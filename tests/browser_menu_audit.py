from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parent.parent
src=(p/'standalone.html').read_text('utf8')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in ((390,844),(1440,900)):
  page=b.new_page(viewport={'width':width,'height':height})
  page.set_content(src,wait_until='domcontentloaded')
  page.locator('#nav-toggle').click()
  page.wait_for_timeout(250)
  page.screenshot(path=str(p/f'menu-{width}.png'))
  print(width,'menu',page.locator('#sidebar').bounding_box(),'sections',page.locator('#sidebar .si-drawer-section').count(),'backdrop',page.locator('#nav-backdrop').is_visible())
  page.close()
 b.close()
