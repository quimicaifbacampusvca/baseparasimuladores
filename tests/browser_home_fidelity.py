"""Bloco 02: Home: geometria + navegação + conteúdo contextual (Chromium injetado)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'standalone.html').read_text('utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(320,700),(360,740),(390,844),(414,896),(768,1024),(1024,768),(1440,900),(844,390)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  assert page.locator('.si-home-path').count()==5
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),('overflow',width)
  coords=page.evaluate('''()=>{const rect=x=>{const r=document.querySelector(x).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};
    return {primary:rect('.si-home-path-primary'),learn:rect('.si-home-path[href="#/aprender"]'),mission:rect('.si-home-path[href="#/missoes"]'),script:rect('.si-home-path[href="#/roteiros"]'),notebook:rect('.si-home-path[href="#/caderno"]'),button:rect('.si-home-path-primary .si-path-action'),hero:rect('.si-home-hero')}}''')
  if width>960:
   assert coords['primary']['x']<coords['learn']['x']<coords['mission']['x'],(width,coords)
   assert coords['primary']['bottom']>=coords['notebook']['bottom']-5,(width,coords)
  elif width>370:
   assert coords['primary']['bottom']<coords['learn']['y'],(width,coords)
   assert abs(coords['learn']['y']-coords['mission']['y'])<5,(width,coords)
  else:
   assert coords['primary']['bottom']<coords['learn']['y']<coords['mission']['y']<coords['script']['y']<coords['notebook']['y'],(width,coords)
  assert coords['button']['y']>=coords['primary']['y'] and coords['button']['bottom']<=coords['primary']['bottom']+1,coords
  assert page.locator('#si-home-learning-meta').inner_text().startswith('3 temas')
  assert page.locator('#si-home-missions-meta').inner_text().startswith('3 desafios')
  assert page.locator('#si-home-scripts-meta').inner_text().startswith('2 investigações')
  # Indicadores devem refletir dados validados, sem números fictícios.
  page.evaluate('''()=>{
    const read=BaseDemoSI.storage.read;
    BaseDemoSI.storage.read=(key)=>{
      if(key==='education-document-v1')return JSON.stringify({schemaVersion:1,topicsDone:['topic-scene'],progress:{},teacherActivities:[]});
      if(key==='journal-document-v1')return JSON.stringify({schemaVersion:1,notes:[],reports:[]});
      return read(key);
    };
    BaseDemoSI.updateHomeIndicators();
  }''')
  assert '1 concluído' in page.locator('#si-home-learning-meta').inner_text()
  if width in [320,390,1024,1440]:page.screenshot(path=str(root/f'home-block02-{width}.png'),full_page=True)
  page.locator('.si-home-path[href="#/aprender"]').click();page.wait_for_timeout(90)
  assert page.locator('[data-view="aprender"]').is_visible()
  page.evaluate('location.hash="#/inicio"');page.wait_for_timeout(90)
  page.locator('.si-home-path-primary').click();page.wait_for_timeout(90)
  assert page.locator('.si-workspace').is_visible()
  assert not errors,(width,errors)
  print('OK Home',width,'x',height)
  page.close()
 browser.close()
