namespace BaseDemoSI {
  export type WorkspaceView = "focus" | "overview";
  export type WorkspaceSide = "left" | "right";
  export type WorkspaceLeftTab = "resumo" | "preparo" | "objetos" | "modulo" | "missao";
  export type WorkspaceRightTab = "ver" | "dados";
  export type WorkspacePresentation = "standard" | "fullscreen";
  export interface WorkspaceState {
    readonly view: WorkspaceView;
    readonly left: "collapsed" | "open";
    readonly right: "collapsed" | "open";
    readonly leftTab: WorkspaceLeftTab;
    readonly rightTab: WorkspaceRightTab;
    readonly presentation: WorkspacePresentation;
  }
  export type WorkspaceAction =
    | { type:"view", view:WorkspaceView }
    | { type:"open", side:WorkspaceSide, tab?:WorkspaceLeftTab | WorkspaceRightTab }
    | { type:"close", side:WorkspaceSide }
    | { type:"left-tab", tab:WorkspaceLeftTab }
    | { type:"right-tab", tab:WorkspaceRightTab }
    | { type:"expand" }
    | { type:"reset" };
  export function initialWorkspace(): WorkspaceState {
    return {view:"focus",left:"collapsed",right:"collapsed",leftTab:"preparo",rightTab:"ver",presentation:"standard"};
  }
  /** A dimensão compacta (<1280 px) opera uma doca por vez; <=900 px usa sheet. */
  export function reduceWorkspace(s:WorkspaceState,a:WorkspaceAction,compact:boolean):WorkspaceState {
    switch(a.type){
      case "reset":return initialWorkspace();
      case "view": return {...s,view:a.view};
      case "open": {
        const tab=a.tab;
        if(a.side==="left")return {...s,left:"open",right:compact?"collapsed":s.right,presentation:"standard",
          leftTab:tab==="resumo"||tab==="objetos"||tab==="modulo"||tab==="missao"?tab:"preparo"};
        return {...s,right:"open",left:compact?"collapsed":s.left,
          rightTab:tab==="dados"?"dados":"ver",presentation:"standard"};
      }
      case "close": return {...s,[a.side]:"collapsed",presentation:"standard"};
      case "left-tab":return {...s,leftTab:a.tab};
      case "right-tab":return {...s,rightTab:a.tab,presentation:"standard"};
      case "expand":if(s.right==="collapsed")return s;
        return {...s,presentation:s.presentation==="fullscreen"?"standard":"fullscreen",left:"collapsed"};
    }
  }
  export function normalizeWorkspace(s:WorkspaceState,compact:boolean):WorkspaceState {
    if(s.presentation==="fullscreen")return {...s,left:"collapsed"};
    if(compact&&s.left==="open"&&s.right==="open")return {...s,left:"collapsed"};
    return s;
  }
  /** Geometria do viewport visual mobile, sem depender do teclado virtual ou da rede. */
  export function mobileViewportMetrics(innerHeight:number, visibleHeight:number, offsetTop:number):{visibleHeight:number, keyboardOffset:number} {
    const safeHeight=Number.isFinite(innerHeight)&&innerHeight>0?innerHeight:1;
    if(!Number.isFinite(visibleHeight)||visibleHeight<=0||!Number.isFinite(offsetTop))return {visibleHeight:safeHeight,keyboardOffset:0};
    return {visibleHeight:Math.min(safeHeight,Math.max(1,visibleHeight)),keyboardOffset:Math.max(0,Math.min(safeHeight,safeHeight-visibleHeight-Math.max(0,offsetTop)))};
  }
  /** Migração explícita dos identificadores internos anteriores da doca. */
  export function normalizeLeftCategory(value:unknown):WorkspaceLeftTab|null {
    if(value==="montagem")return "preparo";
    if(value==="ajustes")return "modulo";
    return value==="resumo"||value==="preparo"||value==="objetos"||value==="modulo"||value==="missao" ? value : null;
  }
  export function parseWorkspacePreference(raw:unknown):WorkspaceState|null {
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
    const t=raw as Record<string,unknown>;
    if(t.schemaVersion!==1&&t.schemaVersion!==2)return null;
    const category=normalizeLeftCategory(t.leftTab);
    if(!["focus","overview"].includes(String(t.view))||!category||!["ver","dados"].includes(String(t.rightTab)))return null;
    return {...initialWorkspace(),view:t.view as WorkspaceView,leftTab:category,rightTab:t.rightTab as WorkspaceRightTab};
  }
  export function serializeWorkspacePreference(s:WorkspaceState):string {
    return JSON.stringify({schemaVersion:2,view:s.view,leftTab:s.leftTab,rightTab:s.rightTab});
  }

}
