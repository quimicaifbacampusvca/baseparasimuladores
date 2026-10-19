namespace BaseDemoSI {
  const SESSION_KEY = "extension-session-v1";
  const MAX_RECORDS = 40;
  const MAX_STATE_BYTES = 8192;
  const TOKEN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
  const SEMVER = /^\d+\.\d+\.\d+$/;
  function safeJSON(value: unknown): unknown | null {
    try {
      const valueText = JSON.stringify(value);
      if (typeof valueText !== "string" || valueText.length > MAX_STATE_BYTES) return null;
      const parsed: unknown = JSON.parse(valueText);
      const visit = (entry: unknown): boolean => {
        if (entry === null || typeof entry === "string" || typeof entry === "boolean") return true;
        if (typeof entry === "number") return Number.isFinite(entry);
        if (Array.isArray(entry)) return entry.every(visit);
        if (typeof entry !== "object") return false;
        return Object.entries(entry as Record<string, unknown>).every(([k, v]) =>
          k !== "__proto__" && k !== "prototype" && k !== "constructor" && visit(v));
      };
      return visit(parsed) ? parsed : null;
    } catch { return null; }
  }
  const validText = (value: unknown, max = 90): value is string =>
    typeof value === "string" && value.trim().length > 0 && value.length <= max;
  function validMetadata(m: ExtensionMetadata): boolean {
    return !!m && TOKEN.test(m.id) && m.id.length <= 80 && SEMVER.test(m.version)
      && validText(m.name) && validText(m.description, 240);
  }
  function validDefs(defs: readonly { id: string; name: string; description: string; requiresSelection: boolean }[]): boolean {
    if (!Array.isArray(defs) || defs.length > 20) return false;
    const ids = new Set<string>();
    return defs.every(d => !!d && TOKEN.test(d.id) && d.id.length <= 64 && !ids.has(d.id) && (ids.add(d.id), true)
      && validText(d.name) && validText(d.description, 240) && typeof d.requiresSelection === "boolean");
  }
  function validReading(value: unknown): value is InstrumentReading {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const v = value as Partial<InstrumentReading>;
    return validText(v.label) && typeof v.value === "number" && Number.isFinite(v.value)
      && typeof v.unit === "string" && v.unit.length <= 24;
  }
  export function parseExtensionSession(value: unknown): ExtensionSavedSession | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const s = value as Partial<ExtensionSavedSession>;
    if (s.schemaVersion !== 1 || !Array.isArray(s.records) || s.records.length > MAX_RECORDS
      || !(s.extensionId === null || (typeof s.extensionId === "string" && TOKEN.test(s.extensionId)))
      || !(s.extensionVersion === null || (typeof s.extensionVersion === "string" && SEMVER.test(s.extensionVersion)))
      || (s.extensionId === null) !== (s.extensionVersion === null)) return null;
    const state = safeJSON(s.state);
    if (state === null && s.state !== null) return null;
    let last = 0;
    for (const rawRecord of s.records) {
      const record = rawRecord as ReadingRecord;
      if (!validReading(record) || !TOKEN.test(record.extensionId) || !TOKEN.test(record.instrumentId)
        || !(record.entityId === null || (validText(record.entityId, 80)))
        || !Number.isSafeInteger(record.sequence) || record.sequence <= last) return null;
      last = record.sequence;
    }
    return { schemaVersion:1, extensionId:s.extensionId!, extensionVersion:s.extensionVersion!, state,
      records:s.records.map(r=>({ ...r })) };
  }
  /** Runtime injetável: testes e extensões não dependem da interface gráfica. */
  export function createExtensionRuntime(scene: SceneStore, io: StoragePort): ExtensionRuntime {
    const registry = new Map<string, SimulationExtension>();
    const subscribers = new Set<() => void>();
    const tell = () => { for (const listener of [...subscribers]) listener(); };
    let saved: ExtensionSavedSession | null = null;
    try { const raw = io.read(SESSION_KEY); saved = raw === null ? null : parseExtensionSession(JSON.parse(raw)); }
    catch { saved = null; }
    let activeId: string | null = null;
    let engineState: unknown = null;
    let records: ReadingRecord[] = saved?.records.map(r=>({...r})) ?? [];
    let sequence = records.reduce((m, r)=>Math.max(m,r.sequence), 0);
    const current = (): SimulationExtension | null => activeId === null ? null : registry.get(activeId) ?? null;
    function persist(): void {
      io.write(SESSION_KEY, JSON.stringify({schemaVersion:1,extensionId:activeId,
        extensionVersion:current()?.metadata.version ?? null,state:engineState,records}));
    }
    function context(): ExtensionContext {
      const snapshot = scene.getSnapshot();
      return {scene:snapshot,selected:snapshot.entities.find(e=>e.id===snapshot.selectedId)??null,
        state:safeJSON(engineState)};
    }
    const failure = (message: string): ExtensionResult => ({ok:false,message});
    return {
      register(extension): boolean {
        if (!extension || !validMetadata(extension.metadata) || registry.has(extension.metadata.id)
          || !validDefs(extension.tools) || !validDefs(extension.instruments)
          || typeof extension.initialState !== "function" || typeof extension.isState !== "function"
          || extension.tools.some(t=>typeof t.run !== "function")
          || extension.instruments.some(t=>typeof t.read !== "function")) return false;
        let init: unknown;
        try { init = safeJSON(extension.initialState()); if (init === null || !extension.isState(init)) return false; }
        catch { return false; }
        registry.set(extension.metadata.id,extension);
        // Restaurar apenas se a versão da extensão continua compatível.
        if (saved?.extensionId===extension.metadata.id && saved.extensionVersion===extension.metadata.version
          && extension.isState(saved.state)) {
          activeId = extension.metadata.id; engineState = safeJSON(saved.state);
        }
        tell(); return true;
      },
      available:()=>[...registry.values()].map(extension=>({...extension.metadata})),
      active:()=>current(),
      activate(id):boolean {
        if (id !== null && !registry.has(id)) return false;
        const extension=id===null?null:registry.get(id)!;
        if (activeId===id) return true;
        let next: unknown = null;
        if (extension) {
          try { next=safeJSON(extension.initialState()); if (next===null || !extension.isState(next))return false; }
          catch { return false; }
        }
        activeId=id;engineState=next;persist();tell();return true;
      },
      runTool(id):ExtensionResult {
        if (!moduleAllows("tools")) return failure("Ferramentas indisponíveis neste módulo.");
        const extension=current();if (!extension) return failure("Ative uma extensão antes de utilizar ferramentas.");
        const tool=extension.tools.find(t=>t.id===id);if(!tool)return failure("Ferramenta não registrada.");
        const ctx=context();if(tool.requiresSelection&&!ctx.selected)return failure("Selecione um objeto para utilizar esta ferramenta.");
        try {
          const action=tool.run(ctx);
          if(!action || !validText(action.message, 240))return failure("A ferramenta retornou uma resposta inválida.");
          let next: unknown = engineState;
          if (Object.prototype.hasOwnProperty.call(action,"nextState")) {
            next=safeJSON(action.nextState);
            if(next===null||!extension.isState(next))return failure("Estado da extensão rejeitado pela validação.");
          }
          // Não registrar estado da extensão se o comando de cena for recusado.
          if (action.command && !scene.dispatch(action.command))return failure("O comando não pôde ser aplicado à cena.");
          engineState=next;persist();tell();return {ok:true,message:action.message};
        } catch {return failure("A ferramenta falhou; a operação foi interrompida.");}
      },
      measure(id):ExtensionResult {
        if (!moduleAllows("measure")) return failure("Instrumentos indisponíveis neste módulo.");
        const extension=current();if(!extension)return failure("Ative uma extensão antes de realizar leituras.");
        const instrument=extension.instruments.find(t=>t.id===id);if(!instrument)return failure("Instrumento não registrado.");
        const ctx=context();if(instrument.requiresSelection&&!ctx.selected)return failure("Selecione um objeto para medir.");
        try {
          const value=instrument.read(ctx);if(!validReading(value))return failure("Leitura inválida; nenhuma medição registrada.");
          const reading:ReadingRecord={...value,extensionId:extension.metadata.id,instrumentId:id,
            entityId:ctx.selected?.id??null,sequence:++sequence};
          records=[...records,reading].slice(-MAX_RECORDS);persist();tell();
          return {ok:true,message:`${value.label}: ${value.value} ${value.unit}`.trim(),reading:{...reading}};
        } catch {return failure("Falha de leitura; nenhum registro foi criado.");}
      },
      getRecords:()=>records.map(r=>({...r})),
      getState:()=>safeJSON(engineState),
      subscribe(listener){subscribers.add(listener);return ()=>{subscribers.delete(listener);};}
    };
  }
}
