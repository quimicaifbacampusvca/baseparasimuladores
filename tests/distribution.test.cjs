const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root,filename), 'utf8');
const sw = read('sw.js');
const html = read('index.html');
const solo = read('standalone.html');
const manifest = JSON.parse(read('manifest.webmanifest'));
const precache = JSON.parse('['+sw.match(/const FILES = \[([\s\S]*?)\];/)[1].replace(/,\s*$/, '')+']');
assert.equal(manifest.name, 'Base Demo Oficial - SI');
assert.equal(JSON.parse(read('package.json')).version, '0.9.13');
assert(new Set(precache).size === precache.length, 'Recursos duplicados no precache');
for(const entry of precache) if(entry!=='./') assert(fs.existsSync(path.join(root,entry)),'Faltando: '+entry);
for(const ref of [...html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)])
  assert(precache.includes(ref[1]), 'Não está no precache: '+ref[1]);
assert(precache.includes('./distribution.css'));
assert(precache.includes('./inspection.css'));
assert(precache.includes('./completion.css'));
for(const icon of ['assets/icon-192.png','assets/icon-512.png','assets/apple-touch-icon.png']) {
  const data = fs.readFileSync(path.join(root,icon));
  assert.equal(data.subarray(1,4).toString(),'PNG');
}
assert(!/https?:\/\//.test(html),'Rede externa inesperada');
assert(!/(?:src|href)="\.\//.test(solo),'Stand alone contém recurso relativo');
assert(!/<link rel="manifest"/.test(solo));
assert(/<style>[\s\S]*<\/style>/.test(solo));
assert(/<script>[\s\S]*<\/script>/.test(solo));
assert(solo.includes('data:image/svg+xml;base64,'));
const styles = solo.match(/<style>([\s\S]*?)<\/style>/)[1];
const script = solo.match(/<script>([\s\S]*?)<\/script>/)[1];
for(const code of [styles,script]) {
  const hash=crypto.createHash('sha256').update(code).digest('base64');
  assert(solo.includes(`'sha256-${hash}'`),'CSP não confere com conteúdo embutido');
}
assert(/connect-src 'none'/.test(solo));
const resources=/https?:\/\/|@import|new\s+WebSocket|\bfetch\(/i;
assert(!resources.test(script));
assert(!/\b(fetch|XMLHttpRequest)\s*\(/.test(read('app.js')));
const tests = ['docs/ACEITE-0.9.3.md','README.md','docs/PLANO-DE-CONSTRUCAO.md'];
for(const t of tests) assert(!/SIAB/i.test(read(t)),'Documento possui referência a outro simulador: '+t);
console.log(`OK: distribuição 0.9.8, ${precache.length} recursos pré-cache, ícones PNG, standalone único com CSP hashes, sem links remotos.`);
