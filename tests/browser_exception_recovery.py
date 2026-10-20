#!/usr/bin/env python3
"""0.9.16: concorrência simulada, foco e estabilidade visual em três resoluções."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parent.parent/'standalone.html').read_text('utf-8')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in ((1440,900),(390,844),(320,700)):
  context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<500,has_touch=width<500)
  page=context.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''() => {const d=new Map(); window.__storage=d;
    Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k)}})}''')
  page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(100)
  page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(75)
  page.locator('[data-open-dock="montagem"]').click(timeout=5000)
  page.locator('[data-left-tab="preparo"]').click(timeout=5000)
  page.locator('[data-add-kind="block"]').click(timeout=5000)
  assert page.locator('.scene-entity').count()==1
  page.evaluate('''() => {const k='base-demo-oficial-si:scene-project-v1';window.__storage.set(k,'{"unrelated":true}');
    window.dispatchEvent(new StorageEvent('storage',{key:k,newValue:window.__storage.get(k)}));}''')
  assert page.locator('#si-storage-conflict').is_visible()
  assert page.locator('#si-storage-conflict [role="invalid"]').count()==0
  assert page.locator('#si-storage-conflict button').evaluate('(el)=>document.activeElement===el')
  assert page.evaluate('window.BaseDemoSI.hasStorageConflict()')
  assert not page.evaluate('''() => window.BaseDemoSI.storage.write('scene-project-v1','x')''')
  assert page.locator('.scene-entity').count()==1
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  assert not errors,(width,errors)
  print(f'OK: {width}px — conflito, aviso acessível, bloqueio, preservação e sem transbordamento')
  context.close()
 browser.close()
