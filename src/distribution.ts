namespace BaseDemoSI {
  /** Estado de distribuição: a aplicação não requer rede para executar. */
  interface InstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
  const precacheFiles = [
    "./", "./index.html", "./app.js", "./app.css", "./workspace.css",
    "./components.css", "./mobile-contract.css", "./extensions.css", "./education.css", "./records.css",
    "./distribution.css", "./inspection.css", "./completion.css", "./organization.css", "./environment-organization.css", "./menu-fidelity.css", "./menu-review.css", "./home-fidelity.css", "./home-context.css", "./manifest.webmanifest", "./assets/icon.svg",
    "./assets/icon-192.png", "./assets/icon-512.png", "./assets/apple-touch-icon.png", "./assets/menu-icons/mount.svg", "./assets/menu-icons/eye.svg", "./assets/menu-icons/report.svg"
  ];
  let installPrompt: InstallPromptEvent | null = null;
  let changingController = false;

  function updateStatus(message: string): void {
    const target = document.getElementById("distribution-status");
    if (target) target.textContent = message;
  }
  function setInstallVisible(visible: boolean): void {
    const control = document.getElementById("distribution-install") as HTMLButtonElement | null;
    if (control) control.hidden = !visible;
    const menuControl = document.getElementById("si-drawer-install") as HTMLButtonElement | null;
    if(menuControl) menuControl.hidden = !visible;
  }
  export function setupDistribution(): void {
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      installPrompt = event as InstallPromptEvent;
      setInstallVisible(true);
    });
    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      setInstallVisible(false);
      updateStatus("Aplicativo instalado. O uso offline depende da conclusão do cache inicial.");
      notify("Aplicativo instalado.", "success");
    });
    document.getElementById("distribution-install")?.addEventListener("click", async () => {
      const current = installPrompt;
      if (!current) return;
      installPrompt = null;
      setInstallVisible(false);
      try {
        await current.prompt();
        const choice = await current.userChoice;
        if (choice.outcome === "dismissed") updateStatus("Instalação cancelada. A aplicação permanece acessível pelo navegador.");
      } catch {
        updateStatus("O navegador não conseguiu concluir a instalação.");
      }
    });
    document.getElementById("distribution-check")?.addEventListener("click", () => void verifyOfflineAssets());

    if (window.location.protocol === "file:") {
      updateStatus("Execução local em arquivo. A versão standalone possui os recursos incorporados; a instalação PWA não se aplica a file://.");
      return;
    }
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      updateStatus("Aplicação funcional; PWA indisponível neste navegador ou contexto. Use HTTPS ou localhost para instalação.");
      return;
    }
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!changingController) {
        changingController = true;
        updateStatus("Versão offline ativada. Recarregue a página para utilizar todos os recursos atualizados.");
      }
    });
    navigator.serviceWorker.register("./sw.js").then(async () => {
      try {
        await navigator.serviceWorker.ready;
        await verifyOfflineAssets(false);
      } catch {
        updateStatus("A verificação da instalação offline não pôde ser concluída.");
      }
    }).catch(() => {
      updateStatus("Não foi possível registrar a PWA. A interface permanece utilizável com os arquivos locais.");
    });
  }

  export async function verifyOfflineAssets(showNotice = true): Promise<boolean> {
    if (window.location.protocol === "file:") {
      updateStatus("Modo arquivo local: o pacote standalone usa CSS, JavaScript, ícones e dados embutidos, sem arquivos externos.");
      if (showNotice) notify("Standalone autocontido: sem cache PWA necessário.", "info");
      return true;
    }
    if (!("caches" in window)) {
      updateStatus("A API de cache offline não está disponível neste contexto.");
      return false;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration("./");
      if (!registration?.active) {
        updateStatus("O cache offline ainda não está ativado. Aguardando instalação da PWA.");
        return false;
      }
      const cache = await caches.open(`base-demo-si-v${manifest.version}`);
      let found = 0;
      for (const path of precacheFiles) {
        if (await cache.match(new URL(path, document.baseURI).href)) found++;
      }
      const complete = found === precacheFiles.length;
      updateStatus(complete
        ? `Cache offline preparado: ${found}/${precacheFiles.length} recursos locais presentes. A instalação não depende de servidores externos.`
        : `Cache offline incompleto: ${found}/${precacheFiles.length} recursos presentes. Conecte-se novamente antes de trabalhar desconectado.`);
      if (showNotice) notify(complete ? "Recursos offline conferidos." : "O cache ainda não está completo.", complete ? "success" : "warning");
      return complete;
    } catch {
      updateStatus("Não foi possível acessar o cache. Confira as permissões do navegador.");
      if (showNotice) notify("Não foi possível verificar o cache local.", "warning");
      return false;
    }
  }
}
