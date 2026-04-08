import { execSync } from 'node:child_process'
import puppeteer from 'puppeteer'

const DIST_DIR = new URL('../dist', import.meta.url).pathname

const pages = [
  { path: '/about/', output: `${DIST_DIR}/resume/index.pdf`, name: 'ko' },
  { path: '/en/about/', output: `${DIST_DIR}/en/resume/index.pdf`, name: 'en' },
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

const browser = await puppeteer.launch()

try {
  for (const { path, output, name } of pages) {
    console.log(`Generating ${name} resume PDF...`)
    const page = await browser.newPage()
    await page.goto(`http://localhost:4322${path}`, { waitUntil: 'networkidle0' })

    // Hide everything except .resume content and adjust for print
    await page.evaluate(() => {
      // Hide blog header, nav, separator, PDF download link, analytics
      document.querySelectorAll(
        'h2.home, nav, body > hr, main > hr:first-child, .pdf-link, script[data-domain]'
      ).forEach((el) => {
        el.style.display = 'none'
      })
      // Also hide the blog title link (parent of h2.home)
      const homeLink = document.querySelector('h2.home')?.parentElement
      if (homeLink?.tagName === 'A') homeLink.style.display = 'none'
      // Remove body padding — Puppeteer margin handles page margins
      document.body.style.padding = '0'
      document.body.style.maxWidth = 'none'
    })

    // Ensure output directory exists
    const outputDir = output.substring(0, output.lastIndexOf('/'))
    execSync(`mkdir -p ${outputDir}`)

    await page.pdf({
      path: output,
      format: 'A4',
      margin: { top: '1.5cm', bottom: '1.5cm', left: '2cm', right: '2cm' },
      printBackground: true,
    })

    console.log(`  → ${output}`)
    await page.close()
  }
} finally {
  await browser.close()
  // Kill preview server
  execSync("kill $(lsof -ti:4322) 2>/dev/null || true")
}

console.log('Done!')
