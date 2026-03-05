import { execFile } from 'node:child_process'
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { parseArgs } from 'node:util'

// --- Config ---

const POSTS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'posts')
const KO_DIR = join(POSTS_DIR, 'ko')
const EN_DIR = join(POSTS_DIR, 'en')

const KOREAN_RE = /[가-힣]/

interface ModelConfig {
  guide: string
  chunk: string
  review: string
  guideEffort: string
  chunkEffort: string
  reviewEffort: string
}

const DEFAULT_CONFIG: ModelConfig = {
  guide: 'opus',
  chunk: 'sonnet',
  review: 'opus',
  guideEffort: 'high',
  chunkEffort: 'low',
  reviewEffort: 'high',
}

// --- Stats tracking ---

interface CallStats {
  phase: string
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

const allStats: CallStats[] = []

function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}

function estimateCost(model: string, input: number, output: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    opus: { input: 15, output: 75 },
    sonnet: { input: 3, output: 15 },
    haiku: { input: 0.8, output: 4 },
  }
  const key = Object.keys(pricing).find((k) => model.includes(k)) ?? 'sonnet'
  const p = pricing[key]
  return (input / 1_000_000) * p.input + (output / 1_000_000) * p.output
}

function printSummary() {
  const total = allStats.reduce(
    (acc, s) => ({
      inputTokens: acc.inputTokens + s.inputTokens,
      outputTokens: acc.outputTokens + s.outputTokens,
      cost: acc.cost + estimateCost(s.model, s.inputTokens, s.outputTokens),
      durationMs: acc.durationMs + s.durationMs,
    }),
    { inputTokens: 0, outputTokens: 0, cost: 0, durationMs: 0 },
  )

  const byPhase = new Map<string, { calls: number; input: number; output: number; cost: number }>()
  for (const s of allStats) {
    const prev = byPhase.get(s.phase) ?? { calls: 0, input: 0, output: 0, cost: 0 }
    byPhase.set(s.phase, {
      calls: prev.calls + 1,
      input: prev.input + s.inputTokens,
      output: prev.output + s.outputTokens,
      cost: prev.cost + estimateCost(s.model, s.inputTokens, s.outputTokens),
    })
  }

  log('')
  log(bold('═══ Summary ═══'))
  log(`  API calls:        ${allStats.length}`)
  log(`  Input tokens:     ${formatNum(total.inputTokens)}`)
  log(`  Output tokens:    ${formatNum(total.outputTokens)}`)
  log(`  Total cost:       ${bold(`$${total.cost.toFixed(4)}`)}`)
  log(`  Cumulative time:  ${(total.durationMs / 1000).toFixed(1)}s`)
  log('')
  for (const [phase, data] of byPhase) {
    log(
      `  ${dim(phase.padEnd(12))} ${String(data.calls).padStart(2)} calls  ${formatNum(data.input).padStart(8)}in  ${formatNum(data.output).padStart(8)}out  $${data.cost.toFixed(4)}`,
    )
  }
}

// --- Pretty output ---

const isTTY = process.stderr.isTTY === true
const bold = (s: string) => (isTTY ? `\x1b[1m${s}\x1b[0m` : s)
const dim = (s: string) => (isTTY ? `\x1b[2m${s}\x1b[0m` : s)
const green = (s: string) => (isTTY ? `\x1b[32m${s}\x1b[0m` : s)
const yellow = (s: string) => (isTTY ? `\x1b[33m${s}\x1b[0m` : s)
const cyan = (s: string) => (isTTY ? `\x1b[36m${s}\x1b[0m` : s)
const red = (s: string) => (isTTY ? `\x1b[31m${s}\x1b[0m` : s)

function log(msg: string) {
  process.stderr.write(`${msg}\n`)
}

function rel(absPath: string): string {
  return relative(process.cwd(), absPath)
}

// --- Chunk Status Map (disk-partition style visualization) ---

type ChunkStatus = 'pending' | 'translating' | 'done' | 'retry' | 'skipped'

