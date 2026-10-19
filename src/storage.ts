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
  export const storage: StoragePort = {
    read(key: string): string | null {
      try { return window.localStorage.getItem(`${manifest.id}:${key}`); }
      catch { markStorageUnavailable(); return null; }
    },
    write(key: string, value: string): boolean {
      try { window.localStorage.setItem(`${manifest.id}:${key}`, value); return true; }
      catch { markStorageUnavailable(); return false; }
    }
  };
}
