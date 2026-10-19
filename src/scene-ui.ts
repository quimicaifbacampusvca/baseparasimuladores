namespace BaseDemoSI {
  const projectKey = "scene-project-v1";
  let store: SceneStore;
  let serial = 0;
  const get = (id: string): HTMLElement | null => document.getElementById(id);
  const selected = (): SceneEntity | undefined => {
    const snap = store.getSnapshot();
    return snap.entities.find(e => e.id === snap.selectedId);
  };
  function announce(message: string): void { const el = get("scene-feedback"); if (el) el.textContent = message; }
  function save(): void {
    if (!storage.write(projectKey, serializeScene(store.getSnapshot()))) {
      announce("Alteração aplicada, mas o navegador não permitiu salvá-la. Não feche esta sessão.");
    } else announce("Projeto salvo automaticamente neste navegador.");
  }
  function freshId(): string {
    let id = ""; const known = new Set(store.getSnapshot().entities.map(e => e.id));
    do { id = `obj-${Date.now().toString(36)}-${(++serial).toString(36)}`; } while (known.has(id));
    return id;
  }
  function render(): void {
    const snap = store.getSnapshot();
    const board = get("scene-objects");
    if (!board) return;
    board.replaceChildren();
    for (const e of snap.entities) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "scene-entity";
      button.classList.add(`entity-${e.kind}`, `tone-${e.tone}`);
      if (e.id === snap.selectedId) button.classList.add("is-selected");
      button.hidden = snap.selectedId !== null && e.id !== snap.selectedId;
      button.dataset.entityId = e.id;
      button.style.left = `${e.x}%`; button.style.top = `${e.y}%`;
      button.style.width = `${e.width}%`; button.style.height = `${e.height}%`;
      button.setAttribute("aria-label", `${e.label}, ${e.kind === "block" ? "bloco" : e.kind === "circle" ? "círculo" : "etiqueta"}`);
      button.setAttribute("aria-pressed", String(e.id === snap.selectedId));
      const span = document.createElement("span"); span.textContent = e.label;
      button.append(span);
      button.addEventListener("click", () => store.select(e.id));
      attachDirectManipulation(button, e, board);
      button.addEventListener("keydown", event => {
        const moves: Record<string, [number,number]> = { ArrowUp:[0,-2], ArrowDown:[0,2], ArrowLeft:[-2,0], ArrowRight:[2,0] };
        const delta = moves[event.key];
        if (!delta || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        if (!sceneManipulationAllowed()){announce("Manipulação indisponível no módulo atual.");return;}
        move(e.id, delta[0], delta[1]);
        board.querySelector<HTMLElement>(`[data-entity-id="${e.id}"]`)?.focus();
      });
      board.append(button);
    }
    const empty = get("scene-empty"); if (empty) empty.hidden = snap.entities.length > 0;
    const counter = get("scene-count"); if (counter) counter.textContent = `${snap.entities.length} / 60 objetos`;
    const undoButton = get("scene-undo") as HTMLButtonElement | null;
    const redoButton = get("scene-redo") as HTMLButtonElement | null;
    if (undoButton) undoButton.disabled = !store.canUndo();
    if (redoButton) redoButton.disabled = !store.canRedo();
    const clearButton = get("scene-clear") as HTMLButtonElement | null;
    if (clearButton) clearButton.disabled = !snap.entities.length || !sceneManipulationAllowed();
    const compactClear = get("si-compact-clear") as HTMLButtonElement | null;
    if (compactClear) compactClear.disabled = !snap.entities.length || !sceneManipulationAllowed();
    const inspector = get("object-inspector");
    if (inspector) inspector.hidden = !snap.selectedId;
    const noSelection = get("no-selection"); if (noSelection) noSelection.hidden = !!snap.selectedId;
    const entity = selected();
    const canEdit=sceneManipulationAllowed();
    for (const id of ["object-label","object-tone","scene-delete"]){
      const input=get(id) as HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null;
      if(input)input.disabled=!canEdit || !entity;
    }
    for(const btn of document.querySelectorAll<HTMLButtonElement>("[data-move]"))btn.disabled=!canEdit||!entity;
    renderWorkspaceContent(snap);
    renderExtensions(snap);
    renderViewers(snap);
    if (entity) {
      const field = get("object-label") as HTMLInputElement | null;
      const tone = get("object-tone") as HTMLSelectElement | null;
      if (field && document.activeElement !== field) field.value = entity.label;
      if (tone) tone.value = entity.tone;
      const xy = get("object-position"); if (xy) xy.textContent = `X: ${entity.x}% · Y: ${entity.y}%`;
      const objectType = get("object-type"); if (objectType) objectType.textContent =
        entity.kind === "block" ? "Bloco" : entity.kind === "circle" ? "Círculo" : "Etiqueta";
    }
  }
  /**
   * Manipulação por ponteiro: atualiza visualmente durante o gesto e confirma
   * uma única mudança ao soltar, preservando uma única posição no histórico.
   * A captura é restrita ao próprio objeto para não interceptar a rolagem da cena.
   */
  function attachDirectManipulation(button:HTMLButtonElement,entity:SceneEntity,board:HTMLElement):void {
    button.addEventListener("pointerdown",event=>{
      if (!event.isPrimary||event.button!==0||!sceneManipulationAllowed())return;
      const rect=board.getBoundingClientRect();
      if (!(rect.width>0&&rect.height>0))return;
      const pointerId=event.pointerId,startX=event.clientX,startY=event.clientY;
      let moved=false,done=false;
      const movePointer=(ev:PointerEvent):void=>{
        if(ev.pointerId!==pointerId||done)return;
        const dx=ev.clientX-startX,dy=ev.clientY-startY;
        if(!moved&&Math.hypot(dx,dy)<5)return;
        moved=true;
        const pos=moveEntityByPixels(entity,dx,dy,rect.width,rect.height);
        if(!pos)return;
        button.style.left=`${pos.x}%`;button.style.top=`${pos.y}%`;
        button.classList.add("is-dragging");
      };
      const finish=(ev:PointerEvent):void=>{
        if(ev.pointerId!==pointerId||done)return;
        done=true;
        button.removeEventListener("pointermove",movePointer);
        button.removeEventListener("pointerup",finish);
        button.removeEventListener("pointercancel",cancel);
        if(button.hasPointerCapture(pointerId))button.releasePointerCapture(pointerId);
        if(!moved||!sceneManipulationAllowed())return;
        const pos=moveEntityByPixels(entity,ev.clientX-startX,ev.clientY-startY,rect.width,rect.height);
        if(pos&&store.dispatch({type:"update",id:entity.id,changes:pos})){
          store.select(entity.id);
          announce(`Objeto ${entity.label} reposicionado.`);
        }else render();
        get("scene-objects")?.querySelector<HTMLElement>(`[data-entity-id="${entity.id}"]`)?.focus({preventScroll:true});
      };
      const cancel=(ev:PointerEvent):void=>{
        if(ev.pointerId!==pointerId||done)return;
        done=true;
        button.removeEventListener("pointermove",movePointer);
        button.removeEventListener("pointerup",finish);
        button.removeEventListener("pointercancel",cancel);
        if(button.hasPointerCapture(pointerId))button.releasePointerCapture(pointerId);
        button.classList.remove("is-dragging");
        button.style.left=`${entity.x}%`;button.style.top=`${entity.y}%`;
      };
      button.addEventListener("pointermove",movePointer);
      button.addEventListener("pointerup",finish);
      button.addEventListener("pointercancel",cancel);
      button.setPointerCapture(pointerId);
    });
  }
  function move(id: string, dx: number, dy: number): void {
    if (!sceneManipulationAllowed())return;
    const e = store.getSnapshot().entities.find(item => item.id === id);
    if (!e) return;
    const x = Math.max(e.width / 2, Math.min(100 - e.width / 2, e.x + dx));
    const y = Math.max(e.height / 2, Math.min(100 - e.height / 2, e.y + dy));
    store.dispatch({ type: "update", id, changes: { x, y } });
  }
  export function setupScene(): void {
    let initial: SceneSnapshot | null = null;
    const raw = storage.read(projectKey);
    if (raw !== null) {
      try { initial = parseScene(JSON.parse(raw)); } catch { initial = null; }
    }
    store = createSceneStore(initial);
    store.subscribe(event => { render(); if (event !== "selection") save(); });
    setupWorkspace(() => store.getSnapshot(), id => store.select(id));
    window.addEventListener("si-module-change",render);
    setupExtensions(store);
    setupViewers(()=>store.getSnapshot());
    setupEducation(store);
    setupJournal(store);
    setupPresets(store);
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-add-kind]")) {
      button.addEventListener("click", () => {
        const kind = button.dataset.addKind as EntityKind;
        const snap = store.getSnapshot();
        const created = store.dispatch({type:"add",entity:makeEntity(kind,freshId(),snap.entities.length)});
        if (!created) { announce("Limite de 60 objetos atingido."); notify("Limite de 60 objetos atingido.", "warning"); }
        else notify("Objeto adicionado à cena.", "success");
      });
    }
    get("scene-undo")?.addEventListener("click", () => { if(store.undo())notify("Última alteração desfeita."); });
    get("scene-redo")?.addEventListener("click", () => { if(store.redo())notify("Alteração refeita."); });
    get("scene-clear")?.addEventListener("click", async () => {
      if (!sceneManipulationAllowed())return;
      const total=store.getSnapshot().entities.length;
      if(!total)return;
      const accepted=await confirmDialog({title:"Limpar cena?",description:`Os ${total} objetos serão removidos. Esta ação pode ser desfeita pelo histórico da sessão.`,confirmText:"Limpar cena",destructive:true});
      if(accepted&&store.dispatch({type:"clear"}))notify("Cena limpa. Use Desfazer para recuperar.","warning");
    });
    setupActionMenu("scene-menu-toggle","scene-tools-menu", action=>{
      if(action==="clear") { get("scene-clear")?.click(); return; }
      if(action==="help"){
        void confirmDialog({title:"Atalhos disponíveis",description:"Arrastar: mover objeto com mouse ou toque.\nSetas: mover o objeto focado.\nCtrl/⌘ + Z: desfazer.\nCtrl/⌘ + Shift + Z: refazer.\nEscape: fechar menus, diálogos e docas.\nTab: navegar pelos controles.",confirmText:"Entendi",cancelText:"Fechar"});
        return;
      }
      if (!moduleAllows("tools")) {notify("A criação de objetos não está disponível neste módulo.","warning");return;}
      const kind=action==="add-block"?"block":action==="add-circle"?"circle":action==="add-label"?"label":null;
      if(!kind)return;
      const snap=store.getSnapshot();
      if(store.dispatch({type:"add",entity:makeEntity(kind,freshId(),snap.entities.length)})) notify("Objeto adicionado à cena.","success");
      else notify("Não foi possível adicionar o objeto.","warning");
    });
    get("scene-delete")?.addEventListener("click", () => {
      if (!sceneManipulationAllowed())return;
      const e = selected(); if (e && store.dispatch({ type:"remove", id:e.id })) notify("Objeto excluído. A ação pode ser desfeita.","info");
    });
    get("object-label")?.addEventListener("change", event => {
      if (!sceneManipulationAllowed())return;
      const e = selected(); if (!e) return;
      const input = event.currentTarget as HTMLInputElement;
      const label = input.value.trim();
      if (!label || label.length > 64) { input.value = e.label; announce("Use um nome entre 1 e 64 caracteres."); return; }
      if(store.dispatch({ type:"update", id:e.id, changes:{label} }))notify("Nome do objeto atualizado.","success");
    });
    get("object-tone")?.addEventListener("change", event => {
      if (!sceneManipulationAllowed())return;
      const e = selected(); if (!e) return;
      const tone = (event.currentTarget as HTMLSelectElement).value as EntityTone;
      if(store.dispatch({ type:"update", id:e.id, changes:{tone} }))notify("Aparência do objeto atualizada.","success");
    });
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-move]")) {
      button.addEventListener("click", () => {
        const e = selected(); if (!e) return;
        const step: Record<string,[number,number]> = {up:[0,-2],down:[0,2],left:[-2,0],right:[2,0]};
        const delta = step[button.dataset.move ?? ""]; if (delta) move(e.id,...delta);
      });
    }
    get("scene-objects")?.addEventListener("click", event => {
      if (event.target === event.currentTarget) store.select(null);
    });
    document.addEventListener("keydown", event => {
      const element = event.target as HTMLElement | null;
      if (element?.matches("input,select,textarea,[contenteditable]") || isPlatformDialogOpen()) return;
      const accel = event.ctrlKey || event.metaKey;
      if (!accel || event.altKey || event.key.toLowerCase() !== "z") return;
      event.preventDefault(); if (event.shiftKey) store.redo(); else store.undo();
    });
    render();
    if (raw !== null && !initial) announce("Projeto salvo inválido ou incompatível; uma cena vazia foi aberta sem sobrescrever os dados anteriores.");
    else if (initial) announce("Projeto local restaurado.");
  }
}