// Total number of box characters to distribute across all chunks
const TOTAL_BOXES = 60
const BOXES_PER_ROW = 30

class ChunkMap {
  private statuses: ChunkStatus[]
  // Each chunk owns a range of boxes: boxRanges[i] = [startIndex, count]
  private boxChunkIndex: number[]
  private linesRendered = 0

  constructor(chunks: Chunk[]) {
    this.statuses = chunks.map(() => 'pending')
    const totalSize = chunks.reduce((a, c) => a + c.content.length, 0)

    // Assign proportional box counts per chunk (min 1)
    const boxCounts = chunks.map((c) =>
      Math.max(1, Math.round((c.content.length / totalSize) * TOTAL_BOXES)),
    )

    // Flatten: each box knows which chunk it belongs to
    this.boxChunkIndex = []
    for (let i = 0; i < chunks.length; i++) {
      for (let b = 0; b < boxCounts[i]; b++) {
        this.boxChunkIndex.push(i)
      }
    }
  }

  setStatus(index: number, status: ChunkStatus, autoRender = true) {
    this.statuses[index] = status
    if (autoRender) this.render()
  }

  private styledChar(status: ChunkStatus): string {
    const ch = status === 'done' || status === 'skipped' ? '■' : '□'
    switch (status) {
      case 'pending':
        return dim(ch)
      case 'translating':
        return green(ch)
      case 'done':
        return green(ch)
      case 'retry':
        return yellow(ch)
      case 'skipped':
        return dim(ch)
    }
  }

  render() {
    if (isTTY && this.linesRendered > 0) {
      process.stderr.write(`\x1b[${this.linesRendered}A\x1b[J`)
    } else if (!isTTY && this.linesRendered > 0) {
      return
    }

    const totalBoxes = this.boxChunkIndex.length
    const lines: string[] = []

    // Lay out all boxes in a grid, BOXES_PER_ROW per line, space between each
    for (let row = 0; row < totalBoxes; row += BOXES_PER_ROW) {
      const end = Math.min(row + BOXES_PER_ROW, totalBoxes)
      const chars: string[] = []
      for (let b = row; b < end; b++) {
        const chunkIdx = this.boxChunkIndex[b]
        chars.push(this.styledChar(this.statuses[chunkIdx]))
      }
      lines.push(`  ${chars.join(' ')}`)
    }

    // Blank line between grid and legend
    lines.push('')

    // Legend
    const n = this.statuses.length
    const counts = { pending: 0, translating: 0, done: 0, retry: 0, skipped: 0 }
    for (const s of this.statuses) counts[s]++
    const doneAndSkip = counts.done + counts.skipped
    const pct = Math.round((doneAndSkip / n) * 100)

    const parts = [
      `${green('■')} ${counts.done} done`,
      `${green('□')} ${counts.translating} active`,
    ]
    if (counts.retry > 0) parts.push(`${yellow('□')} ${counts.retry} retry`)
    parts.push(`${dim('□')} ${counts.pending} pending`)
    if (counts.skipped > 0) parts.push(`${dim('■')} ${counts.skipped} skip`)
    parts.push(bold(`${pct}%`))
    lines.push(`  ${parts.join('  ')}`)

    process.stderr.write(`${lines.join('\n')}\n`)
    this.linesRendered = lines.length
  }
}

// --- Claude CLI wrapper ---

interface ClaudeResult {
  text: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

function callClaude(
  prompt: string,
  opts: { model: string; effort: string; systemPrompt?: string; phase: string },
): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--model', opts.model, '--output-format', 'json', '--effort', opts.effort]
    if (opts.systemPrompt) {
      args.push('--system-prompt', opts.systemPrompt)
    }

    const env = { ...process.env }
    env.CLAUDECODE = undefined

