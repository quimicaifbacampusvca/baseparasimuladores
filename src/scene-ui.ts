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
      button.dataset.entityId = e.id;
      button.style.left = `${e.x}%`; button.style.top = `${e.y}%`;
      button.style.width = `${e.width}%`; button.style.height = `${e.height}%`;
      button.setAttribute("aria-label", `${e.label}, ${e.kind === "block" ? "bloco" : e.kind === "circle" ? "círculo" : "etiqueta"}`);
      button.setAttribute("aria-pressed", String(e.id === snap.selectedId));
      const span = document.createElement("span"); span.textContent = e.label;
      button.append(span);
      button.addEventListener("click", () => store.select(e.id));
      button.addEventListener("keydown", event => {
        const moves: Record<string, [number,number]> = { ArrowUp:[0,-2], ArrowDown:[0,2], ArrowLeft:[-2,0], ArrowRight:[2,0] };
        const delta = moves[event.key];
        if (!delta || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault(); move(e.id, delta[0], delta[1]);
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
    if (clearButton) clearButton.disabled = !snap.entities.length;
    const inspector = get("object-inspector");
    if (inspector) inspector.hidden = !snap.selectedId;
    const noSelection = get("no-selection"); if (noSelection) noSelection.hidden = !!snap.selectedId;
    const entity = selected();
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
  function move(id: string, dx: number, dy: number): void {
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
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-add-kind]")) {
      button.addEventListener("click", () => {
        const kind = button.dataset.addKind as EntityKind;
        const snap = store.getSnapshot();
        const created = store.dispatch({type:"add",entity:makeEntity(kind,freshId(),snap.entities.length)});
        if (!created) announce("Limite de 60 objetos atingido.");
      });
    }
    get("scene-undo")?.addEventListener("click", () => store.undo());
    get("scene-redo")?.addEventListener("click", () => store.redo());
    get("scene-clear")?.addEventListener("click", () => {
      if (window.confirm("Limpar todos os objetos? É possível desfazer esta ação.")) store.dispatch({type:"clear"});
    });
    get("scene-delete")?.addEventListener("click", () => {
      const e = selected(); if (e) store.dispatch({ type:"remove", id:e.id });
    });
    get("object-label")?.addEventListener("change", event => {
      const e = selected(); if (!e) return;
      const input = event.currentTarget as HTMLInputElement;
      const label = input.value.trim();
      if (!label || label.length > 64) { input.value = e.label; announce("Use um nome entre 1 e 64 caracteres."); return; }
      store.dispatch({ type:"update", id:e.id, changes:{label} });
    });
    get("object-tone")?.addEventListener("change", event => {
      const e = selected(); if (!e) return;
      const tone = (event.currentTarget as HTMLSelectElement).value as EntityTone;
      store.dispatch({ type:"update", id:e.id, changes:{tone} });
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
      if (element?.matches("input,select,textarea,[contenteditable]")) return;
      const accel = event.ctrlKey || event.metaKey;
      if (!accel || event.altKey || event.key.toLowerCase() !== "z") return;
      event.preventDefault(); if (event.shiftKey) store.redo(); else store.undo();
    });
    render();
    if (raw !== null && !initial) announce("Projeto salvo inválido ou incompatível; uma cena vazia foi aberta sem sobrescrever os dados anteriores.");
    else if (initial) announce("Projeto local restaurado.");
  }
}
