/** Dados transportáveis da camada de registros. Contratos independentes de conteúdos científicos. */
namespace BaseDemoSI {
  export type NoteKind = "observacao" | "hipotese" | "conclusao";
  export interface JournalNote {
    readonly id: string;
    readonly createdAt: string;
    readonly kind: NoteKind;
    readonly body: string;
    readonly entityId: string | null;
    readonly entityLabel: string | null;
    /** Vinculado a uma tentativa; ausente nos registros anteriores. */
    readonly attemptId?: string;
  }
  export interface ReportEntity {
    readonly id: string;
    readonly label: string;
    readonly kind: EntityKind;
  }
  export interface ReportInput {
    readonly title: string;
    readonly author: string;
    readonly sessionDate: string;
    readonly objective: string;
    readonly includeScene: boolean;
    readonly includeNotes: boolean;
    readonly includeReadings: boolean;
    readonly activity?: GuidedReportContext;
  }
  export interface SavedReport {
    readonly id: string;
    readonly createdAt: string;
    readonly title: string;
    readonly author: string;
    readonly sessionDate: string;
    readonly objective: string;
    /** Metadados da tentativa, preservados na exportação e no relatório. */
    readonly activity?: GuidedReportContext;
    readonly scene: readonly ReportEntity[];
    readonly notes: readonly JournalNote[];
    readonly readings: readonly ReadingRecord[];
    readonly options: Readonly<{ includeScene: boolean; includeNotes: boolean; includeReadings: boolean }>;
  }
  export interface JournalDocument {
    readonly schemaVersion: 1;
    readonly notes: readonly JournalNote[];
    readonly reports: readonly SavedReport[];
  }
  export interface JournalStore {
    snapshot(): JournalDocument;
    addNote(value: unknown, scene: SceneSnapshot, attemptId?: string): boolean;
    removeNote(id: string): boolean;
    clearNotes(): boolean;
    makeReport(value: unknown, scene: SceneSnapshot, readings: readonly ReadingRecord[]): boolean;
    removeReport(id: string): boolean;
    importJSON(value: unknown): boolean;
    exportJSON(): string;
    subscribe(listener: () => void): () => void;
  }
}
