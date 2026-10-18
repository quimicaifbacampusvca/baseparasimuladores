namespace BaseDemoSI {
  const JOURNAL_KEY = "journal-document-v1";
  const JOURNAL_IDS = /^(note|report)-[a-z0-9-]{1,65}$/;
  const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
  const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const MAX_NOTES = 80;
  const MAX_REPORTS = 20;
  const MAX_JSON_LENGTH = 300000;
  const valueText = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
  const safeOptional = (value: unknown, max: number): value is string => typeof value === "string" && value.length <= max;
  const realDay = (value: unknown): value is string => typeof value === "string" && ISO_DAY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) === value;
  const instant = (value: unknown): value is string => typeof value === "string" && ISO_INSTANT.test(value) && !Number.isNaN(Date.parse(value));
  const id = (value: unknown, prefix: string): value is string => typeof value === "string" && JOURNAL_IDS.test(value) && value.startsWith(prefix + "-");
  const noteKinds: readonly NoteKind[] = ["observacao","hipotese","conclusao"];
  function validNote(value: unknown): value is JournalNote {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const n = value as Partial<JournalNote>;
    return id(n.id,"note") && instant(n.createdAt) && noteKinds.includes(n.kind as NoteKind)
      && valueText(n.body,1200) && (n.entityId === null || valueText(n.entityId,80))
      && (n.entityLabel === null || valueText(n.entityLabel,64))
      && ((n.entityId === null) === (n.entityLabel === null));
  }
  function validReading(r: unknown): r is ReadingRecord {
    if (!r || typeof r !== "object" || Array.isArray(r)) return false;
    const x = r as Partial<ReadingRecord>;
    return valueText(x.label,90) && typeof x.value === "number" && Number.isFinite(x.value)
      && safeOptional(x.unit,24) && valueText(x.extensionId,80) && valueText(x.instrumentId,80)
      && (x.entityId === null || valueText(x.entityId,80))
      && Number.isSafeInteger(x.sequence) && (x.sequence??0) > 0;
  }
  function validReport(value: unknown): value is SavedReport {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const r = value as Partial<SavedReport>;
    if (!id(r.id,"report") || !instant(r.createdAt) || !valueText(r.title,100)
      || !safeOptional(r.author,100) || !realDay(r.sessionDate) || !safeOptional(r.objective,1000)
      || !r.options || typeof r.options !== "object" || Array.isArray(r.options)
      || typeof r.options.includeScene !== "boolean" || typeof r.options.includeNotes !== "boolean"
      || typeof r.options.includeReadings !== "boolean" || !Array.isArray(r.scene) || r.scene.length > 60
      || !Array.isArray(r.notes) || r.notes.length > MAX_NOTES || !Array.isArray(r.readings) || r.readings.length > 40) return false;
    const sceneOk = r.scene.every(e => !!e && valueText(e.id,80) && valueText(e.label,64) && ["block","circle","label"].includes(e.kind));
    const uniqueScene = new Set(r.scene.map(e=>e.id)).size === r.scene.length;
    const readingSequences = r.readings.map(e=>e.sequence);
    return sceneOk && uniqueScene && r.notes.every(validNote) && r.readings.every(validReading)
      && new Set(readingSequences).size===readingSequences.length
      && (r.options.includeScene || r.scene.length === 0)
      && (r.options.includeNotes || r.notes.length === 0)
      && (r.options.includeReadings || r.readings.length === 0);
  }
  export function parseJournal(value: unknown): JournalDocument | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const v = value as Partial<JournalDocument>;
    if (v.schemaVersion !== 1 || !Array.isArray(v.notes) || v.notes.length > MAX_NOTES
      || !Array.isArray(v.reports) || v.reports.length > MAX_REPORTS
      || !v.notes.every(validNote) || !v.reports.every(validReport)) return null;
    const ids = [...v.notes.map(n=>n.id),...v.reports.map(r=>r.id)];
    if(new Set(ids).size!==ids.length)return null;
    try {
      const json=JSON.stringify(v);
      if(json.length > MAX_JSON_LENGTH) return null;
      const cloned=JSON.parse(json) as JournalDocument;
      return {schemaVersion:1,notes:cloned.notes,reports:cloned.reports};
    }catch{return null;}
  }
  export function parseJournalImport(value: string): unknown | null {
    if(value.length>MAX_JSON_LENGTH)return null;
    try {return JSON.parse(value) as unknown;}catch{return null;}
  }
  export function createJournalStore(io:StoragePort,clock:()=>Date=()=>new Date()):JournalStore {
    const empty:JournalDocument={schemaVersion:1,notes:[],reports:[]};
    let recovered:JournalDocument|null=null;
    try { const raw=io.read(JOURNAL_KEY);recovered=raw===null?null:parseJournal(JSON.parse(raw));}catch{recovered=null;}
    let state:JournalDocument=recovered??empty;
    let serial=0;
    const listeners=new Set<()=>void>();
    const emit=()=>{for(const listener of [...listeners])listener();};
    const persist=(value:JournalDocument):boolean=>{
      const parsed=parseJournal(value);
      if(!parsed || !io.write(JOURNAL_KEY,JSON.stringify(parsed)))return false;
      state=parsed;emit();return true;
    };
    const nextId=(prefix:"note"|"report"):string=>{
      const existing=new Set([...state.notes.map(n=>n.id),...state.reports.map(r=>r.id)]);
      let next="";do{next=`${prefix}-${clock().getTime().toString(36)}-${(++serial).toString(36)}`;}while(existing.has(next));return next;
    };
    return {
      snapshot:()=>parseJournal(state)!,
      addNote(value,scene):boolean {
        if(state.notes.length>=MAX_NOTES || !value || typeof value!=="object" || Array.isArray(value))return false;
        const data=value as {kind?:unknown;body?:unknown};
        if(!noteKinds.includes(data.kind as NoteKind) || !valueText(data.body,1200))return false;
        const selected=scene.entities.find(e=>e.id===scene.selectedId);
        const note:JournalNote={id:nextId("note"),createdAt:clock().toISOString(),kind:data.kind as NoteKind,
          body:data.body.trim(),entityId:selected?.id??null,entityLabel:selected?.label??null};
        return persist({...state,notes:[...state.notes,note]});
      },
      removeNote(noteId):boolean {
        if(!state.notes.some(n=>n.id===noteId))return false;
        return persist({...state,notes:state.notes.filter(n=>n.id!==noteId)});
      },
      makeReport(value,scene,readings):boolean {
        if(state.reports.length>=MAX_REPORTS || !value || typeof value!=="object" || Array.isArray(value))return false;
        const v=value as Partial<ReportInput>;
        if(!valueText(v.title,100) || !safeOptional(v.author,100) || !realDay(v.sessionDate)
          || !safeOptional(v.objective,1000) || typeof v.includeScene!=="boolean"
          || typeof v.includeNotes!=="boolean" || typeof v.includeReadings!=="boolean")return false;
        const report:SavedReport={id:nextId("report"),createdAt:clock().toISOString(),title:v.title.trim(),
          author:v.author.trim(),sessionDate:v.sessionDate,objective:v.objective.trim(),
          scene:v.includeScene?scene.entities.map(e=>({id:e.id,label:e.label,kind:e.kind})):[],
          notes:v.includeNotes?state.notes.map(n=>({...n})):[],
          readings:v.includeReadings?readings.map(r=>({...r})):[],
          options:{includeScene:v.includeScene,includeNotes:v.includeNotes,includeReadings:v.includeReadings}};
        if(!validReport(report))return false;
        return persist({...state,reports:[...state.reports,report]});
      },
      removeReport(reportId):boolean {
        if(!state.reports.some(r=>r.id===reportId))return false;
        return persist({...state,reports:state.reports.filter(r=>r.id!==reportId)});
      },
      importJSON(value):boolean {
        if(!value || typeof value!=="object" || Array.isArray(value))return false;
        const candidate=value as {format?:unknown;document?:unknown};
        if(candidate.format!=="base-demo-si-journal-v1")return false;
        const parsed=parseJournal(candidate.document);
        return parsed!==null && persist(parsed);
      },
      exportJSON:()=>JSON.stringify({format:"base-demo-si-journal-v1",document:state},null,2),
      subscribe(listener){listeners.add(listener);return()=>{listeners.delete(listener);};}
    };
  }
}
