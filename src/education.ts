namespace BaseDemoSI {
  const EDU_KEY = "education-document-v1";
  const ID = /^(?:topic|mission|script|teacher)-[a-z0-9-]{1,52}$/;
  const RESERVED = new Set(["__proto__", "prototype", "constructor"]);
  const MAX_TEACHER = 24;
  const MAX_IMPORT = 65536;
  const MAX_STEPS = 5;
  export const learningTopics: readonly LearningTopic[] = Object.freeze([
    { id:"topic-scene", title:"Explorar o ambiente", summary:"Conheça a cena e os controles de navegação.",
      paragraphs:["O workspace é a área de interação. A região central recebe os objetos e mantém a prioridade visual, enquanto as docas organizam as ações e os registros.","Use Montagem para criar objetos, Foco para destacar um elemento e Visão geral para comparar o conjunto."] },
    { id:"topic-tools", title:"Ferramentas e instrumentos", summary:"Diferencie ações, observações e leituras.",
      paragraphs:["Ferramentas alteram objetos ou estados; instrumentos retornam valores registráveis. Cada extensão declara seus próprios recursos sem modificar a plataforma.","A edição de objetos é reversível pelo histórico da cena. As leituras possuem registros próprios para consulta."] },
    { id:"topic-records", title:"Registros e interpretação", summary:"Aprenda a registrar observações verificáveis.",
      paragraphs:["Uma observação descreve o que aparece na cena. Uma leitura acrescenta um valor, unidade e vínculo com o instrumento que a produziu.","Conferir resultados implica distinguir ações realizadas, medidas obtidas e interpretações construídas a partir delas."] }
  ]);
  export const officialActivities: readonly LearningActivity[] = Object.freeze([
    {id:"mission-create",kind:"mission",origin:"official",module:"explorar",title:"Primeira composição",description:"Adicione ao menos dois objetos ao ambiente.",steps:[{label:"Adicionar dois objetos na cena",requirement:"entities",minimum:2}]},
    {id:"mission-select",kind:"mission",origin:"official",module:"explorar",title:"Objeto em foco",description:"Selecione um objeto para examiná-lo.",steps:[{label:"Manter um objeto selecionado",requirement:"selection",minimum:1}]},
    {id:"mission-read",kind:"mission",origin:"official",module:"medir",title:"Registrar uma leitura",description:"Utilize um instrumento de uma extensão local.",steps:[{label:"Registrar pelo menos uma leitura",requirement:"readings",minimum:1}]},
    {id:"script-start",kind:"script",origin:"official",module:"explorar",title:"Construção orientada",description:"Prepare, selecione e amplie sua primeira montagem.",steps:[
      {label:"Adicione o primeiro objeto",requirement:"entities",minimum:1},
      {label:"Selecione o objeto para observação",requirement:"selection",minimum:1},
      {label:"Amplie a montagem para dois objetos",requirement:"entities",minimum:2}]},
    {id:"script-observe",kind:"script",origin:"official",module:"medir",title:"Da observação ao registro",description:"Organize um procedimento de inspeção e medição.",steps:[
      {label:"Selecione um objeto no ambiente",requirement:"selection",minimum:1},
      {label:"Utilize um instrumento e registre a leitura",requirement:"readings",minimum:1}]}
  ]);
  const emptyEducation = (): EducationDocument => ({schemaVersion:1,topicsDone:[],progress:{},teacherActivities:[]});
  const clean = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
  const validStep = (value: unknown): value is LearningStep => {
    if(!value || typeof value !== "object" || Array.isArray(value))return false;
    const v=value as Partial<LearningStep>;
    return clean(v.label,140) && ["manual","entities","selection","readings"].includes(v.requirement as string)
      && Number.isSafeInteger(v.minimum) && (v.minimum??0)>=1 && (v.minimum??0)<=60
      && (v.requirement !== "selection" || v.minimum === 1)
      && (v.requirement !== "manual" || v.minimum === 1);
  };
  export function validTeacherActivity(value: unknown): value is LearningActivity {
    if(!value || typeof value !== "object" || Array.isArray(value))return false;
    const a=value as Partial<LearningActivity>;
    return typeof a.id === "string" && ID.test(a.id) && a.id.startsWith("teacher-") && !RESERVED.has(a.id)
      && a.origin === "teacher" && (a.kind === "mission" || a.kind === "script")
      && (a.module === undefined || validModule(a.module)) // Dados legados continuam importáveis.
      && clean(a.title,90) && clean(a.description,300)
      && Array.isArray(a.steps) && a.steps.length >= 1 && a.steps.length <= MAX_STEPS
      && (a.kind !== "mission" || a.steps.length === 1)
      && a.steps.every(validStep);
  }
  export function parseEducation(value: unknown): EducationDocument | null {
    if(!value || typeof value !== "object" || Array.isArray(value))return null;
    const v=value as Partial<EducationDocument>;
    if(v.schemaVersion!==1 || !Array.isArray(v.topicsDone) || v.topicsDone.length>learningTopics.length
      || !v.progress || typeof v.progress!=="object" || Array.isArray(v.progress)
      || !Array.isArray(v.teacherActivities) || v.teacherActivities.length>MAX_TEACHER)return null;
    const availableTopics=new Set(learningTopics.map(t=>t.id));
    if(new Set(v.topicsDone).size!==v.topicsDone.length || v.topicsDone.some(id=>!availableTopics.has(id)))return null;
    if(!v.teacherActivities.every(validTeacherActivity))return null;
    const available=new Map([...officialActivities,...v.teacherActivities].map(a=>[a.id,a]));
    if(available.size!==officialActivities.length+v.teacherActivities.length)return null;
    const progress=Object.create(null) as Record<string,number>;
    const entries=Object.entries(v.progress);
    if(entries.length>officialActivities.length+MAX_TEACHER)return null;
    for(const [id,position] of entries){
      const a=available.get(id);
      if(!a || RESERVED.has(id) || !Number.isSafeInteger(position) || position<0 || position>a.steps.length)return null;
      progress[id]=position;
    }
    return {schemaVersion:1,topicsDone:[...v.topicsDone],progress,teacherActivities:v.teacherActivities.map(a=>({ ...a,steps:a.steps.map(s=>({...s}))}))};
  }
  export function meetsRequirement(step: LearningStep, scene: SceneSnapshot, readingCount: number): boolean {
    if(step.requirement==="manual")return true;
    if(step.requirement==="entities")return scene.entities.length>=step.minimum;
    if(step.requirement==="selection")return !!scene.selectedId && scene.entities.some(e=>e.id===scene.selectedId);
    return readingCount>=step.minimum;
  }
  export function createEducationStore(io:StoragePort):EducationPort {
    let restored:EducationDocument|null=null;
    try { const raw=io.read(EDU_KEY);restored=raw===null?null:parseEducation(JSON.parse(raw)); }catch{restored=null;}
    let state=restored??emptyEducation();
    const subscribers=new Set<()=>void>();
    const emit=()=>{for(const cb of [...subscribers])cb();};
    const persist=(next:EducationDocument):boolean=>{
      const safe=parseEducation(next);if(!safe)return false;
      state=safe;io.write(EDU_KEY,JSON.stringify(state));emit();return true;
    };
    const available=()=>[...officialActivities,...state.teacherActivities];
    const get=(id:string)=>available().find(a=>a.id===id);
    return {
      snapshot:()=>parseEducation(state)!,
      list:(kind)=>available().filter(a=>a.kind===kind).map(a=>({...a,steps:a.steps.map(s=>({...s}))})),
      toggleTopic(id){if(!learningTopics.some(t=>t.id===id))return false;
        const topics=new Set(state.topicsDone);if(topics.has(id))topics.delete(id);else topics.add(id);
        return persist({...state,topicsDone:[...topics]});},
      advance(id,scene,readingCount){const a=get(id);
        if(!a)return {ok:false,message:"Atividade não encontrada."};
        const i=state.progress[id]??0;if(i>=a.steps.length)return {ok:false,message:"Atividade já concluída."};
        if(!meetsRequirement(a.steps[i],scene,readingCount))return {ok:false,message:"Critério ainda não atendido na cena."};
        const progress={...state.progress,[id]:i+1};persist({...state,progress});
        return {ok:true,message:i+1===a.steps.length?"Atividade concluída.":"Etapa registrada. Continue o roteiro."};},
      resetActivity(id){if(!get(id))return false;
        const progress={...state.progress};delete progress[id];
        return persist({...state,progress});},
      createActivity(value){if(!validTeacherActivity(value)||state.teacherActivities.length>=MAX_TEACHER||get(value.id))return false;
        return persist({...state,teacherActivities:[...state.teacherActivities,value]});},
      removeActivity(id){if(!state.teacherActivities.some(a=>a.id===id))return false;
        const progress={...state.progress};delete progress[id];
        return persist({...state,teacherActivities:state.teacherActivities.filter(a=>a.id!==id),progress});},
      importTeachers(value){if(!value||typeof value!=="object"||Array.isArray(value))return false;
        const v=value as {format?:unknown;activities?:unknown};
        if(v.format!=="base-demo-si-teacher-v1"||!Array.isArray(v.activities)||v.activities.length>MAX_TEACHER||!v.activities.every(validTeacherActivity))return false;
        const ids=new Set(v.activities.map(a=>a.id));if(ids.size!==v.activities.length)return false;
        const retained=new Set([...officialActivities,...v.activities].map(a=>a.id));
        const progress=Object.fromEntries(Object.entries(state.progress).filter(([id])=>retained.has(id)));
        return persist({...state,progress,teacherActivities:v.activities});},
      exportTeachers:()=>JSON.stringify({format:"base-demo-si-teacher-v1",activities:state.teacherActivities},null,2),
      subscribe(listener){subscribers.add(listener);return ()=>{subscribers.delete(listener);};}
    };
  }
  export function parseTeacherImport(text:string):unknown|null {
    if(text.length>MAX_IMPORT)return null;
    try {return JSON.parse(text) as unknown;}catch{return null;}
  }
}
