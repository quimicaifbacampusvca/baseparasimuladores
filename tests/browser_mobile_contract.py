#!/usr/bin/env python3
"""Bloco 05: geometria e interações mobile, sem rede externa."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'standalone.html').read_text('utf-8')

def run():
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for w,h in [(320,700),(360,740),(390,844),(414,896),(768,1024),(844,390),(667,375),(1024,768),(1440,900)]:
   mobile=w<=900
   ctx=b.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page();errs=[];page.on('pageerror',lambda err:errs.append(str(err)))
   page.set_content(HTML,wait_until='domcontentloaded');page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(140)
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),('horizontal overflow',w,h)
   scene=page.locator('#si-canvas');base=scene.bounding_box();assert base and base['height']>=55,('scene height',w,h,base)
   left=page.locator('[data-open-dock="montagem"]');left.click()
   assert page.locator('#si-dock-left').is_visible()
   assert abs(scene.bounding_box()['height']-base['height'])<=2,('canvas moved',w,h)
   if mobile:
    h1=page.locator('#si-dock-left .si-dock-header').bounding_box()
    action=page.locator('[data-close-dock="left"]').bounding_box()
    assert action['height']>=43.5 and h1['height']>=50,('touch target',w,h)
    bounds=page.locator('#si-dock-left').bounding_box()
    assert bounds['y']>=0 and bounds['y']+bounds['height']<=h,('sheet outside viewport',w,h,bounds)
    assert page.locator('#si-left-scroll').evaluate('(e)=>getComputedStyle(e).overflowY')=='auto'
    assert page.locator('#si-left-scroll').evaluate('(e)=>getComputedStyle(e).overscrollBehaviorY')=='contain'
    # Mudança entre as folhas inferiores não altera as dimensões da cena.
    page.locator('[data-open-dock="ver"]').click()
    assert page.locator('#si-dock-left').is_hidden() and page.locator('#si-dock-right').is_visible()
    page.locator('[data-open-dock="dados"]').click()
    assert page.locator('[data-right-panel="dados"]').is_visible()
    assert abs(scene.bounding_box()['height']-base['height'])<=2,('canvas jumped after switch',w,h)
   else:
    page.locator('[data-close-dock="left"]').click()
   if page.locator('#si-dock-right').is_visible():page.locator('[data-close-dock="right"]').click()
   else:
    if page.locator('#si-dock-left').is_visible():page.locator('[data-close-dock="left"]').click()
   page.locator('[data-open-dock="montagem"]').click()
   page.locator('[data-left-tab="preparo"]').click()
   page.locator('[data-add-kind="block"]').click()
   assert page.locator('.scene-entity').count()==1
   page.locator('[data-close-dock="left"]').click()
   if w<=420:
    assert page.locator('#scene-clear').is_hidden()
    page.locator('#scene-menu-toggle').click()
    clear=page.locator('#si-compact-clear');assert clear.is_visible() and clear.is_enabled()
    clear.click();assert page.locator('#si-modal').is_visible()
    page.locator('#si-modal-cancel').click();assert page.locator('.scene-entity').count()==1
    page.locator('#scene-menu-toggle').click();page.locator('#si-compact-clear').click()
    page.locator('#si-modal-confirm').click();assert page.locator('.scene-entity').count()==0
    page.locator('#scene-undo').click();assert page.locator('.scene-entity').count()==1
   else:
    assert page.locator('#scene-clear').is_visible()
   assert not errs,(w,h,errs)
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),('overflow after interactions',w,h)
   print('OK',w,h,'scene stability; panel navigation; touch targets; clear action; overflow')
   ctx.close()
  b.close()
if __name__=='__main__':run()
