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
  }
  export function setupHome():void {
    window.addEventListener("si-route-changed",()=>{
      if(currentRoute(window.location.hash)==="inicio")updateHomeIndicators();
    });
    updateHomeIndicators();
  }
}
