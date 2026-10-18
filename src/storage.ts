namespace BaseDemoSI {
  /**
   * A persistência pode estar bloqueada pelo navegador ou por file://.
   * A falha é controlada e nunca impede abrir a aplicação.
   */
  export const storage: StoragePort = {
    read(key: string): string | null {
      try { return window.localStorage.getItem(`${manifest.id}:${key}`); }
      catch { return null; }
    },
    write(key: string, value: string): boolean {
      try { window.localStorage.setItem(`${manifest.id}:${key}`, value); return true; }
      catch { return false; }
    }
  };
}
