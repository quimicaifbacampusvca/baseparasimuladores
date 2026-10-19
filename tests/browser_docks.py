#!/usr/bin/env python3
"""Teste do contrato das docas. Não depende de rede externa."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'standalone.html').read_text('utf-8')

def check():
 with sync_playwright() as play:
  b=play.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(1440,900),(1024,768),(390,844),(320,700),(844,390)]:
   mobile=width<=900
   ctx=b.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.set_content(HTML,wait_until='domcontentloaded');page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(110)
   before_height=page.locator('#si-canvas').bounding_box()['height']
   page.locator('[data-open-dock="montagem"]').click();assert page.locator('#si-dock-left').is_visible()
   assert abs(page.locator('#si-canvas').bounding_box()['height']-before_height)<2,('scene moved',width)
   for key in ['resumo','montagem','objetos','ajustes','missao']:
    page.locator(f'[data-left-tab="{key}"]').click();assert page.locator(f'[data-left-panel="{key}"]').is_visible(),(key,width)
   page.locator('[data-left-tab="resumo"]').click()
   page.locator('[data-open-left-category="montagem"]').click()
   assert page.locator('[data-left-panel="montagem"]').is_visible()
   page.locator('[data-add-kind="block"]').click()
   assert page.locator('.scene-entity').count()==1
   page.locator('[data-close-dock="left"]').click()
   page.locator('[data-open-dock="ver"]').click();assert page.locator('#si-viewer-catalog').is_visible()
   assert not page.locator('#si-viewer-detail').is_visible()
   page.locator('#si-viewer-buttons button').first.click()
   assert page.locator('#si-viewer-detail').is_visible(),('detail',width)
   assert page.locator('#si-dock-viewer-back').is_visible()
   page.locator('#si-dock-viewer-back').click()
   assert page.locator('#si-viewer-catalog').is_visible(),('back',width)
   page.locator('[data-right-tab="dados"]').click()
   assert page.locator('[data-right-panel="dados"]').is_visible()
   assert page.locator('.si-dock-data-actions a').count()==2
   page.keyboard.press('Escape')
   assert page.locator('#si-dock-right').is_hidden(),('escape',width)
   assert page.locator('[data-open-dock="ver"]').evaluate('(el)=>document.activeElement===el'),('focus-return',width)
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),('overflow',width)
   assert not errors,(width,errors)
   print('OK',width,height,'categorias/ver-detalhe-retorno/dados/fechamento/overflow')
   ctx.close()
  b.close()
if __name__=='__main__':check()
