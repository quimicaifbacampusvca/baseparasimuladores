const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const prefix='base-demo-oficial-si:';
function environment(initial={}){
  const values=new Map(Object.entries(initial));const listeners=new Map();
  const nodes=Object.create(null);
  for(const id of ['si-home-resume','si-home-resume-link','si-home-resume-bench','si-home-resume-title','si-home-resume-meta','si-home-scene-summary','si-home-learning-meta','si-home-missions-meta','si-home-scripts-meta','si-home-notebook-meta','si-return-activity','edu-form-kind']){
    nodes[id]={value:"mission",addEventListener(){},hidden:true,textContent:'',href:'',getAttribute(name){return this[name]},setAttribute(name,value){this[name]=value}};
  }
  const document={readyState:'loading',addEventListener(){},querySelectorAll(){return []},getElementById:id=>nodes[id]??null,documentElement:{},body:{}};
  const location={hash:'#/inicio'};
  const window={location,localStorage:{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},addEventListener:(name,listener)=>{const x=listeners.get(name)??[];x.push(listener);listeners.set(name,x)},dispatchEvent:event=>{for(const listener of listeners.get(event.type)??[])listener(event)}};
  const context={document,window,navigator:{},Set,Map,Object,Date,Event:class {constructor(type){this.type=type}},URLSearchParams};
  vm.createContext(context);vm.runInContext(read('app.js'),context);
  const api=context.BaseDemoSI;api.setupEducation(api.createSceneStore());
  return {api,nodes,values,window};
}
const validLink='#/missoes?item=mission-create';
const valid=environment({[prefix+'guided-return-v1']:validLink});
assert.equal(valid.api.guidedActivityContext().url,validLink);
assert.equal(valid.api.guidedActivityContext().title,'Primeira composição');
valid.api.updateHomeIndicators();
assert.equal(valid.nodes['si-home-resume'].hidden,false);
assert.equal(valid.nodes['si-home-resume-link'].href,validLink);
assert.equal(valid.nodes['si-home-scene-summary'].hidden,true);
valid.api.clearGuidedReturn();valid.api.updateHomeIndicators();
assert.equal(valid.nodes['si-home-resume'].hidden,true);
assert.equal(valid.values.get(prefix+'guided-return-v1'),'');
const missing=environment({[prefix+'guided-return-v1']:'#/missoes?item=teacher-missing'});
assert.equal(missing.api.guidedActivityContext(),null);
assert.equal(missing.values.get(prefix+'guided-return-v1'),'');
const wrong=environment({[prefix+'guided-return-v1']:'#/roteiros?item=mission-create'});
assert.equal(wrong.api.guidedActivityContext(),null);
const scene={schemaVersion:1,selectedId:null,entities:[{id:'a',kind:'block',label:'Bloco',tone:'teal',x:30,y:30,width:18,height:18}]};
const saved=environment({[prefix+'scene-project-v1']:JSON.stringify(scene)});saved.api.updateHomeIndicators();
assert.equal(saved.nodes['si-home-scene-summary'].hidden,false);
assert.equal(saved.nodes['si-home-scene-summary'].textContent,'1 objeto salvo na bancada');
assert(read('index.html').includes('id="si-home-resume"')&&read('index.html').includes('id="si-home-resume-bench"'));
assert(read('standalone.html').includes('.si-home-resume-actions'));
assert(read('sw.js').includes('"./home-context.css"'));
assert(read('src/distribution.ts').includes('"./home-context.css"'));
for(const asset of ['mobile-contract.css','menu-icons/mount.svg','menu-icons/eye.svg','menu-icons/report.svg'])assert(read('src/distribution.ts').includes(asset),'PWA checker deve contar '+asset);
for(const p of ['src/home.ts','src/education-ui.ts','home-context.css','docs/AUDITORIA-HOME-0.9.12.md'])assert(!/SIAB/i.test(read(p)));
console.log('OK: retorno orientado validado, persistência e limpeza, contexto ausente rejeitado, cena salva, Home responsiva e offline.');
