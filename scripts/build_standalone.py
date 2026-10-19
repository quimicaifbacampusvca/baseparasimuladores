#!/usr/bin/env python3
"""Gera uma edição standalone de um único HTML com hashes CSP estáveis."""
from pathlib import Path
import base64, hashlib, re

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text('utf-8')
css_files = re.findall(r'<link rel="stylesheet" href="\./([^"<>]+)">', html)
assert css_files and len(css_files) >= 7, 'Lista de estilos inesperada'
all_css = '\n'.join((ROOT / path).read_text('utf-8') for path in css_files)
assert '</style' not in all_css.lower()
js = (ROOT/'app.js').read_text('utf-8')
assert '</script' not in js.lower()
css_sha = base64.b64encode(hashlib.sha256(all_css.encode()).digest()).decode()
js_sha = base64.b64encode(hashlib.sha256(js.encode()).digest()).decode()

# A edição arquivo único permite apenas hashes de scripts/estilos próprios.
policy = ('default-src \'none\'; img-src data:; '
          "style-src 'sha256-"+css_sha+"'; "
          "script-src 'sha256-"+js_sha+"'; "
          "connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'")
html, number = re.subn(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">',
                       lambda _: '<meta http-equiv="Content-Security-Policy" content="'+policy+'">', html)
assert number == 1
svg = base64.b64encode((ROOT/'assets/icon.svg').read_bytes()).decode('ascii')
html = html.replace('./assets/icon.svg', 'data:image/svg+xml;base64,'+svg)
html = re.sub(r'\s*<link rel="manifest" href="\./manifest.webmanifest">', '', html)
html = re.sub(r'\s*<link rel="apple-touch-icon" href="\./assets/apple-touch-icon.png">', '', html)
for css_file in css_files:
    html = html.replace('<link rel="stylesheet" href="./'+css_file+'">', '', 1)
html = html.replace('  <script src="./app.js" defer></script>', '', 1)
html = html.replace('</head>', '<style>'+all_css+'</style>\n</head>', 1)
html = html.replace('</body>', '<script>'+js+'</script>\n</body>', 1)
assert not re.search(r'(?:src|href)="\./', html)
assert len(html) > 100000
out = ROOT/'standalone.html'
out.write_text(html, encoding='utf-8')
print(f'Standalone criado: {out.name}, {len(html.encode()):,} bytes, {len(css_files)} CSS embutidos, JavaScript e ícone SVG embutidos, CSP por hashes.')