    const start = Date.now()
    const proc = execFile(
      'claude',
      args,
      { maxBuffer: 10 * 1024 * 1024, env },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(`claude failed: ${err.message}\n${stderr}`))
        try {
          const json = JSON.parse(stdout)
          const durationMs = Date.now() - start
          const inputTokens = json.usage?.input_tokens ?? 0
          const outputTokens = json.usage?.output_tokens ?? 0
          const text = json.result ?? ''

          const stats: CallStats = {
            phase: opts.phase,
            model: opts.model,
            inputTokens,
            outputTokens,
            durationMs,
          }
          allStats.push(stats)

          resolve({ text, inputTokens, outputTokens, durationMs })
        } catch {
          log(`  ${yellow('⚠')} Could not parse claude JSON output, treating as plain text`)
          resolve({ text: stdout, inputTokens: 0, outputTokens: 0, durationMs: Date.now() - start })
        }
      },
    )
    proc.stdin?.write(prompt)
    proc.stdin?.end()
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// --- Chunking ---

interface Chunk {
  index: number
  type: 'text' | 'code'
  content: string
}

function parseFrontmatter(md: string): { frontmatter: string; body: string } {
  const match = md.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return { frontmatter: '', body: md }
  return { frontmatter: match[1], body: md.slice(match[0].length) }
}

