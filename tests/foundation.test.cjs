const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname,"..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const html = read("index.html");
const js = read("app.js");
const css = read("app.css");
const sw = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const localRefs = [...html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)].map(m=>m[1]);
for (const ref of localRefs) assert(fs.existsSync(path.join(root,ref)), `Arquivo local ausente: ${ref}`);
for (const ref of ["index.html","app.css","workspace.css","components.css","extensions.css","education.css","app.js","manifest.webmanifest","assets/icon.svg"])
  assert(sw.includes(`"./${ref}"`),`Precache não cobre ${ref}`);
assert.equal(manifest.name,"Base Demo Oficial - SI");
assert.equal(JSON.parse(read("package.json")).version,"0.6.0");
assert(!/https?:\/\//.test(html.replace(/http-equiv="Content-Security-Policy"/g,"")),"HTML tem URL remota");
assert(!/@import|url\(\s*['"]?https?:\/\//i.test(css),"CSS tem dependência remota");
assert(!/\b(fetch|XMLHttpRequest)\s*\(/.test(js),"Núcleo requisita rede");
for (const token of [/SIAB\.chem/i,/\b(pHmetro|titrac|tubos?|reagentes?)\b/i])
  for(const filename of ["src/contracts.ts","src/config.ts","src/storage.ts","src/router.ts","src/preferences.ts","src/app.ts"])
    assert(!token.test(read(filename)),`${filename} contém acoplamento científico`);
const documentStub={readyState:"loading",addEventListener(){},querySelectorAll(){return []},getElementById(){return null},documentElement:{},body:{classList:{remove(){}}}};
const sandbox={document:documentStub,window:{},navigator:{},Set,Map,Object};
vm.createContext(sandbox);vm.runInContext(js,sandbox,{filename:"app.js"});
assert.equal(sandbox.BaseDemoSI.manifest.name,"Base Demo Oficial - SI");
assert.equal(sandbox.BaseDemoSI.currentRoute("#/ambiente"),"ambiente");
assert.equal(sandbox.BaseDemoSI.currentRoute("#/rota-inexistente"),"inicio");
assert.equal(sandbox.BaseDemoSI.normalizeTheme("invalido"),"sistema");
assert.equal(sandbox.BaseDemoSI.normalizeTheme("escuro"),"escuro");
console.log(`OK: fundação preservada na 0.6.0, ${localRefs.length} referências HTML, 9 arquivos no precache, contratos e ausência de dependências remotas.`);
