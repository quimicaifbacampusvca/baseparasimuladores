const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../app.js'),'utf8');
const prefix='base-demo-oficial-si:';
const entity=(id,index=0)=>({id,kind:'block',label:'Objeto',tone:'teal',x:30+index*15,y:30,width:18,height:18});
const free={schemaVersion:1,selectedId:null,entities:[entity('free')]};
function launch(memory=new Map(),shouldFail=()=>false){
 const nodes=new Map([['edu-form-kind',{value:'mission',addEventListener(){}}]]);
 const listeners=new Map();const alerts=[];
 const document={readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById:id=>nodes.get(id)||null,documentElement:{},body:{}};
 const window={location:{hash:'#/missoes'},localStorage:{getItem:k=>memory.get(k)??null,setItem(k,v){if(shouldFail(k))throw Error('quota');memory.set(k,String(v));}},
   addEventListener(name,cb){const arr=listeners.get(name)||[];arr.push(cb);listeners.set(name,arr)},
   dispatchEvent(e){(listeners.get(e.type)||[]).forEach(cb=>cb(e))}};
 const ctx={document,window,Set,Map,Object,Date,Math,console,URLSearchParams,Event:class {constructor(type){this.type=type}},CustomEvent:class {constructor(type,args){this.type=type;this.detail=args?.detail}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 const api=ctx.BaseDemoSI;
 const original=memory.get(prefix+'scene-project-v1');const scene=api.createSceneStore(original?JSON.parse(original):free);
 scene.subscribe(event=>{if(event!=='selection')memory.set(prefix+'scene-project-v1',api.serializeScene(scene.getSnapshot()))});
 api.setupEducation(scene);
 return {api,scene,memory,alerts};
}
// A identidade e o identificador NÃO devem mudar ao recuperar checkpoints de um novo processo.
const memory=new Map();let a=launch(memory),api=a.api,scene=a.scene;
const ident={nome:'Estudante 15',turma:'9º B',data:'2026-10-20',professor:'Docente',grupo:'Equipe'};
assert(api.beginGuidedActivity('mission-create','mission',ident));
assert.equal(scene.canUndo(),false,'histórico livre não atravessa a nova sessão');
const attempt=api.guidedReportContext().attemptId;
assert(scene.dispatch({type:'add',entity:entity('task-a')}));
assert(scene.canUndo(),'histórico interno da atividade disponível');
assert(api.endGuidedActivity());
assert.equal(scene.canUndo(),false,'histórico orientado não atravessa o encerramento');
assert.equal(api.guidedActivityContext(),null);
assert.deepEqual(Array.from(scene.getSnapshot().entities,e=>e.id),['free']);
const checkpoint=JSON.parse(memory.get(prefix+'guided-checkpoints-v1'));
assert.equal(checkpoint.entries['#/missoes?item=mission-create'].attemptId,attempt);
a=launch(memory);api=a.api;scene=a.scene;
assert(api.beginGuidedActivity('mission-create','mission'));
assert.equal(api.guidedReportContext().attemptId,attempt,'identidade da tentativa sobreviver à recarga');
assert.equal(api.guidedReportContext().identity.nome,'Estudante 15','identificação acompanha o checkpoint');
assert.deepEqual(Array.from(scene.getSnapshot().entities,e=>e.id),['task-a']);
assert.equal(scene.canUndo(),false,'retomada não recupera a bancada livre por Desfazer');
// A recarga com atividade ativa deve recuperar a tentativa e manter a referência livre.
const afterReload=launch(memory);assert.equal(afterReload.api.guidedReportContext().attemptId,attempt);
assert.equal(afterReload.api.currentModule(),'explorar','módulo guiado restaurado após recarga');
assert(afterReload.api.endGuidedActivity());
assert.deepEqual(Array.from(afterReload.scene.getSnapshot().entities,e=>e.id),['free']);
// O armazenamento pode falhar: nunca informar avanço ou conclusão gravada sem persistir.
const failing=launch(new Map(),key=>key===prefix+'education-document-v1');
const guided=failing.api;
assert(guided.beginGuidedActivity('mission-create','mission'));
failing.scene.dispatch({type:'add',entity:entity('a')});failing.scene.dispatch({type:'add',entity:entity('b',1)});
const outcome=guided.advanceActivityFromMenu('mission-create');
assert.equal(outcome.ok,false,'não relatar conclusão em caso de falha da gravação');
assert.equal(guided.menuActivityProgress('mission-create'),0);
// Não iniciar se a sessão não pôde ser gravada.
const cannotStart=launch(new Map(),key=>key===prefix+'guided-session-v1');
assert.equal(cannotStart.api.beginGuidedActivity('mission-create','mission'),false);
assert.equal(cannotStart.api.guidedActivityContext(),null);
assert.deepEqual(Array.from(cannotStart.scene.getSnapshot().entities,e=>e.id),['free']);
// Não terminar se o checkpoint não foi salvo: a tentativa permanece ativa.
const cannotEnd=launch(new Map(),key=>key===prefix+'guided-checkpoints-v1');
assert(cannotEnd.api.beginGuidedActivity('mission-create','mission'));
cannotEnd.scene.dispatch({type:'add',entity:entity('x')});
assert.equal(cannotEnd.api.endGuidedActivity(),false);
assert(cannotEnd.api.guidedActivityContext());
assert.deepEqual(Array.from(cannotEnd.scene.getSnapshot().entities,e=>e.id),['x']);
console.log('OK: 0.9.15 — identidade e cena após checkpoint/recarga, módulo, falha de gravação, avanço e encerramento seguros.');
