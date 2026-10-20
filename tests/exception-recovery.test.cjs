const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const prefix='base-demo-oficial-si:';
function launch(shared,fail=()=>false){
  const observed=new Map();let refreshes=0;
  const body={append(node){observed.set(node.id,node)}};
  const elements=new Map([['edu-form-kind',{value:'mission',addEventListener(){}}]]);
  const document={readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById(id){return elements.get(id)||null},querySelector(){return null},body,documentElement:{},
    createElement(tag){return {tag,id:'',setAttribute(){},append(){},addEventListener(){},focus(){},className:'',textContent:'',style:{}}}};
  const listeners=new Map();
  const window={location:{hash:'#/missoes',reload(){refreshes++}},localStorage:{getItem:k=>shared.get(k)??null,setItem:(k,v)=>{if(fail(k,String(v)))throw Error("quota");shared.set(k,String(v))}},
    addEventListener(key,fn){const arr=listeners.get(key)||[];arr.push(fn);listeners.set(key,arr)},
    dispatchEvent(ev){(listeners.get(ev.type)||[]).forEach(fn=>fn(ev))}};
  const ctx={window,document,Date,Set,Map,Object,Math,URLSearchParams,console,Event:class{constructor(type){this.type=type}},CustomEvent:class{constructor(type,detail){this.type=type;this.detail=detail?.detail}}};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  const api=ctx.BaseDemoSI;
  const snapshot={schemaVersion:1,selectedId:null,entities:[]};
  const scene=api.createSceneStore(snapshot);
  api.setupStorageConflictProtection();api.setupEducation(scene);
  return {api,scene,window,document,shared,observed,getRefreshes:()=>refreshes};
}
function block(id){return {id,kind:'block',label:'Bloco',tone:'teal',x:30,y:30,width:18,height:18}};
// Conflito recebido após alteração em outra aba: bloquear operações antes de persistir.
const shared=new Map();const tabA=launch(shared),tabB=launch(shared);
assert(tabA.api.beginGuidedActivity('mission-create','mission'));
assert(tabA.scene.dispatch({type:'add',entity:block('local')}));
const previous=tabA.scene.getSnapshot();
const sessionKey=prefix+'guided-session-v1';
shared.set(sessionKey,'{"outro":"editor"}');
tabA.window.dispatchEvent({type:'storage',key:sessionKey,newValue:shared.get(sessionKey)});
assert(tabA.api.hasStorageConflict());
assert.equal(tabA.api.advanceActivityFromMenu('mission-create').ok,false);
assert.equal(tabA.api.endGuidedActivity(),false);
assert.equal(tabA.scene.dispatch({type:'add',entity:block('after')}),false);
assert.equal(tabA.scene.undo(),false);
assert.deepEqual(JSON.stringify(tabA.scene.getSnapshot()),JSON.stringify(previous));
assert(tabA.observed.has('si-storage-conflict'),'mensagem de bloqueio apresentada');
// A outra aba ainda pode carregar os dados atualizados, sem herdá-los como uma sessão inválida.
assert.equal(tabB.api.guidedActivityContext(),null);
// Conflito antes do evento: comparar com a última versão observada na primeira alteração.
const memory2=new Map();const tab=launch(memory2);
const before=tab.scene.getSnapshot();
memory2.set(prefix+'education-document-v1','{"stale":true}');
assert.equal(tab.scene.dispatch({type:'add',entity:block('not-persisted')}),false);
assert(tab.api.hasStorageConflict());
assert.deepEqual(JSON.stringify(tab.scene.getSnapshot()),JSON.stringify(before));
// Os dados não essenciais (preferências locais) não geram bloqueio concorrente.
const memory3=new Map();const preferences=launch(memory3);
preferences.window.dispatchEvent({type:'storage',key:prefix+'theme',newValue:'escuro'});
assert.equal(preferences.api.hasStorageConflict(),false);
assert.equal(preferences.scene.dispatch({type:'add',entity:block('valid')}),true);
// Falha especificamente na gravação do encerramento não pode apagar o checkpoint anterior.
const failingEnd=new Map();
const active=launch(failingEnd,(key,value)=>key===prefix+'guided-session-v1'&&value==='');
assert(active.api.beginGuidedActivity('mission-create','mission'));
assert(active.scene.dispatch({type:'add',entity:block('half')}));
assert.equal(active.api.endGuidedActivity(),false);
assert(active.api.guidedActivityContext(),'tentativa permanece ativa se encerramento não persistiu');
const recovered=JSON.parse(failingEnd.get(prefix+'guided-checkpoints-v1'));
assert.equal(Object.keys(recovered.entries).length,0,'checkpoint novo é revertido após falha do encerramento');
// Regressão de código: importações destrutivas devem revalidar sessão após confirmação.
const records=fs.readFileSync(path.join(__dirname,'../src/records-ui.ts'),'utf8');
assert.match(records,/if\(guidedActivityContext\(\)\)/);
assert((records.split('if(guidedActivityContext())').length-1)>=4,'importação e limpeza bloqueadas durante a atividade');
const educational=fs.readFileSync(path.join(__dirname,'../src/education-ui.ts'),'utf8');
assert.match(educational,/const original=checkpoints;/);
assert.match(educational,/if\(!checkpointSave\(\)\)\{/);
assert.match(educational,/const olderCheckpoint=checkpoints\[previous.url\]\?\?null/);
console.log('OK: 0.9.16 — conflito entre abas com/sem evento, bloqueio de escrita e Desfazer, importações, checkpoint e recuperação.');
