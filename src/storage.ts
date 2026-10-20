namespace BaseDemoSI {
  /**
   * A persistência pode estar bloqueada pelo navegador ou por file://.
   * A falha é controlada e nunca impede abrir a aplicação.
   */
  let storageWarningIssued = false;
  export function markStorageUnavailable(): void {
    if (storageWarningIssued) return;
    storageWarningIssued = true;
    const banner = document.getElementById("storage-warning");
    if (banner) banner.hidden = false;
  }
  // Os documentos essenciais não podem ser mesclados automaticamente entre abas.
  // Além do evento storage, a leitura imediatamente antes de gravar detecta
  // mudanças externas mesmo quando o evento ainda não foi processado.
  const criticalKeys = new Set([
    "scene-project-v1", "education-document-v1", "journal-document-v1",
    "guided-session-v1", "guided-checkpoints-v1", "guided-return-v1"
  ]);
  const lastObserved = new Map<string,string|null>();
  let storageConflict = false;
  export function hasStorageConflict():boolean {
    if(storageConflict)return true;
    // Proteção também para alterações concorrentes ocorridas antes do evento storage.
    try {
      for(const [key,expected] of lastObserved){
        if(window.localStorage.getItem(`${manifest.id}:${key}`)!==expected){reportStorageConflict();return true;}
      }
    }catch{markStorageUnavailable();}
    return false;
  }
  function reportStorageConflict():void {
    if(storageConflict)return;
    storageConflict=true;
    if(typeof document.createElement!=="function" || !document.body)return;
    const overlay=document.createElement("div");
    overlay.id="si-storage-conflict";
    overlay.setAttribute("role","alertdialog");
    overlay.setAttribute("aria-modal","true");
    overlay.setAttribute("aria-labelledby","si-conflict-title");
    overlay.setAttribute("aria-describedby","si-conflict-description");
    const panel=document.createElement("div");panel.className="si-storage-conflict-panel";
    const heading=document.createElement("h2");heading.id="si-conflict-title";heading.textContent="Alteração detectada em outra aba";
    const description=document.createElement("p");description.id="si-conflict-description";
    description.textContent="Outra aba alterou dados deste aplicativo. Para evitar sobrescrever atividades, montagens e relatórios, esta aba foi bloqueada para edição. Recarregue para ler os dados atualizados.";
    const action=document.createElement("button");action.type="button";action.className="button primary";action.textContent="Recarregar dados";
    action.addEventListener("click",()=>window.location.reload());
    panel.append(heading,description,action);overlay.append(panel);document.body.append(overlay);
    const shell=document.querySelector<HTMLElement>(".app-shell");if(shell)shell.inert=true;
    action.focus({preventScroll:true});
  }
  export function setupStorageConflictProtection():void {
    window.addEventListener("storage",event=>{
      if(!event.key || !event.key.startsWith(`${manifest.id}:`))return;
      const key=event.key.slice(manifest.id.length+1);
      if(!criticalKeys.has(key))return;
      const known=lastObserved.get(key);
      // Ausência de leitura local também significa que ainda não houve edição desse
      // documento; ao primeiro acesso futuro vamos conferir o valor atualizado.
      if(lastObserved.has(key) && known!==event.newValue)reportStorageConflict();
    });
  }
  export const storage: StoragePort = {
    read(key: string): string | null {
      try {
        const value=window.localStorage.getItem(`${manifest.id}:${key}`);
        if(criticalKeys.has(key) && !lastObserved.has(key))lastObserved.set(key,value);
        return value;
      } catch { markStorageUnavailable(); return null; }
    },
    write(key: string, value: string): boolean {
      if(criticalKeys.has(key) && hasStorageConflict())return false;
      try {
        const fullKey=`${manifest.id}:${key}`;
        if(criticalKeys.has(key)){
          const actual=window.localStorage.getItem(fullKey);
          if(lastObserved.has(key) && lastObserved.get(key)!==actual){reportStorageConflict();return false;}
          if(!lastObserved.has(key))lastObserved.set(key,actual);
        }
        window.localStorage.setItem(fullKey, value);
        if(criticalKeys.has(key))lastObserved.set(key,value);
        return true;
      } catch { markStorageUnavailable(); return false; }
    }
  };
}
