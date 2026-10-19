"""Chromium E2E da organização 0.9.2 com HTML injetado (não homologa file:// ou PWA)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
source=(root/'standalone.html').read_text(encoding='utf-8')
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(320,700),(360,740),(390,844),(414,896),(768,1024),(1024,768),(1440,900),(844,390)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(source,wait_until='domcontentloaded')
        assert page.locator('.si-home-path').count()==5
        assert not page.evaluate('document.documentElement.scrollWidth>window.innerWidth')
        primary=page.evaluate('''()=>{const s=x=>document.querySelector(x).getBoundingClientRect();return [s('.si-home-path-primary strong').bottom,s('.si-home-path-primary .si-path-description').top,s('.si-home-path-primary .si-path-description').bottom,s('.si-home-path-primary .si-path-action').top]}''')
        assert primary[0]<=primary[1] and primary[2]<=primary[3],(width,primary)
        page.locator('#nav-toggle').click();page.wait_for_timeout(340)
        assert page.locator('#sidebar').is_visible()
        assert page.locator('#main-column').get_attribute('inert') is not None
        page.keyboard.press('Escape');page.wait_for_timeout(340)
        assert not page.locator('#sidebar').is_visible()
        assert page.locator('#main-column').get_attribute('inert') is None
        page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(110)
        assert page.locator('.si-workspace').is_visible()
        assert not page.locator('.si-mobile-bottom-nav').is_visible()
        page.locator('[data-open-dock="montagem"]').click()
        assert page.locator('#si-dock-left').is_visible()
        page.locator('[data-add-kind="block"]').click()
        page.evaluate('document.querySelector("[data-close-dock=left]").click()')
        assert page.locator('.si-stage-canvas').bounding_box()['height']>=110
        assert not page.evaluate('document.documentElement.scrollWidth>window.innerWidth')
        assert not errors,errors
        print('OK',width,'x',height)
        page.close()
    browser.close()
