import { execSync } from 'node:child_process'
import { copyFileSync, mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer'

const DIST_DIR = new URL('../dist', import.meta.url).pathname
const PUBLIC_DIR = new URL('../public', import.meta.url).pathname

const pages = [
  {
    path: '/about/',
    output: `${DIST_DIR}/resume.pdf`,
    publicOutput: `${PUBLIC_DIR}/resume.pdf`,
    name: 'ko',
  },
  {
    path: '/en/about/',
    output: `${DIST_DIR}/en/resume.pdf`,
    publicOutput: `${PUBLIC_DIR}/en/resume.pdf`,
    name: 'en',
  },
]

// Start Astro preview server
console.log('Starting preview server...')
execSync('npx astro preview --port 4322 &', {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
  detached: true,
})

// Wait for server to be ready
await new Promise((resolve) => setTimeout(resolve, 2000))

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

try {
  for (const { path, output, publicOutput, name } of pages) {
    console.log(`Generating ${name} resume PDF...`)
    const page = await browser.newPage()
    await page.goto(`http://localhost:4322${path}`, {
      waitUntil: 'networkidle0',
    })

    // Hide everything except .resume content and adjust for print
    await page.evaluate(() => {
      // Hide blog header, nav, separator, PDF download link, analytics
      for (const el of document.querySelectorAll(
        'h2.home, nav, body > hr, main > hr:first-child, .pdf-link, script[data-domain]',
      )) {
        el.style.display = 'none'
      }
      // Also hide the blog title link (parent of h2.home)
      const homeLink = document.querySelector('h2.home')?.parentElement
      if (homeLink?.tagName === 'A') homeLink.style.display = 'none'

      // Hide Atlas Labs experience section
      for (const section of document.querySelectorAll('.experience')) {
        const h2 = section.querySelector('h2')
        if (h2?.textContent?.includes('Atlas Labs')) {
          section.style.display = 'none'
        }
      }

      // Remove body padding — Puppeteer margin handles page margins
      document.body.style.padding = '0'
      document.body.style.maxWidth = 'none'

      // PDF-specific spacing adjustments
      const header = document.querySelector('.resume-header')
      if (header) header.style.marginBottom = '0.25rem'
      for (const li of document.querySelectorAll('.resume li')) {
        li.style.marginBottom = '0.2rem'
      }
      for (const hr of document.querySelectorAll('.resume hr')) {
        hr.style.margin = '1rem 0'
      }
    })

    // Ensure output directories exist
    const outputDir = output.substring(0, output.lastIndexOf('/'))
    mkdirSync(outputDir, { recursive: true })

    await page.pdf({
      path: output,
      format: 'A4',
      margin: { top: '1cm', bottom: '1cm', left: '1.7cm', right: '1.7cm' },
      printBackground: true,
    })

    // Copy to public/ for dev mode
    const publicDir = publicOutput.substring(0, publicOutput.lastIndexOf('/'))
    mkdirSync(publicDir, { recursive: true })
    copyFileSync(output, publicOutput)

    console.log(`  → ${output}`)
    console.log(`  → ${publicOutput}`)
    await page.close()
  }
} finally {
  await browser.close()
  // Kill preview server
  execSync('kill $(lsof -ti:4322) 2>/dev/null || true')
}

console.log('Done!')
