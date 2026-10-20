namespace BaseDemoSI {
  let journal:JournalStore;
  let journalScene:SceneStore;
  let openReportId:string|null=null;
  let journalFilter:NoteKind|"todos"="todos";
  let registered=false;
  const j=(id:string):HTMLElement|null=>document.getElementById(id);
  function element(tag:string,content:string,className?:string):HTMLElement {
    const e=document.createElement(tag);e.textContent=content;if(className)e.className=className;return e;
  }
  function action(label:string,callback:()=>void,primary=false):HTMLButtonElement {
    const button=document.createElement("button");button.type="button";button.className=`button ${primary?"primary":"outline"}`;
    button.textContent=label;button.addEventListener("click",callback);return button;
  }
  function localDate(iso:string):string {
    const [year,month,day]=iso.slice(0,10).split("-");return `${day}/${month}/${year}`;
  }
  function kindName(kind:NoteKind):string {return kind==="observacao"?"Observação":kind==="hipotese"?"Hipótese":"Conclusão";}
  function createList(title:string,headings:string[],lines:string[][]):HTMLElement {
    const section=document.createElement("section");section.className="si-report-section";section.append(element("h3",title));
    if(!lines.length){section.append(element("p","Nenhum registro disponível para esta seção."));return section;}
    const wrapper=document.createElement("div");wrapper.className="si-report-table-wrap";
    const table=document.createElement("table");table.className="si-report-table";
    const thead=document.createElement("thead"),header=document.createElement("tr");
    for(const label of headings)header.append(element("th",label));thead.append(header);table.append(thead);
    const tbody=document.createElement("tbody");
    for(const line of lines){const tr=document.createElement("tr");for(const value of line)tr.append(element("td",value));tbody.append(tr);}
    table.append(tbody);wrapper.append(table);section.append(wrapper);return section;
  }
  function reportContent(report:SavedReport):HTMLElement {
    const paper=document.createElement("article");paper.className="si-report-paper";
    paper.append(element("p","BASE DEMO OFICIAL - SI · RELATÓRIO","si-report-kicker"),element("h2",report.title));
    const subtitle=element("p",`Responsável: ${report.author||"Não informado"} · Data: ${localDate(report.sessionDate)} · Emissão: ${localDate(report.createdAt)}`);
    subtitle.className="si-report-byline";paper.append(subtitle);
    if(report.activity){
      const a=report.activity,identity=a.identity;
      const section=document.createElement("section");section.className="si-report-section";
      section.append(element("h3","Identificação da atividade"),
        element("p",`Nome: ${identity.nome||"Não informado"} · Turma: ${identity.turma||"Não informada"}`),
        element("p",`Professor: ${identity.professor||"Não informado"} · Grupo: ${identity.grupo||"Não informado"}`),
        element("p",`Data: ${localDate(identity.data)} · Módulo: ${a.module}`),
        element("p",`${a.kind==="mission"?"Missão":"Roteiro"}: ${a.title} · Etapas registradas: ${a.progress}/${a.total}`));
      section.append(createList("Etapas do percurso",["Etapa","Situação"],a.steps.map((name,index)=>[`${index+1}. ${name}`,index<a.progress?"Registrada":"Pendente"])));
      paper.append(section);
    }
    if(report.objective){const section=document.createElement("section");section.className="si-report-section";section.append(element("h3","Objetivo e descrição"),element("p",report.objective));paper.append(section);}
    if(report.options.includeScene)paper.append(createList("Montagem registrada",["Objeto","Tipo"],report.scene.map(e=>[e.label,e.kind==="block"?"Bloco":e.kind==="circle"?"Círculo":"Etiqueta"])));
    if(report.options.includeReadings)paper.append(createList("Medições",["Leitura","Resultado","Origem"],report.readings.map(r=>[r.label,`${r.value} ${r.unit}`.trim(),`${r.extensionId} / ${r.instrumentId} · #${r.sequence}`])));
    if(report.options.includeNotes)paper.append(createList("Registros do Caderno",["Tipo e data","Descrição","Referência"],report.notes.map(n=>[`${kindName(n.kind)} · ${localDate(n.createdAt)}`,n.body,n.entityLabel??"Cena"]))) ;
    paper.append(element("p","Registro documental produzido localmente. Resultados científicos dependem do motor especializado conectado.","si-report-disclaimer"));
    return paper;
  }
  function renderJournal():void {
    if(!registered)return;
    const target=j("journal-entries");if(!target)return;target.replaceChildren();
    const state=journal.snapshot();
    j("journal-total")!.textContent=`${state.notes.length} de 80 registros`;j("journal-readings")!.textContent=`${extensionRecords().length} leituras instrumentais disponíveis`;
    const visible=state.notes.filter(n=>journalFilter==="todos"||n.kind===journalFilter);
    if(!visible.length)target.append(element("p",state.notes.length?"Nenhum registro corresponde ao filtro.":"Nenhuma observação registrada. Use o formulário para iniciar o Caderno.","si-records-empty"));
    for(const note of [...visible].reverse()){
      const entry=document.createElement("article");entry.className="si-journal-entry";
      const header=document.createElement("div");header.className="si-journal-entry-head";
      header.append(element("strong",kindName(note.kind)),element("span",`${localDate(note.createdAt)} · ${note.entityLabel??"Cena"}`));
      const buttons=document.createElement("div");buttons.className="si-journal-actions";
      buttons.append(action("Excluir",()=>{void (async()=>{
        const yes=await confirmDialog({title:"Excluir registro?",description:"Este registro será removido do Caderno. Os relatórios já emitidos preservam suas cópias.",confirmText:"Excluir",destructive:true});
        if(yes){if(journal.removeNote(note.id))notify("Registro removido.","info");else notify("Não foi possível excluir o registro.","warning");}
      })();}));
      entry.append(header,element("p",note.body),buttons);target.append(entry);
    }
  }
  function renderReports():void {
    if(!registered)return;
    const state=journal.snapshot(),list=j("reports-entries"),preview=j("report-preview");
    if(!list||!preview)return;list.replaceChildren();preview.replaceChildren();
    j("reports-total")!.textContent=`${state.reports.length} de 20 relatórios`;
    if(openReportId && !state.reports.some(r=>r.id===openReportId))openReportId=null;
    if(!openReportId)openReportId=state.reports[state.reports.length-1]?.id??null;
    if(!state.reports.length)list.append(element("p","Ainda não existem relatórios salvos.","si-records-empty"));
    for(const report of [...state.reports].reverse()){
      const item=document.createElement("article");item.className="si-report-entry";
      if(report.id===openReportId)item.classList.add("is-open");
      const info=document.createElement("div");info.append(element("strong",report.title),element("small",`${localDate(report.sessionDate)} · ${report.author||"Sem identificação"}`));
      const actions=document.createElement("div");actions.className="si-journal-actions";
      actions.append(action("Visualizar",()=>{openReportId=report.id;renderReports();}));
      actions.append(action("Excluir",()=>{void (async()=>{
        const yes=await confirmDialog({title:"Excluir relatório?",description:"O relatório salvo será removido. Observações e leituras originais serão mantidas.",confirmText:"Excluir",destructive:true});
        if(yes){if(journal.removeReport(report.id))notify("Relatório excluído.","info");else notify("Não foi possível excluir o relatório.","warning");}
      })();}));
      item.append(info,actions);list.append(item);
    }
    const selected=state.reports.find(r=>r.id===openReportId);
    if(selected)preview.append(reportContent(selected));else preview.append(element("p","Selecione ou crie um relatório para visualizar.","si-records-empty"));
    for(const btnId of ["reports-print","reports-html"]){const b=j(btnId) as HTMLButtonElement|null;if(b)b.disabled=!selected;}
  }
  function currentReport():SavedReport|undefined {return journal.snapshot().reports.find(r=>r.id===openReportId);}
  function exportFile(name:string,body:string,type:string):void {
    const blob=new Blob([body],{type});const url=URL.createObjectURL(blob);
    const link=document.createElement("a");link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  /** CSV com separador consistente, preservando textos e bloqueando fórmulas em planilhas. */
  export function journalCSV(notes:readonly JournalNote[]):string {
    const cell=(value:string):string=>{
      const safe=/^[\s]*[=+@-]/.test(value)?"'"+value:value;
      return '"'+safe.replace(/"/g,'""')+'"';
    };
    const rows=[["data","tipo","descricao","objeto","tentativa"],...notes.map(n=>[
      n.createdAt,kindName(n.kind),n.body,n.entityLabel??"",n.attemptId??""
    ])];
    return "\uFEFF"+rows.map(r=>r.map(cell).join(";")).join("\r\n")+"\r\n";
  }
  function journalPrintSheet():HTMLElement {
    const paper=document.createElement("article");paper.className="si-report-paper si-journal-paper";
    paper.append(element("p","BASE DEMO OFICIAL - SI · CADERNO","si-report-kicker"),element("h2","Caderno de registros"),
      element("p",`Emissão: ${localDate(new Date().toISOString())} · ${journal.snapshot().notes.length} registros`,"si-report-byline"));
    for(const note of journal.snapshot().notes){
      const section=document.createElement("section");section.className="si-report-section";
      section.append(element("h3",`${kindName(note.kind)} · ${localDate(note.createdAt)}`),
        element("p",`Referência: ${note.entityLabel??"Cena"}${note.attemptId?" · Registro de atividade orientada":""}`),
        element("p",note.body));paper.append(section);
    }
    if(!journal.snapshot().notes.length)paper.append(element("p","Nenhum registro disponível."));
    return paper;
  }
  function blankReportSheet():HTMLElement {
    const value=(id:string)=>((j(id) as HTMLInputElement|HTMLTextAreaElement|null)?.value??"").trim();
    const paper=document.createElement("article");paper.className="si-report-paper si-blank-report";
    paper.append(element("p","BASE DEMO OFICIAL - SI · FOLHA PARA PREENCHER","si-report-kicker"),
      element("h2",value("report-title")||"Relatório de investigação"),
      element("p",`Responsável: ${value("report-author")||"________________________"} · Data: ${value("report-date")||"____/____/______"}`,"si-report-byline"));
    const objective=value("report-objective");
    if(objective){const section=document.createElement("section");section.className="si-report-section";
      section.append(element("h3","Objetivo"),element("p",objective));paper.append(section);}
    for(const name of ["Montagem e procedimentos","Observações e medições","Análise e interpretação","Conclusão"]){
      const section=document.createElement("section");section.className="si-report-section";
      section.append(element("h3",name));
      for(let i=0;i<8;i++){const line=document.createElement("div");line.className="si-writing-line";line.setAttribute("aria-hidden","true");section.append(line);}
      paper.append(section);
    }
    return paper;
  }
  function printSheet(content:HTMLElement):void {
    const sheet=j("si-print-sheet");if(!sheet)return;
    sheet.replaceChildren(content);sheet.hidden=false;
    try{window.print();}catch{sheet.hidden=true;sheet.replaceChildren();notify("Impressão indisponível neste navegador.","warning");}
  }
  function reportHTML(report:SavedReport):string {
    const reportNode=reportContent(report);
    const style=`body{font:11pt/1.5 Georgia,serif;color:#1b2933;max-width:820px;margin:28px auto;padding:20px}h2{font-size:24pt}h3{font-size:13pt;margin-top:22px}p{white-space:pre-wrap;overflow-wrap:anywhere}.si-report-kicker{font:700 9pt Arial;letter-spacing:.12em}.si-report-byline{font:10pt Arial;color:#455867}table{width:100%;border-collapse:collapse;font:9pt Arial;table-layout:fixed}th,td{border:1px solid #b8c4cc;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#e7eef3}.si-report-disclaimer{font-size:9pt;margin-top:26px;border-top:1px solid #aebbc5;padding-top:10px}@page{size:A4;margin:15mm}`;
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório local</title><style>${style}</style></head><body>${reportNode.outerHTML}</body></html>`;
  }
  let presentedAttempt="";
  function prepareGuidedReport():void {
    if(!registered)return;
    const context=guidedReportContext(),banner=j("report-guided-context");
    if(banner){banner.hidden=!context;banner.textContent=context
      ?`Relatório vinculado à ${context.kind==="mission"?"missão":"investigação"} “${context.title}” · ${context.progress}/${context.total} etapas. Apenas registros desta tentativa serão incluídos.`:"";}
    if(!context){presentedAttempt="";return;}
    const presentationKey=context.attemptId+"|"+JSON.stringify(context.identity);
    if(presentedAttempt===presentationKey)return;
    presentedAttempt=presentationKey;
    const set=(id:string,value:string)=>{const input=j(id) as HTMLInputElement|HTMLTextAreaElement|null;if(input)input.value=value;};
    set("report-title",`Relatório — ${context.title}`.slice(0,100));
    set("report-author",context.identity.nome);
    set("report-date",context.identity.data);
    set("report-objective",context.objective);
  }
  /** Consolida apenas a tentativa atual; uma saída sem registros não produz relatório vazio. */
  export function archiveGuidedReport():boolean {
    const ctx=guidedReportContext();if(!ctx||!registered)return true;
    const scoped=extensionRecords().filter(r=>r.sequence>ctx.readingsBaseline);
    const notes=journal.snapshot().notes.filter(n=>n.attemptId===ctx.attemptId);
    const scene=journalScene.getSnapshot();
    // Relatório parcial não impede um registro final mais completo.
    if(journal.snapshot().reports.some(r=>r.activity?.attemptId===ctx.attemptId
      && r.activity.progress===ctx.progress && r.notes.length>=notes.length
      && r.readings.length>=scoped.length && r.scene.length>=scene.entities.length))return true;
    const referenceEntities=(ctx.module==="medir"||ctx.module==="calcular")?1:0;
    if(ctx.progress===0 && !scoped.length && !notes.length && scene.entities.length<=referenceEntities)return true;
    const archived=journal.makeReport({title:`Relatório — ${ctx.title}`.slice(0,100),author:ctx.identity.nome,
      sessionDate:ctx.identity.data,objective:ctx.objective,
      includeScene:true,includeReadings:true,includeNotes:true,activity:ctx},scene,extensionRecords());
    if(archived){openReportId=null;renderReports();}
    return archived;
  }
  function configure():void {
    j("journal-form")?.addEventListener("submit",event=>{
      event.preventDefault();const form=event.currentTarget as HTMLFormElement;
      const data={kind:(j("journal-kind") as HTMLSelectElement).value,body:(j("journal-body") as HTMLTextAreaElement).value.trim()};
      if(journal.addNote(data,journalScene.getSnapshot(),guidedReportContext()?.attemptId)){form.reset();notify("Registro adicionado ao Caderno.","success");}
      else notify("Não foi possível salvar. Verifique os campos ou o espaço disponível no navegador.","warning");
    });
    j("reports-form")?.addEventListener("submit",event=>{
      event.preventDefault();const i=(id:string)=>(j(id) as HTMLInputElement|HTMLTextAreaElement).value.trim();
      const checked=(id:string)=>(j(id) as HTMLInputElement).checked;
      const context=guidedReportContext();
      const draft:ReportInput={title:i("report-title"),author:i("report-author"),sessionDate:i("report-date"),objective:i("report-objective"),
        ...(context?{activity:context}:{}),
        includeScene:checked("report-scene"),includeNotes:checked("report-notes"),includeReadings:checked("report-readings")};
      if(context&&journal.snapshot().reports.some(r=>r.activity?.attemptId===context.attemptId
          && r.activity.progress===context.progress && r.notes.length>=journal.snapshot().notes.filter(n=>n.attemptId===context.attemptId).length
          && r.readings.length>=extensionRecords().filter(r=>r.sequence>context.readingsBaseline).length)){
        notify("Este estado da tentativa já possui relatório salvo. Abra-o na lista.","info");return;}
      if(journal.makeReport(draft,journalScene.getSnapshot(),extensionRecords())){
        openReportId=null;renderReports();notify("Relatório criado com uma cópia dos registros selecionados.","success");
      }else notify("Relatório não salvo. Revise os campos, os limites ou o armazenamento local.","warning");
    });
    const date=j("report-date") as HTMLInputElement|null;if(date&&!date.value)date.value=(()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);})();
    j("journal-export")?.addEventListener("click",()=>exportFile("base-si-caderno-backup.json",journal.exportJSON(),"application/json;charset=utf-8"));
    j("journal-csv")?.addEventListener("click",()=>exportFile("base-si-caderno.csv",journalCSV(journal.snapshot().notes),"text/csv;charset=utf-8"));
    j("journal-print")?.addEventListener("click",()=>printSheet(journalPrintSheet()));
    (j("journal-filter") as HTMLSelectElement|null)?.addEventListener("change",event=>{
      const filter=(event.currentTarget as HTMLSelectElement).value;
      if(filter==="todos"||filter==="observacao"||filter==="hipotese"||filter==="conclusao"){
        journalFilter=filter;renderJournal();
      }
    });
    j("journal-clear")?.addEventListener("click",()=>{void (async()=>{
      if(guidedActivityContext()){notify("Encerre a investigação antes de limpar os registros.","warning");return;}
      if(!journal.snapshot().notes.length){notify("O Caderno já está vazio.","info");return;}
      const yes=await confirmDialog({title:"Limpar Caderno?",description:"Exporte uma cópia antes de apagar. Relatórios já emitidos serão preservados. Esta ação não pode ser desfeita.",confirmText:"Limpar Caderno",destructive:true});
      if(!yes)return;
      if(guidedActivityContext()){notify("Atividade em andamento; o Caderno não foi alterado.","warning");return;}
      if(journal.clearNotes())notify("Registros do Caderno removidos. Relatórios preservados.","success");
      else notify("Não foi possível limpar o Caderno; os registros foram preservados.","warning");
    })();});
    (j("journal-import") as HTMLInputElement|null)?.addEventListener("change",event=>{void (async()=>{
      const field=event.currentTarget as HTMLInputElement,file=field.files?.[0];field.value="";
      if(!file)return;
      if(guidedActivityContext()){
        notify("Encerre a atividade orientada antes de restaurar registros. A tentativa atual foi preservada.","warning");return;
      }
      if(file.size>300000){notify("Arquivo acima do limite de importação.","warning");return;}
      let decoded:unknown=null;try{decoded=parseJournalImport(await file.text());}catch{decoded=null;}
      if(!decoded || !parseJournal((decoded as {document?:unknown}).document) || (decoded as {format?:unknown}).format!=="base-demo-si-journal-v1"){
        notify("Arquivo incompatível ou inválido. O Caderno não foi alterado.","warning");return;
      }
      const yes=await confirmDialog({title:"Restaurar Caderno e relatórios?",description:"O conteúdo atual do Caderno e os relatórios salvos serão substituídos. Cena, extensões e atividades não serão alteradas.",confirmText:"Restaurar backup",destructive:true});
      if(yes){
        if(guidedActivityContext()){
          notify("A investigação foi iniciada durante a confirmação. Encerre-a antes de importar registros.","warning");return;
        }
        if(journal.importJSON(decoded)){openReportId=null;notify("Backup restaurado com validação.","success");}
        else notify("Não foi possível restaurar o arquivo.","warning");}
    })();});
    j("reports-print")?.addEventListener("click",()=>{
      const report=currentReport();if(report)printSheet(reportContent(report));
    });
    j("reports-blank")?.addEventListener("click",()=>printSheet(blankReportSheet()));
    window.addEventListener("afterprint",()=>{const sheet=j("si-print-sheet");if(sheet){sheet.hidden=true;sheet.replaceChildren();}});
    j("reports-html")?.addEventListener("click",()=>{const report=currentReport();if(!report)return;
      exportFile(`base-si-relatorio-${report.id}.html`,reportHTML(report),"text/html;charset=utf-8");
      notify("Relatório HTML autocontido preparado.","success");
    });
  }
  export function extensionRecords():readonly ReadingRecord[] {return extensionGetRecords();}
  export function setupJournal(scene:SceneStore):void {
    if(registered)return;
    registered=true;journalScene=scene;journal=createJournalStore(storage);
    journal.subscribe(()=>{renderJournal();renderReports();});
    window.addEventListener("si-education-observation",()=>renderJournal());
    window.addEventListener("si-route-changed",()=>{renderJournal();renderReports();prepareGuidedReport();});
    window.addEventListener("si-guided-context-changed",prepareGuidedReport);
    configure();renderJournal();renderReports();prepareGuidedReport();
  }
}
