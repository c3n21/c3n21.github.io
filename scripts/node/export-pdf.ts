import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer, { type LaunchOptions } from 'puppeteer'

export const PDF_OPTIONS = {
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: true,
} as const

export async function exportPdf(chromePathOverride?: string): Promise<string> {
    const chromePath =
        chromePathOverride ||
        process.argv[2] ||
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        (fs.existsSync('/usr/bin/google-chrome')
            ? '/usr/bin/google-chrome'
            : fs.existsSync('/usr/bin/chromium-browser')
            ? '/usr/bin/chromium-browser'
            : fs.existsSync('/usr/bin/chromium')
            ? '/usr/bin/chromium'
            : fs.existsSync('/etc/profiles/per-user/zhifan/bin/chromium')
            ? '/etc/profiles/per-user/zhifan/bin/chromium'
            : undefined)

    const launchOptions: LaunchOptions = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }

    if (chromePath) {
        console.log('Using Chromium executable:', chromePath)
        launchOptions.executablePath = chromePath
    }

    const resumePath = path.resolve('dist/resume/index.html')
    if (!fs.existsSync(resumePath)) {
        throw new Error(
            'dist/resume/index.html not found. Please run `CV=light pnpm run build` first.'
        )
    }

    const resumeHtml = fs.readFileSync(resumePath, 'utf-8')
    if (resumeHtml.includes('aria-label="Main navigation"')) {
        console.warn(
            'Warning: dist/ was built in standard web mode. For clean, print-safe CV export without web chrome, build with `CV=light pnpm run build`.'
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

    return new Promise((resolve, reject) => {
        console.log('Exporting cv.pdf...')
        server.listen(0, '127.0.0.1', async () => {
            const address = server.address()
            const port =
                typeof address === 'object' && address ? address.port : 3000

            try {
                const browser = await puppeteer.launch(launchOptions)
                const page = await browser.newPage()

                await page.emulateMediaType('print')
                await page.emulateMediaFeatures([
                    { name: 'prefers-color-scheme', value: 'light' },
                ])

                await page.goto(`http://127.0.0.1:${port}/resume/`, {
                    waitUntil: 'networkidle0',
                })

                const outputPath = path.resolve('ZhifanChen.pdf')
                await page.pdf({
                    path: outputPath,
                    ...PDF_OPTIONS,
                })

                await browser.close()
                console.log(`PDF exported to ${outputPath}`)
                resolve(outputPath)
            } catch (error) {
                console.error('Failed to export PDF:', error)
                reject(error)
            } finally {
                server.close()
            }
        })
    })
}

// Execute when run as a CLI script directly
const isMainModule = Boolean(
    process.argv[1] &&
        path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)

if (isMainModule) {
    exportPdf().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
