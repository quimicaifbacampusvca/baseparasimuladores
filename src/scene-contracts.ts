namespace BaseDemoSI {
  /** Coordenadas e dimensões são percentuais da cena, sem unidades científicas. */
  export type EntityKind = "block" | "circle" | "label";
  export type EntityTone = "teal" | "blue" | "amber";

  export interface SceneEntity {
    readonly id: string;
    readonly kind: EntityKind;
    readonly label: string;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly tone: EntityTone;
  }
  export interface SceneSnapshot {
    readonly schemaVersion: 1;
    readonly entities: readonly SceneEntity[];
    readonly selectedId: string | null;
  }
  export type SceneCommand =
    | { readonly type: "add"; readonly entity: SceneEntity }
    | { readonly type: "update"; readonly id: string; readonly changes: Partial<Omit<SceneEntity,"id"|"kind">> }
    | { readonly type: "remove"; readonly id: string }
    | { readonly type: "clear" }
    | { readonly type: "replace"; readonly snapshot: SceneSnapshot };
  export type SceneEvent = "edit" | "selection" | "history";
  export interface SceneStore {
    getSnapshot(): SceneSnapshot;
    dispatch(command: SceneCommand): boolean;
    /** Troca de contexto: não transportar Desfazer/Refazer entre sessões. */
    restoreContext(snapshot: SceneSnapshot): boolean;
    select(id: string | null): boolean;
    undo(): boolean;
    redo(): boolean;
    canUndo(): boolean;
    canRedo(): boolean;
    subscribe(listener: (event: SceneEvent) => void): () => void;
  }
}
