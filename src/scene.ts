namespace BaseDemoSI {
  const MAX_ENTITIES = 60;
  const HISTORY_LIMIT = 50;
  const kinds: readonly EntityKind[] = ["block", "circle", "label"];
  const tones: readonly EntityTone[] = ["teal", "blue", "amber"];
  const forbidden = new Set(["__proto__", "constructor", "prototype"]);

  function finite(n: unknown): n is number { return typeof n === "number" && Number.isFinite(n); }
  function goodEntity(raw: unknown): raw is SceneEntity {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    const e = raw as Partial<SceneEntity>;
    return typeof e.id === "string" && e.id.length > 0 && e.id.length <= 80 && !forbidden.has(e.id)
      && kinds.includes(e.kind as EntityKind)
      && typeof e.label === "string" && e.label.trim().length > 0 && e.label.length <= 64
      && tones.includes(e.tone as EntityTone)
      && finite(e.x) && finite(e.y) && finite(e.width) && finite(e.height)
      && e.width >= 8 && e.width <= 40 && e.height >= 8 && e.height <= 40
      && e.x >= e.width / 2 && e.x <= 100 - e.width / 2
      && e.y >= e.height / 2 && e.y <= 100 - e.height / 2;
  }
  const empty = (): SceneSnapshot => ({ schemaVersion: 1, entities: [], selectedId: null });
  function clone(snapshot: SceneSnapshot): SceneSnapshot {
    return { schemaVersion: 1, selectedId: snapshot.selectedId,
      entities: snapshot.entities.map(e => ({ ...e })) };
  }
  /** Dados armazenados não são confiáveis: rejeitar documentos inteiros com campos inválidos. */
  export function parseScene(value: unknown): SceneSnapshot | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const raw = value as Partial<SceneSnapshot>;
    if (raw.schemaVersion !== 1 || !Array.isArray(raw.entities) || raw.entities.length > MAX_ENTITIES) return null;
    const seen = new Set<string>();
    for (const e of raw.entities) {
      if (!goodEntity(e) || seen.has(e.id)) return null;
      seen.add(e.id);
    }
    if (raw.selectedId !== null && (typeof raw.selectedId !== "string" || !seen.has(raw.selectedId))) return null;
    return clone(raw as SceneSnapshot);
  }
  export function serializeScene(snapshot: SceneSnapshot): string {
    const valid = parseScene(snapshot);
    if (!valid) throw new Error("Cena inválida; gravação interrompida.");
    return JSON.stringify(valid);
  }
  export function createSceneStore(initial?: unknown): SceneStore {
    let present = parseScene(initial) ?? empty();
    const past: SceneSnapshot[] = [], future: SceneSnapshot[] = [];
    const listeners = new Set<(event: SceneEvent) => void>();
    const emit = (event: SceneEvent): void => { for (const listener of [...listeners]) listener(event); };
    function commit(next: SceneSnapshot): boolean {
      const parsed = parseScene(next);
      if (!parsed || JSON.stringify(parsed) === JSON.stringify(present)) return false;
      past.push(clone(present));
      if (past.length > HISTORY_LIMIT) past.shift();
      future.length = 0;
      present = parsed;
      emit("edit");
      return true;
    }
    return {
      getSnapshot: () => clone(present),
      dispatch(command): boolean {
        const entities = present.entities.map(e => ({ ...e }));
        let selectedId = present.selectedId;
        switch (command.type) {
          case "add":
            if (entities.length >= MAX_ENTITIES || !goodEntity(command.entity) || entities.some(e => e.id === command.entity.id)) return false;
            entities.push({ ...command.entity }); selectedId = command.entity.id; break;
          case "update": {
            const i = entities.findIndex(e => e.id === command.id);
            if (i < 0 || !command.changes || typeof command.changes !== "object" || Array.isArray(command.changes)) return false;
            const allowed = new Set(["label", "x", "y", "width", "height", "tone"]);
            if (Object.keys(command.changes).some(k => !allowed.has(k))) return false;
            const next: SceneEntity = { ...entities[i], ...command.changes };
            if (!goodEntity(next)) return false;
            entities[i] = next; break;
          }
          case "remove": {
            const i = entities.findIndex(e => e.id === command.id);
            if (i < 0) return false;
            entities.splice(i, 1);
            if (selectedId === command.id) selectedId = null;
            break;
          }
          case "clear":
            if (!entities.length) return false;
            entities.length = 0; selectedId = null; break;
          default: return false;
        }
        return commit({ schemaVersion: 1, entities, selectedId });
      },
      select(id): boolean {
        if (id !== null && !present.entities.some(e => e.id === id)) return false;
        if (present.selectedId === id) return false;
        present = { ...present, selectedId: id }; emit("selection"); return true;
      },
      undo(): boolean {
        const previous = past.pop(); if (!previous) return false;
        future.push(clone(present)); present = previous; emit("history"); return true;
      },
      redo(): boolean {
        const next = future.pop(); if (!next) return false;
        past.push(clone(present)); present = next; emit("history"); return true;
      },
      canUndo: () => past.length > 0,
      canRedo: () => future.length > 0,
      subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; }
    };
  }
  export function makeEntity(kind: EntityKind, id: string, index = 0): SceneEntity {
    const width = kind === "label" ? 28 : 18;
    const height = kind === "label" ? 10 : 18;
    const spread = (index % 5) * 9;
    return { id, kind, label: kind === "block" ? "Bloco" : kind === "circle" ? "Círculo" : "Etiqueta",
      x: 30 + spread, y: 30 + spread / 2, width, height, tone: "teal" };
  }
}
