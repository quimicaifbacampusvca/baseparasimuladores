namespace BaseDemoSI {
  const allowed = new Set<ThemePreference>(["sistema", "claro", "escuro"]);

  export function normalizeTheme(value: string | null): ThemePreference {
    return allowed.has(value as ThemePreference) ? value as ThemePreference : "sistema";
  }

  export function applyTheme(theme: ThemePreference): void {
    const dark = theme === "escuro" || (theme === "sistema" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "escuro" : "claro";
    document.documentElement.dataset.themePreference = theme;
  }

  export function setupPreferences(): void {
    const selector = document.getElementById("theme-choice") as HTMLSelectElement | null;
    if (!selector) return;
    let preference = normalizeTheme(storage.read("theme"));
    selector.value = preference;
    applyTheme(preference);
    selector.addEventListener("change", () => {
      preference = normalizeTheme(selector.value);
      applyTheme(preference);
      const saved = storage.write("theme", preference);
      const feedback = document.getElementById("preferences-feedback");
      if (feedback) feedback.textContent = saved
        ? "Preferência salva neste navegador."
        : "Preferência aplicada nesta sessão; o navegador bloqueou o armazenamento local.";
      notify(saved ? "Preferência de aparência salva." : "Aparência aplicada apenas nesta sessão.", saved ? "success" : "warning");
    });
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", () => {
      if (preference === "sistema") applyTheme(preference);
    });
  }
}
