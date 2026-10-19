namespace BaseDemoSI {
  let runtime:ExtensionRuntime;
  let extensionsReady=false;
  const find = (id:string):HTMLElement|null=>document.getElementById(id);
  function descriptor(text:string):HTMLElement {
    const p=document.createElement("p");p.textContent=text;return p;
  }
  function showFeedback(result:ExtensionResult):void {
    const status=find("extension-status");if(status)status.textContent=result.message;
    notify(result.message,result.ok?"success":"warning");
    signalFeedback(result.ok?"success":"warning");
  }
  export function renderExtensions(snapshot:SceneSnapshot):void {
    if(!extensionsReady)return;
    const extension=runtime.active();
    const choices=find("extension-choice") as HTMLSelectElement|null;
    if(choices)choices.value=extension?.metadata.id??"";
    const information=find("extension-descriptor");if(information)
      information.textContent=extension?`${extension.metadata.name} · v${extension.metadata.version}. ${extension.metadata.description}`:
        "Nenhuma extensão ativa. Os controles básicos da cena continuam disponíveis.";
    for(const [rootId,definitions,mode] of [
      ["extension-tools",extension?.tools??[],"tool"],
      ["extension-instruments",extension?.instruments??[],"instrument"]
    ] as const){
      const target=find(rootId);if(!target)continue;target.replaceChildren();
      if(!definitions.length){target.append(descriptor("Nenhum recurso conectado."));continue;}
      for(const item of definitions){
        const button=document.createElement("button");button.type="button";button.className="button outline si-extension-action";
        button.textContent=item.name;button.title=item.description;
        button.disabled=(item.requiresSelection&&!snapshot.selectedId) || !moduleAllows(mode==="tool"?"tools":"measure");
        button.setAttribute("aria-label",`${item.name}. ${item.description}`);
        button.addEventListener("click",()=>showFeedback(mode==="tool"?runtime.runTool(item.id):runtime.measure(item.id)));
        target.append(button);
      }
    }
    const log=find("extension-records");if(log){log.replaceChildren();const rows=runtime.getRecords();
      if(!rows.length){log.append(descriptor("Nenhuma leitura registrada nesta instalação."));}
      else{const list=document.createElement("ol");list.className="si-extension-log";
        for(const record of [...rows].reverse().slice(0,10)){
          const li=document.createElement("li");const strong=document.createElement("strong");strong.textContent=record.label;
          const value=document.createElement("span");value.textContent=`${record.value} ${record.unit}`.trim();
          const metadata=document.createElement("small");metadata.textContent=`Leitura #${record.sequence} · ${record.entityId?"Objeto selecionado":"Cena"}`;
          li.append(strong,value,metadata);list.append(li);
        }log.append(list);}
    }
  }
  export function extensionGetRecords():readonly ReadingRecord[] {return extensionsReady?runtime.getRecords():[];}
  export function extensionRecordCount():number {return extensionsReady?runtime.getRecords().length:0;}
  export function setupExtensions(scene:SceneStore):void {
    if(extensionsReady)return;
    runtime=createExtensionRuntime(scene,storage);
    runtime.register(neutralDemoExtension);
    // Primeira instalação: ativação explícita na base, sem alterar documentos já persistidos.
    if(storage.read("extension-session-v1")===null)runtime.activate(neutralDemoExtension.metadata.id);
    extensionsReady=true;
    const select=find("extension-choice") as HTMLSelectElement|null;
    if(select){select.replaceChildren();const none=document.createElement("option");none.value="";none.textContent="Nenhuma extensão";select.append(none);
      for(const item of runtime.available()){
        const option=document.createElement("option");option.value=item.id;option.textContent=item.name;select.append(option);
      }
      select.addEventListener("change",()=>{
        const result=runtime.activate(select.value||null);
        if(!result)notify("Não foi possível ativar a extensão.","warning");
        else notify(select.value?"Extensão local ativada.":"Extensão desativada.","info");
        renderExtensions(scene.getSnapshot());
      });
    }
    runtime.subscribe(()=>{renderExtensions(scene.getSnapshot());window.dispatchEvent(new Event("si-education-observation"));});
    window.addEventListener("si-module-change",()=>renderExtensions(scene.getSnapshot()));
    renderExtensions(scene.getSnapshot());
  }
}
