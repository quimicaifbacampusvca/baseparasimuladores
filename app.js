"use strict";
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Fonte de identidade; nenhum conteúdo científico é carregado no núcleo. */
    BaseDemoSI.manifest = Object.freeze({
        id: "base-demo-oficial-si",
        name: "Base Demo Oficial - SI",
        shortName: "SI",
        version: "0.1.0",
        language: "pt-BR",
        requiresNetwork: false,
        routes: Object.freeze([
            { id: "inicio", title: "Início", subtitle: "Fundação da plataforma" },
            { id: "ambiente", title: "Ambiente", subtitle: "Estrutura de simulação" },
            { id: "configuracoes", title: "Preferências", subtitle: "Personalização local" },
            { id: "sobre", title: "Sobre a base", subtitle: "Identidade e arquitetura" }
        ])
    });
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    /**
     * A persistência pode estar bloqueada pelo navegador ou por file://.
     * A falha é controlada e nunca impede abrir a aplicação.
     */
    BaseDemoSI.storage = {
        read(key) {
            try {
                return window.localStorage.getItem(`${BaseDemoSI.manifest.id}:${key}`);
            }
            catch {
                return null;
            }
        },
        write(key, value) {
            try {
                window.localStorage.setItem(`${BaseDemoSI.manifest.id}:${key}`, value);
                return true;
            }
            catch {
                return false;
            }
        }
    };
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const validRoutes = new Set(["inicio", "ambiente", "configuracoes", "sobre"]);
    function currentRoute(hash) {
        const slug = hash.replace(/^#\/?/, "").split(/[?&]/, 1)[0];
        return validRoutes.has(slug) ? slug : "inicio";
    }
    BaseDemoSI.currentRoute = currentRoute;
    function updateRoute() {
        const selected = currentRoute(window.location.hash);
        for (const view of document.querySelectorAll("[data-view]")) {
            view.hidden = view.dataset.view !== selected;
        }
        for (const link of document.querySelectorAll("[data-route]")) {
            const active = link.dataset.route === selected;
            if (active)
                link.setAttribute("aria-current", "page");
            else
                link.removeAttribute("aria-current");
        }
        const route = BaseDemoSI.manifest.routes.find(item => item.id === selected);
        document.title = `${route?.title ?? "Início"} · ${BaseDemoSI.manifest.name}`;
        const heading = document.getElementById("current-section");
        if (heading)
            heading.textContent = route?.subtitle ?? "";
        document.body.classList.remove("nav-open");
        const navToggle = document.getElementById("nav-toggle");
        navToggle?.setAttribute("aria-expanded", "false");
    }
    BaseDemoSI.updateRoute = updateRoute;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const allowed = new Set(["sistema", "claro", "escuro"]);
    function normalizeTheme(value) {
        return allowed.has(value) ? value : "sistema";
    }
    BaseDemoSI.normalizeTheme = normalizeTheme;
    function applyTheme(theme) {
        const dark = theme === "escuro" || (theme === "sistema" &&
            window.matchMedia?.("(prefers-color-scheme: dark)").matches);
        document.documentElement.dataset.theme = dark ? "escuro" : "claro";
        document.documentElement.dataset.themePreference = theme;
    }
    BaseDemoSI.applyTheme = applyTheme;
    function setupPreferences() {
        const selector = document.getElementById("theme-choice");
        if (!selector)
            return;
        let preference = normalizeTheme(BaseDemoSI.storage.read("theme"));
        selector.value = preference;
        applyTheme(preference);
        selector.addEventListener("change", () => {
            preference = normalizeTheme(selector.value);
            applyTheme(preference);
            const saved = BaseDemoSI.storage.write("theme", preference);
            const feedback = document.getElementById("preferences-feedback");
            if (feedback)
                feedback.textContent = saved
                    ? "Preferência salva neste navegador."
                    : "Preferência aplicada nesta sessão; o navegador bloqueou o armazenamento local.";
        });
        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        media?.addEventListener?.("change", () => {
            if (preference === "sistema")
                applyTheme(preference);
        });
    }
    BaseDemoSI.setupPreferences = setupPreferences;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    function initialize() {
        document.documentElement.lang = BaseDemoSI.manifest.language;
        for (const version of document.querySelectorAll("[data-app-version]")) {
            version.textContent = BaseDemoSI.manifest.version;
        }
        for (const name of document.querySelectorAll("[data-app-name]")) {
            name.textContent = BaseDemoSI.manifest.name;
        }
        BaseDemoSI.setupPreferences();
        BaseDemoSI.updateRoute();
        window.addEventListener("hashchange", BaseDemoSI.updateRoute);
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
                if (status)
                    status.textContent = "Execução local disponível; instalação PWA indisponível aqui.";
            });
        }
    }
    BaseDemoSI.initialize = initialize;
})(BaseDemoSI || (BaseDemoSI = {}));
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", BaseDemoSI.initialize, { once: true });
}
else {
    BaseDemoSI.initialize();
}