function chunkMarkdown(body: string): Chunk[] {
  const raw: Chunk[] = []
  let idx = 0

  const sections = body.split(/(?=^#{2,3} )/m)
  for (const section of sections) {
    if (!section.trim()) continue
    const parts = section.split(/(```\w*\n[\s\S]*?\n```)/g)
    for (const part of parts) {
      if (!part.trim()) continue
      const isCode = /^```\w*\n/.test(part) && part.endsWith('```')
      raw.push({ index: idx++, type: isCode ? 'code' : 'text', content: part })
    }
  }

  // Merge short text chunks into previous text chunk only
  const merged: Chunk[] = []
  for (const chunk of raw) {
    if (
      merged.length > 0 &&
      chunk.type === 'text' &&
      chunk.content.length < 100 &&
      merged[merged.length - 1].type === 'text'
    ) {
      merged[merged.length - 1].content += chunk.content
    } else {
      merged.push({ ...chunk })
    }
  }
  for (let i = 0; i < merged.length; i++) {
    merged[i].index = i
  }
  return merged
}

// --- Concurrency ---

async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  limit: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++
      results[i] = await fn(items[i], i)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

// --- Phase 1: Translation Guide ---

async function generateGuide(source: string, config: ModelConfig): Promise<string> {
  log(
    `\n${bold('Phase 1')} ${cyan('Translation Guide')} ${dim(`[${config.guide}, effort=${config.guideEffort}]`)}`,
  )

  const result = await callClaude(
    `You are a professional Korean-to-English technical translator.

Read the following Korean blog post and produce a concise Translation Guide in English that will be used to ensure consistency when translating individual sections.

The guide should include:
1. **Glossary**: Korean technical terms and proper nouns with their English translations (table format)
2. **Tone & Style**: Brief notes on the writing style to maintain (formal/informal, audience level, etc.)
3. **Context Summary**: 2-3 sentence summary of what this post is about

Keep the guide concise (under 500 words).

---
${source}`,
    { model: config.guide, effort: config.guideEffort, phase: 'guide' },
  )
  logCallStats('guide', result)
  return result.text
}

function logCallStats(label: string, result: ClaudeResult) {
  const cost = estimateCost(label, result.inputTokens, result.outputTokens)
  log(
    `    ${dim('in=')}${formatNum(result.inputTokens)} ${dim('out=')}${formatNum(result.outputTokens)} ${dim('cost=')}$${cost.toFixed(4)} ${dim('time=')}${(result.durationMs / 1000).toFixed(1)}s`,
  )
}

// --- Phase 2: Translate chunks ---

async function translateChunk(chunk: Chunk, guide: string, config: ModelConfig): Promise<string> {
  // Skip LLM call for code blocks without Korean
  if (chunk.type === 'code' && !KOREAN_RE.test(chunk.content)) {
    return chunk.content
  }

  if (chunk.type === 'code') {
    const result = await callClaude(
      `Translate only Korean comments in this code block to English. Keep everything else exactly as-is. Output ONLY the code block, nothing else.

${chunk.content}`,
      {
        model: config.chunk,
        effort: config.chunkEffort,
        systemPrompt:
          'You are a code comment translator. Only translate Korean comments to English. Preserve all code, formatting, and structure exactly.',
        phase: 'chunk',
      },
    )
    return result.text
  }

  const result = await callClaude(
    `Translate the following Korean markdown section to English.

Rules:
- Preserve ALL markdown formatting, HTML tags, and links exactly
- Translate link text but preserve URLs unchanged
- Do NOT translate inline code (\`backtick\` content), code identifiers, function names, or variable names
- Keep the same paragraph structure
- Produce natural, fluent English
- Output ONLY the translated text, no explanations

---
${chunk.content}`,
    {
      model: config.chunk,
      effort: config.chunkEffort,
      systemPrompt: `You are a professional Korean-to-English technical blog translator. Follow the translation guide below for consistency.\n\n${guide}`,
      phase: 'chunk',
    },
  )
  return result.text
}

async function translateChunkWithRetry(
  chunk: Chunk,
  guide: string,
  config: ModelConfig,
  chunkMap?: ChunkMap,
  maxRetries = 2,
): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await translateChunk(chunk, guide, config)
    } catch (e) {
      if (attempt >= maxRetries) throw e
      chunkMap?.setStatus(chunk.index, 'retry')
      const delay = 1000 * 2 ** attempt
      log(
        `    ${yellow('⟳')} Chunk ${chunk.index} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
      )
      await sleep(delay)
    }
  }
}

// --- Phase 3: Review ---

interface ReviewResult {
  notes: string
  translation: string
}

const REVIEW_SEPARATOR = '---FINAL_TRANSLATION---'

async function reviewTranslation(
  source: string,
  translated: string,
  guide: string,
  config: ModelConfig,
): Promise<ReviewResult> {
  log(
    `\n${bold('Phase 3')} ${cyan('Review & Polish')} ${dim(`[${config.review}, effort=${config.reviewEffort}]`)}`,
  )

  const result = await callClaude(
    `You are a professional Korean-to-English translation reviewer.

Below is the original Korean blog post, the translation guide used, and the English translation. Review the translation for issues and produce a corrected version.

Check for:
- Accuracy (mistranslations, omissions)
- Naturalness (awkward phrasing)
- Consistency (terminology should match the guide)
- Formatting (markdown, HTML, and links must be preserved exactly)

Output format — you MUST output BOTH sections in this exact order:

## Review Notes
For each issue found, write:
- What was wrong (quote the original phrase)
- What you changed it to and why
If nothing needed fixing, say "No issues found."

${REVIEW_SEPARATOR}

(The complete final corrected English translation goes here, with all fixes applied.)

=== TRANSLATION GUIDE ===
${guide}

=== ORIGINAL (Korean) ===
${source}

=== TRANSLATION (English) ===
${translated}`,
    { model: config.review, effort: config.reviewEffort, phase: 'review' },
  )
  logCallStats('review', result)

  // Parse: split on separator
  const sepIdx = result.text.indexOf(REVIEW_SEPARATOR)
  if (sepIdx === -1) {
    // Fallback: no separator found, treat entire output as translation
    return { notes: '(Review notes not found in output)', translation: result.text }
  }

  const notes = result.text.slice(0, sepIdx).trim()
  const translation = result.text.slice(sepIdx + REVIEW_SEPARATOR.length).trim()
  return { notes, translation }
}

// --- Frontmatter ---

async function translateFrontmatter(
  frontmatter: string,
  guide: string,
  config: ModelConfig,
): Promise<string> {
  const lines = frontmatter.split('\n')
  const translated: string[] = []

  for (const line of lines) {
    const titleMatch = line.match(/^title:\s*(.+)$/)
    if (titleMatch) {
      const result = await callClaude(
        `Translate this Korean blog post title to English. Output ONLY the translated title, nothing else.\n\n${titleMatch[1]}`,
        {
          model: config.chunk,
          effort: config.chunkEffort,
          systemPrompt: guide,
          phase: 'frontmatter',
        },
      )
      translated.push(`title: ${result.text.trim()}`)
    } else {
      translated.push(line)
    }
  }
  return translated.join('\n')
}

// --- Log files ---

const LOG_DIR = join(import.meta.dirname, '..', '.translate-logs')

async function saveLog(slug: string, phase: string, content: string): Promise<string> {
  const logDir = join(LOG_DIR, slug)
  await mkdir(logDir, { recursive: true })
  const logPath = join(logDir, `${phase}.md`)
  await writeFile(logPath, content, 'utf-8')
  return logPath
}

// --- Main pipeline ---

async function translatePost(
  slug: string,
  config: ModelConfig,
  concurrency: number,
  opts: { dryRun: boolean; skipReview: boolean },
): Promise<void> {
  const srcPath = join(KO_DIR, slug, 'index.md')
  const destPath = join(EN_DIR, slug, 'index.md')

  try {
    await access(srcPath)
  } catch {
    throw new Error(`Post not found: ${rel(srcPath)}`)
  }

  const source = await readFile(srcPath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(source)
  const chunks = chunkMarkdown(body)

  const textChunks = chunks.filter((c) => c.type === 'text').length
  const codeChunks = chunks.filter((c) => c.type === 'code').length
  const codeSkip = chunks.filter((c) => c.type === 'code' && !KOREAN_RE.test(c.content)).length

  log(bold(`\n┌─ Translating: ${slug}`))
  log(`│  Source:  ${rel(srcPath)}`)
  log(`│  Output:  ${rel(destPath)}`)
  log(`│  Length:  ${formatNum(source.length)} chars`)
  log(
    `│  Chunks:  ${chunks.length} total (${textChunks} text, ${codeChunks} code, ${codeSkip} code-skip)`,
  )
  log(
    `│  Models:  guide=${cyan(config.guide)} chunk=${cyan(config.chunk)} review=${cyan(config.review)}`,
  )
  log('└─')

  if (opts.dryRun) {
    log(yellow('\n  [dry-run] Skipping translation.\n'))
    const chunkMap = new ChunkMap(chunks)
    for (const chunk of chunks) {
      if (chunk.type === 'code' && !KOREAN_RE.test(chunk.content)) {
        chunkMap.setStatus(chunk.index, 'skipped', false)
      }
    }
    chunkMap.render()
    log('')
    for (const chunk of chunks) {
      const hasKo = KOREAN_RE.test(chunk.content) ? '' : dim(' (no Korean, skip)')
      log(
        `  ${dim(`#${String(chunk.index).padStart(2)}`)} ${chunk.type === 'code' ? dim('code') : 'text'} ${formatNum(chunk.content.length).padStart(6)}ch${hasKo}`,
      )
    }
    return
  }

  // Phase 1
  const guide = await generateGuide(source, config)
  const guidePath = await saveLog(slug, 'guide', guide)
  log(`    ${dim(`log: ${rel(guidePath)}`)}`)

  // Frontmatter
  log(`\n${bold('Frontmatter')} ${dim(`[${config.chunk}]`)}`)
  const translatedFrontmatter = await translateFrontmatter(frontmatter, guide, config)

  // Phase 2 with visual chunk map
  log(
    `\n${bold('Phase 2')} ${cyan('Chunk Translation')} ${dim(`[${config.chunk}, effort=${config.chunkEffort}, concurrency=${concurrency}]`)}\n`,
  )

  const chunkMap = new ChunkMap(chunks)

  // Mark code-skip chunks immediately
  for (const chunk of chunks) {
    if (chunk.type === 'code' && !KOREAN_RE.test(chunk.content)) {
      chunkMap.setStatus(chunk.index, 'skipped', false)
    }
  }
  chunkMap.render()

  const translatedChunks = await mapWithConcurrency(
    chunks,
    async (chunk, i) => {
      chunkMap.setStatus(i, 'translating')
      const result = await translateChunkWithRetry(chunk, guide, config, chunkMap)
      chunkMap.setStatus(i, 'done')
      return result
    },
    concurrency,
  )

  log('')

  // Assemble
  const assembled = `---\n${translatedFrontmatter}\n---\n${translatedChunks.map((c) => c.trimEnd()).join('\n\n')}`

  // Phase 3
  let final: string
  if (opts.skipReview) {
    log(`\n${dim('Phase 3 skipped (--skip-review)')}`)
    final = assembled
  } else {
    await saveLog(slug, 'assembled', assembled)
    const review = await reviewTranslation(source, assembled, guide, config)
    final = review.translation
    const notesPath = await saveLog(slug, 'review-notes', review.notes)
    log(`    ${dim(`log: ${rel(notesPath)}`)}`)
  }

  // Write
  await mkdir(dirname(destPath), { recursive: true })
  await writeFile(destPath, final, 'utf-8')
  log(`\n${green('✓')} Written to ${rel(destPath)}`)
}

// --- CLI ---

function printUsage() {
  log(`
${bold('Usage:')} npx tsx scripts/translate.ts [options] <slug|--all>

${bold('Arguments:')}
  <slug>              Translate a specific post
  --all               Translate all untranslated posts

${bold('Model options:')}
  --guide-model <m>   Model for translation guide     ${dim('(default: opus)')}
  --chunk-model <m>   Model for chunk translation      ${dim('(default: sonnet)')}
  --review-model <m>  Model for review                 ${dim('(default: opus)')}
  --guide-effort <e>  Effort for guide                 ${dim('(default: high)')}
  --chunk-effort <e>  Effort for chunks                ${dim('(default: low)')}
  --review-effort <e> Effort for review                ${dim('(default: high)')}

${bold('Other options:')}
  --concurrency <n>   Parallel chunk translations      ${dim('(default: 5)')}
  --skip-review       Skip Phase 3 review (saves cost)
  --dry-run           Show chunk breakdown without translating
  --force             Overwrite existing translations
  --help              Show this help
`)
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'guide-model': { type: 'string' },
      'chunk-model': { type: 'string' },
      'review-model': { type: 'string' },
      'guide-effort': { type: 'string' },
      'chunk-effort': { type: 'string' },
      'review-effort': { type: 'string' },
      concurrency: { type: 'string' },
      'skip-review': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
      all: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  })

  if (values.help || (positionals.length === 0 && !values.all)) {
    printUsage()
    process.exit(values.help ? 0 : 1)
  }

  const config: ModelConfig = {
    guide: values['guide-model'] ?? DEFAULT_CONFIG.guide,
    chunk: values['chunk-model'] ?? DEFAULT_CONFIG.chunk,
    review: values['review-model'] ?? DEFAULT_CONFIG.review,
    guideEffort: values['guide-effort'] ?? DEFAULT_CONFIG.guideEffort,
    chunkEffort: values['chunk-effort'] ?? DEFAULT_CONFIG.chunkEffort,
    reviewEffort: values['review-effort'] ?? DEFAULT_CONFIG.reviewEffort,
  }
  const concurrency = Number.parseInt(values.concurrency ?? '5', 10)
  const dryRun = values['dry-run'] ?? false
  const skipReview = values['skip-review'] ?? false
  const force = values.force ?? false

  const slugs: string[] = []

  if (values.all) {
    const entries = await readdir(KO_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const enPath = join(EN_DIR, entry.name, 'index.md')
      if (!force) {
        try {
          await access(enPath)
          continue
        } catch {
          // not translated yet
        }
      }
      slugs.push(entry.name)
    }
    log(`Found ${bold(String(slugs.length))} untranslated posts.`)
  } else {
    slugs.push(...positionals)
  }

  const startTime = Date.now()
  for (let i = 0; i < slugs.length; i++) {
    if (slugs.length > 1) {
      log(bold(`\n══════ [${i + 1}/${slugs.length}] ══════`))
    }
    await translatePost(slugs[i], config, concurrency, { dryRun, skipReview })
  }

  if (!dryRun) {
    printSummary()
    log(`\nWall time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
  }
}

main().catch((err) => {
  console.error(red(`Error: ${err.message}`))
  process.exit(1)
})
