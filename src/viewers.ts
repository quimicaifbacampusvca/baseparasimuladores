namespace BaseDemoSI {
  export type ViewerId = string;
  export interface ViewerDefinition {
    readonly id: ViewerId;
    readonly title: string;
    readonly capability: ModuleCapability;
    render(snapshot: SceneSnapshot, readings: readonly ReadingRecord[], output: HTMLElement): void;
  }
  export type ViewerFamilyId="observar"|"medir"|"analisar";
  const familyNames:Readonly<Record<ViewerFamilyId,string>>={observar:"Observar",medir:"Medir",analisar:"Analisar"};
  // Ícones vetoriais próprios do contrato de navegação da família (SVGs locais).
  const familyIcons:Readonly<Record<ViewerFamilyId,string>>={
    observar:"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    medir:"M4 17 17 4l3 3L7 20H4ZM8 13l2 2M11 10l2 2M14 7l2 2",
    analisar:"M4 3v17h17M7 16l4-5 4 2 5-8"
  };
  const familyDescriptions:Readonly<Record<ViewerFamilyId,string>>={
    observar:"Representações e propriedades dos objetos em foco.",
    medir:"Instrumentos disponíveis e leituras da investigação.",
    analisar:"Comparações e interpretações dos dados da cena."
  };
  const viewerRegistry = new Map<string,ViewerDefinition>();
  let selectedViewer="observacao";
  let selectedFamily:ViewerFamilyId="observar";
  const viewerFamilyKey="viewer-family-selection-v1";
  export function viewerFamily(capability:ModuleCapability):ViewerFamilyId {
    return capability==="measure"?"medir":capability==="analyze"?"analisar":"observar";
  }
  export function activeViewer():ViewerDefinition|null {
    const viewer=viewerRegistry.get(selectedViewer);
    return viewer&&moduleAllows(viewer.capability)?viewer:null;
  }
  export function availableViewerFamilies():readonly ViewerFamilyId[] {
    const choices=new Set([...viewerRegistry.values()].filter(v=>moduleAllows(v.capability)).map(v=>viewerFamily(v.capability)));
    return (Object.keys(familyNames) as ViewerFamilyId[]).filter(id=>choices.has(id));
  }
  export function currentViewerFamily():ViewerFamilyId {return selectedFamily;}
  export function chooseViewerFamily(id:string):boolean {
    if(!availableViewerFamilies().includes(id as ViewerFamilyId))return false;
    selectedFamily=id as ViewerFamilyId;
    storage.write(viewerFamilyKey,id);
    renderViewers(viewerScene?.());
    window.dispatchEvent(new Event("si-viewer-family-selected"));
    return true;
  }
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
    selectedViewer=id;
    selectedFamily=viewerFamily(viewer.capability);
    storage.write(viewerKey,id);storage.write(viewerFamilyKey,selectedFamily);
    renderViewers(viewerScene?.());return true;
  }
  export function renderViewers(snapshot?:SceneSnapshot):void {
    if(!snapshot)return;
    const buttons=document.getElementById("si-viewer-buttons"),output=document.getElementById("si-viewer-output");
    const tabs=document.getElementById("si-viewer-families"),description=document.getElementById("si-viewer-family-description");
    const panel=document.getElementById("si-viewer-family-panel");
    if(!buttons||!output||!tabs||!description||!panel)return;
    const allowed=[...viewerRegistry.values()].filter(v=>moduleAllows(v.capability));
    const families=availableViewerFamilies();
    if(!families.includes(selectedFamily))selectedFamily=families[0]??"observar";
    if(!allowed.some(v=>v.id===selectedViewer))selectedViewer=allowed.find(v=>viewerFamily(v.capability)===selectedFamily)?.id??"";
    tabs.replaceChildren();
    for(const family of families){
      const tab=document.createElement("button");tab.type="button";tab.className="si-viewer-family-tab";
      const svgNs="http:"+"//www.w3.org/2000/svg";
      const svg=document.createElementNS(svgNs,"svg");
      svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");
      svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.8");
      svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
      svg.setAttribute("aria-hidden","true");svg.classList.add("si-viewer-family-icon");
      const shape=document.createElementNS(svgNs,"path");shape.setAttribute("d",familyIcons[family]);svg.append(shape);
      tab.append(svg,label("span",familyNames[family]));tab.setAttribute("role","tab");tab.setAttribute("aria-selected",String(family===selectedFamily));
      tab.tabIndex=family===selectedFamily?0:-1;tab.setAttribute("aria-controls","si-viewer-family-panel");
      tab.addEventListener("click",()=>chooseViewerFamily(family));
      tab.addEventListener("keydown",ev=>{
        if(ev.key!=="ArrowRight"&&ev.key!=="ArrowLeft"&&ev.key!=="Home"&&ev.key!=="End")return;
        ev.preventDefault();const i=families.indexOf(family);
        const next=ev.key==="Home"?families[0]:ev.key==="End"?families[families.length-1]:families[(i+(ev.key==="ArrowRight"?1:-1)+families.length)%families.length];
        chooseViewerFamily(next);
        tabs.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus({preventScroll:true});
      });
      tabs.append(tab);
    }
    panel.setAttribute("aria-label",`${familyNames[selectedFamily]} — ferramentas`);
    description.textContent=families.length?familyDescriptions[selectedFamily]:"Nenhuma família disponível neste módulo.";
    buttons.replaceChildren();
    for(const v of allowed.filter(v=>viewerFamily(v.capability)===selectedFamily)){
      const btn=document.createElement("button");btn.type="button";btn.className="si-viewer-item";
      btn.textContent=v.title;btn.setAttribute("aria-pressed",String(selectedViewer===v.id));
      btn.addEventListener("click",()=>{if(chooseViewer(v.id))window.dispatchEvent(new CustomEvent("si-viewer-selected",{detail:v.id}));});
      buttons.append(btn);
    }
    output.replaceChildren();const chosen=activeViewer();
    if(!chosen){output.append(label("p","Não há visualizadores habilitados neste módulo."));return;}
    try{chosen.render(snapshot,extensionGetRecords(),output);}catch{output.replaceChildren(label("p","Visualização indisponível."));}
  }
  export function setupViewers(scene:()=>SceneSnapshot):void {
    viewerScene=scene;
    registerViewer({id:"observacao",title:"Propriedades da cena",capability:"observe",render(s,_,out){
      const selected=s.entities.find(e=>e.id===s.selectedId);
      out.append(label("h3","Observação"),label("p",selected?`Objeto em foco: ${selected.label}`:"Selecione um objeto na cena."));
      if(selected){const dl=document.createElement("dl");for(const [k,v] of [["Tipo",selected.kind],["Posição",`${selected.x}% × ${selected.y}%`],["Dimensões",`${selected.width}% × ${selected.height}%`]]){
        const row=document.createElement("div");row.append(label("dt",k),label("dd",v));dl.append(row);}out.append(dl);}
    }});
    registerViewer({id:"medicao",title:"Leituras registradas",capability:"measure",render(_,records,out){
      out.append(label("h3","Medições"));if(!records.length){out.append(label("p","Nenhuma leitura registrada."));return;}
      const list=document.createElement("ol");for(const entry of records.slice(-10).reverse())list.append(label("li",`${entry.label}: ${entry.value} ${entry.unit}`.trim()));out.append(list);
    }});
    registerViewer({id:"analise",title:"Distribuição dos objetos",capability:"analyze",render(s,records,out){
      out.append(label("h3","Análise da cena"));
      const kinds={block:0,circle:0,label:0};for(const e of s.entities)kinds[e.kind]++;
      const dl=document.createElement("dl");for(const [k,v] of [["Objetos",s.entities.length],["Blocos",kinds.block],["Círculos",kinds.circle],["Etiquetas",kinds.label],["Leituras registradas",records.length]]){
        const row=document.createElement("div");row.append(label("dt",String(k)),label("dd",String(v)));dl.append(row);}
      out.append(dl);
    }});
    const stored=storage.read(viewerKey);if(stored&&viewerRegistry.has(stored))selectedViewer=stored;
    const family=storage.read(viewerFamilyKey);
    if(family&&["observar","medir","analisar"].includes(family))selectedFamily=family as ViewerFamilyId;
    else selectedFamily=viewerRegistry.has(selectedViewer)?viewerFamily(viewerRegistry.get(selectedViewer)!.capability):"observar";
    window.addEventListener("si-module-change",()=>renderViewers(scene()));
    window.addEventListener("si-education-observation",()=>renderViewers(scene()));
    renderViewers(scene());
  }
}
