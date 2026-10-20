#!/usr/bin/env python3
"""Integração de identificação, registros e saída guiada; HTML autocontido."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parent.parent/'standalone.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(1440,900),(390,844),(320,700)]:
        context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<=900,has_touch=width<=900)
        page=context.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.evaluate("""() => {const d=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k)}})}""")
        page.set_content(html,wait_until='domcontentloaded')
        page.evaluate('location.hash="#/caderno"');page.wait_for_timeout(80)
        page.locator('#journal-body').fill('OBSERVAÇÃO PRIVADA DA BANCADA LIVRE')
        page.locator('#journal-form button[type="submit"]').click();page.wait_for_timeout(50)
        page.evaluate('location.hash="#/missoes?item=mission-create"');page.wait_for_timeout(120)
        detail=page.locator('#edu-mission-detail')
        assert detail.is_visible(),(width,'detail')
        assert detail.locator('input[name=nome]').count()==1
        detail.locator('input[name=nome]').fill('Estudante de Teste')
        detail.locator('input[name=turma]').fill('Turma B')
        detail.locator('input[name=professor]').fill('Docente')
        detail.locator('input[name=grupo]').fill('Equipe 2')
        detail.locator('button:has-text("Montar na bancada")').click();page.wait_for_timeout(100)
        assert page.evaluate('location.hash')=='#/ambiente',width
        page.evaluate('location.hash="#/caderno"');page.wait_for_timeout(80)
        page.locator('#journal-body').fill('OBSERVAÇÃO DA TENTATIVA GUIADA')
        page.locator('#journal-form button[type="submit"]').click();page.wait_for_timeout(60)
        page.evaluate('location.hash="#/ambiente"');page.wait_for_timeout(65)
        page.locator('[data-open-dock="montagem"]').click();page.locator('[data-left-tab="preparo"]').click()
        page.locator('[data-add-kind="block"]').click();page.locator('[data-add-kind="circle"]').click();
        page.locator('[data-close-dock="left"]').click()
        page.evaluate('location.hash="#/missoes?item=mission-create"');page.wait_for_timeout(65)
        detail.locator('button:has-text("Conferir e registrar")').click();page.wait_for_timeout(70)
        assert 'Atividade concluída' in detail.inner_text(),(width,'completion')
        page.evaluate('location.hash="#/relatorios"');page.wait_for_timeout(75)
        assert page.locator('#report-guided-context').is_visible(),(width,'report context')
        assert page.locator('#report-author').input_value()=='Estudante de Teste'
        assert page.locator('#report-title').input_value().startswith('Relatório — Primeira composição')
        page.locator('#reports-form button[type=submit]').click();page.wait_for_timeout(95)
        assert page.locator('#reports-entries .si-report-entry').count()==1,(width,'report saved')
        report=page.locator('#report-preview').inner_text()
        assert 'Turma B' in report and 'Equipe 2' in report and '1/1' in report,(width,report[:250])
        assert 'OBSERVAÇÃO DA TENTATIVA GUIADA' in report and 'OBSERVAÇÃO PRIVADA DA BANCADA LIVRE' not in report,(width,'scope')
        page.evaluate('location.hash="#/missoes?item=mission-create"');page.wait_for_timeout(65)
        detail.locator('button:has-text("Encerrar atividade")').click()
        assert page.locator('#si-modal').is_visible()
        page.locator('#si-modal-confirm').click();page.wait_for_timeout(75)
        assert page.locator('#reports-entries .si-report-entry').count()==1,(width,'no duplicated automatic report')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),(width,'no overflow')
        assert not errors,(width,errors)
        print('OK',width,'px: identificação, caderno isolado, relatório, conclusão, saída sem duplicação, responsividade')
        context.close()
    browser.close()
