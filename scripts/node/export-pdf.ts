import puppeteer, { type LaunchOptions } from 'puppeteer'
import path from 'path'

// Get the first argument passed to the Node.js script
const chromePath = process.argv[2]
const launchOptions: LaunchOptions = {
    args: ['--no-sandbox'],
}

/**
 * workaround needed because I can't run regular dynamic linked
 * executables in Nix.
 */
if (chromePath) {
    console.log('Chrome path:', chromePath)
    launchOptions.executablePath = chromePath
}

console.log('Exporting cv.pdf...')
;(async () => {
    const browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    // Update 'dist/index.html' if your entry point is different
    await page.goto(`file://${path.resolve('dist/index.html')}`, {
        waitUntil: 'networkidle0',
    })
    await page.pdf({
        path: 'ZhifanChen.pdf',
        format: 'A4',
        displayHeaderFooter: false,
        printBackground: true,
    })
    await browser.close()
    console.log('PDF exported to ZhifanChen.pdf')
})()
