"""Auditoria de operação do menu em Chromium injetado: não homologa instalação PWA."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'standalone.html').read_text('utf8')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(320,700),(390,844),(844,390),(1440,900)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(html,wait_until='domcontentloaded')
        toggle=page.locator('#nav-toggle')
        toggle.click()
        page.wait_for_timeout(380)
        assert page.locator('#sidebar').is_visible()
        assert page.locator('#sidebar').get_attribute('aria-modal')=='true'
        assert toggle.get_attribute('aria-expanded')=='true'
        assert page.locator('#main-column').get_attribute('inert') is not None
        assert page.locator('#nav-backdrop').is_visible()
        assert page.locator('#sidebar').bounding_box()['width'] <= min(360,width*.88)+2
        page.keyboard.press('Tab')
        assert page.evaluate('document.querySelector("#sidebar").contains(document.activeElement)')
        page.locator('#si-nav-group-toggle').click()
        assert page.locator('#si-nav-main').is_hidden()
        page.locator('#si-nav-group-toggle').click()
        assert page.locator('#si-nav-main').is_visible()
        page.locator('#si-nav-close').click()
        page.wait_for_timeout(380)
        assert not page.locator('#sidebar').is_visible()
        assert toggle.get_attribute('aria-expanded')=='false'
        assert page.locator('#main-column').get_attribute('inert') is None
        assert page.evaluate('document.activeElement.id')=='nav-toggle'
        toggle.click()
        page.wait_for_timeout(380)
        page.locator('#sidebar a[data-route="manual"]').click()
        page.wait_for_timeout(350)
        assert page.locator('[data-view="manual"]').is_visible(), page.evaluate("location.hash")
        assert not page.locator('#sidebar').is_visible()
        assert page.locator('#sidebar a[data-route="manual"]').get_attribute('aria-current')=='page'
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        assert not errors,(width,errors)
        print('OK menu',width,height)
        page.close()
    browser.close()
