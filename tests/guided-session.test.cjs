const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');const src=fs.readFileSync(path.join(root,'app.js'),'utf8');
const prefix='base-demo-oficial-si:';
const entity=(id,index=0)=>({id,kind:'block',label:'Bloco',tone:'teal',x:28+index*22,y:35,width:18,height:18});
const freeScene={schemaVersion:1,selectedId:null,entities:[entity('free-a'),entity('free-b',1)]};
function load(values=new Map()){
  const nodes=new Map(),listeners=new Map();
  nodes.set("edu-form-kind",{value:"mission",addEventListener(){}});
  const document={readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById:id=>nodes.get(id)||null,documentElement:{},body:{}};
  const window={location:{hash:'#/missoes'},localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))},
    addEventListener:(name,cb)=>{const a=listeners.get(name)||[];a.push(cb);listeners.set(name,a)},dispatchEvent:e=>(listeners.get(e.type)||[]).forEach(f=>f(e))};
  const context={document,window,Set,Map,Object,Date,console,URLSearchParams,Event:class {constructor(type){this.type=type}},CustomEvent:class {constructor(type,options){this.type=type;this.detail=options?.detail}}};
  vm.createContext(context);vm.runInContext(src,context);
  const api=context.BaseDemoSI;
  let saved=values.get(prefix+'scene-project-v1');
  const scene=api.createSceneStore(saved?JSON.parse(saved):freeScene);
  scene.subscribe(ev=>{if(ev!=='selection')values.set(prefix+'scene-project-v1',api.serializeScene(scene.getSnapshot()))});
  api.setupEducation(scene);
  return {api,scene,values};
}
const memory=new Map();let a=load(memory),api=a.api,scene=a.scene;
assert.equal(api.guidedActivityContext(),null);
assert.equal(api.advanceActivityFromMenu('mission-create').ok,false,'Só consulta não conta como execução');
assert.equal(api.beginGuidedActivity('mission-create','mission'),true);
assert.equal(scene.getSnapshot().entities.length,0,'Nova bancada não herda objetos da bancada livre');
assert.equal(api.guidedActivityContext().title,'Primeira composição');
assert.equal(api.beginGuidedActivity('script-start','script'),false,'Impede trocar atividade ativa sem encerrar');
assert.equal(api.advanceActivityFromMenu('mission-create').ok,false,'Cena inicial não atende critério');
assert(scene.dispatch({type:'add',entity:entity('work-a')}));
assert.equal(api.advanceActivityFromMenu('mission-create').ok,false);
api.endGuidedActivity();
assert.equal(api.guidedActivityContext(),null);
assert.deepEqual(Array.from(scene.getSnapshot().entities,e=>e.id),['free-a','free-b'],'Bancada livre restaurada');
assert.equal(api.beginGuidedActivity('mission-create','mission'),true);
assert.deepEqual(Array.from(scene.getSnapshot().entities,e=>e.id),['work-a'],'Retomar recupera cena parcial, não a bancada livre');
scene.dispatch({type:'add',entity:entity('work-b',1)});
assert.equal(api.advanceActivityFromMenu('mission-create').ok,true);
assert.equal(api.menuActivityProgress('mission-create'),1);
api.endGuidedActivity();
assert.equal(api.beginGuidedActivity('mission-create','mission'),false,'Repetição explícita após conclusão');
// Abertura de nova atividade mantém o estado livre anterior.
assert.equal(api.beginGuidedActivity('script-start','script'),true);
assert.equal(scene.getSnapshot().entities.length,0);
const second=load(memory);
assert.equal(second.api.guidedActivityContext().kind,'script','Sessão retomada após recarga');
assert.equal(second.scene.getSnapshot().entities.length,0);
second.api.endGuidedActivity();
assert.deepEqual(Array.from(second.scene.getSnapshot().entities,e=>e.id),['free-a','free-b']);
assert.equal(second.api.beginGuidedActivity('script-start','script'),true);
assert.equal(second.scene.getSnapshot().entities.length,0);
// Documento de progresso preservado após recarga, sem confundir missão e roteiro.
assert.equal(second.api.menuActivityProgress('mission-create'),1);
assert.equal(second.api.advanceActivityFromMenu('mission-create').ok,false,'Etapa de outra atividade não pode ser registrada');
// Corrupção não pode criar uma sessão fantasma.
const corrupted=new Map([[prefix+'guided-session-v1','{"schemaVersion":1,"url":"#/missoes?item=mission-create","freeScene":{},"readingsBaseline":0}']]);
assert.equal(load(corrupted).api.guidedActivityContext(),null);
assert(fs.readFileSync(path.join(root,'src/education-ui.ts'),'utf8').includes('checkpointDelete'));
console.log('OK: 0.9.13 — iniciar/continuar/encerrar, bancada isolada, checkpoints, progresso, recarga e validação.');
