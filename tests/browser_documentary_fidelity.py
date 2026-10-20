#!/usr/bin/env python3
"""UI Caderno e Relatórios: filtros, impressão, exclusão segura e folhas manuais."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parent.parent/'standalone.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in ((1440,900),(390,844),(320,700)):
        context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<=900,has_touch=width<=900,accept_downloads=True)
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.evaluate("""() => { const d=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k)}});window.__printed=[];window.print=()=>{window.__printed.push(document.getElementById('si-print-sheet').innerText);}; }""")
        page.set_content(html,wait_until='domcontentloaded')
        page.evaluate('location.hash="#/caderno"');page.wait_for_timeout(90)
        for kind,message in [('observacao','Primeira observação.'),('hipotese','=FÓRMULA TESTE'),('conclusao','Conclusão final.')]:
            page.locator('#journal-kind').select_option(kind)
            page.locator('#journal-body').fill(message)
            page.locator('#journal-form button[type=submit]').click()
            page.wait_for_timeout(45)
        assert page.locator('#journal-entries .si-journal-entry').count()==3,(width,'notes')
        page.locator('#journal-filter').select_option('hipotese')
        assert page.locator('#journal-entries .si-journal-entry').count()==1,(width,'filter')
        assert '=FÓRMULA TESTE' in page.locator('#journal-entries').inner_text()
        page.locator('#journal-filter').select_option('todos')
        assert page.locator('#journal-entries .si-journal-entry').count()==3
        with page.expect_download(timeout=5000) as d:
            page.locator('#journal-csv').click()
        assert d.value.suggested_filename=='base-si-caderno.csv',(width,d.value.suggested_filename)
        page.locator('#journal-print').click()
        printed=page.evaluate('window.__printed')
        assert printed and 'Primeira observação' in printed[-1] and 'Conclusão final' in printed[-1],(width,'print caderno')
        page.evaluate('window.dispatchEvent(new Event("afterprint"))')
        page.evaluate('location.hash="#/relatorios"');page.wait_for_timeout(80)
        page.locator('#report-title').fill('Relatório da bancada')
        page.locator('#report-author').fill('Estudante Teste')
        page.locator('#reports-form button[type=submit]').click();page.wait_for_timeout(70)
        assert page.locator('#reports-entries .si-report-entry').count()==1,(width,'report persisted')
        page.locator('#reports-blank').click()
        blank=page.evaluate('window.__printed')[-1]
        assert 'Folha para preencher' not in blank or 'Montagem e procedimentos' in blank
        assert 'Análise e interpretação' in blank and 'Conclusão' in blank,(width,'blank')
        page.evaluate('window.dispatchEvent(new Event("afterprint"))')
        page.evaluate('location.hash="#/caderno"');page.wait_for_timeout(80)
        page.locator('#journal-clear').click()
        assert page.locator('#si-modal').is_visible(),(width,'confirmation')
        page.locator('#si-modal-confirm').click();page.wait_for_timeout(80)
        assert page.locator('#journal-entries .si-journal-entry').count()==0,(width,'clear')
        page.evaluate('location.hash="#/relatorios"');page.wait_for_timeout(65)
        assert page.locator('#reports-entries .si-report-entry').count()==1,(width,'report preserved')
        assert 'Primeira observação' in page.locator('#report-preview').inner_text(),(width,'immutable')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'),(width,'horizontal overflow')
        assert not errors,(width,errors)
        print('OK',width,'px: filtros, CSV, impressão, folha manual, confirmação, relatórios preservados')
        context.close()
    browser.close()
