import { chromium } from 'playwright'

// This script launches a browser with your profile so you can manually log in to LinkedIn
// After logging in, close the browser and the session will be saved

const CONFIG = {
    userProfilePath: './tmp',
    headless: false,
    loginUrl: 'https://www.linkedin.com/login',
    profileUrl: 'https://www.linkedin.com/in/zhifanchen00/',
    waitTime: 120000, // 2 minutes to log in
}

async function main() {
    console.log('🔐 LinkedIn Login Helper')
    console.log('========================\n')
    console.log(
        'This script will open a browser for you to log in to LinkedIn.'
    )
    console.log(
        'After logging in and verifying you can see your profile, close the browser.\n'
    )

    const browser = await chromium.launchPersistentContext(
        CONFIG.userProfilePath,
        {
            headless: CONFIG.headless,
        }
    )

    const page = browser.pages()[0] || (await browser.newPage())

    console.log('🌐 Opening LinkedIn login page...\n')
    await page.goto(CONFIG.loginUrl)

    console.log('📝 Instructions:')
    console.log('   1. Log in to LinkedIn in the browser window')
    console.log(
        '   2. After logging in, navigate to your profile to verify access'
    )
    console.log('   3. Close the browser window when done\n')
    console.log(
        '⏳ Waiting for you to log in (will auto-close in 2 minutes)...\n'
    )

    // Wait for user to close browser or timeout
    await page.waitForTimeout(CONFIG.waitTime).catch(() => {})

    try {
        console.log('🔍 Checking if login was successful...')
        await page.goto(CONFIG.profileUrl, { timeout: 10000 })

        const title = await page.title()
        console.log(`   Page title: ${title}`)

        if (title.includes('Sign In') || title.includes('Join LinkedIn')) {
            console.log(
                '\n⚠️  Warning: Still on login page. You may need to log in again.'
            )
        } else {
            console.log('\n✅ Login appears successful!')
            console.log('   Your session has been saved to ./tmp')
            console.log('   You can now run: pnpm scrape-linkedin\n')
        }
    } catch (error) {
        console.log('   Could not verify login status')
    }

    await browser.close()
    console.log('\n✓ Browser closed. Session saved.\n')
}

main().catch(console.error)
