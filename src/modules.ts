namespace BaseDemoSI {
  export type ModuleId = "livre" | "explorar" | "medir" | "calcular";
  export type ModuleCapability = "tools" | "measure" | "observe" | "analyze";
  export interface ModuleDefinition {
    readonly id: ModuleId;
    readonly label: string;
    readonly summary: string;
    readonly capabilities: readonly ModuleCapability[];
  }
  const moduleKey = "module-selection-v1";
  export const moduleDefinitions: readonly ModuleDefinition[] = Object.freeze([
    { id:"livre", label:"Livre", summary:"Todas as ferramentas, leituras e visualizações disponíveis.", capabilities:["tools","measure","observe","analyze"] },
    { id:"explorar", label:"Explorar", summary:"Manipulação e observação de objetos, sem leituras instrumentais.", capabilities:["tools","observe"] },
    { id:"medir", label:"Medir", summary:"Observação e medições de instrumentos habilitados.", capabilities:["measure","observe"] },
    { id:"calcular", label:"Calcular", summary:"Análise de dados e indicadores genéricos da cena.", capabilities:["observe","analyze"] }
  ]);
  let activeModule: ModuleId = "livre";
  export function validModule(value: unknown): value is ModuleId {
    return typeof value === "string" && moduleDefinitions.some(item=>item.id===value);
  }
  export function moduleAllows(capability: ModuleCapability): boolean {
    return moduleDefinitions.find(item=>item.id===activeModule)!.capabilities.includes(capability);
  }
  export function currentModule(): ModuleId { return activeModule; }
  export function selectModule(value: unknown): boolean {
    if (!validModule(value)) return false;
    if (activeModule === value) return true;
    activeModule=value;
    storage.write(moduleKey,activeModule);
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function")
      window.dispatchEvent(new CustomEvent("si-module-change",{detail:activeModule}));
    return true;
  }
  export function setupModules(): void {
    const stored=storage.read(moduleKey);
    if(validModule(stored))activeModule=stored;
    const select=document.getElementById("si-module-choice") as HTMLSelectElement|null;
    if (!select) return;
    select.replaceChildren();
    for(const definition of moduleDefinitions){
      const item=document.createElement("option");item.value=definition.id;item.textContent=definition.label;select.append(item);
    }
    const refresh=()=>{
      select.value=activeModule;
      const current=moduleDefinitions.find(item=>item.id===activeModule)!;
      const message=document.getElementById("si-module-description");if(message)message.textContent=current.summary;
      document.getElementById("si-workspace")?.setAttribute("data-module",activeModule);
      document.querySelectorAll<HTMLElement>("[data-add-kind]").forEach(button=>{
        (button as HTMLButtonElement).disabled=!moduleAllows("tools");
      });
      document.querySelectorAll<HTMLButtonElement>("[data-menu-action^=add-]").forEach(button=>{button.disabled=!moduleAllows("tools");});
      document.getElementById("si-module-choice")?.setAttribute("title",current.summary);
    };
    select.addEventListener("change",()=>{if(selectModule(select.value))notify("Módulo atualizado.","info");refresh();});
    window.addEventListener("si-module-change",()=>{refresh();});
    refresh();
    window.dispatchEvent(new CustomEvent("si-module-change",{detail:activeModule}));
  }
}
