namespace BaseDemoSI {
  export type ActivityKind = "mission" | "script";
  export type RequirementKind = "manual" | "entities" | "selection" | "readings";
  export interface LearningTopic {
    readonly id: string;
    readonly title: string;
    readonly summary: string;
    readonly paragraphs: readonly string[];
  }
  export interface LearningStep {
    readonly label: string;
    readonly requirement: RequirementKind;
    readonly minimum: number;
  }
  export interface LearningActivity {
    readonly id: string;
    readonly kind: ActivityKind;
    readonly origin: "official" | "teacher";
    /** Ausente somente em atividades legadas (migradas como Livre). */
    readonly module?: ModuleId;
    readonly title: string;
    readonly description: string;
    readonly steps: readonly LearningStep[];
  }
  export interface EducationDocument {
    readonly schemaVersion: 1;
    readonly topicsDone: readonly string[];
    readonly progress: Readonly<Record<string, number>>;
    readonly teacherActivities: readonly LearningActivity[];
  }
  export interface EducationPort {
    snapshot(): EducationDocument;
    list(kind: ActivityKind): readonly LearningActivity[];
    toggleTopic(id: string): boolean;
    advance(id: string, scene: SceneSnapshot, count: number): { readonly ok: boolean; readonly message: string };
    resetActivity(id: string): boolean;
    createActivity(value: unknown): boolean;
    removeActivity(id: string): boolean;
    importTeachers(value: unknown): boolean;
    exportTeachers(): string;
    subscribe(listener: () => void): () => void;
  }
}
