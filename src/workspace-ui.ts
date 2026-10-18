namespace BaseDemoSI {
  const WORKSPACE_KEY="workspace-layout-v1";
  let workspaceState:WorkspaceState=initialWorkspace();
  let workspaceStarted=false;
  let readScene:()=>SceneSnapshot;
  let selectScene:(id:string|null)=>void;
  let lastTrigger:HTMLElement|null=null;
  let lastSide:WorkspaceSide="left";
  const node=(id:string)=>document.getElementById(id);
  const mobile=()=>window.matchMedia("(max-width: 900px)").matches;
  const compact=()=>window.innerWidth<1280;
  const activeSide=():WorkspaceSide|null=>workspaceState.right==="open"?"right":workspaceState.left==="open"?"left":null;
  function dock(side:WorkspaceSide):HTMLElement {return node(`si-dock-${side}`)!;}
  function persistWorkspace():void{storage.write(WORKSPACE_KEY,serializeWorkspacePreference(workspaceState));}
  function focusReturn(side:WorkspaceSide):void {
    const button=lastTrigger?.isConnected ? lastTrigger:document.querySelector<HTMLElement>(`[data-open-dock="${side==="left"?"montagem":workspaceState.rightTab}"]`);
    button?.focus({preventScroll:true});
  }
  function renderWorkspace():void {
    const root=node("si-workspace");if(!root)return;
    const sheet=mobile();
    const active=activeSide();
    const fullscreen=!sheet&&workspaceState.right==="open"&&workspaceState.presentation==="fullscreen";
    root.dataset.viewMode=workspaceState.view;
    root.dataset.leftOpen=String(workspaceState.left==="open");
    root.dataset.rightOpen=String(workspaceState.right==="open");
    root.classList.toggle("si-workspace-fullscreen",fullscreen);
    for(const [view,id] of [["focus","workspace-focus"],["overview","workspace-overview"]] as const){
      const el=node(id);if(el)el.hidden=workspaceState.view!==view;
      document.querySelector<HTMLElement>(`[data-scene-view="${view}"]`)?.setAttribute("aria-pressed",String(workspaceState.view===view));
    }
    for(const side of ["left","right"] as const){
      const pane=dock(side);const opened=workspaceState[side]==="open";
      pane.hidden=!opened;pane.inert=!opened;
      pane.classList.toggle("si-bottom-sheet",sheet);
      pane.setAttribute("role",sheet&&opened?"dialog":"region");
      if(sheet&&opened)pane.setAttribute("aria-modal","true");else pane.removeAttribute("aria-modal");
    }
    for(const button of document.querySelectorAll<HTMLElement>("[data-open-dock]")){
      const target=button.dataset.openDock;
      const on=target==="montagem"?workspaceState.left==="open":workspaceState.right==="open"&&workspaceState.rightTab===target;
      button.setAttribute("aria-expanded",String(on));
    }
    for(const b of document.querySelectorAll<HTMLElement>("[data-left-tab]"))b.setAttribute("aria-pressed",String(workspaceState.leftTab===b.dataset.leftTab));
    for(const b of document.querySelectorAll<HTMLElement>("[data-right-tab]"))b.setAttribute("aria-pressed",String(workspaceState.rightTab===b.dataset.rightTab));
    for(const panel of document.querySelectorAll<HTMLElement>("[data-left-panel]"))panel.hidden=panel.dataset.leftPanel!==workspaceState.leftTab;
    for(const panel of document.querySelectorAll<HTMLElement>("[data-right-panel]"))panel.hidden=panel.dataset.rightPanel!==workspaceState.rightTab;
    const lh=node("si-left-title");if(lh)lh.textContent={montagem:"Montagem",objetos:"Objetos",ajustes:"Ajustes"}[workspaceState.leftTab];
    const rh=node("si-right-title");if(rh)rh.textContent=workspaceState.rightTab==="dados"?"Dados":"Ver";
    const rp=dock("right");rp.dataset.presentation=fullscreen?"fullscreen":"standard";
    const expand=node("si-expand") as HTMLButtonElement|null;
    if(expand){expand.hidden=sheet||workspaceState.rightTab==="dados";expand.textContent=fullscreen?"Restaurar":"Expandir";expand.setAttribute("aria-expanded",String(fullscreen));}
    const backdrop=node("si-sheet-backdrop");if(backdrop)backdrop.hidden=!(sheet&&!!active);
    document.body.classList.toggle("si-sheet-active",sheet&&!!active);
    const scene=node("si-stage");if(scene)scene.inert=!!(sheet&&active)||fullscreen;
    const actionbar=root.querySelector<HTMLElement>(".si-actionbar");if(actionbar)actionbar.inert=!!(sheet&&active)||fullscreen;
    const toolbar=root.querySelector<HTMLElement>(".si-workspace-toolbar .si-view-tabs");if(toolbar)toolbar.inert=!!(sheet&&active)||fullscreen;
    const strip=node("scene-strip");if(strip)strip.inert=!!(sheet&&active)||fullscreen;
    if(workspaceState.left==="open"&&workspaceState.right==="open"&&compact())console.warn("Estado compacto normalizado incorretamente");
  }
  function changeWorkspace(a:WorkspaceAction,persist=true):void {
    workspaceState=normalizeWorkspace(reduceWorkspace(workspaceState,a,compact()),compact());
    renderWorkspace();if(persist)persistWorkspace();
  }
  function openWorkspace(side:WorkspaceSide,tab:WorkspaceLeftTab|WorkspaceRightTab,trigger:HTMLElement):void {
    const same=side==="left"?workspaceState.left==="open":workspaceState.right==="open"&&workspaceState.rightTab===tab;
    if(same){closeWorkspace(side);return;}
    lastTrigger=trigger;lastSide=side;
    changeWorkspace({type:"open",side,tab});
    dock(side).querySelector<HTMLElement>("[data-close-dock]")?.focus({preventScroll:true});
  }
  function closeWorkspace(side:WorkspaceSide,returnFocus=true):void {
    changeWorkspace({type:"close",side});if(returnFocus)focusReturn(side);
  }
  function updateViewport():void {
    workspaceState=normalizeWorkspace(workspaceState,compact());renderWorkspace();
    const vv=window.visualViewport;const root=node("si-workspace");
    if(root&&mobile()&&vv)root.style.setProperty("--si-visible-height",`${vv.height}px`);
    else root?.style.removeProperty("--si-visible-height");
  }
  function focusables(pane:HTMLElement):HTMLElement[]{return Array.from(pane.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')).filter(el=>!el.closest('[hidden],[inert]')&&el.getClientRects().length>0);}
  function keyboardHandler(ev:KeyboardEvent):void {
    if(!document.body.classList.contains("route-ambiente"))return;
    const side=activeSide();if(!side)return;
    if(ev.key==="Escape") {ev.preventDefault();closeWorkspace(lastSide);return;}
    if(ev.key!=="Tab"||!(mobile()||workspaceState.presentation==="fullscreen"))return;
    const items=focusables(dock(side));if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}
    else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}
  }
  function createObjectButton(e:SceneEntity,kind:"strip"|"overview"):HTMLButtonElement {
    const b=document.createElement("button");b.type="button";
    b.className=kind==="strip"?"si-strip-item":"si-overview-item";
    b.setAttribute("aria-pressed",String(e.id===readScene().selectedId));
    const label=document.createElement("strong");label.textContent=e.label;
    const info=document.createElement("small");info.textContent=e.kind==="block"?"Bloco":e.kind==="circle"?"Círculo":"Etiqueta";
    const swatch=document.createElement("span");swatch.className=`si-swatch tone-${e.tone}`;swatch.setAttribute("aria-hidden","true");
    b.append(swatch,label,info);
    b.addEventListener("click",()=>{selectScene(e.id);if(kind==="overview")changeWorkspace({type:"view",view:"focus"});});
    return b;
  }
  export function renderWorkspaceContent(snap:SceneSnapshot):void {
    if(!workspaceStarted)return;
    const focus=snap.entities.find(e=>e.id===snap.selectedId);
    const title=node("focused-object-label"),sub=node("focused-object-subtitle");
    if(title)title.textContent=focus?.label??"Cena de demonstração";
    if(sub)sub.textContent=focus?`Objeto selecionado · ${focus.kind==="circle"?"Círculo":focus.kind==="block"?"Bloco":"Etiqueta"}`:"Selecione ou adicione um objeto";
    const strip=node("scene-strip"),overview=node("scene-overview-items");
    if(strip){strip.replaceChildren();if(!snap.entities.length){const empty=document.createElement("span");empty.className="si-strip-placeholder";empty.textContent="Abra Montagem para adicionar objetos.";strip.append(empty);}else for(const e of snap.entities)strip.append(createObjectButton(e,"strip"));}
    if(overview){overview.replaceChildren();if(!snap.entities.length){const empty=document.createElement("p");empty.textContent="Ainda não há objetos nesta cena.";overview.append(empty);}else for(const e of snap.entities)overview.append(createObjectButton(e,"overview"));}
    const obs=node("si-observation"),data=node("si-data-summary");
    if(obs){obs.replaceChildren();const p=document.createElement("p");p.textContent=focus?`Objeto: ${focus.label}`:"Selecione um objeto para inspecionar sua representação.";obs.append(p);
      if(focus){const dl=document.createElement("dl");for(const [key,val] of [["Tipo",focus.kind],["Posição",`${focus.x}% × ${focus.y}%`],["Dimensões",`${focus.width}% × ${focus.height}%`],["Cor",focus.tone]]){const d=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=String(key);dd.textContent=String(val);d.append(dt,dd);dl.append(d);}obs.append(dl);}}
    if(data){data.replaceChildren();const counts={block:0,circle:0,label:0};for(const e of snap.entities)counts[e.kind]++;
      const dl=document.createElement("dl");for(const [key,value] of [["Objetos",snap.entities.length],["Blocos",counts.block],["Círculos",counts.circle],["Etiquetas",counts.label]]){const div=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=String(key);dd.textContent=String(value);div.append(dt,dd);dl.append(div);}data.append(dl);}
  }
  export function setupWorkspace(snapshot:()=>SceneSnapshot,select:(id:string|null)=>void):void {
    if(workspaceStarted)return;readScene=snapshot;selectScene=select;
    const raw=storage.read(WORKSPACE_KEY);if(raw!==null){try{workspaceState=parseWorkspacePreference(JSON.parse(raw))??initialWorkspace();}catch{workspaceState=initialWorkspace();}}
    workspaceStarted=true;
    document.querySelectorAll<HTMLElement>("[data-scene-view]").forEach(b=>b.addEventListener("click",()=>changeWorkspace({type:"view",view:b.dataset.sceneView as WorkspaceView})));
    document.querySelectorAll<HTMLElement>("[data-open-dock]").forEach(b=>b.addEventListener("click",()=>{
      const which=b.dataset.openDock;openWorkspace(which==="montagem"?"left":"right",which==="montagem"?"montagem":which as WorkspaceRightTab,b);
    }));
    document.querySelectorAll<HTMLElement>("[data-close-dock]").forEach(b=>b.addEventListener("click",()=>closeWorkspace(b.dataset.closeDock as WorkspaceSide)));
    document.querySelectorAll<HTMLElement>("[data-left-tab]").forEach(b=>b.addEventListener("click",()=>changeWorkspace({type:"left-tab",tab:b.dataset.leftTab as WorkspaceLeftTab})));
    document.querySelectorAll<HTMLElement>("[data-right-tab]").forEach(b=>b.addEventListener("click",()=>changeWorkspace({type:"right-tab",tab:b.dataset.rightTab as WorkspaceRightTab})));
    node("si-expand")?.addEventListener("click",()=>changeWorkspace({type:"expand"}));
    node("si-sheet-backdrop")?.addEventListener("click",()=>{const side=activeSide();if(side)closeWorkspace(side);});
    document.addEventListener("keydown",keyboardHandler);
    window.addEventListener("resize",updateViewport);
    window.visualViewport?.addEventListener("resize",updateViewport);
    window.addEventListener("si-route-changed",(event:Event)=>{
      if((event as CustomEvent).detail!=="ambiente"){
        workspaceState={...workspaceState,left:"collapsed",right:"collapsed",presentation:"standard"};
        renderWorkspace();
      } else updateViewport();
    });
    renderWorkspace();renderWorkspaceContent(readScene());updateViewport();
  }
}
