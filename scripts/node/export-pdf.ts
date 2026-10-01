import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import puppeteer, { type LaunchOptions } from 'puppeteer'

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

const resumePath = path.resolve('dist/resume/index.html')
if (!fs.existsSync(resumePath)) {
    console.error(
        `Error: dist/resume/index.html not found. Please run build first.`
    )
    process.exit(1)
}

const resumeHtml = fs.readFileSync(resumePath, 'utf-8')
if (resumeHtml.includes('aria-label="Main navigation"')) {
    console.warn(
        'Warning: dist/ was built in standard web mode. For clean, print-safe CV export without web chrome, build with `CV=dark pnpm run build`.'
    )
}

const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.json': 'application/json',
}

const distRoot = path.resolve('dist')
const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url?.split('?')[0] || '/')
    if (reqPath.endsWith('/')) {
        reqPath += 'index.html'
    }

    let filePath = path.join(distRoot, reqPath)

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html')
    }

    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        const ext = path.extname(filePath).toLowerCase()
        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        })
        fs.createReadStream(filePath).pipe(res)
    } else {
        res.writeHead(404)
        res.end('Not Found')
    }
})

console.log('Exporting cv.pdf...')
server.listen(0, '127.0.0.1', async () => {
    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : 3000

    try {
        const browser = await puppeteer.launch(launchOptions)
        const page = await browser.newPage()

        // Dedicated resume entry point for CV export
        await page.goto(`http://127.0.0.1:${port}/resume/`, {
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
    } catch (error) {
        console.error('Failed to export PDF:', error)
        process.exitCode = 1
    } finally {
        server.close()
    }
})

