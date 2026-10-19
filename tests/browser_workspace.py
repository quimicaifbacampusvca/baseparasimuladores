#!/usr/bin/env python3
"""Smoke real em Chromium para a cena; não exige HTTP ou serviços remotos."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent

def run():
    content=(ROOT/'standalone.html').read_text('utf-8')
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        for width,height in [(1440,900),(1024,768),(390,844),(320,700)]:
            context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<=390,has_touch=width<=390)
            page=context.new_page()
            errors=[]
            page.on('pageerror',lambda err:errors.append(str(err)))
            page.set_content(content,wait_until='domcontentloaded')
            page.evaluate('location.hash="#/ambiente"')
            page.wait_for_timeout(120)
            page.locator('[data-open-dock="montagem"]').click()
            page.locator('[data-add-kind="block"]').click()
            page.locator('[data-close-dock="left"]').click()
            obj=page.locator('.scene-entity').first
            before=obj.get_attribute('style')
            bb=obj.bounding_box()
            assert bb is not None
            x=bb['x']+bb['width']/2
            y=bb['y']+bb['height']/2
            page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+60,y+35,steps=8);page.mouse.up()
            page.wait_for_timeout(90)
            after=page.locator('.scene-entity').first.get_attribute('style')
            assert after!=before, ('drag',width)
            page.locator('#scene-undo').click()
            assert page.locator('.scene-entity').first.get_attribute('style')==before, ('undo',width)
            page.locator('#scene-redo').click()
            assert page.locator('.scene-entity').first.get_attribute('style')==after, ('redo',width)
            page.locator('[data-scene-view="overview"]').click()
            page.locator('.si-overview-item').first.click()
            assert page.locator('#workspace-focus').is_visible()
            page.locator('[data-open-dock="ver"]').click()
            assert page.locator('#si-dock-right').is_visible()
            page.locator('[data-close-dock="right"]').click()
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),('overflow',width)
            assert not errors,(width,errors)
            print('OK Chromium',width,height,'drag/undo/redo/foco/docas')
            context.close()
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        page=context.new_page()
        page.set_content(content)
        page.evaluate('location.hash="#/ambiente"')
        page.wait_for_timeout(120)
        page.locator('[data-open-dock="montagem"]').click()
        page.locator('[data-add-kind="block"]').click()
        page.locator('[data-close-dock="left"]').click()
        obj=page.locator('.scene-entity').first
        before=obj.get_attribute('style');bb=obj.bounding_box()
        x=bb['x']+bb['width']/2;y=bb['y']+bb['height']/2
        cdp=context.new_cdp_session(page)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
        for i in range(1,10):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+5*i,'y':y+4*i,'id':1}]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        page.wait_for_timeout(100)
        assert page.locator('.scene-entity').first.get_attribute('style')!=before
        page.locator('#scene-undo').click()
        assert page.locator('.scene-entity').first.get_attribute('style')==before
        page.select_option('#si-module-choice','medir')
        assert page.locator('#scene-clear').is_disabled()
        obj=page.locator('.scene-entity').first;bb=obj.bounding_box()
        x=bb['x']+bb['width']/2;y=bb['y']+bb['height']/2
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':2}]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+70,'y':y+40,'id':2}]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        page.wait_for_timeout(100)
        assert page.locator('.scene-entity').first.get_attribute('style')==before
        print('OK Chromium 390 touch/undo/permissões')
        context.close();browser.close()

if __name__=='__main__':run()
