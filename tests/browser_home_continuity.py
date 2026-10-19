from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path(__file__).resolve().parent.parent
html=(root/'standalone.html').read_text()
for width,height in [(1440,900),(390,844),(320,700)]:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':width,'height':height})
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.evaluate('''() => { const d=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.has(k)?d.get(k):null,setItem:(k,v)=>d.set(k,v),removeItem:k=>d.delete(k)}}) }''')
  page.set_content(html,wait_until='load')
  page.wait_for_timeout(150)

  assert page.locator('[data-view="inicio"]').is_visible()
  assert page.locator('#si-home-resume').is_hidden()
  # navigate to missions and drill into a mission, then go Home
  page.locator('.si-home-path[href="#/missoes"]').click()
  page.wait_for_timeout(90)
  assert page.evaluate("""() => !!document.activeElement.closest('[data-view="missoes"]')"""), 'Foco não transferido ao destino' 

  page.locator('#edu-mission-list [data-catalog-id="mission-create"]').click()
  page.wait_for_timeout(90)
  assert page.locator('#si-home-resume').is_hidden(), 'Consultar catálogo não pode iniciar sessão'
  page.locator('#edu-mission-detail button:has-text("Montar na bancada")').click()
  page.wait_for_timeout(90)

  page.evaluate('location.hash="#/inicio"')
  page.wait_for_timeout(100)

  assert page.locator('#si-home-resume').is_visible()
  assert page.locator('#si-home-resume-link').get_attribute('href')=='#/missoes?item=mission-create'
  assert page.locator('#si-home-scene-summary').is_hidden()
  assert page.evaluate('localStorage.getItem("base-demo-oficial-si:guided-return-v1")')=='#/missoes?item=mission-create'
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
  assert not errors, errors
  # navigate via Home back to detail, then workbench
  page.locator('#si-home-resume-link').click();page.wait_for_timeout(100)
  assert page.evaluate('location.hash')=='#/missoes?item=mission-create'
  page.locator('#edu-mission-detail button:has-text("Continuar na bancada")').click();page.wait_for_timeout(100)
  assert page.locator('#si-return-activity').is_visible()
  browser.close()
  print(f'OK: Home → missão → Home → retomar → bancada, foco e responsividade ({width} px)')
