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
  function countReadings():number {return extensionRecordCount();}
  /** Catálogo e leitura têm espaços próprios; nunca substituímos a bancada. */
  let returnToActivity = "";
  const guidedKey = "guided-return-v1";
  /** Vínculo validado sempre contra o catálogo carregado: sem atividade fantasma. */
  function validatedGuidedLink(value:string):{url:string;activity:LearningActivity;progress:number}|null {
    const match=/^#\/(missoes|roteiros)\?item=([a-z0-9-]{1,80})$/.exec(value);
    if(!match || !education)return null;
    const kind:ActivityKind=match[1]==="missoes"?"mission":"script";
    const activity=education.list(kind).find(a=>a.id===match[2]);
    if(!activity)return null;
    return {url:`#/${match[1]}?item=${encodeURIComponent(activity.id)}`,activity,progress:education.snapshot().progress[activity.id]??0};
  }
  function saveGuidedReturn(value:string):void {
    returnToActivity=value;
    storage.write(guidedKey,value);
    mountReturnLink();
    window.dispatchEvent(new Event("si-guided-context-changed"));
  }
  export function guidedActivityContext():{url:string;title:string;kind:ActivityKind;progress:number;total:number}|null {
    const result=validatedGuidedLink(returnToActivity);
    return result?{url:result.url,title:result.activity.title,kind:result.activity.kind,progress:result.progress,total:result.activity.steps.length}:null;
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
  export function menuActivity(kind:ActivityKind,id:string):LearningActivity|undefined {return education?.list(kind).find(a=>a.id===id);}
  export function menuActivityProgress(id:string):number {return education?.snapshot().progress[id]??0;}
  export function advanceActivityFromMenu(id:string):{ok:boolean;message:string} {
    if(!education || !educationScene)return {ok:false,message:"Nenhuma atividade disponível."};
    return education.advance(id,educationScene.getSnapshot(),extensionRecordCount());
  }
  export function clearGuidedReturn():void { saveGuidedReturn(""); }
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
      card.append(text("p",`${activity.origin==="teacher"?"Professor · ":""}${kind==="mission"?"Missão":"Roteiro"} · ${finished?"Concluído":`${position}/${activity.steps.length} etapas`}`,"edu-kicker"),text("h2",activity.title),text("p",activity.description));
      const go=button("Ver detalhes",()=>openDetail(route,"item",activity.id));go.dataset.catalogId=activity.id;
      card.append(go);target.append(card);
    }
    if(!target.children.length)target.append(text("p","Nenhuma atividade disponível."));
    if(!active||!detail)return;
    const position=snapshot.progress[active.id]??0,finished=position>=active.steps.length;
    const nextReturn=`#/${route}?item=${encodeURIComponent(active.id)}`;
    if(returnToActivity!==nextReturn)saveGuidedReturn(nextReturn);
    const back=button(`← Todas as ${kind==="mission"?"missões":"investigações"}`,()=>returnToCatalog(route,active.id));back.classList.add("si-detail-back");
    const heading=text("h2",active.title);heading.tabIndex=-1;
    detail.append(back,text("p",kind==="mission"?"MISSÃO · OBJETIVOS":"ROTEIRO · PROCEDIMENTO","edu-kicker"),heading,text("p",active.description,"si-detail-lead"));
    const list=document.createElement("ol");list.className="edu-steps si-detail-steps";
    for(let i=0;i<active.steps.length;i++){
      const step=active.steps[i],item=document.createElement("li");item.className=i<position?"edu-step-done":i===position?"edu-step-current":"";
      item.append(text("strong",step.label));
      const criterion=step.requirement==="entities"?`${step.minimum} objeto(s) na cena`:step.requirement==="selection"?"Um objeto selecionado":step.requirement==="readings"?`${step.minimum} leitura(s) registrada(s)`:"Confirmação de realização";
      item.append(text("small",criterion));list.append(item);
    }
    detail.append(list);
    const actions=document.createElement("div");actions.className="edu-actions";
    const bench=document.createElement("a");bench.className="button primary";bench.href="#/ambiente";bench.textContent="Montar na bancada";actions.append(bench);
    if(!finished){
      const step=active.steps[position];const allowed=meetsRequirement(step,educationScene.getSnapshot(),countReadings());
      const check=button(step.requirement==="manual"?"Confirmar etapa":"Conferir e registrar",()=>{
        const outcome=education.advance(active.id,educationScene.getSnapshot(),countReadings());
        notify(outcome.message,outcome.ok?"success":"warning");
      },"outline");
      check.disabled=!allowed;check.title=allowed?"Registrar etapa":"Conclua o critério no ambiente primeiro";actions.append(check);
    }else actions.append(text("span","Atividade concluída","edu-finished"));
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
        if(accepted&&education.removeActivity(a.id))notify("Atividade removida.","info");
      }));target.append(card);
    }
  }
  function renderAll():void {renderTopics();renderActivity("mission");renderActivity("script");renderTeacher();mountReturnLink();}
  const inputValue=(id:string):string=>(el(id) as HTMLInputElement|HTMLTextAreaElement|null)?.value.trim()??"";
  const rule=(id:string):RequirementKind=>(el(id) as HTMLSelectElement).value as RequirementKind;
  const step=(prefix:string):LearningStep=>({label:inputValue(`${prefix}-label`),requirement:rule(`${prefix}-rule`),minimum:Number(inputValue(`${prefix}-min`)||1)});
  function displayTeacherKind():void {
    const show=(el("edu-form-kind") as HTMLSelectElement).value==="script";
    const second=el("edu-second-step");if(second)second.hidden=!show;
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
      preview.append(text("p",`1. ${inputValue("edu-step-one-label")}`));
      if((el("edu-form-kind") as HTMLSelectElement).value==="script")preview.append(text("p",`2. ${inputValue("edu-step-two-label")}`));
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
    document.querySelectorAll<HTMLButtonElement>("[data-teacher-next],[data-teacher-previous],[data-teacher-step]").forEach(control=>{
      control.addEventListener("click",()=>teacherStep(Number(control.dataset.teacherNext??control.dataset.teacherPrevious??control.dataset.teacherStep)));
    });
    teacherStep(1,false);
    el("edu-teacher-form")?.addEventListener("submit",event=>{
      event.preventDefault();const type=kind?.value as ActivityKind;
      const created:LearningActivity={id:`teacher-${Date.now().toString(36)}-${(++teacherSerial).toString(36)}`,kind:type,origin:"teacher",
        title:inputValue("edu-form-title"),description:inputValue("edu-form-description"),
        steps:type==="script"?[step("edu-step-one"),step("edu-step-two")]:[step("edu-step-one")]};
      if(!education.createActivity(created)){notify("Revise os campos: título, descrição, critérios e etapas são obrigatórios.","warning");return;}
      (el("edu-teacher-form") as HTMLFormElement).reset();displayTeacherKind();teacherStep(1,false);notify("Atividade personalizada criada.","success");
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
      if(education.importTeachers(decoded))notify("Atividades importadas e validadas.","success");
      else notify("Formato incompatível ou conteúdo inválido; nenhuma atividade foi alterada.","warning");
    });
  }
  export function setupEducation(scene:SceneStore):void {
    educationScene=scene;education=createEducationStore(storage);
    const previous=storage.read(guidedKey)??"";
    returnToActivity=validatedGuidedLink(previous)?.url??"";
    if(previous && !returnToActivity)storage.write(guidedKey,"");
    bindEducationForSharing(education);
    education.subscribe(()=>{
      if(returnToActivity && !validatedGuidedLink(returnToActivity))saveGuidedReturn("");
      renderAll();window.dispatchEvent(new Event("si-guided-context-changed"));
    });
    scene.subscribe(()=>{if(currentRoute(window.location.hash)!=="ambiente")renderAll();});
    window.addEventListener("si-education-observation",()=>renderAll());
    window.addEventListener("si-route-changed",()=>renderAll());
    setupTeacherForm();renderAll();
  }
}
