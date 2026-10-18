/** Contratos públicos da camada de extensões. Nenhum campo pressupõe uma ciência. */
namespace BaseDemoSI {
  export interface ExtensionMetadata {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly description: string;
  }
  export interface ExtensionContext<State = unknown> {
    readonly scene: SceneSnapshot;
    readonly selected: SceneEntity | null;
    readonly state: State;
  }
  export interface ExtensionAction<State = unknown> {
    /** Mudança na cena, executada pelo histórico universal de comandos. */
    readonly command?: SceneCommand;
    /** Estado particular da extensão; validado antes de ser gravado. */
    readonly nextState?: State;
    readonly message: string;
  }
  export interface ExtensionTool<State = unknown> {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly requiresSelection: boolean;
    run(context: ExtensionContext<State>): ExtensionAction<State>;
  }
  export interface InstrumentReading {
    readonly label: string;
    readonly value: number;
    readonly unit: string;
  }
  export interface ExtensionInstrument<State = unknown> {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly requiresSelection: boolean;
    read(context: ExtensionContext<State>): InstrumentReading;
  }
  export interface SimulationExtension<State = unknown> {
    readonly metadata: ExtensionMetadata;
    readonly tools: readonly ExtensionTool<State>[];
    readonly instruments: readonly ExtensionInstrument<State>[];
    initialState(): State;
    isState(value: unknown): value is State;
  }
  export interface ReadingRecord extends InstrumentReading {
    readonly extensionId: string;
    readonly instrumentId: string;
    readonly entityId: string | null;
    readonly sequence: number;
  }
  export interface ExtensionSavedSession {
    readonly schemaVersion: 1;
    readonly extensionId: string | null;
    readonly extensionVersion: string | null;
    readonly state: unknown;
    readonly records: readonly ReadingRecord[];
  }
  export interface ExtensionResult {
    readonly ok: boolean;
    readonly message: string;
    readonly reading?: ReadingRecord;
  }
  export interface ExtensionRuntime {
    register(extension: SimulationExtension): boolean;
    available(): readonly ExtensionMetadata[];
    active(): SimulationExtension | null;
    activate(id: string | null): boolean;
    runTool(id: string): ExtensionResult;
    measure(id: string): ExtensionResult;
    getRecords(): readonly ReadingRecord[];
    getState(): unknown;
    subscribe(listener: () => void): () => void;
  }
}
