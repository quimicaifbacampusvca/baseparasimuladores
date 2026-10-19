namespace BaseDemoSI {
  let education: EducationPort;
  let educationScene: SceneStore;
  let teacherSerial=0;
  const el=(id:string):HTMLElement|null=>document.getElementById(id);
  const text=(tag:string,value:string,className?:string):HTMLElement=>{
    const node=document.createElement(tag);node.textContent=value;
    if(className)node.className=className;return node;
  };
  function button(label:string,action:()=>void,mode="outline"):HTMLButtonElement {
    const node=document.createElement("button");node.type="button";node.className=`button ${mode}`;
    node.textContent=label;node.addEventListener("click",action);return node;
  }
  function countReadings():number {return extensionRecordSequence();}
  /** A leitura do catálogo não inicia uma atividade. A sessão nasce no comando Montar. */
  let returnToActivity = "";
  const guidedKey = "guided-return-v1";
  const sessionKey = "guided-session-v1";
  const checkpointsKey = "guided-checkpoints-v1";
  interface GuidedCheckpoint { scene:SceneSnapshot; readingsBaseline:number; }
  let checkpoints:Record<string,GuidedCheckpoint>=Object.create(null);
  function restoreCheckpoints():void {
    checkpoints=Object.create(null);
    try {
      const saved=storage.read(checkpointsKey);if(!saved)return;
      const value=JSON.parse(saved) as {schemaVersion?:number;entries?:Record<string,GuidedCheckpoint>};
      if(value.schemaVersion!==1 || !value.entries || Array.isArray(value.entries) || typeof value.entries!=="object")return;
      const entries=Object.entries(value.entries);
      if(entries.length>29)return;
      for(const [url,entry] of entries){
        if(!validatedGuidedLink(url) || !entry || !parseScene(entry.scene) || !Number.isSafeInteger(entry.readingsBaseline) || entry.readingsBaseline<0)return;
      }
      for(const [url,entry] of entries)checkpoints[url]={scene:parseScene(entry.scene)!,readingsBaseline:entry.readingsBaseline};
    }catch{checkpoints=Object.create(null);}
  }
  function checkpointSave():void {storage.write(checkpointsKey,JSON.stringify({schemaVersion:1,entries:checkpoints}));}
  function checkpointDelete(url:string):void {delete checkpoints[url];checkpointSave();}
  interface GuidedSession { schemaVersion:1; url:string; freeScene:SceneSnapshot; readingsBaseline:number; freeModule?:ModuleId; }
  let guidedSession:GuidedSession|null=null;
  function validatedGuidedLink(value:string):{url:string;activity:LearningActivity;progress:number}|null {
    const match=/^#\/(missoes|roteiros)\?item=([a-z0-9-]{1,80})$/.exec(value);
    if(!match || !education)return null;
    const kind:ActivityKind=match[1]==="missoes"?"mission":"script";
    const activity=education.list(kind).find(a=>a.id===match[2]);
    if(!activity)return null;
    return {url:`#/${match[1]}?item=${encodeURIComponent(activity.id)}`,activity,progress:education.snapshot().progress[activity.id]??0};
  }
  function readGuidedSession(value:string|null):GuidedSession|null {
    if(!value)return null;
    try {
      const raw=JSON.parse(value) as Partial<GuidedSession>;
      if(raw.schemaVersion!==1 || typeof raw.url!=="string" || !validatedGuidedLink(raw.url)
        || !Number.isSafeInteger(raw.readingsBaseline) || (raw.readingsBaseline??-1)<0
        || !parseScene(raw.freeScene) || (raw.freeModule!==undefined&&!validModule(raw.freeModule)))return null;
      return {schemaVersion:1,url:raw.url,freeScene:parseScene(raw.freeScene)!,readingsBaseline:raw.readingsBaseline!,freeModule:raw.freeModule};
    }catch{return null;}
  }
  function saveGuidedReturn(value:string):void {
    returnToActivity=value;
    storage.write(guidedKey,value);
    mountReturnLink();
    window.dispatchEvent(new Event("si-guided-context-changed"));
  }
  function saveSession(session:GuidedSession|null):void {
    guidedSession=session;
    storage.write(sessionKey,session?JSON.stringify(session):"");
    saveGuidedReturn(session?.url??"");
  }
  export function guidedActivityContext():{url:string;title:string;kind:ActivityKind;progress:number;total:number}|null {
    const valid=guidedSession&&validatedGuidedLink(guidedSession.url);
    return valid?{url:valid.url,title:valid.activity.title,kind:valid.activity.kind,progress:valid.progress,total:valid.activity.steps.length}:null;
  }
  function sessionFor(id:string):boolean { return guidedActivityContext()?.url.endsWith(`?item=${encodeURIComponent(id)}`)??false; }
  function scopedReadings():number {return Math.max(0,countReadings()-(guidedSession?.readingsBaseline??0));}
  export function beginGuidedActivity(id:string,kind:ActivityKind):boolean {
    const activity=education.list(kind).find(a=>a.id===id);
    if(!activity)return false;
    const url=`#/${kind==="mission"?"missoes":"roteiros"}?item=${encodeURIComponent(id)}`;
    if(guidedSession){
      if(guidedSession.url!==url){notify("Encerre a atividade em andamento antes de iniciar outra.","warning");return false;}
      window.location.hash="#/ambiente";return true;
    }
    if((education.snapshot().progress[id]??0)>=activity.steps.length){notify("Atividade concluída. Inicie uma nova tentativa para refazê-la.","info");return false;}
    const original=educationScene.getSnapshot();
    const checkpoint=checkpoints[url];
    const run:GuidedSession={schemaVersion:1,url,freeScene:original,
      readingsBaseline:checkpoint?.readingsBaseline??countReadings(),freeModule:currentModule()};
    // Gravar o vínculo antes da alteração: uma recarga nunca perde a cena livre.
    saveSession(run);
    const blank:SceneSnapshot={schemaVersion:1,entities:[],selectedId:null};
    const targetModule=activity.module??"livre";
    selectModule(targetModule);
    // Medir/Calcular não oferecem criação de entidades; disponibilizar um objeto
    // neutro e não selecionado para observação, sem substituir a intervenção do aluno.
    const starter:SceneSnapshot=(targetModule==="medir"||targetModule==="calcular")
      ?{schemaVersion:1,entities:[makeEntity("block",`obj-atividade-${id}`)],selectedId:null}
      :blank;
    educationScene.dispatch({type:"replace",snapshot:checkpoint?.scene??starter});
    window.location.hash="#/ambiente";
    return true;
  }
  export function endGuidedActivity():void {
    const previous=guidedSession;
    if(previous){
      const valid=validatedGuidedLink(previous.url);
      if(valid&&valid.progress<valid.activity.steps.length){
        checkpoints[previous.url]={scene:educationScene.getSnapshot(),readingsBaseline:previous.readingsBaseline};
        checkpointSave();
      }else checkpointDelete(previous.url);
      educationScene.dispatch({type:"replace",snapshot:previous.freeScene});
      if(previous.freeModule)selectModule(previous.freeModule);
    }
    saveSession(null);
    renderAll();
  }
  export function clearGuidedReturn():void {endGuidedActivity();}
  export function menuActivity(kind:ActivityKind,id:string):LearningActivity|undefined {return education?.list(kind).find(a=>a.id===id);}
  export function menuActivityProgress(id:string):number {return education?.snapshot().progress[id]??0;}
  export function advanceActivityFromMenu(id:string):{ok:boolean;message:string} {
    if(!education || !educationScene || !sessionFor(id))return {ok:false,message:"Inicie esta atividade antes de registrar etapas."};
    return education.advance(id,educationScene.getSnapshot(),scopedReadings());
  }
  const selectedParam = (key:string):string => {
    const search=window.location.hash.split("?")[1]??"";
    return new URLSearchParams(search).get(key)??"";
  };
  function openDetail(route:RouteId,key:string,id:string):void {
    window.location.hash=`#/${route}?${key}=${encodeURIComponent(id)}`;
    if(currentRoute(window.location.hash)===route)renderAll();
  }
  function returnToCatalog(route:RouteId,id:string):void {
    window.location.hash=`#/${route}`;
    window.setTimeout(()=>{
      document.querySelector<HTMLElement>(`[data-catalog-id="${id}"]`)?.focus({preventScroll:true});
    },0);
  }
  function mountReturnLink():void {
    const control=el("si-return-activity") as HTMLAnchorElement|null;
    if(!control)return;
    const guided=guidedActivityContext();
    control.hidden=!guided || currentRoute(window.location.hash)!=="ambiente";
    if(guided)control.href=guided.url;
  }
  function showDetail(catalogId:string,detailId:string,open:boolean):HTMLElement|null {
    const catalog=el(catalogId),detail=el(detailId);
    if(catalog)catalog.hidden=open;
    if(detail)detail.hidden=!open;
    if(open)detail?.replaceChildren();
    return detail;
  }
  function renderTopics():void {
    const target=el("edu-topic-list");if(!target)return;target.replaceChildren();
    const saved=education.snapshot();
    const active=learningTopics.find(t=>t.id===selectedParam("tema"));
    const detail=showDetail("edu-topic-list","edu-topic-detail",!!active);
    for(const topic of learningTopics){
      const card=document.createElement("article");card.className="edu-card";card.dataset.topicId=topic.id;
      card.append(text("p",saved.topicsDone.includes(topic.id)?"Concluído":"Tema disponível","edu-kicker"),text("h2",topic.title),text("p",topic.summary));
      const go=button("Abrir tema",()=>openDetail("aprender","tema",topic.id),"outline");go.dataset.catalogId=topic.id;card.append(go);
      target.append(card);
    }
    if(active&&detail){
      const back=button("← Todos os temas",()=>returnToCatalog("aprender",active.id));back.classList.add("si-detail-back");
      const heading=text("h2",active.title);heading.tabIndex=-1;
      detail.append(back,text("p","LEITURA ORIENTADA","edu-kicker"),heading,text("p",active.summary,"si-detail-lead"));
      const article=document.createElement("article");article.className="si-detail-reading";
      for(const paragraph of active.paragraphs)article.append(text("p",paragraph));detail.append(article);
      const related=document.createElement("div");related.className="edu-related";
      related.append(text("strong","Pratique este tema"));
      related.append(button("Explorar na bancada",()=>{window.location.hash="#/ambiente";}));
      related.append(button("Ver missões",()=>{window.location.hash="#/missoes";}));
      related.append(button("Ver roteiros",()=>{window.location.hash="#/roteiros";}));
      detail.append(related);
      detail.append(button(saved.topicsDone.includes(active.id)?"Desmarcar conclusão":"Marcar como concluído",()=>{
        education.toggleTopic(active.id);
        notify("Progresso de leitura atualizado.","success");
      },"primary"));
    }
    const stats=el("edu-topic-summary");if(stats)stats.textContent=`${saved.topicsDone.length} de ${learningTopics.length} temas concluídos`;
  }
  function renderActivity(kind:ActivityKind):void {
    const route:RouteId=kind==="mission"?"missoes":"roteiros";
    const listId=kind==="mission"?"edu-mission-list":"edu-script-list";
    const detailId=kind==="mission"?"edu-mission-detail":"edu-script-detail";
    const target=el(listId);if(!target)return;target.replaceChildren();
    const snapshot=education.snapshot();const activities=education.list(kind);
    const active=activities.find(a=>a.id===selectedParam("item") && currentRoute(window.location.hash)===route);
    const detail=showDetail(listId,detailId,!!active);
    for(const activity of activities){
      const position=snapshot.progress[activity.id]??0,finished=position>=activity.steps.length;
      const card=document.createElement("article");card.className="edu-card";card.dataset.activityId=activity.id;
      const module=moduleDefinitions.find(m=>m.id===(activity.module??"livre"))!;
      card.append(text("p",`${activity.origin==="teacher"?"Professor · ":""}${kind==="mission"?"Missão":"Roteiro"} · ${module.label} · ${finished?"Concluído":`${position}/${activity.steps.length} etapas`}`,"edu-kicker"),text("h2",activity.title),text("p",activity.description));
      const go=button("Ver detalhes",()=>openDetail(route,"item",activity.id));go.dataset.catalogId=activity.id;
      card.append(go);target.append(card);
    }
    if(!target.children.length)target.append(text("p","Nenhuma atividade disponível."));
    if(!active||!detail)return;
    const position=snapshot.progress[active.id]??0,finished=position>=active.steps.length;
    const running=sessionFor(active.id);
    const back=button(`← Todas as ${kind==="mission"?"missões":"investigações"}`,()=>returnToCatalog(route,active.id));back.classList.add("si-detail-back");
    const heading=text("h2",active.title);heading.tabIndex=-1;
    const module=moduleDefinitions.find(m=>m.id===(active.module??"livre"))!;
    detail.append(back,text("p",`${kind==="mission"?"MISSÃO · OBJETIVOS":"ROTEIRO · PROCEDIMENTO"} · ${module.label}`,"edu-kicker"),heading,text("p",active.description,"si-detail-lead"));
    const list=document.createElement("ol");list.className="edu-steps si-detail-steps";
    for(let i=0;i<active.steps.length;i++){
      const step=active.steps[i],item=document.createElement("li");item.className=i<position?"edu-step-done":i===position?"edu-step-current":"";
      item.append(text("strong",step.label));
      const criterion=step.requirement==="entities"?`${step.minimum} objeto(s) na cena`:step.requirement==="selection"?"Um objeto selecionado":step.requirement==="readings"?`${step.minimum} leitura(s) registrada(s)`:"Confirmação de realização";
      item.append(text("small",criterion));list.append(item);
    }
    detail.append(list);
    const actions=document.createElement("div");actions.className="edu-actions";
    if(!finished){
      const begin=button(running?"Continuar na bancada":"Montar na bancada",()=>beginGuidedActivity(active.id,kind),"primary");
      if(guidedSession&&!running){begin.disabled=true;begin.title="Encerre a atividade atual antes de iniciar outra.";}
      actions.append(begin);
      const step=active.steps[position];const allowed=running&&meetsRequirement(step,educationScene.getSnapshot(),scopedReadings());
      const check=button(step.requirement==="manual"?"Confirmar etapa":"Conferir e registrar",()=>{
        const outcome=advanceActivityFromMenu(active.id);
        notify(outcome.message,outcome.ok?"success":"warning");
      },"outline");
      check.disabled=!allowed;check.title=allowed?"Registrar etapa":"Conclua o critério no ambiente primeiro";actions.append(check);
    }else {
      actions.append(text("span","Atividade concluída","edu-finished"));
      const again=button("Iniciar nova tentativa",async()=>{
        if(guidedSession){notify("Encerre a atividade atual antes de iniciar outra tentativa.","warning");return;}
        const yes=await confirmDialog({title:"Reiniciar atividade?",description:"Uma nova tentativa começará do início. O progresso anterior desta atividade será reiniciado.",confirmText:"Iniciar novamente",destructive:true});
        if(yes&&education.resetActivity(active.id)){
          checkpointDelete(`#/${route}?item=${encodeURIComponent(active.id)}`);
          beginGuidedActivity(active.id,kind);
        }
      });
      again.disabled=!!guidedSession;actions.append(again);
    }
    if(running){actions.append(button("Encerrar atividade",async()=>{
      const yes=await confirmDialog({title:"Encerrar atividade?",description:"A bancada livre será restaurada. As etapas já registradas permanecerão salvas.",confirmText:"Encerrar"});
      if(yes)endGuidedActivity();
    }));}
    detail.append(actions);mountReturnLink();
  }
  function renderTeacher():void {
    const target=el("edu-teacher-list");if(!target)return;target.replaceChildren();
    const activities=education.snapshot().teacherActivities;
    const summary=el("edu-teacher-summary");if(summary)summary.textContent=`${activities.length} / 24 atividades personalizadas`;
    if(!activities.length)target.append(text("p","Nenhuma atividade personalizada. Crie uma atividade no editor abaixo."));
    for(const a of activities){
      const card=document.createElement("article");card.className="edu-teacher-item";
      const info=document.createElement("div");info.append(text("strong",a.title),text("small",`${a.kind==="mission"?"Missão":"Roteiro"} · ${a.steps.length} etapa(s)`));
      card.append(info,button("Criar link",()=>offerShareLink(a)),button("Excluir",async()=>{
        const accepted=await confirmDialog({title:"Excluir atividade?",description:`A atividade ${a.title} e seu progresso serão excluídos deste navegador.`,confirmText:"Excluir",destructive:true});
        if(accepted&&education.removeActivity(a.id)){
          checkpointDelete(`#/${a.kind==="mission"?"missoes":"roteiros"}?item=${encodeURIComponent(a.id)}`);
          notify("Atividade removida.","info");
        }
      }));target.append(card);
    }
  }
  function renderAll():void {renderTopics();renderActivity("mission");renderActivity("script");renderTeacher();mountReturnLink();}
  const inputValue=(id:string):string=>(el(id) as HTMLInputElement|HTMLTextAreaElement|null)?.value.trim()??"";
  const rule=(id:string):RequirementKind=>(el(id) as HTMLSelectElement).value as RequirementKind;
  const step=(prefix:string):LearningStep=>({label:inputValue(`${prefix}-label`),requirement:rule(`${prefix}-rule`),minimum:Number(inputValue(`${prefix}-min`)||1)});
  const dynamicStepNames=["three","four","five"] as const;
  function extraSteps():LearningStep[] {
    return [...document.querySelectorAll<HTMLElement>("#edu-extra-steps [data-extra-step]")]
      .map(panel=>step(`edu-step-${panel.dataset.extraStep}`));
  }
  function createExtraStep():void {
    const host=el("edu-extra-steps");if(!host||host.childElementCount>=3)return;
    const count=host.childElementCount+2,name=dynamicStepNames[count-2];
    const panel=document.createElement("fieldset");panel.dataset.extraStep=name;
    const legend=text("legend",`Etapa ${count+1}`);panel.append(legend);
    const label=text("label","Procedimento");label.setAttribute("for",`edu-step-${name}-label`);
    const input=document.createElement("input");input.id=`edu-step-${name}-label`;input.maxLength=140;input.required=true;
    const row=document.createElement("div");row.className="edu-form-row";
    const ruleWrap=document.createElement("div");const ruleLabel=text("label","Critério");ruleLabel.setAttribute("for",`edu-step-${name}-rule`);
    const select=document.createElement("select");select.id=`edu-step-${name}-rule`;
    for(const [value,display] of [["manual","Confirmação manual"],["entities","Quantidade de objetos"],["selection","Objeto selecionado"],["readings","Quantidade de leituras"]]){
      const option=document.createElement("option");option.value=value;option.textContent=display;select.append(option);
    }
    ruleWrap.append(ruleLabel,select);
    const minWrap=document.createElement("div");const minLabel=text("label","Quantidade");minLabel.setAttribute("for",`edu-step-${name}-min`);
    const min=document.createElement("input");min.id=`edu-step-${name}-min`;min.type="number";min.min="1";min.max="60";min.value="1";min.required=true;min.disabled=true;
    select.addEventListener("change",()=>{min.disabled=["manual","selection"].includes(select.value);if(min.disabled)min.value="1";});
    minWrap.append(minLabel,min);row.append(ruleWrap,minWrap);
    panel.append(label,input,row);host.append(panel);
    const remove=el("edu-remove-step");if(remove)remove.hidden=false;
    const add=el("edu-add-step") as HTMLButtonElement|null;if(add)add.disabled=host.childElementCount>=3;
  }
  function resetExtraSteps():void {
    el("edu-extra-steps")?.replaceChildren();
    const add=el("edu-add-step") as HTMLButtonElement|null;if(add)add.disabled=false;
    const remove=el("edu-remove-step");if(remove)remove.hidden=true;
  }
  function displayTeacherKind():void {
    const show=(el("edu-form-kind") as HTMLSelectElement).value==="script";
    const second=el("edu-second-step");if(second)second.hidden=!show;
    const more=el("edu-script-step-actions");if(more)more.hidden=!show;
    const label=el("edu-step-two-label") as HTMLInputElement|null;if(label)label.required=show;
    if(!show)resetExtraSteps();
  }
  let currentTeacherStep=1;
  function teacherStep(step:number,validate=true):void {
    const form=el("edu-teacher-form") as HTMLFormElement|null;
    if(!form || step<1 || step>3)return;
    if(validate && step>currentTeacherStep){
      for(let index=currentTeacherStep;index<step;index++){
        const panel=form.querySelector<HTMLElement>(`[data-teacher-panel="${index}"]`);
        const inputs=Array.from(panel?.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>("input,textarea,select")??[]);
        const invalid=inputs.find(input=>!input.disabled && !input.checkValidity());
        if(invalid){notify("Preencha os campos obrigatórios antes de continuar.","warning");invalid.focus();return;}
      }
    }
    currentTeacherStep=step;
    for(const panel of form.querySelectorAll<HTMLElement>("[data-teacher-panel]"))panel.hidden=Number(panel.dataset.teacherPanel)!==step;
    for(const control of document.querySelectorAll<HTMLButtonElement>("[data-teacher-step]")){
      if(Number(control.dataset.teacherStep)===step)control.setAttribute("aria-current","step");
      else control.removeAttribute("aria-current");
    }
    const preview=el("edu-teacher-preview");
    if(preview && step===3){preview.replaceChildren();
      preview.append(text("strong",inputValue("edu-form-title")||"Título não informado"),text("p",inputValue("edu-form-description")));
      preview.append(text("p",`Tipo: ${(el("edu-form-kind") as HTMLSelectElement).value==="script"?"Roteiro":"Missão"}`));
      preview.append(text("p",`Módulo: ${(el("edu-form-module") as HTMLSelectElement)?.selectedOptions?.[0]?.textContent??"Livre"}`));
      preview.append(text("p",`1. ${inputValue("edu-step-one-label")}`));
      if((el("edu-form-kind") as HTMLSelectElement).value==="script"){
        [inputValue("edu-step-two-label"),...extraSteps().map(value=>value.label)].forEach((label,i)=>preview.append(text("p",`${i+2}. ${label}`)));
      }
    }
  }
  function setupTeacherForm():void {
    const kind=el("edu-form-kind") as HTMLSelectElement|null;
    kind?.addEventListener("change",displayTeacherKind);
    for(const prefix of ["edu-step-one","edu-step-two"]){
      const control=el(`${prefix}-rule`) as HTMLSelectElement;
      control?.addEventListener("change",()=>{
        const min=el(`${prefix}-min`) as HTMLInputElement;
        min.disabled=["manual","selection"].includes(control.value);
        if(min.disabled)min.value="1";
      });
    }
    displayTeacherKind();
    el("edu-add-step")?.addEventListener("click",createExtraStep);
    el("edu-remove-step")?.addEventListener("click",()=>{
      const host=el("edu-extra-steps");host?.lastElementChild?.remove();
      const remove=el("edu-remove-step");if(remove)remove.hidden=!host?.childElementCount;
      const add=el("edu-add-step") as HTMLButtonElement|null;if(add)add.disabled=false;
    });
    document.querySelectorAll<HTMLButtonElement>("[data-teacher-next],[data-teacher-previous],[data-teacher-step]").forEach(control=>{
      control.addEventListener("click",()=>teacherStep(Number(control.dataset.teacherNext??control.dataset.teacherPrevious??control.dataset.teacherStep)));
    });
    teacherStep(1,false);
    el("edu-teacher-form")?.addEventListener("submit",event=>{
      event.preventDefault();const type=kind?.value as ActivityKind;
      const created:LearningActivity={id:`teacher-${Date.now().toString(36)}-${(++teacherSerial).toString(36)}`,kind:type,origin:"teacher",
        module:(el("edu-form-module") as HTMLSelectElement).value as ModuleId,
        title:inputValue("edu-form-title"),description:inputValue("edu-form-description"),
        steps:type==="script"?[step("edu-step-one"),step("edu-step-two"),...extraSteps()]:[step("edu-step-one")]};
      if(!education.createActivity(created)){notify("Revise os campos: título, descrição, critérios e etapas são obrigatórios.","warning");return;}
      (el("edu-teacher-form") as HTMLFormElement).reset();resetExtraSteps();displayTeacherKind();teacherStep(1,false);notify("Atividade personalizada criada.","success");
    });
    el("edu-export")?.addEventListener("click",()=>{
      const file=new Blob([education.exportTeachers()],{type:"application/json;charset=utf-8"});
      const url=URL.createObjectURL(file);
      const anchor=document.createElement("a");anchor.href=url;anchor.download="base-si-atividades-professor.json";
      document.body.append(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1200);
      notify("Arquivo JSON preparado para download.","success");
    });
    (el("edu-import") as HTMLInputElement|null)?.addEventListener("change",async event=>{
      const source=event.target as HTMLInputElement;const file=source.files?.[0];source.value="";
      if(!file)return;
      if(file.size>65536){notify("Arquivo acima do limite de 64 KiB.","warning");return;}
      let decoded:unknown=null;try{decoded=parseTeacherImport(await file.text());}catch{decoded=null;}
      if(!decoded){notify("Arquivo de atividades inválido.","warning");return;}
      const accepted=await confirmDialog({title:"Importar atividades?",description:"As atividades personalizadas atuais serão substituídas. O progresso dos temas e das atividades oficiais será mantido.",confirmText:"Importar atividades",destructive:true});
      if(!accepted)return;
      if(education.importTeachers(decoded)){
        // Uma atividade importada pode manter o mesmo ID e alterar seus critérios.
        // Não reaproveitar checkpoints de versões anteriores do conteúdo.
        checkpoints=Object.create(null);checkpointSave();
        notify("Atividades importadas e validadas.","success");
      }else notify("Formato incompatível ou conteúdo inválido; nenhuma atividade foi alterada.","warning");
    });
  }
  export function setupEducation(scene:SceneStore):void {
    educationScene=scene;education=createEducationStore(storage);
    restoreCheckpoints();
    const previous=storage.read(guidedKey)??"";
    guidedSession=readGuidedSession(storage.read(sessionKey));
    if(!guidedSession && previous && validatedGuidedLink(previous)){
      // Compatibilidade com sessões legadas: a cena antiga já é a cena de trabalho.
      guidedSession={schemaVersion:1,url:validatedGuidedLink(previous)!.url,
        freeScene:{schemaVersion:1,entities:[],selectedId:null},readingsBaseline:0};
      storage.write(sessionKey,JSON.stringify(guidedSession));
    }
    returnToActivity=guidedSession?.url??"";
    if(previous!==returnToActivity)storage.write(guidedKey,returnToActivity);
    bindEducationForSharing(education);
    education.subscribe(()=>{
      if(guidedSession&&!validatedGuidedLink(guidedSession.url))endGuidedActivity();
      renderAll();window.dispatchEvent(new Event("si-guided-context-changed"));
    });
    scene.subscribe(()=>{if(currentRoute(window.location.hash)!=="ambiente")renderAll();});
    window.addEventListener("si-education-observation",()=>renderAll());
    window.addEventListener("si-route-changed",()=>renderAll());
    setupTeacherForm();renderAll();
  }
}
