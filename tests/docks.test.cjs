const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..');const read=(s)=>fs.readFileSync(path.join(base,s),'utf8');
const ctx={document:{readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById(){return null},body:{classList:{toggle(){},remove(){}}}},window:{},navigator:{},console,Map,Set,Date,URL};vm.createContext(ctx);vm.runInContext(read('app.js'),ctx);const api=ctx.BaseDemoSI;
let ws=api.initialWorkspace();for(const tab of ['resumo','montagem','objetos','ajustes','missao']){ws=api.reduceWorkspace(ws,{type:'left-tab',tab},false);assert.equal(ws.leftTab,tab);}
assert.equal(api.parseWorkspacePreference(JSON.parse(api.serializeWorkspacePreference(ws))).leftTab,'missao');
for(const prior of ['montagem','objetos','ajustes'])assert.equal(api.parseWorkspacePreference({schemaVersion:1,view:'focus',leftTab:prior,rightTab:'ver'}).leftTab,prior);
for(const bad of ['bad','other',''])assert.equal(api.parseWorkspacePreference({schemaVersion:1,view:'focus',leftTab:bad,rightTab:'ver'}),null);
ws=api.reduceWorkspace(ws,{type:'open',side:'left',tab:'missao'},true);ws=api.reduceWorkspace(ws,{type:'open',side:'right',tab:'ver'},true);assert.equal(ws.left,'collapsed');
const html=read('index.html'),ui=read('src/workspace-ui.ts'),viewer=read('src/viewers.ts'),css=read('workspace.css');
for(const tab of ['resumo','montagem','objetos','ajustes','missao']){assert(html.includes('data-left-tab="'+tab+'"'));assert(html.includes('data-left-panel="'+tab+'"'));}
for(const id of ['si-dock-viewer-back','si-viewer-catalog','si-viewer-detail','si-dock-setup-summary','si-dock-activity-status','si-dock-activity-link','si-right-scroll'])assert(html.includes('id="'+id+'"'));
assert(ui.includes('si-viewer-selected'));assert(viewer.includes('si-viewer-selected'));assert(css.includes('height:min(73dvh,600px)'));
assert(!/SIAB/i.test(read('docs/ACEITE-BLOCO-04-0.9.5.md')));
console.log('OK: Bloco 04 — categorias, migração, navegação Ver, dados, responsividade e documentação.');
