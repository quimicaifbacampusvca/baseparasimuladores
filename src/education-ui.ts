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
  function renderTopics():void {
    const target=el("edu-topic-list");if(!target)return;target.replaceChildren();
    const saved=education.snapshot();
    for(const topic of learningTopics){
      const card=document.createElement("article");card.className="edu-card";card.dataset.topicId=topic.id;
      card.append(text("p",saved.topicsDone.includes(topic.id)?"Concluído":"Tema", "edu-kicker"),text("h2",topic.title),text("p",topic.summary));
      const details=document.createElement("details");const summary=text("summary","Ler conteúdo");details.append(summary);
      const body=document.createElement("div");body.className="edu-body";for(const paragraph of topic.paragraphs)body.append(text("p",paragraph));
      details.append(body);card.append(details);
      card.append(button(saved.topicsDone.includes(topic.id)?"Desmarcar conclusão":"Marcar como concluído",()=>{if(education.toggleTopic(topic.id)){const next=target.querySelector<HTMLElement>(`[data-topic-id="${topic.id}"] button`);next?.focus({preventScroll:true});}}));
      target.append(card);
    }
    const stats=el("edu-topic-summary");if(stats)stats.textContent=`${saved.topicsDone.length} de ${learningTopics.length} temas concluídos`;
  }
  function renderActivity(kind:ActivityKind):void {
    const target=el(kind==="mission"?"edu-mission-list":"edu-script-list");if(!target)return;
    target.replaceChildren();const snapshot=education.snapshot();
    for(const a of education.list(kind)){
      const card=document.createElement("article");card.className="edu-card";card.dataset.activityId=a.id;
      const position=snapshot.progress[a.id]??0,finished=position>=a.steps.length;
      card.append(text("p",`${a.origin==="teacher"?"Professor · ":""}${kind==="mission"?"Missão":"Roteiro"} · ${finished?"Concluído":`${position}/${a.steps.length} etapas`}`,"edu-kicker"),text("h2",a.title),text("p",a.description));
      const list=document.createElement("ol");list.className="edu-steps";
      for(let i=0;i<a.steps.length;i++){
        const step=a.steps[i],item=document.createElement("li");
        item.className=i<position?"edu-step-done":i===position?"edu-step-current":"";
        item.append(text("strong",step.label));
        const criterion=step.requirement==="entities"?`${step.minimum} objeto(s) na cena`:step.requirement==="selection"?"Um objeto selecionado":step.requirement==="readings"?`${step.minimum} leitura(s) registrada(s)`:"Confirmação de realização";
        item.append(text("small",criterion));list.append(item);
      }
      card.append(list);
      const actions=document.createElement("div");actions.className="edu-actions";
      const go=document.createElement("a");go.className="button outline";go.href="#/ambiente";go.textContent="Montar na bancada";actions.append(go);
      if(!finished){
        const step=a.steps[position];const allowed=meetsRequirement(step,educationScene.getSnapshot(),countReadings());
        const confirm=button(step.requirement==="manual"?"Confirmar etapa":"Conferir e registrar",()=>{
          const outcome=education.advance(a.id,educationScene.getSnapshot(),countReadings());
          notify(outcome.message,outcome.ok?"success":"warning");
          if(outcome.ok){const current=target.querySelector<HTMLElement>(`[data-activity-id="${a.id}"]`);
            (current?.querySelector<HTMLButtonElement>("button")??current?.querySelector<HTMLAnchorElement>("a"))?.focus({preventScroll:true});}
        },"primary");
        confirm.disabled=!allowed;confirm.title=allowed?"Registrar etapa":"Conclua o critério no ambiente primeiro";actions.append(confirm);
      } else actions.append(text("span","Atividade finalizada","edu-finished"));
      card.append(actions);target.append(card);
    }
    if(!target.children.length)target.append(text("p","Nenhuma atividade disponível."));
  }
  function renderTeacher():void {
    const target=el("edu-teacher-list");if(!target)return;target.replaceChildren();
    const activities=education.snapshot().teacherActivities;
    const summary=el("edu-teacher-summary");if(summary)summary.textContent=`${activities.length} / 24 atividades personalizadas`;
    if(!activities.length)target.append(text("p","Nenhuma atividade personalizada. Crie uma atividade no editor abaixo."));
    for(const a of activities){
      const card=document.createElement("article");card.className="edu-teacher-item";
      const info=document.createElement("div");info.append(text("strong",a.title),text("small",`${a.kind==="mission"?"Missão":"Roteiro"} · ${a.steps.length} etapa(s)`));
      card.append(info,button("Excluir",async()=>{
        const accepted=await confirmDialog({title:"Excluir atividade?",description:`A atividade ${a.title} e seu progresso serão excluídos deste navegador.`,confirmText:"Excluir",destructive:true});
        if(accepted&&education.removeActivity(a.id))notify("Atividade removida.","info");
      }));target.append(card);
    }
  }
  function renderAll():void {renderTopics();renderActivity("mission");renderActivity("script");renderTeacher();}
  const inputValue=(id:string):string=>(el(id) as HTMLInputElement|HTMLTextAreaElement|null)?.value.trim()??"";
  const rule=(id:string):RequirementKind=>(el(id) as HTMLSelectElement).value as RequirementKind;
  const step=(prefix:string):LearningStep=>({label:inputValue(`${prefix}-label`),requirement:rule(`${prefix}-rule`),minimum:Number(inputValue(`${prefix}-min`)||1)});
  function displayTeacherKind():void {
    const show=(el("edu-form-kind") as HTMLSelectElement).value==="script";
    const second=el("edu-second-step");if(second)second.hidden=!show;
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
    el("edu-teacher-form")?.addEventListener("submit",event=>{
      event.preventDefault();const type=kind?.value as ActivityKind;
      const created:LearningActivity={id:`teacher-${Date.now().toString(36)}-${(++teacherSerial).toString(36)}`,kind:type,origin:"teacher",
        title:inputValue("edu-form-title"),description:inputValue("edu-form-description"),
        steps:type==="script"?[step("edu-step-one"),step("edu-step-two")]:[step("edu-step-one")]};
      if(!education.createActivity(created)){notify("Revise os campos: título, descrição, critérios e etapas são obrigatórios.","warning");return;}
      (el("edu-teacher-form") as HTMLFormElement).reset();displayTeacherKind();notify("Atividade personalizada criada.","success");
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
    education.subscribe(renderAll);
    scene.subscribe(()=>{if(currentRoute(window.location.hash)!=="ambiente")renderAll();});
    window.addEventListener("si-education-observation",()=>renderAll());
    window.addEventListener("si-route-changed",()=>renderAll());
    setupTeacherForm();renderAll();
  }
}
