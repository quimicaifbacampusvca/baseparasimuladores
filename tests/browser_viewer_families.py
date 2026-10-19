#!/usr/bin/env python3
"""Teste funcional dos painéis Ver/Dados, sem rede nem imagens prévias."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'standalone.html').read_text('utf-8')

with sync_playwright() as play:
 browser=play.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1440,900),(1024,768),(390,844),(320,700),(844,390)]:
  mobile=width<=900
  context=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(HTML,wait_until='domcontentloaded')
  page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(90)
  baseline=page.locator('#si-canvas').bounding_box()['height']
  page.locator('[data-open-dock="ver"]').click()
  assert page.locator('#si-viewer-families [role="tab"]').count()==3
  assert page.locator('[data-right-tab]').count()==0
  assert page.locator('#si-viewer-families [role="tab"][aria-selected="true"]').inner_text()=='Observar'
  assert page.locator('#si-viewer-buttons button').count()==1
  page.locator('#si-viewer-buttons button').first.click()
  assert page.locator('#si-viewer-detail').is_visible()
  assert page.locator('#si-viewer-instruments').is_hidden(),'Instrumentos aparecendo durante observação'
  page.locator('#si-dock-viewer-back').click()
  page.locator('#si-viewer-families [role="tab"]').nth(1).click()
  assert page.locator('#si-viewer-families [role="tab"][aria-selected="true"]').inner_text()=='Medir'
  page.locator('#si-viewer-buttons button').click()
  assert page.locator('#si-viewer-detail').is_visible()
  assert page.locator('#si-viewer-instruments').is_visible(),'Faltam instrumentos no contexto Medir'
  page.locator('#si-dock-viewer-back').click()
  page.locator('#si-viewer-families [role="tab"]').last.click()
  page.locator('#si-viewer-buttons button').click()
  assert page.locator('#si-viewer-instruments').is_hidden(),'Instrumentos aparecendo durante análise'
  page.locator('#si-dock-viewer-back').click()
  page.locator('#si-viewer-families [role="tab"][aria-selected="true"]').focus()
  page.keyboard.press('Home')
  assert page.locator('#si-viewer-families [role="tab"][aria-selected="true"]').inner_text()=='Observar'
  page.keyboard.press('End')
  assert page.locator('#si-viewer-families [role="tab"][aria-selected="true"]').inner_text()=='Analisar'
  page.locator('[data-open-dock="dados"]').click()
  assert page.locator('[data-right-panel="dados"]').is_visible()
  assert page.locator('#si-data-summary dt').count()>=4
  assert page.locator('.si-dock-data-actions a').count()==2
  assert abs(page.locator('#si-canvas').bounding_box()['height']-baseline)<2
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),('overflow',width)
  assert not errors,(width,errors)
  print('OK',width,height,'Ver famílias/medição/dados/atalhos/layout')
  context.close()
 browser.close()
