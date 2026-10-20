#!/usr/bin/env python3
"""Audita separação do Desfazer e do contexto livre/orientado na interface offline."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'standalone.html').read_text('utf8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(1440,900),(390,844),(320,700)]:
        context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<700,has_touch=width<700)
        page=context.new_page(); errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.evaluate('''() => {const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))}})}''')
        page.set_content(html,wait_until='domcontentloaded')
        page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(80)
        page.locator('[data-open-dock="montagem"]').click()
        page.locator('[data-left-tab="preparo"]').click()
        page.locator('[data-add-kind="block"]').click()
        page.locator('[data-close-dock="left"]').click()
        assert page.locator('.scene-entity').count()==1
        assert page.locator('#scene-undo').is_enabled()
        page.evaluate('location.hash="#/missoes?item=mission-create"');page.wait_for_timeout(85)
        page.locator('#edu-mission-detail button:has-text("Montar na bancada")').click();page.wait_for_timeout(85)
        assert page.locator('.scene-entity').count()==0,'cena livre atravessou a sessão'
        assert page.locator('#scene-undo').is_disabled(),'Desfazer indevidamente recupera a bancada livre'
        page.locator('[data-open-dock="montagem"]').click();page.locator('[data-left-tab="preparo"]').click()
        page.locator('[data-add-kind="block"]').click();page.locator('[data-close-dock="left"]').click()
        assert page.locator('#scene-undo').is_enabled(),'Desfazer próprio da sessão deve funcionar'
        page.locator('#scene-undo').click();assert page.locator('.scene-entity').count()==0
        page.evaluate('location.hash="#/missoes?item=mission-create"');page.wait_for_timeout(85)
        page.locator('#edu-mission-detail button:has-text("Encerrar atividade")').click()
        page.locator('#si-modal-confirm').click();page.wait_for_timeout(85)
        page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(85)
        assert page.locator('.scene-entity').count()==1,'encerramento não restaurou a bancada livre'
        assert page.locator('#scene-undo').is_disabled(),'Desfazer indevidamente reabre a sessão encerrada'
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,'overflow')
        assert not errors,(width,errors)
        print(f'OK {width}px: Desfazer isolado, bancada livre preservada, encerramento seguro, sem erros de interface.')
        context.close()
    browser.close()
