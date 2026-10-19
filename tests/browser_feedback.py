from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'standalone.html').read_text(encoding='utf-8')
with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(1440,900),(390,844),(320,700)]:
    page=browser.new_page(viewport={'width':width,'height':height},is_mobile=width<500,has_touch=width<500)
    errors=[]
    page.on('pageerror', lambda error:errors.append(str(error)))
    page.evaluate("Object.defineProperty(navigator,'vibrate',{configurable:true,value:(pattern)=>{window.__lastVibration=pattern;return true}})")
    page.set_content(html,wait_until='domcontentloaded')
    page.locator('#nav-toggle').click()
    page.locator('#si-a11y-toggle').click()
    sound=page.locator('#si-sound')
    vibration=page.locator('#si-vibrate')
    assert not sound.is_disabled(),f'Audio indisponível no Chromium de teste: {width}'
    assert not vibration.is_disabled(),f'Vibração mock indisponível: {width}'
    assert not sound.is_checked() and not vibration.is_checked()
    sound.check(force=True)
    vibration.check(force=True)
    assert sound.is_checked() and vibration.is_checked()
    assert page.evaluate('window.__lastVibration===55')
    page.locator('#si-a11y-reset').click(force=True)
    assert not sound.is_checked() and not vibration.is_checked()
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    assert not errors,errors
    print(f'OK Chromium {width}x{height}: opt-in, sinal inicial, reset, sem overflow e erros JS')
    page.close()
  browser.close()
