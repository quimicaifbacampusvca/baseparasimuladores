#!/usr/bin/env python3
"""Verificação E2E local da 0.9.1 por HTML autocontido injetado (não prova file:// nem PWA)."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'standalone.html').read_text('utf-8')
report=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in ((320,700),(390,844),(1024,768),(1440,900)):
  page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded',timeout=15000)
  page.evaluate('location.hash="#/manual"');page.wait_for_timeout(60)
  assert page.locator('#manual-topics .si-manual-topic').count()==9
  page.locator('#manual-search').fill('relatorios');page.wait_for_timeout(50)
  assert page.locator('#manual-topics .si-manual-topic').count()>=1
  page.evaluate('location.hash="#/professor"');page.wait_for_timeout(60)
  page.locator('#edu-form-title').fill('Percurso com link')
  page.locator('#edu-form-description').fill('Demonstração completa do compartilhamento local.')
  page.locator('#edu-step-one-label').fill('Confirmar realização')
  page.evaluate('document.querySelector("#edu-teacher-form button[type=submit]").click()');page.wait_for_timeout(75)
  assert page.locator('#edu-teacher-list .edu-teacher-item').count()==1
  page.locator('#si-sharing-mode').select_option('view')
  page.locator('#edu-teacher-list .edu-teacher-item button').first.click()
  share=page.locator('#si-sharing-link').input_value()
  assert '#/missoes?share=' in share and len(share)>100
  page.evaluate('location.hash='+json.dumps('#'+share.split('#',1)[1].lstrip('#')))
  page.wait_for_timeout(65)
  assert page.locator('#si-shared-mission').is_visible()
  assert page.locator('#si-shared-mission button').count()==0
  page.evaluate('location.hash="#/professor"');page.wait_for_timeout(60)
  page.locator('#si-sharing-mode').select_option('run')
  page.locator('#edu-teacher-list .edu-teacher-item button').first.click()
  link=page.locator('#si-sharing-link').input_value()
  page.evaluate('location.hash='+json.dumps('#'+link.split('#',1)[1].lstrip('#')));page.wait_for_timeout(70)
  assert page.locator('#si-shared-mission button').count()==1
  page.locator('#si-shared-mission button').click();page.wait_for_timeout(80)
  assert page.locator('#si-shared-mission button').is_disabled()
  page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(65)
  assert page.locator('#si-module-choice option').count()==4
  page.locator('#si-module-choice').select_option('explorar');page.wait_for_timeout(50)
  assert page.locator('#si-viewer-buttons button').count()==1
  page.evaluate('document.querySelector("[data-open-dock=montagem]").click()');page.wait_for_timeout(30)
  page.locator('[data-add-kind=block]').first.click(force=True)
  page.locator('#si-module-choice').select_option('medir');page.wait_for_timeout(55)
  assert page.locator('[data-add-kind=block]').first.is_disabled()
  assert page.locator('#si-viewer-buttons button').count()==2
  page.locator('#si-module-choice').select_option('calcular');page.wait_for_timeout(50)
  assert page.locator('#si-viewer-buttons button').count()==2
  assert 'Analisar' in page.locator('#si-viewer-buttons').inner_text()
  page.locator('#si-module-choice').select_option('livre');page.wait_for_timeout(50)
  assert page.locator('#si-viewer-buttons button').count()==3
  assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'),f'overflow {width}'
  assert not errors,errors
  page.screenshot(path=str(root/f'completion-{width}.png'),animations='disabled')
  report.append({'viewport':width,'manual':True,'sharing_view_run':True,'modules':True,'viewer_count':3,'overflow':False,'js_errors':len(errors)})
  page.close()
 browser.close()
print(json.dumps(report,ensure_ascii=False,indent=2))
