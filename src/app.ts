namespace BaseDemoSI {
  export function initialize(): void {
    document.documentElement.lang = manifest.language;
    for (const version of document.querySelectorAll<HTMLElement>("[data-app-version]")) {
      version.textContent = manifest.version;
    }
    for (const name of document.querySelectorAll<HTMLElement>("[data-app-name]")) {
      name.textContent = manifest.name;
    }
    setupPreferences();
    setupComponents();
    setupScene();
    updateRoute();
    window.addEventListener("hashchange", updateRoute);
    const toggle = document.getElementById("nav-toggle");
    toggle?.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.body.classList.remove("nav-open");
        toggle?.setAttribute("aria-expanded", "false");
      }
    });
    if (window.isSecureContext && "serviceWorker" in navigator) {
      // Sem HTTPS/localhost (ex.: file://), o aplicativo continua funcional sem SW.
      navigator.serviceWorker.register("./sw.js").catch(() => {
        const status = document.getElementById("offline-status");
        if (status) status.textContent = "Execução local disponível; instalação PWA indisponível aqui.";
      });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", BaseDemoSI.initialize, { once: true });
} else {
  BaseDemoSI.initialize();
}
