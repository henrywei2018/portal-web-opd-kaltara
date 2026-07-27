import { chromium } from 'playwright-core'
const EXEC = process.env.HOME + '/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome'
const b = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
await p.goto('http://127.0.0.1:8000/', { waitUntil:'networkidle' }); await p.waitForTimeout(2000)
// close floating promo + cookie so they don't overlap the footer
try { await p.getByRole('button', { name: /Setuju|Tolak/ }).first().click({ timeout: 1500 }) } catch {}
try { await p.locator('button[aria-label*="Tutup"], button[aria-label*="close" i]').first().click({ timeout: 1000 }) } catch {}
await p.waitForTimeout(400)
const footer = p.locator('footer'); await footer.scrollIntoViewIfNeeded(); await p.waitForTimeout(400)
await footer.screenshot({ path: 'footer-after.png' })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
console.log('captured; errors:', errs.length?errs:'none')
await b.close()
