namespace BaseDemoSI {
  export function initialize(): void {
    document.documentElement.lang = manifest.language;
    for (const version of document.querySelectorAll<HTMLElement>("[data-app-version]")) {
      version.textContent = manifest.version;
    }
    for (const name of document.querySelectorAll<HTMLElement>("[data-app-name]")) {
      name.textContent = manifest.name;
    }
    setupStorageConflictProtection();
    setupPreferences();
    setupComponents();
    setupScene();
    updateRoute();
    window.addEventListener("hashchange", updateRoute);
    setupNavigationDrawer();
    setupMenuReview();
    setupDistribution();
    setupModules();
    setupManual();
    setupSharedActivities();
    setupHome();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", BaseDemoSI.initialize, { once: true });
} else {
  BaseDemoSI.initialize();
}
