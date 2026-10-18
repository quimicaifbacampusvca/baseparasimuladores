namespace BaseDemoSI {
  let journal:JournalStore;
  let journalScene:SceneStore;
  let openReportId:string|null=null;
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
    if(!state.notes.length)target.append(element("p","Nenhuma observação registrada. Use o formulário para iniciar o Caderno.","si-records-empty"));
    for(const note of [...state.notes].reverse()){
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
  function reportHTML(report:SavedReport):string {
    const reportNode=reportContent(report);
    const style=`body{font:11pt/1.5 Georgia,serif;color:#1b2933;max-width:820px;margin:28px auto;padding:20px}h2{font-size:24pt}h3{font-size:13pt;margin-top:22px}p{white-space:pre-wrap;overflow-wrap:anywhere}.si-report-kicker{font:700 9pt Arial;letter-spacing:.12em}.si-report-byline{font:10pt Arial;color:#455867}table{width:100%;border-collapse:collapse;font:9pt Arial;table-layout:fixed}th,td{border:1px solid #b8c4cc;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#e7eef3}.si-report-disclaimer{font-size:9pt;margin-top:26px;border-top:1px solid #aebbc5;padding-top:10px}@page{size:A4;margin:15mm}`;
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório local</title><style>${style}</style></head><body>${reportNode.outerHTML}</body></html>`;
  }
  function configure():void {
    j("journal-form")?.addEventListener("submit",event=>{
      event.preventDefault();const form=event.currentTarget as HTMLFormElement;
      const data={kind:(j("journal-kind") as HTMLSelectElement).value,body:(j("journal-body") as HTMLTextAreaElement).value.trim()};
      if(journal.addNote(data,journalScene.getSnapshot())){form.reset();notify("Registro adicionado ao Caderno.","success");}
      else notify("Não foi possível salvar. Verifique os campos ou o espaço disponível no navegador.","warning");
    });
    j("reports-form")?.addEventListener("submit",event=>{
      event.preventDefault();const i=(id:string)=>(j(id) as HTMLInputElement|HTMLTextAreaElement).value.trim();
      const checked=(id:string)=>(j(id) as HTMLInputElement).checked;
      const draft:ReportInput={title:i("report-title"),author:i("report-author"),sessionDate:i("report-date"),objective:i("report-objective"),
        includeScene:checked("report-scene"),includeNotes:checked("report-notes"),includeReadings:checked("report-readings")};
      if(journal.makeReport(draft,journalScene.getSnapshot(),extensionRecords())){
        openReportId=null;renderReports();notify("Relatório criado com uma cópia dos registros selecionados.","success");
      }else notify("Relatório não salvo. Revise os campos, os limites ou o armazenamento local.","warning");
    });
    const date=j("report-date") as HTMLInputElement|null;if(date&&!date.value)date.value=(()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);})();
    j("journal-export")?.addEventListener("click",()=>exportFile("base-si-caderno-backup.json",journal.exportJSON(),"application/json;charset=utf-8"));
    (j("journal-import") as HTMLInputElement|null)?.addEventListener("change",event=>{void (async()=>{
      const field=event.currentTarget as HTMLInputElement,file=field.files?.[0];field.value="";
      if(!file)return;
      if(file.size>300000){notify("Arquivo acima do limite de importação.","warning");return;}
      let decoded:unknown=null;try{decoded=parseJournalImport(await file.text());}catch{decoded=null;}
      if(!decoded || !parseJournal((decoded as {document?:unknown}).document) || (decoded as {format?:unknown}).format!=="base-demo-si-journal-v1"){
        notify("Arquivo incompatível ou inválido. O Caderno não foi alterado.","warning");return;
      }
      const yes=await confirmDialog({title:"Restaurar Caderno e relatórios?",description:"O conteúdo atual do Caderno e os relatórios salvos serão substituídos. Cena, extensões e atividades não serão alteradas.",confirmText:"Restaurar backup",destructive:true});
      if(yes){if(journal.importJSON(decoded)){openReportId=null;notify("Backup restaurado com validação.","success");}
        else notify("Não foi possível restaurar o arquivo.","warning");}
    })();});
    j("reports-print")?.addEventListener("click",()=>{
      const report=currentReport(),sheet=j("si-print-sheet");if(!report||!sheet)return;
      sheet.replaceChildren(reportContent(report));sheet.hidden=false;window.print();
    });
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
    window.addEventListener("si-route-changed",()=>{renderJournal();renderReports();});
    configure();renderJournal();renderReports();
  }
}
