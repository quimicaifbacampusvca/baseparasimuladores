const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const documentStub={readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById(){return null},documentElement:{},body:{classList:{remove(){}}}};
const context={document:documentStub,window:{},navigator:{},Set,Map,Object,Date,console};
vm.createContext(context);vm.runInContext(read('app.js'),context);const api=context.BaseDemoSI;
const disk=new Map();const io={read:key=>disk.get(key)??null,write:(key,value)=>{disk.set(key,value);return true;}};
const scene=api.createSceneStore();
const runtime=api.createExtensionRuntime(scene,io);
assert.equal(runtime.register(api.neutralDemoExtension),true);
assert.equal(runtime.register(api.neutralDemoExtension),false,'IDs de extensões duplicados são rejeitados');
assert.equal(runtime.available().length,1);
assert.equal(runtime.activate('inexistente'),false);
assert.equal(runtime.activate('demo.neutral'),true);
assert.equal(runtime.active().metadata.id,'demo.neutral');
assert.equal(runtime.runTool('step').ok,false,'sem seleção não executa ferramenta de objeto');
assert.equal(runtime.measure('position').ok,false,'sem seleção não mede posição');
const e=api.makeEntity('block','case-1');assert.equal(scene.dispatch({type:'add',entity:e}),true);
const invalid=runtime.runTool('inexistente');assert.equal(invalid.ok,false);
const moved=runtime.runTool('step');assert.equal(moved.ok,true,moved.message);
assert.equal(scene.getSnapshot().entities[0].x,e.x+2);
assert.equal(runtime.getState().actions,1);
const colored=runtime.runTool('tone');assert.equal(colored.ok,true);
assert.equal(scene.getSnapshot().entities[0].tone,'blue');
const recorded=runtime.measure('position');assert.equal(recorded.ok,true);
assert.equal(recorded.reading.value,e.x+2);
assert.equal(recorded.reading.unit,'%');
assert.equal(runtime.measure('quantity').reading.value,1);
assert.equal(runtime.measure('operations').reading.value,2);
assert.equal(runtime.getRecords().length,3);
assert.equal(scene.undo(),true,'comandos da extensão devem usar histórico da cena');
assert.equal(scene.getSnapshot().entities[0].tone,'teal');
assert.equal(scene.redo(),true);
assert.equal(scene.getSnapshot().entities[0].tone,'blue');
const restored=api.createExtensionRuntime(scene,io);
assert.equal(restored.register(api.neutralDemoExtension),true);
assert.equal(restored.active().metadata.id,'demo.neutral');
assert.equal(restored.getState().actions,2);
assert.equal(restored.getRecords().length,3);
assert.equal(restored.activate(null),true);
assert.equal(restored.active(),null);
assert.equal(restored.runTool('step').ok,false);
assert.equal(scene.getSnapshot().entities.length,1,'desativar extensão não limpa cena');
assert.equal(restored.activate('demo.neutral'),true);
assert.equal(restored.getState().actions,0,'reativação inicia estado isolado');
assert.equal(api.parseExtensionSession(JSON.parse('{"schemaVersion":1,"extensionId":"demo.neutral","extensionVersion":"1.0.0","state":{"__proto__":1},"records":[]}')),null,'chaves inseguras não podem ser restauradas');
for(const corrupt of [null,{},[],{schemaVersion:2,extensionId:null,extensionVersion:null,state:null,records:[]},
 {schemaVersion:1,extensionId:'invalid',extensionVersion:'1.0.0',state:{},records:[{sequence:2,label:'a',value:Infinity,unit:'u',extensionId:'x',instrumentId:'i',entityId:null}]},
 {schemaVersion:1,extensionId:null,extensionVersion:'1.0.0',state:null,records:[]}])assert.equal(api.parseExtensionSession(corrupt),null);
const badModule={...api.neutralDemoExtension,metadata:{...api.neutralDemoExtension.metadata,id:'demo.bad'},
 tools:[{id:'evil',name:'Teste inválido',description:'Estado inválido',requiresSelection:false,
 run:()=>({message:'OK',nextState:{actions:-1},command:{type:'clear'}})}]};
assert.equal(restored.register(badModule),true);
assert.equal(restored.activate('demo.bad'),true);
const before=scene.getSnapshot().entities.length;
assert.equal(restored.runTool('evil').ok,false,'não aplicar comando quando estado for inválido');
assert.equal(scene.getSnapshot().entities.length,before);
const badNumber={...api.neutralDemoExtension,metadata:{...api.neutralDemoExtension.metadata,id:'demo.nan'},
 tools:[],instruments:[{id:'bad',name:'Leitura',description:'Leitura inválida',requiresSelection:false,read:()=>({label:'Inválido',value:NaN,unit:''})}]};
assert.equal(restored.register(badNumber),true);
assert.equal(restored.activate('demo.nan'),true);
assert.equal(restored.measure('bad').ok,false);
for(const element of ['extension-choice','extension-tools','extension-instruments','extension-records','extension-descriptor','extension-status'])
 assert(read('index.html').includes(`id="${element}"`),'falta UI: '+element);
for(const file of ['README.md','docs/PLANO-DE-CONSTRUCAO.md','docs/ACEITE-0.6.0.md','src/extension-contracts.ts','src/extensions.ts','src/extensions-demo.ts','index.html'])
 assert(!/SIAB/i.test(read(file)),'referência indevida: '+file);
assert(read('sw.js').includes('"./extensions.css"'),'recursos locais da extensão no precache');
assert(!read('index.html').includes('href="./workspace.css"\n'),'link stylesheet deve estar fechado');
console.log('OK: plugins locais, selecao, comandos atomicos, instrumentos, validacao, registros, restauracao, desativacao e documentacao independente.');
