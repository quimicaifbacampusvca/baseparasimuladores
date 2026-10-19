namespace BaseDemoSI {
  /** Indicadores reais do catálogo, sem conteúdo disciplinar na Home. */
  export function updateHomeIndicators(): void {
    const setText=(id:string,text:string):void=>{const node=document.getElementById(id);if(node)node.textContent=text;};
    const officialMissions=officialActivities.filter(a=>a.kind==="mission").length;
    const officialScripts=officialActivities.filter(a=>a.kind==="script").length;
    let saved:EducationDocument|null=null;
    let journal:JournalDocument|null=null;
    try {const value=storage.read("education-document-v1");if(value)saved=parseEducation(JSON.parse(value));} catch { /* Sem dados acessíveis: catálogo ainda funciona. */ }
    try {const value=storage.read("journal-document-v1");if(value)journal=parseJournal(JSON.parse(value));} catch { /* Falha de armazenamento não bloqueia a Home. */ }
    const topicsDone=saved?.topicsDone.length??0;
    const extraMissions=saved?.teacherActivities.filter(a=>a.kind==="mission").length??0;
    const extraScripts=saved?.teacherActivities.filter(a=>a.kind==="script").length??0;
    const notes=journal?.notes.length??0;
    setText("si-home-learning-meta", `${learningTopics.length} temas · ${topicsDone} concluído${topicsDone===1?"":"s"}`);
    setText("si-home-missions-meta", `${officialMissions+extraMissions} desafios para investigar`);
    setText("si-home-scripts-meta", `${officialScripts+extraScripts} investigações orientadas`);
    setText("si-home-notebook-meta", notes?`${notes} registro${notes===1?"":"s"} salvo${notes===1?"":"s"}`:"Pronto para seus registros");
    const active=guidedActivityContext();
    const resume=document.getElementById("si-home-resume");
    const resumeLink=document.getElementById("si-home-resume-link") as HTMLAnchorElement|null;
    const benchLink=document.getElementById("si-home-resume-bench") as HTMLAnchorElement|null;
    if(resume)resume.hidden=!active;
    if(active){
      setText("si-home-resume-title",active.title);
      setText("si-home-resume-meta",`${active.kind==="mission"?"Missão":"Roteiro"} · ${Math.min(active.progress,active.total)}/${active.total} etapa(s) ${active.progress>=active.total?"concluídas":"registradas"}`);
      if(resumeLink){resumeLink.href=active.url;resumeLink.textContent=active.progress>=active.total?"Rever atividade":"Retomar atividade";}
      if(benchLink)benchLink.href="#/ambiente";
    }
    let scene:SceneSnapshot|null=null;
    try{const raw=storage.read("scene-project-v1");if(raw)scene=parseScene(JSON.parse(raw));}catch{/* Projeto não válido: nenhuma retomada é exibida. */}
    const count=scene?.entities.length??0;
    const sceneInfo=document.getElementById("si-home-scene-summary");
    if(sceneInfo){sceneInfo.hidden=count===0;sceneInfo.textContent=count===1?"1 objeto salvo na bancada":`${count} objetos salvos na bancada`; }
  }
  export function setupHome():void {
    let pendingFromHome:RouteId|null=null;
    window.addEventListener("si-route-changed",()=>{
      const current=currentRoute(window.location.hash);
      if(current==="inicio")updateHomeIndicators();
      if(current!==pendingFromHome)return;
      pendingFromHome=null;
      // Atualizar a rota antes de mover o foco: cabeçalhos ocultos não recebem foco.
      window.requestAnimationFrame(()=>{
        const view=document.querySelector<HTMLElement>(`[data-view="${current}"]`);
        const heading=view?.querySelector<HTMLElement>("h1,h2");
        if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
        else document.getElementById("conteudo")?.focus({preventScroll:true});
      });
    });
    window.addEventListener("si-guided-context-changed",()=>{
      if(currentRoute(window.location.hash)==="inicio")updateHomeIndicators();
    });
    // O clique apenas marca o destino; a restauração de foco aguarda a rota realmente visível.
    document.querySelectorAll<HTMLAnchorElement>(".si-home-family a[href^='#/']").forEach(link=>{
      link.addEventListener("click",()=>{
        const next=currentRoute(link.getAttribute("href")??"");
        if(next!=="inicio")pendingFromHome=next;
      });
    });
    updateHomeIndicators();
  }
}
