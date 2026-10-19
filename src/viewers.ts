namespace BaseDemoSI {
  export type ViewerId = string;
  export interface ViewerDefinition {
    readonly id: ViewerId;
    readonly title: string;
    readonly capability: ModuleCapability;
    render(snapshot: SceneSnapshot, readings: readonly ReadingRecord[], output: HTMLElement): void;
  }
  const viewerRegistry = new Map<string,ViewerDefinition>();
  let selectedViewer="observacao";
  let viewerScene:()=>SceneSnapshot;
  const viewerKey="viewer-selection-v1";
  const label=(tag:string,value:string)=>{const node=document.createElement(tag);node.textContent=value;return node;};
  export function registerViewer(viewer: ViewerDefinition):boolean {
    if(!viewer || !/^[a-z][a-z0-9-]{1,40}$/.test(viewer.id) || viewerRegistry.has(viewer.id)
      || typeof viewer.title!=="string" || viewer.title.length<2 || viewer.title.length>60
      || !["tools","measure","observe","analyze"].includes(viewer.capability)
      || typeof viewer.render!=="function")return false;
    viewerRegistry.set(viewer.id,viewer);return true;
  }
  export function availableViewers():readonly ViewerDefinition[]{return [...viewerRegistry.values()];}
  export function chooseViewer(id:string):boolean {
    const viewer=viewerRegistry.get(id);if(!viewer||!moduleAllows(viewer.capability))return false;
    selectedViewer=id;storage.write(viewerKey,id);renderViewers(viewerScene?.());return true;
  }
  export function renderViewers(snapshot?:SceneSnapshot):void {
    if(!snapshot)return;
    const buttons=document.getElementById("si-viewer-buttons"),output=document.getElementById("si-viewer-output");
    if(!buttons||!output)return;
    const allowed=[...viewerRegistry.values()].filter(v=>moduleAllows(v.capability));
    if(!allowed.some(v=>v.id===selectedViewer))selectedViewer=allowed[0]?.id??"";
    buttons.replaceChildren();
    for(const v of allowed){const btn=document.createElement("button");btn.type="button";btn.className="button outline";
      btn.textContent=v.title;btn.setAttribute("aria-pressed",String(selectedViewer===v.id));
      btn.addEventListener("click",()=>{chooseViewer(v.id);});buttons.append(btn);}
    output.replaceChildren();const chosen=viewerRegistry.get(selectedViewer);
    if(!chosen){output.append(label("p","Não há visualizadores habilitados neste módulo."));return;}
    try{chosen.render(snapshot,extensionGetRecords(),output);}catch{output.replaceChildren(label("p","Visualização indisponível."));}
  }
  export function setupViewers(scene:()=>SceneSnapshot):void {
    viewerScene=scene;
    registerViewer({id:"observacao",title:"Observar",capability:"observe",render(s,_,out){
      const selected=s.entities.find(e=>e.id===s.selectedId);
      out.append(label("h3","Observação"),label("p",selected?`Objeto em foco: ${selected.label}`:"Selecione um objeto na cena."));
      if(selected){const dl=document.createElement("dl");for(const [k,v] of [["Tipo",selected.kind],["Posição",`${selected.x}% × ${selected.y}%`],["Dimensões",`${selected.width}% × ${selected.height}%`]]){
        const row=document.createElement("div");row.append(label("dt",k),label("dd",v));dl.append(row);}out.append(dl);}
    }});
    registerViewer({id:"medicao",title:"Medir",capability:"measure",render(_,records,out){
      out.append(label("h3","Medições"));if(!records.length){out.append(label("p","Nenhuma leitura registrada."));return;}
      const list=document.createElement("ol");for(const entry of records.slice(-10).reverse())list.append(label("li",`${entry.label}: ${entry.value} ${entry.unit}`.trim()));out.append(list);
    }});
    registerViewer({id:"analise",title:"Analisar",capability:"analyze",render(s,records,out){
      out.append(label("h3","Análise da cena"));
      const kinds={block:0,circle:0,label:0};for(const e of s.entities)kinds[e.kind]++;
      const dl=document.createElement("dl");for(const [k,v] of [["Objetos",s.entities.length],["Blocos",kinds.block],["Círculos",kinds.circle],["Etiquetas",kinds.label],["Leituras registradas",records.length]]){
        const row=document.createElement("div");row.append(label("dt",String(k)),label("dd",String(v)));dl.append(row);}
      out.append(dl);
    }});
    const stored=storage.read(viewerKey);if(stored&&viewerRegistry.has(stored))selectedViewer=stored;
    window.addEventListener("si-module-change",()=>renderViewers(scene()));
    window.addEventListener("si-education-observation",()=>renderViewers(scene()));
    renderViewers(scene());
  }
}
