#!/usr/bin/env python3
"""Smoke test visual (Chromium local); não representa homologação file:// ou PWA."""
from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parent.parent
html=(root/'standalone.html').read_text('utf-8')
results=[]
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(320,700),(390,844),(1024,768),(1440,900)]:
        page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda e:errors.append('pageerror: '+str(e)))
        page.on('console',lambda e:errors.append(e.text) if e.type=='error' else None)
        page.set_content(html,wait_until='domcontentloaded',timeout=12000)
        page.wait_for_timeout(120)
        assert page.locator('#distribution-install').is_hidden(), 'Instalar exibido sem evento de instalação'
        if width<=970:
            page.locator('#nav-toggle').click()
            assert page.locator('#nav-backdrop').is_visible(), 'Backdrop mobile ausente'
            assert page.locator('#main-column').get_attribute('inert') is not None, 'Fundo do menu ainda interativo'
            page.keyboard.press('Escape')
            assert page.locator('#nav-backdrop').is_hidden(), 'Backdrop não fechou por Escape'
            assert page.locator('#main-column').get_attribute('inert') is None, 'Fundo ainda bloqueado após Escape'
            assert page.locator('#nav-toggle').get_attribute('aria-expanded')=='false'
            page.locator('#nav-toggle').click()
            page.locator('#nav-backdrop').click(position={'x':width-10,'y':height-10})
            assert page.locator('#nav-backdrop').is_hidden(), 'Backdrop não fechou por toque'
        page.evaluate('location.hash="#/ambiente"')
        page.wait_for_timeout(150)
        page.evaluate('document.querySelector("[data-open-dock=montagem]").click()')
        page.evaluate('document.querySelector("[data-add-kind=block]").click()')
        assert '1 / 60' in page.locator('#scene-count').inner_text()
        page.evaluate('document.querySelector("#scene-undo").click()')
        assert '0 / 60' in page.locator('#scene-count').inner_text()
        page.evaluate('document.querySelector("#scene-redo").click()')
        assert '1 / 60' in page.locator('#scene-count').inner_text()
        assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), 'Overflow horizontal'
        page.screenshot(path=str(root/f'smoke-{width}.png'),animations='disabled')
        assert not errors, errors
        results.append({'viewport':width,'menu_mobile':width<=970,'entidades':1,'overflow':False,'js_errors':0})
        page.close()
    # Simulação explícita de storage bloqueado: persistência de dados não pode ser alegada.
    page=browser.new_page()
    page.evaluate('Object.defineProperty(window,"localStorage",{configurable:true,get(){throw Error("bloqueado")}})')
    page.set_content(html,wait_until='domcontentloaded')
    page.evaluate('location.hash="#/ambiente"')
    page.wait_for_timeout(100)
    page.evaluate('document.querySelector("[data-open-dock=montagem]").click()')
    page.evaluate('document.querySelector("[data-add-kind=block]").click()')
    assert page.locator('#storage-warning').is_visible(), 'Falha de persistência não informada'
    results.append({'storage_bloqueado':'aviso persistente visível'})
    page.close()
    browser.close()
print(json.dumps(results,ensure_ascii=False,indent=2))
