#!/usr/bin/env python3
"""Teste funcional e visual da doca Montagem, sem usar rede."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'standalone.html').read_text('utf-8')

def run():
  with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(1440,900),(1024,768),(390,844),(320,700),(844,390)]:
      ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=w<=900,has_touch=w<=900)
      pg=ctx.new_page()
      errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
      pg.set_content(HTML,wait_until='domcontentloaded')
      pg.evaluate("location.hash='#/ambiente'")
      pg.wait_for_timeout(80)
      initial=pg.locator('#si-canvas').bounding_box()['height']
      pg.locator('[data-open-dock="montagem"]').click()
      assert pg.locator('#si-dock-left').is_visible()
      assert [x.get_attribute('data-left-tab') for x in pg.locator('[data-left-tab]:visible').all()]==['resumo','preparo','objetos','modulo']
      assert pg.locator('[data-left-tab="missao"]').is_hidden()
      for tab in ['resumo','preparo','objetos','modulo']:
        pg.locator(f'[data-left-tab="{tab}"]').click()
        assert pg.locator(f'[data-left-panel="{tab}"]').is_visible(), (w,tab)
      pg.locator('[data-left-tab="modulo"]').click()
      assert pg.locator('#si-module-choice').is_visible()
      pg.locator('#si-module-choice').select_option('medir')
      assert pg.locator('[data-left-tab="preparo"]').is_hidden()
      assert pg.locator('[data-left-tab="objetos"]').is_hidden()
      assert pg.locator('[data-left-tab="modulo"]').is_visible()
      pg.locator('#si-module-choice').select_option('livre')
      assert pg.locator('[data-left-tab="preparo"]').is_visible()
      pg.locator('[data-left-tab="preparo"]').click()
      pg.locator('[data-add-kind="block"]').click()
      assert pg.locator('.scene-entity').count()==1
      # Abas dinamicamente contextualizadas; Missão só quando existe atividade real.
      pg.evaluate('''() => {let l=document.getElementById('si-return-activity');l.hidden=false;l.setAttribute('href','#/roteiros');window.dispatchEvent(new CustomEvent('si-module-change',{detail:'livre'}));}''')
      assert pg.locator('[data-left-tab="missao"]').is_visible(),('mission',w)
      assert pg.locator('[data-left-tab="modulo"]').is_hidden()
      pg.locator('[data-left-tab="missao"]').click()
      assert pg.locator('[data-left-panel="missao"]').is_visible()
      pg.evaluate('''() => {document.getElementById('si-return-activity').hidden=true;window.dispatchEvent(new CustomEvent('si-module-change',{detail:'livre'}));}''')
      assert pg.locator('[data-left-tab="missao"]').is_hidden()
      assert pg.locator('[data-left-panel="resumo"]').is_visible()
      assert abs(pg.locator('#si-canvas').bounding_box()['height']-initial)<2
      assert not pg.evaluate('document.documentElement.scrollWidth > innerWidth + 2'),('overflow',w)
      assert not errors,(w,errors)
      print('OK',w,h,'categorias condicionais, seleção de módulo, missão, cena estável, estilo')
      ctx.close()
    browser.close()
if __name__=='__main__':run()
