"""Auditoria interativa: gaveta, progresso e preferências; Chromium isolado e sem rede.

Pré-requisito opcional de desenvolvimento: Playwright Python + Chromium local.
Não é uma dependência de execução da aplicação.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'standalone.html').read_text('utf-8')

async def run():
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width,height in [(1440,900),(390,844),(320,700)]:
            page=await browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            await page.set_content(HTML)
            await page.locator('#nav-toggle').click()
            await page.locator('#si-a11y-toggle').click()
            for _ in range(10): await page.locator('#si-font-plus').click()
            assert await page.evaluate('parseFloat(getComputedStyle(document.documentElement).fontSize)')==32
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
            await page.locator('#si-a11y-reset').click()
            assert await page.evaluate('parseFloat(getComputedStyle(document.documentElement).fontSize)')==16
            await page.locator('#si-nav-close').click()
            await page.evaluate("location.hash='#/missoes?item=mission-create'")
            await page.locator('#nav-toggle').click()
            assert '0/1 etapas' in (await page.locator('#si-activity-context').text_content())
            await page.locator('#si-activity-finish').click()
            await page.evaluate("document.querySelector('[data-add-kind=block]').click();document.querySelector('[data-add-kind=circle]').click()")
            await page.locator('#nav-toggle').click()
            await page.locator('#si-activity-finish').click()
            assert '1/1 etapas' in (await page.locator('#si-activity-context').text_content())
            await page.locator('#nav-toggle').click()
            await page.locator('#si-activity-exit').click()
            await page.locator('#si-modal-confirm').click()
            assert await page.evaluate('location.hash')=='#/missoes'
            await page.evaluate("location.hash='#/roteiros?item=script-start'")
            await page.locator('#nav-toggle').click()
            await page.locator('#si-activity-exit').click()
            await page.locator('#si-modal-confirm').click()
            assert await page.evaluate('location.hash')=='#/roteiros'
            assert not errors, errors
            print('OK:',width,'px; progresso e contexto, escala 200%, sem overflow ou erros JS')
            await page.close()
        await browser.close()

if __name__=='__main__':
    asyncio.run(run())
