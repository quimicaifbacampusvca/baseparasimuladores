"use strict";
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Fonte de identidade; nenhum conteúdo científico é carregado no núcleo. */
    BaseDemoSI.manifest = Object.freeze({
        id: "base-demo-oficial-si",
        name: "Base Demo Oficial - SI",
        shortName: "SI",
        version: "0.9.12",
        language: "pt-BR",
        requiresNetwork: false,
        routes: Object.freeze([
            { id: "inicio", title: "Início", subtitle: "Workspace universal" },
            { id: "ambiente", title: "Ambiente", subtitle: "Extensões, docas e visão geral" },
            { id: "aprender", title: "Aprender", subtitle: "Temas e orientações" },
            { id: "missoes", title: "Missões", subtitle: "Atividades verificáveis" },
            { id: "roteiros", title: "Roteiros", subtitle: "Percursos guiados" },
            { id: "professor", title: "Professor", subtitle: "Editor de atividades" },
            { id: "caderno", title: "Caderno", subtitle: "Observações e interpretações" },
            { id: "relatorios", title: "Relatórios", subtitle: "Documentação e impressão" },
            { id: "manual", title: "Manual", subtitle: "Busca e orientação contextual" },
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
    let storageWarningIssued = false;
    function markStorageUnavailable() {
        if (storageWarningIssued)
            return;
        storageWarningIssued = true;
        const banner = document.getElementById("storage-warning");
        if (banner)
            banner.hidden = false;
    }
    BaseDemoSI.markStorageUnavailable = markStorageUnavailable;
    BaseDemoSI.storage = {
        read(key) {
            try {
                return window.localStorage.getItem(`${BaseDemoSI.manifest.id}:${key}`);
            }
            catch {
                markStorageUnavailable();
                return null;
            }
        },
        write(key, value) {
            try {
                window.localStorage.setItem(`${BaseDemoSI.manifest.id}:${key}`, value);
                return true;
            }
            catch {
                markStorageUnavailable();
                return false;
            }
        }
    };
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    let drawerStarted = false;
    const menuButton = () => document.getElementById("nav-toggle");
    const drawer = () => document.getElementById("sidebar");
    const backdrop = () => document.getElementById("nav-backdrop");
    const mainColumn = () => document.getElementById("main-column");
    const drawerOpen = () => document.body.classList.contains("nav-open");
    function closeNavigationDrawer(restoreFocus = false) {
        const wasOpen = drawerOpen();
        document.body.classList.remove("nav-open");
        menuButton()?.setAttribute("aria-expanded", "false");
        drawer()?.setAttribute("aria-hidden", "true");
        const shade = backdrop();
        if (shade)
            shade.hidden = true;
        const page = mainColumn();
        if (page)
            page.inert = false;
        if (restoreFocus && wasOpen)
            menuButton()?.focus({ preventScroll: true });
    }
    BaseDemoSI.closeNavigationDrawer = closeNavigationDrawer;
    function openNavigationDrawer() {
        if (BaseDemoSI.isPlatformDialogOpen())
            return;
        document.body.classList.add("nav-open");
        menuButton()?.setAttribute("aria-expanded", "true");
        drawer()?.setAttribute("aria-hidden", "false");
        updateMenuContext();
        const shade = backdrop();
        if (shade)
            shade.hidden = false;
        const page = mainColumn();
        if (page)
            page.inert = true;
        // A transição visual não pode impedir a entrada do foco na gaveta modal.
        window.requestAnimationFrame(() => {
            if (!drawerOpen())
                return;
            const initial = drawer()?.querySelector("#si-nav-close");
            initial?.focus({ preventScroll: true });
        });
    }
    function updateMenuContext() {
        const route = BaseDemoSI.currentRoute(window.location.hash);
        const found = BaseDemoSI.manifest.routes.find(item => item.id === route);
        const title = document.getElementById("si-now-title");
        const description = document.getElementById("si-now-description");
        if (title)
            title.textContent = found?.title ?? "Início";
        if (description)
            description.textContent = found?.subtitle ?? "Continue sua atividade.";
    }
    function focusableItems() {
        return Array.from(drawer()?.querySelectorAll('a[href]:not([hidden]),button:not([disabled]),input:not([disabled]),select:not([disabled])') ?? [])
            .filter(item => item.getClientRects().length > 0);
    }
    function setupNavigationDrawer() {
        if (drawerStarted)
            return;
        drawerStarted = true;
        menuButton()?.addEventListener("click", () => drawerOpen() ? closeNavigationDrawer(true) : openNavigationDrawer());
        document.getElementById("si-nav-close")?.addEventListener("click", () => closeNavigationDrawer(true));
        document.getElementById("si-nav-continue")?.addEventListener("click", () => closeNavigationDrawer(true));
        document.getElementById("si-nav-group-toggle")?.addEventListener("click", () => {
            const group = document.getElementById("si-nav-main");
            const toggle = document.getElementById("si-nav-group-toggle");
            if (!group || !toggle)
                return;
            group.hidden = !group.hidden;
            toggle.setAttribute("aria-expanded", String(!group.hidden));
        });
        backdrop()?.addEventListener("click", () => closeNavigationDrawer(true));
        document.addEventListener("keydown", event => {
            if (!drawerOpen())
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                closeNavigationDrawer(true);
                return;
            }
            if (event.key !== "Tab")
                return;
            const items = focusableItems();
            if (!items.length)
                return;
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
        document.querySelectorAll("#sidebar a[href]").forEach(link => link.addEventListener("click", () => {
            if (!drawerOpen())
                return;
            closeNavigationDrawer(false);
            // Link navigation has occurred; announce the content destination to keyboard users.
            window.setTimeout(() => document.getElementById("conteudo")?.focus({ preventScroll: true }), 0);
        }));
    }
    BaseDemoSI.setupNavigationDrawer = setupNavigationDrawer;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    let soundEnabled = false;
    let vibrationEnabled = false;
    let audio = null;
    function findAudioCtor() {
        const browser = window;
        if (typeof browser.AudioContext === "function")
            return browser.AudioContext;
        return typeof browser.webkitAudioContext === "function" ? browser.webkitAudioContext : null;
    }
    function feedbackCapabilities() {
        return { sound: !!findAudioCtor(), vibration: typeof navigator.vibrate === "function" };
    }
    BaseDemoSI.feedbackCapabilities = feedbackCapabilities;
    function configureFeedback(sound, vibration) {
        soundEnabled = sound === true;
        vibrationEnabled = vibration === true;
    }
    BaseDemoSI.configureFeedback = configureFeedback;
    function currentFeedback() {
        return { sound: soundEnabled, vibration: vibrationEnabled };
    }
    BaseDemoSI.currentFeedback = currentFeedback;
    /** Não emite sinais até que a pessoa habilite a preferência explicitamente. */
    function signalFeedback(event) {
        const support = feedbackCapabilities();
        if (soundEnabled && support.sound) {
            try {
                const ctor = findAudioCtor();
                if (ctor) {
                    audio = audio || new ctor();
                    if (audio.state === "suspended")
                        void audio.resume().catch(() => { });
                    const oscillator = audio.createOscillator();
                    const gain = audio.createGain();
                    oscillator.type = "sine";
                    oscillator.frequency.value = event === "success" ? 580 : event === "warning" ? 295 : 440;
                    const now = audio.currentTime;
                    gain.gain.setValueAtTime(0.0001, now);
                    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
                    oscillator.connect(gain).connect(audio.destination);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                }
            }
            catch { /* A preferência continua ativa; o dispositivo pode bloquear áudio. */ }
        }
        if (vibrationEnabled && support.vibration) {
            try {
                navigator.vibrate(event === "warning" ? [65, 35, 65] : 55);
            }
            catch { /* Nem todo sistema operacional autoriza vibração. */ }
        }
    }
    BaseDemoSI.signalFeedback = signalFeedback;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    // Contrato de menu: preferência local e acesso contextual; nenhum motor científico.
    const menuGet = (id) => document.getElementById(id);
    const prefDefault = { dark: true, contrast: false, font: 1, spacing: false, motion: false, intro: true, simple: false, vision: "none", projector: false, startup: "inicio", sound: false, vibrate: false };
    const prefKey = "family-menu-v1";
    const validVision = ["none", "protanopia", "deuteranopia", "tritanopia", "acromatopsia"];
    let pref = { ...prefDefault };
    let activityLink = "";
    let activeActivity = null;
    const checkbox = (id, checked) => { const node = menuGet(id); if (node)
        node.checked = checked; };
    function menuPreferences(value) {
        pref = value;
        const root = document.documentElement;
        BaseDemoSI.configureFeedback(pref.sound, pref.vibrate);
        const theme = pref.dark ? "escuro" : "claro";
        BaseDemoSI.applyTheme(theme);
        menuGet("theme-choice")?.setAttribute("data-from-menu", theme);
        const selector = menuGet("theme-choice");
        if (selector)
            selector.value = theme;
        BaseDemoSI.storage.write("theme", theme);
        root.classList.toggle("si-highcontrast", pref.contrast);
        root.classList.toggle("si-large-spacing", pref.spacing);
        root.classList.toggle("si-no-motion", pref.motion);
        root.classList.toggle("si-simple-reading", pref.simple);
        root.classList.toggle("si-font-mod", pref.font !== 1);
        // Rem afeta a aplicação inteira, não apenas os rótulos da gaveta.
        root.style.fontSize = pref.font === 1 ? "" : `${16 * pref.font}px`;
        root.style.setProperty("--si-font-factor", String(pref.font));
        document.body.classList.toggle("si-projector-mode", pref.projector);
        for (const [id, v] of [["si-dark", pref.dark], ["si-contrast", pref.contrast], ["si-letter-spacing", pref.spacing], ["si-motion", pref.motion], ["si-intro", pref.intro], ["si-simple", pref.simple], ["si-projector", pref.projector]])
            checkbox(id, v);
        const output = menuGet("si-font-output");
        if (output)
            output.textContent = `${Math.round(pref.font * 100)}%`;
        const minus = menuGet("si-font-minus");
        const plus = menuGet("si-font-plus");
        if (minus)
            minus.disabled = pref.font <= .8;
        if (plus)
            plus.disabled = pref.font >= 2;
        const capabilities = BaseDemoSI.feedbackCapabilities();
        for (const [id, enabled, supported, noteId] of [
            ["si-sound", pref.sound, capabilities.sound, "si-sound-support"],
            ["si-vibrate", pref.vibrate, capabilities.vibration, "si-vibrate-support"]
        ]) {
            const control = menuGet(id);
            if (control) {
                control.disabled = !supported;
                control.checked = supported && enabled;
                control.setAttribute("aria-disabled", String(!supported));
            }
            const note = menuGet(noteId);
            if (note)
                note.textContent = supported ? `${id === "si-sound" ? "Som" : "Vibração"} ${enabled ? "ativado" : "desativado"}; controle local` : (id === "si-sound" ? "Áudio indisponível neste navegador" : "Vibração indisponível neste dispositivo");
        }
        const vision = menuGet("si-vision-select");
        if (vision)
            vision.value = pref.vision;
        const startup = menuGet("si-startup-select");
        if (startup)
            startup.value = pref.startup;
        // Acromatopsia é representável por escala cinza. Os demais perfis
        // demandam transformações de cor validadas e permanecem informativos.
        for (const filter of ["protanopia", "deuteranopia", "tritanopia", "acromatopsia"])
            root.classList.toggle(`si-color-${filter}`, pref.vision === filter);
        root.dataset.siIntro = pref.intro ? "on" : "off";
    }
    function updatePref(key, value) {
        menuPreferences({ ...pref, [key]: value });
        if (!BaseDemoSI.storage.write(prefKey, JSON.stringify(pref)))
            BaseDemoSI.notify("Preferência aplicada nesta sessão. O navegador bloqueou o armazenamento.", "warning");
    }
    function getActivityContext() {
        const route = BaseDemoSI.currentRoute(window.location.hash);
        let destination = window.location.hash;
        if (route === "ambiente") {
            const returnControl = menuGet("si-return-activity");
            if (!returnControl || returnControl.hidden)
                return null;
            destination = returnControl.getAttribute("href") ?? "";
        }
        const activityRoute = BaseDemoSI.currentRoute(destination);
        if (activityRoute !== "missoes" && activityRoute !== "roteiros")
            return null;
        const id = new URLSearchParams(destination.split("?")[1] ?? "").get("item");
        if (!id)
            return null;
        const kind = activityRoute === "missoes" ? "mission" : "script";
        const activity = BaseDemoSI.menuActivity(kind, id);
        return activity ? { id, kind, title: activity.title, url: `#/${activityRoute}?item=${encodeURIComponent(id)}`, steps: activity.steps } : null;
    }
    function syncMenuReview() {
        const ctx = getActivityContext();
        activeActivity = ctx;
        activityLink = ctx?.url ?? "";
        const activity = menuGet("si-activity-menu");
        if (activity)
            activity.hidden = !ctx;
        const context = menuGet("si-activity-context");
        if (context) {
            const done = ctx ? BaseDemoSI.menuActivityProgress(ctx.id) : 0;
            context.textContent = ctx ? `${ctx.title} · ${Math.min(done, ctx.steps.length)}/${ctx.steps.length} etapas` : "";
        }
        const title = menuGet("si-menu-title");
        if (title)
            title.textContent = ctx ? "Menu da atividade" : "Menu";
        const now = menuGet("si-now-title"), desc = menuGet("si-now-description");
        const route = BaseDemoSI.currentRoute(window.location.hash), info = BaseDemoSI.manifest.routes.find(x => x.id === route);
        if (now)
            now.textContent = info?.title ?? "Início";
        if (desc)
            desc.textContent = route === "ambiente" ? "Ambiente livre · Cena e ferramentas" : info?.subtitle ?? "Seu contexto atual";
        const button = menuGet("si-nav-continue");
        if (button)
            button.textContent = route === "ambiente" ? "Continuar no ambiente" : "Continuar nesta tela";
    }
    function openAccessibility() {
        const menu = menuGet("nav-toggle");
        if (menu?.getAttribute("aria-expanded") !== "true")
            menu?.click();
        const area = menuGet("si-a11y-panel"), expand = menuGet("si-a11y-toggle");
        if (area)
            area.hidden = false;
        if (expand)
            expand.setAttribute("aria-expanded", "true");
        expand?.focus({ preventScroll: true });
        expand?.scrollIntoView({ block: "nearest" });
    }
    function togglePanel(triggerId, panelId) {
        const trigger = menuGet(triggerId);
        const panel = menuGet(panelId);
        if (!panel || !trigger)
            return;
        panel.hidden = !panel.hidden;
        trigger.setAttribute("aria-expanded", String(!panel.hidden));
    }
    // Tour em coachmarks: não altera objetos, não interfere com missões e não
    // ocupa a cena com uma folha inferior que desloque o experimento.
    function startWorkspaceTour() {
        if (getActivityContext()) {
            BaseDemoSI.notify("O tour está disponível apenas no ambiente livre. Encerre a atividade orientada primeiro.", "warning");
            return;
        }
        const steps = [
            { target: "#si-stage", title: "Conheça o ambiente", content: "Esta é a cena central, onde você seleciona e movimenta objetos." },
            { target: '[data-open-dock="montagem"]', title: "Prepare a montagem", content: "Abra Montagem para preparar a cena, selecionar objetos e escolher o módulo de trabalho." },
            { target: '[data-scene-view="overview"]', title: "Foco e visão geral", content: "Alterne entre examinar um objeto selecionado e acompanhar todos os objetos da montagem." },
            { target: '[data-open-dock="ver"]', title: "Observe e meça", content: "Abra Ver para escolher recursos de Observar, Medir e Analisar compatíveis com o módulo." },
            { target: '[data-open-dock="dados"]', title: "Consulte seus registros", content: "Em Dados, você encontra o histórico e os atalhos para Caderno e Relatórios." }
        ];
        const launch = () => {
            // Evitar sobreposição de diálogos ou de folhas inferiores.
            const previousFocus = document.activeElement;
            const dialog = document.createElement("dialog");
            dialog.className = "si-coach-dialog";
            dialog.setAttribute("aria-label", "Tour guiado do ambiente");
            const ring = document.createElement("div");
            ring.className = "si-coach-ring";
            ring.setAttribute("aria-hidden", "true");
            const card = document.createElement("section");
            card.className = "si-coach-card";
            const step = document.createElement("p");
            step.className = "si-coach-step";
            const title = document.createElement("h2");
            title.id = "si-coach-title";
            const content = document.createElement("p");
            content.className = "si-coach-text";
            const actions = document.createElement("div");
            actions.className = "si-coach-actions";
            const back = document.createElement("button"), next = document.createElement("button"), skip = document.createElement("button");
            for (const button of [back, next, skip])
                button.type = "button";
            back.textContent = "Voltar";
            skip.textContent = "Pular tour";
            actions.append(skip, back, next);
            card.append(step, title, content, actions);
            dialog.append(ring, card);
            dialog.setAttribute("aria-labelledby", title.id);
            document.body.append(dialog);
            let current = 0;
            const position = () => {
                const target = document.querySelector(steps[current].target);
                const box = target?.getBoundingClientRect();
                const vw = window.innerWidth, vh = window.innerHeight;
                ring.hidden = !box || box.width <= 0 || box.height <= 0;
                if (box && !ring.hidden) {
                    const x = Math.max(4, box.left - 5), y = Math.max(4, box.top - 5);
                    ring.style.left = `${x}px`;
                    ring.style.top = `${y}px`;
                    ring.style.width = `${Math.min(vw - 4, box.right + 5) - x}px`;
                    ring.style.height = `${Math.min(vh - 4, box.bottom + 5) - y}px`;
                }
                const cw = Math.min(430, Math.max(260, vw - 24));
                const ch = card.getBoundingClientRect().height;
                const freeBottom = box ? vh - box.bottom : 0;
                const freeTop = box ? box.top : 0;
                let cy = (box && freeBottom >= ch + 22) ? box.bottom + 12 : (box && freeTop >= ch + 22) ? box.top - ch - 12 : vh - ch - 12;
                cy = Math.max(8, Math.min(cy, vh - ch - 8));
                let cx = box ? box.left + box.width / 2 - cw / 2 : (vw - cw) / 2;
                cx = Math.max(10, Math.min(cx, vw - cw - 10));
                card.style.left = `${cx}px`;
                card.style.top = `${cy}px`;
            };
            const show = (index) => {
                current = index;
                step.textContent = `PASSO ${current + 1} DE ${steps.length}`;
                title.textContent = steps[current].title;
                content.textContent = steps[current].content;
                back.disabled = index === 0;
                next.textContent = index === steps.length - 1 ? "Concluir" : "Próximo";
                position();
                next.focus({ preventScroll: true });
            };
            let cleaned = false;
            const cleanup = () => {
                if (cleaned)
                    return;
                cleaned = true;
                window.removeEventListener("resize", position);
                document.removeEventListener("scroll", position, true);
                dialog.remove();
                const returnTarget = previousFocus?.isConnected && !previousFocus.closest("#sidebar") ? previousFocus : menuGet("nav-toggle");
                returnTarget?.focus({ preventScroll: true });
            };
            dialog.addEventListener("close", cleanup, { once: true });
            dialog.addEventListener("cancel", event => { event.preventDefault(); dialog.close(); });
            dialog.addEventListener("click", event => { if (event.target === dialog)
                dialog.close(); });
            skip.addEventListener("click", () => dialog.close());
            back.addEventListener("click", () => show(Math.max(0, current - 1)));
            next.addEventListener("click", () => { if (current >= steps.length - 1)
                dialog.close();
            else
                show(current + 1); });
            dialog.addEventListener("keydown", event => {
                if (event.key !== "Tab")
                    return;
                const buttons = [skip, back, next].filter(button => !button.disabled);
                if (event.shiftKey && document.activeElement === buttons[0]) {
                    event.preventDefault();
                    buttons[buttons.length - 1].focus();
                }
                else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
                    event.preventDefault();
                    buttons[0].focus();
                }
            });
            window.addEventListener("resize", position);
            document.addEventListener("scroll", position, true);
            dialog.showModal();
            show(0);
        };
        BaseDemoSI.closeNavigationDrawer(false);
        if (BaseDemoSI.currentRoute(window.location.hash) !== "ambiente") {
            window.location.hash = "#/ambiente";
            window.requestAnimationFrame(() => window.requestAnimationFrame(launch));
        }
        else
            window.requestAnimationFrame(launch);
    }
    BaseDemoSI.startWorkspaceTour = startWorkspaceTour;
    function setupMenuReview() {
        try {
            const value = BaseDemoSI.storage.read(prefKey);
            if (value) {
                const obj = JSON.parse(value);
                if (obj && typeof obj === "object")
                    pref = { ...prefDefault, ...obj, font: Math.min(2, Math.max(.8, Number(obj.font) || 1)), vision: validVision.includes(obj.vision ?? "") ? obj.vision : "none", startup: ["inicio", "ambiente", "aprender"].includes(obj.startup ?? "") ? obj.startup : "inicio", sound: obj.sound === true, vibrate: obj.vibrate === true };
            }
        }
        catch {
            pref = { ...prefDefault };
        }
        const theme = BaseDemoSI.normalizeTheme(BaseDemoSI.storage.read("theme"));
        if (theme !== "sistema")
            pref.dark = theme === "escuro";
        menuPreferences(pref);
        // Apenas na abertura sem destino indicado é aplicada a tela inicial.
        if (!window.location.hash || window.location.hash === "#/")
            window.location.hash = `#/${pref.startup}`;
        menuGet("si-nav-group-toggle")?.setAttribute("aria-expanded", String(window.matchMedia("(max-width:900px)").matches));
        const routes = menuGet("si-nav-main");
        if (routes)
            routes.hidden = !window.matchMedia("(max-width:900px)").matches;
        menuGet("si-a11y-toggle")?.addEventListener("click", () => togglePanel("si-a11y-toggle", "si-a11y-panel"));
        menuGet("si-startup-toggle")?.addEventListener("click", () => togglePanel("si-startup-toggle", "si-startup-panel"));
        menuGet("si-header-access")?.addEventListener("click", openAccessibility);
        menuGet("nav-toggle")?.addEventListener("click", () => requestAnimationFrame(syncMenuReview));
        window.addEventListener("si-route-changed", syncMenuReview);
        menuGet("si-startup-select")?.addEventListener("change", event => updatePref("startup", event.target.value));
        menuGet("si-projector")?.addEventListener("click", event => {
            if (getActivityContext()) {
                event.preventDefault();
                BaseDemoSI.notify("O modo projetor não pode ser alterado durante uma atividade orientada.", "warning");
            }
        });
        for (const [id, key] of [["si-dark", "dark"], ["si-contrast", "contrast"], ["si-letter-spacing", "spacing"], ["si-motion", "motion"], ["si-intro", "intro"], ["si-simple", "simple"], ["si-projector", "projector"]]) {
            menuGet(id)?.addEventListener("change", event => updatePref(key, event.target.checked));
        }
        for (const [id, key, capability] of [["si-sound", "sound", "sound"], ["si-vibrate", "vibrate", "vibration"]]) {
            menuGet(id)?.addEventListener("change", event => {
                const choice = event.target.checked;
                if (choice && !BaseDemoSI.feedbackCapabilities()[capability]) {
                    BaseDemoSI.notify("Este dispositivo não oferece o recurso solicitado.", "warning");
                    menuPreferences(pref);
                    return;
                }
                updatePref(key, choice);
                if (choice)
                    BaseDemoSI.signalFeedback("info");
            });
        }
        for (const [id, delta] of [["si-font-minus", -.1], ["si-font-plus", .1]]) {
            menuGet(id)?.addEventListener("click", () => updatePref("font", Math.round(Math.max(.8, Math.min(2, pref.font + delta)) * 10) / 10));
        }
        menuGet("si-vision-select")?.addEventListener("change", event => {
            const v = event.target.value;
            updatePref("vision", v);
            if (v !== "none")
                BaseDemoSI.notify("Simulação aproximada de visão de cores ativada. Consulte também os rótulos textuais.", "info");
        });
        menuGet("si-a11y-reset")?.addEventListener("click", () => { menuPreferences({ ...prefDefault }); BaseDemoSI.storage.write(prefKey, JSON.stringify(pref)); BaseDemoSI.notify("Preferências de acessibilidade restauradas.", "success"); });
        menuGet("si-drawer-install")?.addEventListener("click", () => { BaseDemoSI.closeNavigationDrawer(false); menuGet("distribution-install")?.click(); });
        menuGet("si-drawer-tour")?.addEventListener("click", startWorkspaceTour);
        menuGet("si-guide-open")?.addEventListener("click", () => { BaseDemoSI.closeNavigationDrawer(false); window.location.hash = "#/manual"; BaseDemoSI.notify("Consulte as orientações de acessibilidade e os recursos para mediação em sala.", "info"); });
        menuGet("si-activity-about")?.addEventListener("click", () => { if (activityLink) {
            BaseDemoSI.closeNavigationDrawer(false);
            window.location.hash = activityLink;
        } });
        menuGet("si-activity-finish")?.addEventListener("click", () => {
            const ctx = activeActivity;
            if (!ctx)
                return;
            BaseDemoSI.closeNavigationDrawer(false);
            const progress = BaseDemoSI.menuActivityProgress(ctx.id);
            if (progress >= ctx.steps.length) {
                BaseDemoSI.notify("Esta atividade já está concluída.", "info");
                window.location.hash = ctx.url;
                return;
            }
            const result = BaseDemoSI.advanceActivityFromMenu(ctx.id);
            BaseDemoSI.notify(result.message, result.ok ? "success" : "warning");
            if (result.ok) {
                window.location.hash = ctx.url;
                syncMenuReview();
            }
        });
        menuGet("si-activity-exit")?.addEventListener("click", async () => {
            const ctx = activeActivity;
            if (!ctx)
                return;
            const decision = await BaseDemoSI.confirmDialog({ title: "Encerrar atividade?", description: "Você retornará ao catálogo. O progresso local já registrado será preservado.", confirmText: "Encerrar" });
            if (!decision)
                return;
            BaseDemoSI.clearGuidedReturn();
            BaseDemoSI.closeNavigationDrawer(false);
            window.location.hash = ctx.kind === "mission" ? "#/missoes" : "#/roteiros";
            syncMenuReview();
        });
        syncMenuReview();
    }
    BaseDemoSI.setupMenuReview = setupMenuReview;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const validRoutes = new Set(["inicio", "ambiente", "aprender", "missoes", "roteiros", "professor", "caderno", "relatorios", "manual", "configuracoes", "sobre"]);
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
        document.body.classList.toggle("route-ambiente", selected === "ambiente");
        window.dispatchEvent(new CustomEvent("si-route-changed", { detail: selected }));
        BaseDemoSI.closeNavigationDrawer(false);
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
            BaseDemoSI.notify(saved ? "Preferência de aparência salva." : "Aparência aplicada apenas nesta sessão.", saved ? "success" : "warning");
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
    const moduleKey = "module-selection-v1";
    BaseDemoSI.moduleDefinitions = Object.freeze([
        { id: "livre", label: "Livre", summary: "Todas as ferramentas, leituras e visualizações disponíveis.", capabilities: ["tools", "measure", "observe", "analyze"] },
        { id: "explorar", label: "Explorar", summary: "Manipulação e observação de objetos, sem leituras instrumentais.", capabilities: ["tools", "observe"] },
        { id: "medir", label: "Medir", summary: "Observação e medições de instrumentos habilitados.", capabilities: ["measure", "observe"] },
        { id: "calcular", label: "Calcular", summary: "Análise de dados e indicadores genéricos da cena.", capabilities: ["observe", "analyze"] }
    ]);
    let activeModule = "livre";
    function validModule(value) {
        return typeof value === "string" && BaseDemoSI.moduleDefinitions.some(item => item.id === value);
    }
    BaseDemoSI.validModule = validModule;
    function moduleAllows(capability) {
        return BaseDemoSI.moduleDefinitions.find(item => item.id === activeModule).capabilities.includes(capability);
    }
    BaseDemoSI.moduleAllows = moduleAllows;
    function currentModule() { return activeModule; }
    BaseDemoSI.currentModule = currentModule;
    function selectModule(value) {
        if (!validModule(value))
            return false;
        if (activeModule === value)
            return true;
        activeModule = value;
        BaseDemoSI.storage.write(moduleKey, activeModule);
        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function")
            window.dispatchEvent(new CustomEvent("si-module-change", { detail: activeModule }));
        return true;
    }
    BaseDemoSI.selectModule = selectModule;
    function setupModules() {
        const stored = BaseDemoSI.storage.read(moduleKey);
        if (validModule(stored))
            activeModule = stored;
        const select = document.getElementById("si-module-choice");
        if (!select)
            return;
        select.replaceChildren();
        for (const definition of BaseDemoSI.moduleDefinitions) {
            const item = document.createElement("option");
            item.value = definition.id;
            item.textContent = definition.label;
            select.append(item);
        }
        const refresh = () => {
            select.value = activeModule;
            const current = BaseDemoSI.moduleDefinitions.find(item => item.id === activeModule);
            const message = document.getElementById("si-module-description");
            if (message)
                message.textContent = current.summary;
            document.getElementById("si-workspace")?.setAttribute("data-module", activeModule);
            document.querySelectorAll("[data-add-kind]").forEach(button => {
                button.disabled = !moduleAllows("tools");
            });
            document.querySelectorAll("[data-menu-action^=add-]").forEach(button => { button.disabled = !moduleAllows("tools"); });
            document.getElementById("si-module-choice")?.setAttribute("title", current.summary);
        };
        select.addEventListener("change", () => { if (selectModule(select.value))
            BaseDemoSI.notify("Módulo atualizado.", "info"); refresh(); });
        window.addEventListener("si-module-change", () => { refresh(); });
        refresh();
        window.dispatchEvent(new CustomEvent("si-module-change", { detail: activeModule }));
    }
    BaseDemoSI.setupModules = setupModules;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const SESSION_KEY = "extension-session-v1";
    const MAX_RECORDS = 40;
    const MAX_STATE_BYTES = 8192;
    const TOKEN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
    const SEMVER = /^\d+\.\d+\.\d+$/;
    function safeJSON(value) {
        try {
            const valueText = JSON.stringify(value);
            if (typeof valueText !== "string" || valueText.length > MAX_STATE_BYTES)
                return null;
            const parsed = JSON.parse(valueText);
            const visit = (entry) => {
                if (entry === null || typeof entry === "string" || typeof entry === "boolean")
                    return true;
                if (typeof entry === "number")
                    return Number.isFinite(entry);
                if (Array.isArray(entry))
                    return entry.every(visit);
                if (typeof entry !== "object")
                    return false;
                return Object.entries(entry).every(([k, v]) => k !== "__proto__" && k !== "prototype" && k !== "constructor" && visit(v));
            };
            return visit(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
    const validText = (value, max = 90) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
    function validMetadata(m) {
        return !!m && TOKEN.test(m.id) && m.id.length <= 80 && SEMVER.test(m.version)
            && validText(m.name) && validText(m.description, 240);
    }
    function validDefs(defs) {
        if (!Array.isArray(defs) || defs.length > 20)
            return false;
        const ids = new Set();
        return defs.every(d => !!d && TOKEN.test(d.id) && d.id.length <= 64 && !ids.has(d.id) && (ids.add(d.id), true)
            && validText(d.name) && validText(d.description, 240) && typeof d.requiresSelection === "boolean");
    }
    function validReading(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        const v = value;
        return validText(v.label) && typeof v.value === "number" && Number.isFinite(v.value)
            && typeof v.unit === "string" && v.unit.length <= 24;
    }
    function parseExtensionSession(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return null;
        const s = value;
        if (s.schemaVersion !== 1 || !Array.isArray(s.records) || s.records.length > MAX_RECORDS
            || !(s.extensionId === null || (typeof s.extensionId === "string" && TOKEN.test(s.extensionId)))
            || !(s.extensionVersion === null || (typeof s.extensionVersion === "string" && SEMVER.test(s.extensionVersion)))
            || (s.extensionId === null) !== (s.extensionVersion === null))
            return null;
        const state = safeJSON(s.state);
        if (state === null && s.state !== null)
            return null;
        let last = 0;
        for (const rawRecord of s.records) {
            const record = rawRecord;
            if (!validReading(record) || !TOKEN.test(record.extensionId) || !TOKEN.test(record.instrumentId)
                || !(record.entityId === null || (validText(record.entityId, 80)))
                || !Number.isSafeInteger(record.sequence) || record.sequence <= last)
                return null;
            last = record.sequence;
        }
        return { schemaVersion: 1, extensionId: s.extensionId, extensionVersion: s.extensionVersion, state,
            records: s.records.map(r => ({ ...r })) };
    }
    BaseDemoSI.parseExtensionSession = parseExtensionSession;
    /** Runtime injetável: testes e extensões não dependem da interface gráfica. */
    function createExtensionRuntime(scene, io) {
        const registry = new Map();
        const subscribers = new Set();
        const tell = () => { for (const listener of [...subscribers])
            listener(); };
        let saved = null;
        try {
            const raw = io.read(SESSION_KEY);
            saved = raw === null ? null : parseExtensionSession(JSON.parse(raw));
        }
        catch {
            saved = null;
        }
        let activeId = null;
        let engineState = null;
        let records = saved?.records.map(r => ({ ...r })) ?? [];
        let sequence = records.reduce((m, r) => Math.max(m, r.sequence), 0);
        const current = () => activeId === null ? null : registry.get(activeId) ?? null;
        function persist() {
            io.write(SESSION_KEY, JSON.stringify({ schemaVersion: 1, extensionId: activeId,
                extensionVersion: current()?.metadata.version ?? null, state: engineState, records }));
        }
        function context() {
            const snapshot = scene.getSnapshot();
            return { scene: snapshot, selected: snapshot.entities.find(e => e.id === snapshot.selectedId) ?? null,
                state: safeJSON(engineState) };
        }
        const failure = (message) => ({ ok: false, message });
        return {
            register(extension) {
                if (!extension || !validMetadata(extension.metadata) || registry.has(extension.metadata.id)
                    || !validDefs(extension.tools) || !validDefs(extension.instruments)
                    || typeof extension.initialState !== "function" || typeof extension.isState !== "function"
                    || extension.tools.some(t => typeof t.run !== "function")
                    || extension.instruments.some(t => typeof t.read !== "function"))
                    return false;
                let init;
                try {
                    init = safeJSON(extension.initialState());
                    if (init === null || !extension.isState(init))
                        return false;
                }
                catch {
                    return false;
                }
                registry.set(extension.metadata.id, extension);
                // Restaurar apenas se a versão da extensão continua compatível.
                if (saved?.extensionId === extension.metadata.id && saved.extensionVersion === extension.metadata.version
                    && extension.isState(saved.state)) {
                    activeId = extension.metadata.id;
                    engineState = safeJSON(saved.state);
                }
                tell();
                return true;
            },
            available: () => [...registry.values()].map(extension => ({ ...extension.metadata })),
            active: () => current(),
            activate(id) {
                if (id !== null && !registry.has(id))
                    return false;
                const extension = id === null ? null : registry.get(id);
                if (activeId === id)
                    return true;
                let next = null;
                if (extension) {
                    try {
                        next = safeJSON(extension.initialState());
                        if (next === null || !extension.isState(next))
                            return false;
                    }
                    catch {
                        return false;
                    }
                }
                activeId = id;
                engineState = next;
                persist();
                tell();
                return true;
            },
            runTool(id) {
                if (!BaseDemoSI.moduleAllows("tools"))
                    return failure("Ferramentas indisponíveis neste módulo.");
                const extension = current();
                if (!extension)
                    return failure("Ative uma extensão antes de utilizar ferramentas.");
                const tool = extension.tools.find(t => t.id === id);
                if (!tool)
                    return failure("Ferramenta não registrada.");
                const ctx = context();
                if (tool.requiresSelection && !ctx.selected)
                    return failure("Selecione um objeto para utilizar esta ferramenta.");
                try {
                    const action = tool.run(ctx);
                    if (!action || !validText(action.message, 240))
                        return failure("A ferramenta retornou uma resposta inválida.");
                    let next = engineState;
                    if (Object.prototype.hasOwnProperty.call(action, "nextState")) {
                        next = safeJSON(action.nextState);
                        if (next === null || !extension.isState(next))
                            return failure("Estado da extensão rejeitado pela validação.");
                    }
                    // Não registrar estado da extensão se o comando de cena for recusado.
                    if (action.command && !scene.dispatch(action.command))
                        return failure("O comando não pôde ser aplicado à cena.");
                    engineState = next;
                    persist();
                    tell();
                    return { ok: true, message: action.message };
                }
                catch {
                    return failure("A ferramenta falhou; a operação foi interrompida.");
                }
            },
            measure(id) {
                if (!BaseDemoSI.moduleAllows("measure"))
                    return failure("Instrumentos indisponíveis neste módulo.");
                const extension = current();
                if (!extension)
                    return failure("Ative uma extensão antes de realizar leituras.");
                const instrument = extension.instruments.find(t => t.id === id);
                if (!instrument)
                    return failure("Instrumento não registrado.");
                const ctx = context();
                if (instrument.requiresSelection && !ctx.selected)
                    return failure("Selecione um objeto para medir.");
                try {
                    const value = instrument.read(ctx);
                    if (!validReading(value))
                        return failure("Leitura inválida; nenhuma medição registrada.");
                    const reading = { ...value, extensionId: extension.metadata.id, instrumentId: id,
                        entityId: ctx.selected?.id ?? null, sequence: ++sequence };
                    records = [...records, reading].slice(-MAX_RECORDS);
                    persist();
                    tell();
                    return { ok: true, message: `${value.label}: ${value.value} ${value.unit}`.trim(), reading: { ...reading } };
                }
                catch {
                    return failure("Falha de leitura; nenhum registro foi criado.");
                }
            },
            getRecords: () => records.map(r => ({ ...r })),
            getState: () => safeJSON(engineState),
            subscribe(listener) { subscribers.add(listener); return () => { subscribers.delete(listener); }; }
        };
    }
    BaseDemoSI.createExtensionRuntime = createExtensionRuntime;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    BaseDemoSI.neutralDemoExtension = {
        metadata: { id: "demo.neutral", name: "Operações neutras", version: "1.0.0",
            description: "Demonstra ações sobre objetos e leitura de propriedades sem qualquer modelo científico." },
        initialState: () => ({ actions: 0 }),
        isState: (value) => {
            if (!value || typeof value !== "object" || Array.isArray(value))
                return false;
            const v = value;
            return Number.isSafeInteger(v.actions) && typeof v.actions === "number" && v.actions >= 0 && v.actions <= 1000000;
        },
        tools: [
            { id: "step", name: "Avançar posição", description: "Desloca o objeto selecionado 2% para a direita, respeitando os limites.", requiresSelection: true,
                run: ({ selected, state }) => {
                    if (!selected)
                        throw Error("Nenhum objeto selecionado");
                    const position = Math.min(100 - selected.width / 2, selected.x + 2);
                    return { command: { type: "update", id: selected.id, changes: { x: position } }, nextState: { actions: state.actions + 1 },
                        message: "Posição avançada em até 2 pontos percentuais." };
                } },
            { id: "tone", name: "Alternar aparência", description: "Alterna a cor do objeto selecionado.", requiresSelection: true,
                run: ({ selected, state }) => {
                    if (!selected)
                        throw Error("Nenhum objeto selecionado");
                    const colors = ["teal", "blue", "amber"];
                    const tone = colors[(colors.indexOf(selected.tone) + 1) % colors.length];
                    return { command: { type: "update", id: selected.id, changes: { tone } }, nextState: { actions: state.actions + 1 },
                        message: "A aparência do objeto foi alternada." };
                } }
        ],
        instruments: [
            { id: "position", name: "Posição X", description: "Lê a coordenada horizontal percentual do objeto.", requiresSelection: true,
                read: ({ selected }) => ({ label: "Posição X", value: selected?.x ?? 0, unit: "%" }) },
            { id: "quantity", name: "Quantidade", description: "Lê a quantidade atual de objetos na cena.", requiresSelection: false,
                read: ({ scene }) => ({ label: "Quantidade de objetos", value: scene.entities.length, unit: "objetos" }) },
            { id: "operations", name: "Operações", description: "Lê o contador de ferramentas desta extensão.", requiresSelection: false,
                read: ({ state }) => ({ label: "Operações executadas", value: state.actions, unit: "ações" }) }
        ]
    };
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const EDU_KEY = "education-document-v1";
    const ID = /^(?:topic|mission|script|teacher)-[a-z0-9-]{1,52}$/;
    const RESERVED = new Set(["__proto__", "prototype", "constructor"]);
    const MAX_TEACHER = 24;
    const MAX_IMPORT = 65536;
    const MAX_STEPS = 5;
    BaseDemoSI.learningTopics = Object.freeze([
        { id: "topic-scene", title: "Explorar o ambiente", summary: "Conheça a cena e os controles de navegação.",
            paragraphs: ["O workspace é a área de interação. A região central recebe os objetos e mantém a prioridade visual, enquanto as docas organizam as ações e os registros.", "Use Montagem para criar objetos, Foco para destacar um elemento e Visão geral para comparar o conjunto."] },
        { id: "topic-tools", title: "Ferramentas e instrumentos", summary: "Diferencie ações, observações e leituras.",
            paragraphs: ["Ferramentas alteram objetos ou estados; instrumentos retornam valores registráveis. Cada extensão declara seus próprios recursos sem modificar a plataforma.", "A edição de objetos é reversível pelo histórico da cena. As leituras possuem registros próprios para consulta."] },
        { id: "topic-records", title: "Registros e interpretação", summary: "Aprenda a registrar observações verificáveis.",
            paragraphs: ["Uma observação descreve o que aparece na cena. Uma leitura acrescenta um valor, unidade e vínculo com o instrumento que a produziu.", "Conferir resultados implica distinguir ações realizadas, medidas obtidas e interpretações construídas a partir delas."] }
    ]);
    BaseDemoSI.officialActivities = Object.freeze([
        { id: "mission-create", kind: "mission", origin: "official", title: "Primeira composição", description: "Adicione ao menos dois objetos ao ambiente.", steps: [{ label: "Adicionar dois objetos na cena", requirement: "entities", minimum: 2 }] },
        { id: "mission-select", kind: "mission", origin: "official", title: "Objeto em foco", description: "Selecione um objeto para examiná-lo.", steps: [{ label: "Manter um objeto selecionado", requirement: "selection", minimum: 1 }] },
        { id: "mission-read", kind: "mission", origin: "official", title: "Registrar uma leitura", description: "Utilize um instrumento de uma extensão local.", steps: [{ label: "Registrar pelo menos uma leitura", requirement: "readings", minimum: 1 }] },
        { id: "script-start", kind: "script", origin: "official", title: "Construção orientada", description: "Prepare, selecione e amplie sua primeira montagem.", steps: [
                { label: "Adicione o primeiro objeto", requirement: "entities", minimum: 1 },
                { label: "Selecione o objeto para observação", requirement: "selection", minimum: 1 },
                { label: "Amplie a montagem para dois objetos", requirement: "entities", minimum: 2 }
            ] },
        { id: "script-observe", kind: "script", origin: "official", title: "Da observação ao registro", description: "Organize um procedimento de inspeção e medição.", steps: [
                { label: "Selecione um objeto no ambiente", requirement: "selection", minimum: 1 },
                { label: "Utilize um instrumento e registre a leitura", requirement: "readings", minimum: 1 }
            ] }
    ]);
    const emptyEducation = () => ({ schemaVersion: 1, topicsDone: [], progress: {}, teacherActivities: [] });
    const clean = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
    const validStep = (value) => {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        const v = value;
        return clean(v.label, 140) && ["manual", "entities", "selection", "readings"].includes(v.requirement)
            && Number.isSafeInteger(v.minimum) && (v.minimum ?? 0) >= 1 && (v.minimum ?? 0) <= 60
            && (v.requirement !== "selection" || v.minimum === 1)
            && (v.requirement !== "manual" || v.minimum === 1);
    };
    function validTeacherActivity(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        const a = value;
        return typeof a.id === "string" && ID.test(a.id) && a.id.startsWith("teacher-") && !RESERVED.has(a.id)
            && a.origin === "teacher" && (a.kind === "mission" || a.kind === "script")
            && clean(a.title, 90) && clean(a.description, 300)
            && Array.isArray(a.steps) && a.steps.length >= 1 && a.steps.length <= MAX_STEPS
            && (a.kind !== "mission" || a.steps.length === 1)
            && a.steps.every(validStep);
    }
    BaseDemoSI.validTeacherActivity = validTeacherActivity;
    function parseEducation(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return null;
        const v = value;
        if (v.schemaVersion !== 1 || !Array.isArray(v.topicsDone) || v.topicsDone.length > BaseDemoSI.learningTopics.length
            || !v.progress || typeof v.progress !== "object" || Array.isArray(v.progress)
            || !Array.isArray(v.teacherActivities) || v.teacherActivities.length > MAX_TEACHER)
            return null;
        const availableTopics = new Set(BaseDemoSI.learningTopics.map(t => t.id));
        if (new Set(v.topicsDone).size !== v.topicsDone.length || v.topicsDone.some(id => !availableTopics.has(id)))
            return null;
        if (!v.teacherActivities.every(validTeacherActivity))
            return null;
        const available = new Map([...BaseDemoSI.officialActivities, ...v.teacherActivities].map(a => [a.id, a]));
        if (available.size !== BaseDemoSI.officialActivities.length + v.teacherActivities.length)
            return null;
        const progress = Object.create(null);
        const entries = Object.entries(v.progress);
        if (entries.length > BaseDemoSI.officialActivities.length + MAX_TEACHER)
            return null;
        for (const [id, position] of entries) {
            const a = available.get(id);
            if (!a || RESERVED.has(id) || !Number.isSafeInteger(position) || position < 0 || position > a.steps.length)
                return null;
            progress[id] = position;
        }
        return { schemaVersion: 1, topicsDone: [...v.topicsDone], progress, teacherActivities: v.teacherActivities.map(a => ({ ...a, steps: a.steps.map(s => ({ ...s })) })) };
    }
    BaseDemoSI.parseEducation = parseEducation;
    function meetsRequirement(step, scene, readingCount) {
        if (step.requirement === "manual")
            return true;
        if (step.requirement === "entities")
            return scene.entities.length >= step.minimum;
        if (step.requirement === "selection")
            return !!scene.selectedId && scene.entities.some(e => e.id === scene.selectedId);
        return readingCount >= step.minimum;
    }
    BaseDemoSI.meetsRequirement = meetsRequirement;
    function createEducationStore(io) {
        let restored = null;
        try {
            const raw = io.read(EDU_KEY);
            restored = raw === null ? null : parseEducation(JSON.parse(raw));
        }
        catch {
            restored = null;
        }
        let state = restored ?? emptyEducation();
        const subscribers = new Set();
        const emit = () => { for (const cb of [...subscribers])
            cb(); };
        const persist = (next) => {
            const safe = parseEducation(next);
            if (!safe)
                return false;
            state = safe;
            io.write(EDU_KEY, JSON.stringify(state));
            emit();
            return true;
        };
        const available = () => [...BaseDemoSI.officialActivities, ...state.teacherActivities];
        const get = (id) => available().find(a => a.id === id);
        return {
            snapshot: () => parseEducation(state),
            list: (kind) => available().filter(a => a.kind === kind).map(a => ({ ...a, steps: a.steps.map(s => ({ ...s })) })),
            toggleTopic(id) {
                if (!BaseDemoSI.learningTopics.some(t => t.id === id))
                    return false;
                const topics = new Set(state.topicsDone);
                if (topics.has(id))
                    topics.delete(id);
                else
                    topics.add(id);
                return persist({ ...state, topicsDone: [...topics] });
            },
            advance(id, scene, readingCount) {
                const a = get(id);
                if (!a)
                    return { ok: false, message: "Atividade não encontrada." };
                const i = state.progress[id] ?? 0;
                if (i >= a.steps.length)
                    return { ok: false, message: "Atividade já concluída." };
                if (!meetsRequirement(a.steps[i], scene, readingCount))
                    return { ok: false, message: "Critério ainda não atendido na cena." };
                const progress = { ...state.progress, [id]: i + 1 };
                persist({ ...state, progress });
                return { ok: true, message: i + 1 === a.steps.length ? "Atividade concluída." : "Etapa registrada. Continue o roteiro." };
            },
            createActivity(value) {
                if (!validTeacherActivity(value) || state.teacherActivities.length >= MAX_TEACHER || get(value.id))
                    return false;
                return persist({ ...state, teacherActivities: [...state.teacherActivities, value] });
            },
            removeActivity(id) {
                if (!state.teacherActivities.some(a => a.id === id))
                    return false;
                const progress = { ...state.progress };
                delete progress[id];
                return persist({ ...state, teacherActivities: state.teacherActivities.filter(a => a.id !== id), progress });
            },
            importTeachers(value) {
                if (!value || typeof value !== "object" || Array.isArray(value))
                    return false;
                const v = value;
                if (v.format !== "base-demo-si-teacher-v1" || !Array.isArray(v.activities) || v.activities.length > MAX_TEACHER || !v.activities.every(validTeacherActivity))
                    return false;
                const ids = new Set(v.activities.map(a => a.id));
                if (ids.size !== v.activities.length)
                    return false;
                const retained = new Set([...BaseDemoSI.officialActivities, ...v.activities].map(a => a.id));
                const progress = Object.fromEntries(Object.entries(state.progress).filter(([id]) => retained.has(id)));
                return persist({ ...state, progress, teacherActivities: v.activities });
            },
            exportTeachers: () => JSON.stringify({ format: "base-demo-si-teacher-v1", activities: state.teacherActivities }, null, 2),
            subscribe(listener) { subscribers.add(listener); return () => { subscribers.delete(listener); }; }
        };
    }
    BaseDemoSI.createEducationStore = createEducationStore;
    function parseTeacherImport(text) {
        if (text.length > MAX_IMPORT)
            return null;
        try {
            return JSON.parse(text);
        }
        catch {
            return null;
        }
    }
    BaseDemoSI.parseTeacherImport = parseTeacherImport;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const JOURNAL_KEY = "journal-document-v1";
    const JOURNAL_IDS = /^(note|report)-[a-z0-9-]{1,65}$/;
    const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
    const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    const MAX_NOTES = 80;
    const MAX_REPORTS = 20;
    const MAX_JSON_LENGTH = 300000;
    const valueText = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
    const safeOptional = (value, max) => typeof value === "string" && value.length <= max;
    const realDay = (value) => typeof value === "string" && ISO_DAY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    const instant = (value) => typeof value === "string" && ISO_INSTANT.test(value) && !Number.isNaN(Date.parse(value));
    const id = (value, prefix) => typeof value === "string" && JOURNAL_IDS.test(value) && value.startsWith(prefix + "-");
    const noteKinds = ["observacao", "hipotese", "conclusao"];
    function validNote(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        const n = value;
        return id(n.id, "note") && instant(n.createdAt) && noteKinds.includes(n.kind)
            && valueText(n.body, 1200) && (n.entityId === null || valueText(n.entityId, 80))
            && (n.entityLabel === null || valueText(n.entityLabel, 64))
            && ((n.entityId === null) === (n.entityLabel === null));
    }
    function validReading(r) {
        if (!r || typeof r !== "object" || Array.isArray(r))
            return false;
        const x = r;
        return valueText(x.label, 90) && typeof x.value === "number" && Number.isFinite(x.value)
            && safeOptional(x.unit, 24) && valueText(x.extensionId, 80) && valueText(x.instrumentId, 80)
            && (x.entityId === null || valueText(x.entityId, 80))
            && Number.isSafeInteger(x.sequence) && (x.sequence ?? 0) > 0;
    }
    function validReport(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        const r = value;
        if (!id(r.id, "report") || !instant(r.createdAt) || !valueText(r.title, 100)
            || !safeOptional(r.author, 100) || !realDay(r.sessionDate) || !safeOptional(r.objective, 1000)
            || !r.options || typeof r.options !== "object" || Array.isArray(r.options)
            || typeof r.options.includeScene !== "boolean" || typeof r.options.includeNotes !== "boolean"
            || typeof r.options.includeReadings !== "boolean" || !Array.isArray(r.scene) || r.scene.length > 60
            || !Array.isArray(r.notes) || r.notes.length > MAX_NOTES || !Array.isArray(r.readings) || r.readings.length > 40)
            return false;
        const sceneOk = r.scene.every(e => !!e && valueText(e.id, 80) && valueText(e.label, 64) && ["block", "circle", "label"].includes(e.kind));
        const uniqueScene = new Set(r.scene.map(e => e.id)).size === r.scene.length;
        const readingSequences = r.readings.map(e => e.sequence);
        return sceneOk && uniqueScene && r.notes.every(validNote) && r.readings.every(validReading)
            && new Set(readingSequences).size === readingSequences.length
            && (r.options.includeScene || r.scene.length === 0)
            && (r.options.includeNotes || r.notes.length === 0)
            && (r.options.includeReadings || r.readings.length === 0);
    }
    function parseJournal(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return null;
        const v = value;
        if (v.schemaVersion !== 1 || !Array.isArray(v.notes) || v.notes.length > MAX_NOTES
            || !Array.isArray(v.reports) || v.reports.length > MAX_REPORTS
            || !v.notes.every(validNote) || !v.reports.every(validReport))
            return null;
        const ids = [...v.notes.map(n => n.id), ...v.reports.map(r => r.id)];
        if (new Set(ids).size !== ids.length)
            return null;
        try {
            const json = JSON.stringify(v);
            if (json.length > MAX_JSON_LENGTH)
                return null;
            const cloned = JSON.parse(json);
            return { schemaVersion: 1, notes: cloned.notes, reports: cloned.reports };
        }
        catch {
            return null;
        }
    }
    BaseDemoSI.parseJournal = parseJournal;
    function parseJournalImport(value) {
        if (value.length > MAX_JSON_LENGTH)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    }
    BaseDemoSI.parseJournalImport = parseJournalImport;
    function createJournalStore(io, clock = () => new Date()) {
        const empty = { schemaVersion: 1, notes: [], reports: [] };
        let recovered = null;
        try {
            const raw = io.read(JOURNAL_KEY);
            recovered = raw === null ? null : parseJournal(JSON.parse(raw));
        }
        catch {
            recovered = null;
        }
        let state = recovered ?? empty;
        let serial = 0;
        const listeners = new Set();
        const emit = () => { for (const listener of [...listeners])
            listener(); };
        const persist = (value) => {
            const parsed = parseJournal(value);
            if (!parsed || !io.write(JOURNAL_KEY, JSON.stringify(parsed)))
                return false;
            state = parsed;
            emit();
            return true;
        };
        const nextId = (prefix) => {
            const existing = new Set([...state.notes.map(n => n.id), ...state.reports.map(r => r.id)]);
            let next = "";
            do {
                next = `${prefix}-${clock().getTime().toString(36)}-${(++serial).toString(36)}`;
            } while (existing.has(next));
            return next;
        };
        return {
            snapshot: () => parseJournal(state),
            addNote(value, scene) {
                if (state.notes.length >= MAX_NOTES || !value || typeof value !== "object" || Array.isArray(value))
                    return false;
                const data = value;
                if (!noteKinds.includes(data.kind) || !valueText(data.body, 1200))
                    return false;
                const selected = scene.entities.find(e => e.id === scene.selectedId);
                const note = { id: nextId("note"), createdAt: clock().toISOString(), kind: data.kind,
                    body: data.body.trim(), entityId: selected?.id ?? null, entityLabel: selected?.label ?? null };
                return persist({ ...state, notes: [...state.notes, note] });
            },
            removeNote(noteId) {
                if (!state.notes.some(n => n.id === noteId))
                    return false;
                return persist({ ...state, notes: state.notes.filter(n => n.id !== noteId) });
            },
            makeReport(value, scene, readings) {
                if (state.reports.length >= MAX_REPORTS || !value || typeof value !== "object" || Array.isArray(value))
                    return false;
                const v = value;
                if (!valueText(v.title, 100) || !safeOptional(v.author, 100) || !realDay(v.sessionDate)
                    || !safeOptional(v.objective, 1000) || typeof v.includeScene !== "boolean"
                    || typeof v.includeNotes !== "boolean" || typeof v.includeReadings !== "boolean")
                    return false;
                const report = { id: nextId("report"), createdAt: clock().toISOString(), title: v.title.trim(),
                    author: v.author.trim(), sessionDate: v.sessionDate, objective: v.objective.trim(),
                    scene: v.includeScene ? scene.entities.map(e => ({ id: e.id, label: e.label, kind: e.kind })) : [],
                    notes: v.includeNotes ? state.notes.map(n => ({ ...n })) : [],
                    readings: v.includeReadings ? readings.map(r => ({ ...r })) : [],
                    options: { includeScene: v.includeScene, includeNotes: v.includeNotes, includeReadings: v.includeReadings } };
                if (!validReport(report))
                    return false;
                return persist({ ...state, reports: [...state.reports, report] });
            },
            removeReport(reportId) {
                if (!state.reports.some(r => r.id === reportId))
                    return false;
                return persist({ ...state, reports: state.reports.filter(r => r.id !== reportId) });
            },
            importJSON(value) {
                if (!value || typeof value !== "object" || Array.isArray(value))
                    return false;
                const candidate = value;
                if (candidate.format !== "base-demo-si-journal-v1")
                    return false;
                const parsed = parseJournal(candidate.document);
                return parsed !== null && persist(parsed);
            },
            exportJSON: () => JSON.stringify({ format: "base-demo-si-journal-v1", document: state }, null, 2),
            subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; }
        };
    }
    BaseDemoSI.createJournalStore = createJournalStore;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const MAX_ENTITIES = 60;
    const HISTORY_LIMIT = 50;
    const kinds = ["block", "circle", "label"];
    const tones = ["teal", "blue", "amber"];
    const forbidden = new Set(["__proto__", "constructor", "prototype"]);
    function finite(n) { return typeof n === "number" && Number.isFinite(n); }
    function goodEntity(raw) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw))
            return false;
        const e = raw;
        return typeof e.id === "string" && e.id.length > 0 && e.id.length <= 80 && !forbidden.has(e.id)
            && kinds.includes(e.kind)
            && typeof e.label === "string" && e.label.trim().length > 0 && e.label.length <= 64
            && tones.includes(e.tone)
            && finite(e.x) && finite(e.y) && finite(e.width) && finite(e.height)
            && e.width >= 8 && e.width <= 40 && e.height >= 8 && e.height <= 40
            && e.x >= e.width / 2 && e.x <= 100 - e.width / 2
            && e.y >= e.height / 2 && e.y <= 100 - e.height / 2;
    }
    const empty = () => ({ schemaVersion: 1, entities: [], selectedId: null });
    function clone(snapshot) {
        return { schemaVersion: 1, selectedId: snapshot.selectedId,
            entities: snapshot.entities.map(e => ({ ...e })) };
    }
    /** Dados armazenados não são confiáveis: rejeitar documentos inteiros com campos inválidos. */
    function parseScene(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return null;
        const raw = value;
        if (raw.schemaVersion !== 1 || !Array.isArray(raw.entities) || raw.entities.length > MAX_ENTITIES)
            return null;
        const seen = new Set();
        for (const e of raw.entities) {
            if (!goodEntity(e) || seen.has(e.id))
                return null;
            seen.add(e.id);
        }
        if (raw.selectedId !== null && (typeof raw.selectedId !== "string" || !seen.has(raw.selectedId)))
            return null;
        return clone(raw);
    }
    BaseDemoSI.parseScene = parseScene;
    function serializeScene(snapshot) {
        const valid = parseScene(snapshot);
        if (!valid)
            throw new Error("Cena inválida; gravação interrompida.");
        return JSON.stringify(valid);
    }
    BaseDemoSI.serializeScene = serializeScene;
    function createSceneStore(initial) {
        let present = parseScene(initial) ?? empty();
        const past = [], future = [];
        const listeners = new Set();
        const emit = (event) => { for (const listener of [...listeners])
            listener(event); };
        function commit(next) {
            const parsed = parseScene(next);
            if (!parsed || JSON.stringify(parsed) === JSON.stringify(present))
                return false;
            past.push(clone(present));
            if (past.length > HISTORY_LIMIT)
                past.shift();
            future.length = 0;
            present = parsed;
            emit("edit");
            return true;
        }
        return {
            getSnapshot: () => clone(present),
            dispatch(command) {
                const entities = present.entities.map(e => ({ ...e }));
                let selectedId = present.selectedId;
                switch (command.type) {
                    case "add":
                        if (entities.length >= MAX_ENTITIES || !goodEntity(command.entity) || entities.some(e => e.id === command.entity.id))
                            return false;
                        entities.push({ ...command.entity });
                        selectedId = command.entity.id;
                        break;
                    case "update": {
                        const i = entities.findIndex(e => e.id === command.id);
                        if (i < 0 || !command.changes || typeof command.changes !== "object" || Array.isArray(command.changes))
                            return false;
                        const allowed = new Set(["label", "x", "y", "width", "height", "tone"]);
                        if (Object.keys(command.changes).some(k => !allowed.has(k)))
                            return false;
                        const next = { ...entities[i], ...command.changes };
                        if (!goodEntity(next))
                            return false;
                        entities[i] = next;
                        break;
                    }
                    case "remove": {
                        const i = entities.findIndex(e => e.id === command.id);
                        if (i < 0)
                            return false;
                        entities.splice(i, 1);
                        if (selectedId === command.id)
                            selectedId = null;
                        break;
                    }
                    case "replace": {
                        const replacement = parseScene(command.snapshot);
                        if (!replacement)
                            return false;
                        return commit(replacement);
                    }
                    case "clear":
                        if (!entities.length)
                            return false;
                        entities.length = 0;
                        selectedId = null;
                        break;
                    default: return false;
                }
                return commit({ schemaVersion: 1, entities, selectedId });
            },
            select(id) {
                if (id !== null && !present.entities.some(e => e.id === id))
                    return false;
                if (present.selectedId === id)
                    return false;
                present = { ...present, selectedId: id };
                emit("selection");
                return true;
            },
            undo() {
                const previous = past.pop();
                if (!previous)
                    return false;
                future.push(clone(present));
                present = previous;
                emit("history");
                return true;
            },
            redo() {
                const next = future.pop();
                if (!next)
                    return false;
                past.push(clone(present));
                present = next;
                emit("history");
                return true;
            },
            canUndo: () => past.length > 0,
            canRedo: () => future.length > 0,
            subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; }
        };
    }
    BaseDemoSI.createSceneStore = createSceneStore;
    function makeEntity(kind, id, index = 0) {
        const width = kind === "label" ? 28 : 18;
        const height = kind === "label" ? 10 : 18;
        const spread = (index % 5) * 9;
        return { id, kind, label: kind === "block" ? "Bloco" : kind === "circle" ? "Círculo" : "Etiqueta",
            x: 30 + spread, y: 30 + spread / 2, width, height, tone: "teal" };
    }
    BaseDemoSI.makeEntity = makeEntity;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const key = "si-scene-presets-v1";
    const builtins = [
        { id: "modelo-basico", name: "Objeto central", builtin: true, snapshot: { schemaVersion: 1, selectedId: null, entities: [{ id: "preset-1", kind: "block", label: "Objeto central", x: 50, y: 50, width: 20, height: 20, tone: "teal" }] } },
        { id: "modelo-comparacao", name: "Comparação lado a lado", builtin: true, snapshot: { schemaVersion: 1, selectedId: null, entities: [
                    { id: "preset-1", kind: "circle", label: "Objeto A", x: 32, y: 49, width: 18, height: 18, tone: "blue" },
                    { id: "preset-2", kind: "circle", label: "Objeto B", x: 68, y: 49, width: 18, height: 18, tone: "amber" }
                ] } },
        { id: "modelo-analise", name: "Composição com legenda", builtin: true, snapshot: { schemaVersion: 1, selectedId: null, entities: [
                    { id: "preset-1", kind: "block", label: "Estrutura", x: 49, y: 39, width: 23, height: 20, tone: "teal" },
                    { id: "preset-2", kind: "label", label: "Observação", x: 49, y: 72, width: 29, height: 10, tone: "blue" }
                ] } }
    ];
    const validPresetName = (value) => typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 64;
    function parseCustomPresets(input) {
        if (!Array.isArray(input) || input.length > 8)
            return [];
        const seen = new Set();
        const result = [];
        for (const item of input) {
            if (!item || typeof item !== "object" || Array.isArray(item))
                return [];
            const raw = item;
            if (typeof raw.id !== "string" || !/^user-[a-z0-9-]{1,55}$/.test(raw.id) || seen.has(raw.id) || !validPresetName(raw.name) || raw.builtin !== false)
                return [];
            const snapshot = BaseDemoSI.parseScene(raw.snapshot);
            if (!snapshot || snapshot.entities.length === 0)
                return [];
            seen.add(raw.id);
            result.push({ id: raw.id, name: raw.name.trim(), snapshot, builtin: false });
        }
        return result;
    }
    BaseDemoSI.parseCustomPresets = parseCustomPresets;
    let saved = [];
    let opened = false;
    const byId = (id) => document.getElementById(id);
    function setupPresets(sceneStore) {
        let dirty = false;
        try {
            const value = BaseDemoSI.storage.read(key);
            if (value !== null) {
                saved = parseCustomPresets(JSON.parse(value));
                dirty = JSON.parse(value).length !== saved.length;
            }
        }
        catch {
            saved = [];
            dirty = true;
        }
        const trigger = byId("si-drawer-presets");
        if (!trigger)
            return;
        const dialog = document.createElement("dialog");
        dialog.className = "si-preset-dialog";
        dialog.setAttribute("aria-labelledby", "si-preset-title");
        const container = document.createElement("div");
        container.className = "si-preset-layout";
        const heading = document.createElement("h2");
        heading.id = "si-preset-title";
        heading.textContent = "Montagens prontas";
        const description = document.createElement("p");
        description.textContent = "Escolha uma montagem neutra ou guarde a organização atual para reutilizar nesta instalação.";
        const list = document.createElement("div");
        list.className = "si-preset-list";
        list.setAttribute("role", "group");
        list.setAttribute("aria-label", "Montagens disponíveis");
        const label = document.createElement("label");
        label.textContent = "Nome da montagem atual";
        label.htmlFor = "si-preset-name";
        const input = document.createElement("input");
        input.id = "si-preset-name";
        input.maxLength = 64;
        input.placeholder = "Ex.: Investigação 1";
        const actions = document.createElement("div");
        actions.className = "si-preset-actions";
        const save = document.createElement("button");
        save.type = "button";
        save.textContent = "Guardar montagem";
        const close = document.createElement("button");
        close.type = "button";
        close.textContent = "Fechar";
        actions.append(save, close);
        container.append(heading, description, list, label, input, actions);
        dialog.append(container);
        document.body.append(dialog);
        const closeDialog = () => { if (dialog.open)
            dialog.close(); };
        function persist() { return BaseDemoSI.storage.write(key, JSON.stringify(saved)); }
        function rebuild() {
            list.replaceChildren();
            for (const preset of [...builtins, ...saved]) {
                const row = document.createElement("div");
                row.className = "si-preset-entry";
                const info = document.createElement("span");
                info.textContent = `${preset.name} · ${preset.snapshot.entities.length} objeto(s)`;
                const load = document.createElement("button");
                load.type = "button";
                load.textContent = "Montar";
                load.disabled = !BaseDemoSI.sceneManipulationAllowed();
                load.addEventListener("click", async () => {
                    if (!BaseDemoSI.sceneManipulationAllowed()) {
                        BaseDemoSI.notify("Este módulo não permite manipular a montagem.", "warning");
                        return;
                    }
                    const current = sceneStore.getSnapshot();
                    closeDialog();
                    if (current.entities.length) {
                        const accepted = await BaseDemoSI.confirmDialog({ title: "Substituir montagem atual?", description: "A montagem atual será substituída. Você poderá usar Desfazer para recuperar todos os objetos de uma vez.", confirmText: "Montar", destructive: true });
                        if (!accepted)
                            return;
                    }
                    if (sceneStore.dispatch({ type: "replace", snapshot: preset.snapshot })) {
                        BaseDemoSI.closeNavigationDrawer(false);
                        window.location.hash = "#/ambiente";
                        BaseDemoSI.notify(`Montagem “${preset.name}” aplicada. Use Desfazer para recuperar a anterior.`, "success");
                    }
                    else
                        BaseDemoSI.notify("A montagem escolhida já está na cena.", "info");
                });
                row.append(info, load);
                if (!preset.builtin) {
                    const remove = document.createElement("button");
                    remove.type = "button";
                    remove.textContent = "Excluir";
                    remove.setAttribute("aria-label", `Excluir montagem ${preset.name}`);
                    remove.addEventListener("click", async () => {
                        closeDialog();
                        const accepted = await BaseDemoSI.confirmDialog({ title: "Excluir montagem guardada?", description: `A montagem “${preset.name}” será excluída do catálogo local.`, confirmText: "Excluir", destructive: true });
                        if (!accepted)
                            return;
                        saved = saved.filter(x => x.id !== preset.id);
                        if (!persist())
                            BaseDemoSI.notify("Montagem excluída nesta sessão, mas o armazenamento está bloqueado.", "warning");
                        rebuild();
                        dialog.showModal();
                    });
                    row.append(remove);
                }
                list.append(row);
            }
        }
        trigger.addEventListener("click", () => {
            if (opened || dialog.open)
                return;
            BaseDemoSI.closeNavigationDrawer(false);
            rebuild();
            dialog.showModal();
            input.focus();
            if (dirty)
                BaseDemoSI.notify("Algumas montagens locais eram inválidas e não foram carregadas.", "warning");
            dirty = false;
        });
        save.addEventListener("click", () => {
            const snapshot = sceneStore.getSnapshot();
            const name = input.value.trim();
            if (!BaseDemoSI.sceneManipulationAllowed()) {
                BaseDemoSI.notify("A montagem não pode ser editada neste módulo.", "warning");
                return;
            }
            if (!validPresetName(name)) {
                BaseDemoSI.notify("Informe um nome entre 2 e 64 caracteres.", "warning");
                input.focus();
                return;
            }
            if (!snapshot.entities.length) {
                BaseDemoSI.notify("Adicione um objeto antes de guardar uma montagem.", "warning");
                return;
            }
            if (saved.length >= 8) {
                BaseDemoSI.notify("Limite de 8 montagens locais atingido.", "warning");
                return;
            }
            const id = `user-${Date.now().toString(36)}-${saved.length}`;
            saved = [...saved, { id, name, snapshot, builtin: false }];
            if (!persist())
                BaseDemoSI.notify("Montagem guardada nesta sessão, mas o armazenamento local está indisponível.", "warning");
            else
                BaseDemoSI.notify("Montagem guardada no dispositivo.", "success");
            input.value = "";
            rebuild();
        });
        close.addEventListener("click", closeDialog);
        dialog.addEventListener("close", () => { trigger.focus({ preventScroll: true }); });
        window.addEventListener("si-module-change", () => { if (dialog.open)
            rebuild(); });
    }
    BaseDemoSI.setupPresets = setupPresets;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Coordenadas independentes de resolução; commit ocorre somente no fim do gesto. */
    function moveEntityByPixels(entity, deltaX, deltaY, boundsWidth, boundsHeight) {
        if (![deltaX, deltaY, boundsWidth, boundsHeight].every(Number.isFinite) || boundsWidth <= 0 || boundsHeight <= 0)
            return null;
        const clamp = (value, extent) => Math.min(100 - extent / 2, Math.max(extent / 2, value));
        const round = (value) => Math.round(value * 10) / 10;
        return { x: round(clamp(entity.x + (deltaX / boundsWidth) * 100, entity.width)), y: round(clamp(entity.y + (deltaY / boundsHeight) * 100, entity.height)) };
    }
    BaseDemoSI.moveEntityByPixels = moveEntityByPixels;
    /** Todo movimento interativo sobre a cena depende da capacidade de manipulação. */
    function sceneManipulationAllowed() { return BaseDemoSI.moduleAllows("tools"); }
    BaseDemoSI.sceneManipulationAllowed = sceneManipulationAllowed;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    function initialWorkspace() {
        return { view: "focus", left: "collapsed", right: "collapsed", leftTab: "preparo", rightTab: "ver", presentation: "standard" };
    }
    BaseDemoSI.initialWorkspace = initialWorkspace;
    /** A dimensão compacta (<1280 px) opera uma doca por vez; <=900 px usa sheet. */
    function reduceWorkspace(s, a, compact) {
        switch (a.type) {
            case "reset": return initialWorkspace();
            case "view": return { ...s, view: a.view };
            case "open": {
                const tab = a.tab;
                if (a.side === "left")
                    return { ...s, left: "open", right: compact ? "collapsed" : s.right, presentation: "standard",
                        leftTab: tab === "resumo" || tab === "objetos" || tab === "modulo" || tab === "missao" ? tab : "preparo" };
                return { ...s, right: "open", left: compact ? "collapsed" : s.left,
                    rightTab: tab === "dados" ? "dados" : "ver", presentation: "standard" };
            }
            case "close": return { ...s, [a.side]: "collapsed", presentation: "standard" };
            case "left-tab": return { ...s, leftTab: a.tab };
            case "right-tab": return { ...s, rightTab: a.tab, presentation: "standard" };
            case "expand":
                if (s.right === "collapsed")
                    return s;
                return { ...s, presentation: s.presentation === "fullscreen" ? "standard" : "fullscreen", left: "collapsed" };
        }
    }
    BaseDemoSI.reduceWorkspace = reduceWorkspace;
    function normalizeWorkspace(s, compact) {
        if (s.presentation === "fullscreen")
            return { ...s, left: "collapsed" };
        if (compact && s.left === "open" && s.right === "open")
            return { ...s, left: "collapsed" };
        return s;
    }
    BaseDemoSI.normalizeWorkspace = normalizeWorkspace;
    /** Geometria do viewport visual mobile, sem depender do teclado virtual ou da rede. */
    function mobileViewportMetrics(innerHeight, visibleHeight, offsetTop) {
        const safeHeight = Number.isFinite(innerHeight) && innerHeight > 0 ? innerHeight : 1;
        if (!Number.isFinite(visibleHeight) || visibleHeight <= 0 || !Number.isFinite(offsetTop))
            return { visibleHeight: safeHeight, keyboardOffset: 0 };
        return { visibleHeight: Math.min(safeHeight, Math.max(1, visibleHeight)), keyboardOffset: Math.max(0, Math.min(safeHeight, safeHeight - visibleHeight - Math.max(0, offsetTop))) };
    }
    BaseDemoSI.mobileViewportMetrics = mobileViewportMetrics;
    /** Migração explícita dos identificadores internos anteriores da doca. */
    function normalizeLeftCategory(value) {
        if (value === "montagem")
            return "preparo";
        if (value === "ajustes")
            return "modulo";
        return value === "resumo" || value === "preparo" || value === "objetos" || value === "modulo" || value === "missao" ? value : null;
    }
    BaseDemoSI.normalizeLeftCategory = normalizeLeftCategory;
    function parseWorkspacePreference(raw) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw))
            return null;
        const t = raw;
        if (t.schemaVersion !== 1 && t.schemaVersion !== 2)
            return null;
        const category = normalizeLeftCategory(t.leftTab);
        if (!["focus", "overview"].includes(String(t.view)) || !category || !["ver", "dados"].includes(String(t.rightTab)))
            return null;
        return { ...initialWorkspace(), view: t.view, leftTab: category, rightTab: t.rightTab };
    }
    BaseDemoSI.parseWorkspacePreference = parseWorkspacePreference;
    function serializeWorkspacePreference(s) {
        return JSON.stringify({ schemaVersion: 2, view: s.view, leftTab: s.leftTab, rightTab: s.rightTab });
    }
    BaseDemoSI.serializeWorkspacePreference = serializeWorkspacePreference;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const WORKSPACE_KEY = "workspace-layout-v1";
    let workspaceState = BaseDemoSI.initialWorkspace();
    let workspaceStarted = false;
    let readScene;
    let selectScene;
    const dockTriggers = {};
    let viewerLevel = "catalog";
    const node = (id) => document.getElementById(id);
    const mobile = () => window.matchMedia("(max-width: 900px)").matches;
    const compact = () => window.innerWidth < 1280;
    const activeSide = () => workspaceState.right === "open" ? "right" : workspaceState.left === "open" ? "left" : null;
    function dock(side) { return node(`si-dock-${side}`); }
    function guidedActivity() {
        const returnLink = node("si-return-activity");
        return !!returnLink && !returnLink.hidden && !!returnLink.getAttribute("href");
    }
    function persistWorkspace() { BaseDemoSI.storage.write(WORKSPACE_KEY, BaseDemoSI.serializeWorkspacePreference(workspaceState)); }
    function focusReturn(side) {
        const trigger = dockTriggers[side];
        const button = trigger?.isConnected ? trigger : document.querySelector(`[data-open-dock="${side === "left" ? "montagem" : workspaceState.rightTab}"]`);
        button?.focus({ preventScroll: true });
    }
    function renderWorkspace() {
        const root = node("si-workspace");
        if (!root)
            return;
        const sheet = mobile();
        const active = activeSide();
        const fullscreen = !sheet && workspaceState.right === "open" && workspaceState.presentation === "fullscreen";
        root.dataset.viewMode = workspaceState.view;
        root.dataset.leftOpen = String(workspaceState.left === "open");
        root.dataset.rightOpen = String(workspaceState.right === "open");
        root.classList.toggle("si-workspace-fullscreen", fullscreen);
        for (const [view, id] of [["focus", "workspace-focus"], ["overview", "workspace-overview"]]) {
            const el = node(id);
            if (el)
                el.hidden = workspaceState.view !== view;
            document.querySelector(`[data-scene-view="${view}"]`)?.setAttribute("aria-pressed", String(workspaceState.view === view));
        }
        for (const side of ["left", "right"]) {
            const pane = dock(side);
            const opened = workspaceState[side] === "open";
            pane.hidden = !opened;
            pane.inert = !opened;
            pane.classList.toggle("si-bottom-sheet", sheet);
            pane.setAttribute("role", sheet && opened ? "dialog" : "region");
            if (sheet && opened)
                pane.setAttribute("aria-modal", "true");
            else
                pane.removeAttribute("aria-modal");
        }
        for (const button of document.querySelectorAll("[data-open-dock]")) {
            const target = button.dataset.openDock;
            const on = target === "montagem" ? workspaceState.left === "open" : workspaceState.right === "open" && workspaceState.rightTab === target;
            button.setAttribute("aria-expanded", String(on));
        }
        // Mesma gramática da montagem: abas contextuais, não uma lista fixa de recursos.
        // Em atividades guiadas o contexto substitui a aba Módulo; em modo sem
        // edição as áreas de criação e edição de objetos deixam de aparecer.
        const guided = guidedActivity();
        const editable = BaseDemoSI.moduleAllows("tools");
        const available = (tab) => tab === "resumo" || (tab === "missao" ? guided : (tab === "modulo" ? !guided : editable));
        if (!available(workspaceState.leftTab))
            workspaceState = { ...workspaceState, leftTab: guided ? "missao" : "resumo" };
        for (const b of document.querySelectorAll("[data-left-tab]")) {
            const name = b.dataset.leftTab;
            b.hidden = !available(name);
            b.setAttribute("aria-pressed", String(workspaceState.leftTab === name));
        }
        const count = [...document.querySelectorAll("[data-left-tab]")].filter(b => !b.hidden).length;
        dock("left").style.setProperty("--si-visible-categories", String(count));
        for (const b of document.querySelectorAll("[data-right-tab]"))
            b.setAttribute("aria-pressed", String(workspaceState.rightTab === b.dataset.rightTab));
        for (const panel of document.querySelectorAll("[data-left-panel]"))
            panel.hidden = panel.dataset.leftPanel !== workspaceState.leftTab;
        for (const panel of document.querySelectorAll("[data-right-panel]"))
            panel.hidden = panel.dataset.rightPanel !== workspaceState.rightTab;
        const lh = node("si-left-title");
        if (lh)
            lh.textContent = { resumo: "Montagem", preparo: "Preparo", objetos: "Recipientes", modulo: "Módulo", missao: "Missão" }[workspaceState.leftTab];
        const detail = viewerLevel === "detail" && workspaceState.rightTab === "ver";
        const rh = node("si-right-title");
        if (rh)
            rh.textContent = workspaceState.rightTab === "dados" ? "Dados" : detail ? (BaseDemoSI.activeViewer()?.title ?? "Ver") : "Ver";
        const instruments = node("si-viewer-instruments");
        if (instruments)
            instruments.hidden = !(detail && BaseDemoSI.activeViewer()?.capability === "measure" && BaseDemoSI.moduleAllows("measure"));
        const back = node("si-dock-viewer-back");
        if (back)
            back.hidden = !detail;
        const catalog = node("si-viewer-catalog");
        if (catalog)
            catalog.hidden = detail;
        const view = node("si-viewer-detail");
        if (view)
            view.hidden = !detail;
        const rp = dock("right");
        rp.dataset.presentation = fullscreen ? "fullscreen" : "standard";
        const expand = node("si-expand");
        if (expand) {
            expand.hidden = sheet || workspaceState.rightTab === "dados";
            expand.textContent = fullscreen ? "Restaurar" : "Expandir";
            expand.setAttribute("aria-expanded", String(fullscreen));
        }
        const backdrop = node("si-sheet-backdrop");
        if (backdrop)
            backdrop.hidden = !(sheet && !!active);
        document.body.classList.toggle("si-sheet-active", sheet && !!active);
        const scene = node("si-stage");
        if (scene)
            scene.inert = !!(sheet && active) || fullscreen;
        const actionbar = root.querySelector(".si-actionbar");
        if (actionbar)
            actionbar.inert = !!(sheet && active) || fullscreen;
        const toolbar = root.querySelector(".si-workspace-toolbar .si-view-tabs");
        if (toolbar)
            toolbar.inert = !!(sheet && active) || fullscreen;
        const strip = node("scene-strip");
        if (strip)
            strip.inert = !!(sheet && active) || fullscreen;
        if (workspaceState.left === "open" && workspaceState.right === "open" && compact())
            console.warn("Estado compacto normalizado incorretamente");
    }
    function changeWorkspace(a, persist = true) {
        workspaceState = BaseDemoSI.normalizeWorkspace(BaseDemoSI.reduceWorkspace(workspaceState, a, compact()), compact());
        renderWorkspace();
        if (persist)
            persistWorkspace();
    }
    function openWorkspace(side, tab, trigger) {
        const same = side === "left" ? workspaceState.left === "open" : workspaceState.right === "open" && workspaceState.rightTab === tab;
        if (same) {
            closeWorkspace(side);
            return;
        }
        dockTriggers[side] = trigger;
        if (side === "right" && tab === "ver")
            viewerLevel = "catalog";
        changeWorkspace({ type: "open", side, tab });
        // Uma categoria nova começa no topo da própria folha, nunca preserva
        // deslocamento interno da categoria anterior.
        const scroll = dock(side).querySelector(".si-dock-scroll");
        if (scroll)
            scroll.scrollTop = 0;
        dock(side).querySelector("[data-close-dock]")?.focus({ preventScroll: true });
    }
    function closeWorkspace(side, returnFocus = true) {
        changeWorkspace({ type: "close", side });
        if (returnFocus)
            focusReturn(side);
    }
    function updateViewport() {
        workspaceState = BaseDemoSI.normalizeWorkspace(workspaceState, compact());
        renderWorkspace();
        const root = node("si-workspace");
        if (!root)
            return;
        if (mobile()) {
            const vv = window.visualViewport;
            const size = BaseDemoSI.mobileViewportMetrics(window.innerHeight, vv?.height ?? window.innerHeight, vv?.offsetTop ?? 0);
            root.style.setProperty("--si-visible-height", `${size.visibleHeight}px`);
            // Não reposicionar a cena quando o teclado aparece: apenas a folha e
            // os lançadores passam a acompanhar a área visível do navegador.
            root.style.setProperty("--si-keyboard-offset", `${Math.round(size.keyboardOffset)}px`);
        }
        else {
            root.style.removeProperty("--si-visible-height");
            root.style.removeProperty("--si-keyboard-offset");
        }
    }
    function focusables(pane) { return Array.from(pane.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')).filter(el => !el.closest('[hidden],[inert]') && el.getClientRects().length > 0); }
    function keyboardHandler(ev) {
        if (!document.body.classList.contains("route-ambiente"))
            return;
        const side = activeSide();
        if (!side)
            return;
        if (ev.key === "Escape") {
            ev.preventDefault();
            closeWorkspace(side);
            return;
        }
        if (ev.key !== "Tab" || !(mobile() || workspaceState.presentation === "fullscreen"))
            return;
        const items = focusables(dock(side));
        if (!items.length)
            return;
        const first = items[0], last = items[items.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
            ev.preventDefault();
            last.focus();
        }
        else if (!ev.shiftKey && document.activeElement === last) {
            ev.preventDefault();
            first.focus();
        }
    }
    function createObjectButton(e, kind) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = kind === "strip" ? "si-strip-item" : "si-overview-item";
        b.setAttribute("aria-pressed", String(e.id === readScene().selectedId));
        const label = document.createElement("strong");
        label.textContent = e.label;
        const info = document.createElement("small");
        info.textContent = e.kind === "block" ? "Bloco" : e.kind === "circle" ? "Círculo" : "Etiqueta";
        const swatch = document.createElement("span");
        swatch.className = `si-swatch tone-${e.tone}`;
        swatch.setAttribute("aria-hidden", "true");
        b.append(swatch, label, info);
        b.addEventListener("click", () => { selectScene(e.id); if (kind === "overview")
            changeWorkspace({ type: "view", view: "focus" }); });
        return b;
    }
    function renderWorkspaceContent(snap) {
        if (!workspaceStarted)
            return;
        const focus = snap.entities.find(e => e.id === snap.selectedId);
        const title = node("focused-object-label"), sub = node("focused-object-subtitle");
        if (title)
            title.textContent = focus?.label ?? "Cena de demonstração";
        if (sub)
            sub.textContent = focus ? `Objeto selecionado · ${focus.kind === "circle" ? "Círculo" : focus.kind === "block" ? "Bloco" : "Etiqueta"}` : "Selecione ou adicione um objeto";
        const strip = node("scene-strip"), overview = node("scene-overview-items");
        if (strip) {
            strip.replaceChildren();
            if (!snap.entities.length) {
                const empty = document.createElement("span");
                empty.className = "si-strip-placeholder";
                empty.textContent = "Abra Montagem para adicionar objetos.";
                strip.append(empty);
            }
            else
                for (const e of snap.entities)
                    strip.append(createObjectButton(e, "strip"));
        }
        if (overview) {
            overview.replaceChildren();
            if (!snap.entities.length) {
                const empty = document.createElement("p");
                empty.textContent = "Ainda não há objetos nesta cena.";
                overview.append(empty);
            }
            else
                for (const e of snap.entities)
                    overview.append(createObjectButton(e, "overview"));
        }
        const obs = node("si-observation"), data = node("si-data-summary");
        if (obs) {
            obs.replaceChildren();
            const p = document.createElement("p");
            p.textContent = focus ? `Objeto: ${focus.label}` : "Selecione um objeto para inspecionar sua representação.";
            obs.append(p);
            if (focus) {
                const dl = document.createElement("dl");
                for (const [key, val] of [["Tipo", focus.kind], ["Posição", `${focus.x}% × ${focus.y}%`], ["Dimensões", `${focus.width}% × ${focus.height}%`], ["Cor", focus.tone]]) {
                    const d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
                    dt.textContent = String(key);
                    dd.textContent = String(val);
                    d.append(dt, dd);
                    dl.append(d);
                }
                obs.append(dl);
            }
        }
        const setup = node("si-dock-setup-summary");
        if (setup) {
            setup.replaceChildren();
            const heading = document.createElement("p");
            heading.textContent = `${snap.entities.length} objeto(s) na cena`;
            const selected = document.createElement("p");
            selected.textContent = focus ? `Em foco: ${focus.label}` : "Nenhum objeto selecionado";
            setup.append(heading, selected);
        }
        const contextLink = node("si-dock-activity-link");
        const contextStatus = node("si-dock-activity-status");
        const returnLink = node("si-return-activity");
        const activeActivity = !!returnLink && !returnLink.hidden && !!returnLink.getAttribute("href");
        if (contextLink) {
            contextLink.hidden = !activeActivity;
            if (activeActivity)
                contextLink.href = returnLink.href;
        }
        if (contextStatus)
            contextStatus.textContent = activeActivity ? "Atividade em andamento. O retorno mantém os objetos da cena." : "Nenhuma atividade orientada em andamento.";
        if (data) {
            data.replaceChildren();
            const counts = { block: 0, circle: 0, label: 0 };
            for (const e of snap.entities)
                counts[e.kind]++;
            const dl = document.createElement("dl");
            for (const [key, value] of [["Objetos", snap.entities.length], ["Blocos", counts.block], ["Círculos", counts.circle], ["Etiquetas", counts.label]]) {
                const div = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
                dt.textContent = String(key);
                dd.textContent = String(value);
                div.append(dt, dd);
                dl.append(div);
            }
            data.append(dl);
        }
    }
    BaseDemoSI.renderWorkspaceContent = renderWorkspaceContent;
    function setupWorkspace(snapshot, select) {
        if (workspaceStarted)
            return;
        readScene = snapshot;
        selectScene = select;
        const raw = BaseDemoSI.storage.read(WORKSPACE_KEY);
        if (raw !== null) {
            try {
                workspaceState = BaseDemoSI.parseWorkspacePreference(JSON.parse(raw)) ?? BaseDemoSI.initialWorkspace();
            }
            catch {
                workspaceState = BaseDemoSI.initialWorkspace();
            }
        }
        workspaceStarted = true;
        document.querySelectorAll("[data-scene-view]").forEach(b => b.addEventListener("click", () => changeWorkspace({ type: "view", view: b.dataset.sceneView })));
        document.querySelectorAll("[data-open-dock]").forEach(b => b.addEventListener("click", () => {
            const which = b.dataset.openDock;
            openWorkspace(which === "montagem" ? "left" : "right", which === "montagem" ? "preparo" : which, b);
        }));
        document.querySelectorAll("[data-close-dock]").forEach(b => b.addEventListener("click", () => closeWorkspace(b.dataset.closeDock)));
        document.querySelectorAll("[data-left-tab],[data-open-left-category]").forEach(b => b.addEventListener("click", () => {
            if (b.hidden || b.closest("[hidden],[inert]"))
                return;
            const tab = BaseDemoSI.normalizeLeftCategory(b.dataset.leftTab ?? b.dataset.openLeftCategory);
            if (!tab)
                return;
            changeWorkspace({ type: "left-tab", tab });
            const container = node("si-left-scroll");
            if (container)
                container.scrollTop = 0;
        }));
        node("si-dock-viewer-back")?.addEventListener("click", () => {
            viewerLevel = "catalog";
            renderWorkspace();
            node("si-right-scroll").scrollTop = 0;
            (node("si-viewer-buttons")?.querySelector('[aria-pressed="true"]')
                ?? node("si-viewer-buttons")?.querySelector("button"))?.focus({ preventScroll: true });
        });
        window.addEventListener("si-viewer-family-selected", () => {
            viewerLevel = "catalog";
            renderWorkspace();
            const scroll = node("si-right-scroll");
            if (scroll)
                scroll.scrollTop = 0;
        });
        window.addEventListener("si-viewer-selected", () => {
            viewerLevel = "detail";
            if (workspaceState.right === "open" && workspaceState.rightTab === "ver") {
                renderWorkspace();
                node("si-right-scroll").scrollTop = 0;
                node("si-dock-viewer-back")?.focus({ preventScroll: true });
            }
        });
        node("si-expand")?.addEventListener("click", () => changeWorkspace({ type: "expand" }));
        node("si-sheet-backdrop")?.addEventListener("click", () => { const side = activeSide(); if (side)
            closeWorkspace(side); });
        window.addEventListener("si-module-change", () => {
            viewerLevel = "catalog";
            renderWorkspace();
            persistWorkspace();
        });
        document.addEventListener("keydown", keyboardHandler);
        window.addEventListener("resize", updateViewport);
        window.visualViewport?.addEventListener("resize", updateViewport);
        window.visualViewport?.addEventListener("scroll", updateViewport);
        window.addEventListener("orientationchange", updateViewport);
        for (const side of ["left", "right"]) {
            const pane = dock(side);
            pane.addEventListener("focusin", event => {
                if (!mobile() || workspaceState[side] !== "open")
                    return;
                const target = event.target;
                // Somente campos editáveis precisam ser trazidos para a região visível.
                if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
                    target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
                }
            });
        }
        window.addEventListener("si-route-changed", (event) => {
            if (event.detail !== "ambiente") {
                workspaceState = { ...workspaceState, left: "collapsed", right: "collapsed", presentation: "standard" };
                viewerLevel = "catalog";
                renderWorkspace();
            }
            else
                updateViewport();
        });
        renderWorkspace();
        renderWorkspaceContent(readScene());
        updateViewport();
    }
    BaseDemoSI.setupWorkspace = setupWorkspace;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Porta compartilhada de notificações; nenhuma notificação depende de serviços externos. */
    let noticeSerial = 0;
    const noticeTimers = new Map();
    function notify(text, kind = "info") {
        const rail = document.getElementById("si-notifications");
        if (!rail)
            return;
        const item = document.createElement("div");
        item.className = `si-notice si-notice-${kind}`;
        item.setAttribute("role", kind === "error" ? "alert" : "status");
        item.dataset.noticeId = String(++noticeSerial);
        const message = document.createElement("span");
        message.textContent = text;
        const dismiss = document.createElement("button");
        dismiss.type = "button";
        dismiss.textContent = "×";
        dismiss.setAttribute("aria-label", "Dispensar notificação");
        item.append(message, dismiss);
        const remove = () => {
            const timer = noticeTimers.get(item);
            if (timer !== undefined) {
                window.clearTimeout(timer);
                noticeTimers.delete(item);
            }
            item.remove();
        };
        dismiss.addEventListener("click", remove);
        rail.append(item);
        while (rail.children.length > 3)
            rail.firstElementChild?.querySelector("button")?.click();
        const duration = kind === "error" ? 9000 : kind === "warning" ? 6500 : 4400;
        noticeTimers.set(item, window.setTimeout(remove, duration));
    }
    BaseDemoSI.notify = notify;
    let finishModal = null;
    let dialogOrigin = null;
    let modalOpen = false;
    const dialogNode = (id) => document.getElementById(id);
    /** Modal acessível sem window.confirm(): exige decisão explícita e restaura o foco. */
    function confirmDialog(spec) {
        const root = dialogNode("si-modal");
        if (!root || modalOpen)
            return Promise.resolve(false);
        modalOpen = true;
        dialogOrigin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialogNode("si-modal-title").textContent = spec.title;
        dialogNode("si-modal-description").textContent = spec.description;
        const accept = dialogNode("si-modal-confirm");
        const cancel = dialogNode("si-modal-cancel");
        accept.textContent = spec.confirmText ?? "Confirmar";
        cancel.textContent = spec.cancelText ?? "Cancelar";
        accept.classList.toggle("si-button-danger", !!spec.destructive);
        root.hidden = false;
        document.body.classList.add("si-modal-active");
        const app = document.querySelector(".app-shell");
        if (app)
            app.inert = true;
        // Sem dependência de HTMLDialogElement, compatível com os navegadores-alvo.
        cancel.focus({ preventScroll: true });
        return new Promise(resolve => { finishModal = resolve; });
    }
    BaseDemoSI.confirmDialog = confirmDialog;
    function settleDialog(accepted) {
        if (!modalOpen)
            return;
        const resolve = finishModal;
        finishModal = null;
        modalOpen = false;
        const root = dialogNode("si-modal");
        if (root)
            root.hidden = true;
        document.body.classList.remove("si-modal-active");
        const app = document.querySelector(".app-shell");
        if (app)
            app.inert = false;
        const focusTarget = dialogOrigin?.matches(":disabled") ? document.getElementById("scene-undo") : dialogOrigin;
        focusTarget?.focus({ preventScroll: true });
        dialogOrigin = null;
        resolve?.(accepted);
    }
    function focusableIn(el) {
        return Array.from(el.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]'))
            .filter(item => !item.closest('[hidden],[inert]') && item.getClientRects().length > 0);
    }
    function isPlatformDialogOpen() { return modalOpen; }
    BaseDemoSI.isPlatformDialogOpen = isPlatformDialogOpen;
    function setupComponents() {
        dialogNode("si-modal-cancel")?.addEventListener("click", () => settleDialog(false));
        dialogNode("si-modal-confirm")?.addEventListener("click", () => settleDialog(true));
        // Clicar fora equivale a cancelar, não confirmar uma ação destrutiva.
        dialogNode("si-modal")?.addEventListener("click", event => { if (event.target === event.currentTarget)
            settleDialog(false); });
        document.addEventListener("keydown", event => {
            if (!modalOpen)
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopImmediatePropagation();
                settleDialog(false);
                return;
            }
            if (event.key !== "Tab")
                return;
            const root = dialogNode("si-modal");
            const items = focusableIn(root);
            if (!items.length)
                return;
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }, true);
        window.addEventListener("si-route-changed", () => settleDialog(false));
    }
    BaseDemoSI.setupComponents = setupComponents;
    /** Menu de ações reutilizável: fechar por Escape, clique externo e perda de foco. */
    function setupActionMenu(triggerId, menuId, activate) {
        const trigger = dialogNode(triggerId);
        const menu = dialogNode(menuId);
        if (!trigger || !menu)
            return;
        const items = () => Array.from(menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
        const close = (restore) => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); if (restore)
            trigger.focus({ preventScroll: true }); };
        const open = () => { if (modalOpen)
            return; menu.hidden = false; trigger.setAttribute("aria-expanded", "true"); items()[0]?.focus({ preventScroll: true }); };
        trigger.addEventListener("click", () => menu.hidden ? open() : close(true));
        trigger.addEventListener("keydown", event => { if (["ArrowDown", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            open();
        } });
        menu.addEventListener("click", event => {
            const clicked = event.target.closest('[role="menuitem"]');
            if (!clicked || !menu.contains(clicked))
                return;
            const action = clicked.dataset.menuAction;
            close(true);
            if (action)
                activate(action);
        });
        menu.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close(true);
                return;
            }
            if (event.key === "Tab") {
                close(false);
                return;
            }
            if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key))
                return;
            event.preventDefault();
            const list = items(), index = list.indexOf(document.activeElement);
            const next = event.key === "Home" ? 0 : event.key === "End" ? list.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
            list[next]?.focus();
        });
        document.addEventListener("pointerdown", event => {
            if (menu.hidden)
                return;
            if (!menu.contains(event.target) && !trigger.contains(event.target))
                close(false);
        });
        window.addEventListener("si-route-changed", () => close(false));
    }
    BaseDemoSI.setupActionMenu = setupActionMenu;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    let runtime;
    let extensionsReady = false;
    const find = (id) => document.getElementById(id);
    function descriptor(text) {
        const p = document.createElement("p");
        p.textContent = text;
        return p;
    }
    function showFeedback(result) {
        const status = find("extension-status");
        if (status)
            status.textContent = result.message;
        BaseDemoSI.notify(result.message, result.ok ? "success" : "warning");
        BaseDemoSI.signalFeedback(result.ok ? "success" : "warning");
    }
    function renderExtensions(snapshot) {
        if (!extensionsReady)
            return;
        const extension = runtime.active();
        const choices = find("extension-choice");
        if (choices)
            choices.value = extension?.metadata.id ?? "";
        const information = find("extension-descriptor");
        if (information)
            information.textContent = extension ? `${extension.metadata.name} · v${extension.metadata.version}. ${extension.metadata.description}` :
                "Nenhuma extensão ativa. Os controles básicos da cena continuam disponíveis.";
        for (const [rootId, definitions, mode] of [
            ["extension-tools", extension?.tools ?? [], "tool"],
            ["extension-instruments", extension?.instruments ?? [], "instrument"]
        ]) {
            const target = find(rootId);
            if (!target)
                continue;
            target.replaceChildren();
            if (!definitions.length) {
                target.append(descriptor("Nenhum recurso conectado."));
                continue;
            }
            for (const item of definitions) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "button outline si-extension-action";
                button.textContent = item.name;
                button.title = item.description;
                button.disabled = (item.requiresSelection && !snapshot.selectedId) || !BaseDemoSI.moduleAllows(mode === "tool" ? "tools" : "measure");
                button.setAttribute("aria-label", `${item.name}. ${item.description}`);
                button.addEventListener("click", () => showFeedback(mode === "tool" ? runtime.runTool(item.id) : runtime.measure(item.id)));
                target.append(button);
            }
        }
        const log = find("extension-records");
        if (log) {
            log.replaceChildren();
            const rows = runtime.getRecords();
            if (!rows.length) {
                log.append(descriptor("Nenhuma leitura registrada nesta instalação."));
            }
            else {
                const list = document.createElement("ol");
                list.className = "si-extension-log";
                for (const record of [...rows].reverse().slice(0, 10)) {
                    const li = document.createElement("li");
                    const strong = document.createElement("strong");
                    strong.textContent = record.label;
                    const value = document.createElement("span");
                    value.textContent = `${record.value} ${record.unit}`.trim();
                    const metadata = document.createElement("small");
                    metadata.textContent = `Leitura #${record.sequence} · ${record.entityId ? "Objeto selecionado" : "Cena"}`;
                    li.append(strong, value, metadata);
                    list.append(li);
                }
                log.append(list);
            }
        }
    }
    BaseDemoSI.renderExtensions = renderExtensions;
    function extensionGetRecords() { return extensionsReady ? runtime.getRecords() : []; }
    BaseDemoSI.extensionGetRecords = extensionGetRecords;
    function extensionRecordCount() { return extensionsReady ? runtime.getRecords().length : 0; }
    BaseDemoSI.extensionRecordCount = extensionRecordCount;
    function setupExtensions(scene) {
        if (extensionsReady)
            return;
        runtime = BaseDemoSI.createExtensionRuntime(scene, BaseDemoSI.storage);
        runtime.register(BaseDemoSI.neutralDemoExtension);
        // Primeira instalação: ativação explícita na base, sem alterar documentos já persistidos.
        if (BaseDemoSI.storage.read("extension-session-v1") === null)
            runtime.activate(BaseDemoSI.neutralDemoExtension.metadata.id);
        extensionsReady = true;
        const select = find("extension-choice");
        if (select) {
            select.replaceChildren();
            const none = document.createElement("option");
            none.value = "";
            none.textContent = "Nenhuma extensão";
            select.append(none);
            for (const item of runtime.available()) {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.name;
                select.append(option);
            }
            select.addEventListener("change", () => {
                const result = runtime.activate(select.value || null);
                if (!result)
                    BaseDemoSI.notify("Não foi possível ativar a extensão.", "warning");
                else
                    BaseDemoSI.notify(select.value ? "Extensão local ativada." : "Extensão desativada.", "info");
                renderExtensions(scene.getSnapshot());
            });
        }
        runtime.subscribe(() => { renderExtensions(scene.getSnapshot()); window.dispatchEvent(new Event("si-education-observation")); });
        window.addEventListener("si-module-change", () => renderExtensions(scene.getSnapshot()));
        renderExtensions(scene.getSnapshot());
    }
    BaseDemoSI.setupExtensions = setupExtensions;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const familyNames = { observar: "Observar", medir: "Medir", analisar: "Analisar" };
    // Ícones vetoriais próprios do contrato de navegação da família (SVGs locais).
    const familyIcons = {
        observar: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
        medir: "M4 17 17 4l3 3L7 20H4ZM8 13l2 2M11 10l2 2M14 7l2 2",
        analisar: "M4 3v17h17M7 16l4-5 4 2 5-8"
    };
    const familyDescriptions = {
        observar: "Representações e propriedades dos objetos em foco.",
        medir: "Instrumentos disponíveis e leituras da investigação.",
        analisar: "Comparações e interpretações dos dados da cena."
    };
    const viewerRegistry = new Map();
    let selectedViewer = "observacao";
    let selectedFamily = "observar";
    const viewerFamilyKey = "viewer-family-selection-v1";
    function viewerFamily(capability) {
        return capability === "measure" ? "medir" : capability === "analyze" ? "analisar" : "observar";
    }
    BaseDemoSI.viewerFamily = viewerFamily;
    function activeViewer() {
        const viewer = viewerRegistry.get(selectedViewer);
        return viewer && BaseDemoSI.moduleAllows(viewer.capability) ? viewer : null;
    }
    BaseDemoSI.activeViewer = activeViewer;
    function availableViewerFamilies() {
        const choices = new Set([...viewerRegistry.values()].filter(v => BaseDemoSI.moduleAllows(v.capability)).map(v => viewerFamily(v.capability)));
        return Object.keys(familyNames).filter(id => choices.has(id));
    }
    BaseDemoSI.availableViewerFamilies = availableViewerFamilies;
    function currentViewerFamily() { return selectedFamily; }
    BaseDemoSI.currentViewerFamily = currentViewerFamily;
    function chooseViewerFamily(id) {
        if (!availableViewerFamilies().includes(id))
            return false;
        selectedFamily = id;
        BaseDemoSI.storage.write(viewerFamilyKey, id);
        renderViewers(viewerScene?.());
        window.dispatchEvent(new Event("si-viewer-family-selected"));
        return true;
    }
    BaseDemoSI.chooseViewerFamily = chooseViewerFamily;
    let viewerScene;
    const viewerKey = "viewer-selection-v1";
    const label = (tag, value) => { const node = document.createElement(tag); node.textContent = value; return node; };
    function registerViewer(viewer) {
        if (!viewer || !/^[a-z][a-z0-9-]{1,40}$/.test(viewer.id) || viewerRegistry.has(viewer.id)
            || typeof viewer.title !== "string" || viewer.title.length < 2 || viewer.title.length > 60
            || !["tools", "measure", "observe", "analyze"].includes(viewer.capability)
            || typeof viewer.render !== "function")
            return false;
        viewerRegistry.set(viewer.id, viewer);
        return true;
    }
    BaseDemoSI.registerViewer = registerViewer;
    function availableViewers() { return [...viewerRegistry.values()]; }
    BaseDemoSI.availableViewers = availableViewers;
    function chooseViewer(id) {
        const viewer = viewerRegistry.get(id);
        if (!viewer || !BaseDemoSI.moduleAllows(viewer.capability))
            return false;
        selectedViewer = id;
        selectedFamily = viewerFamily(viewer.capability);
        BaseDemoSI.storage.write(viewerKey, id);
        BaseDemoSI.storage.write(viewerFamilyKey, selectedFamily);
        renderViewers(viewerScene?.());
        return true;
    }
    BaseDemoSI.chooseViewer = chooseViewer;
    function renderViewers(snapshot) {
        if (!snapshot)
            return;
        const buttons = document.getElementById("si-viewer-buttons"), output = document.getElementById("si-viewer-output");
        const tabs = document.getElementById("si-viewer-families"), description = document.getElementById("si-viewer-family-description");
        const panel = document.getElementById("si-viewer-family-panel");
        if (!buttons || !output || !tabs || !description || !panel)
            return;
        const allowed = [...viewerRegistry.values()].filter(v => BaseDemoSI.moduleAllows(v.capability));
        const families = availableViewerFamilies();
        if (!families.includes(selectedFamily))
            selectedFamily = families[0] ?? "observar";
        if (!allowed.some(v => v.id === selectedViewer))
            selectedViewer = allowed.find(v => viewerFamily(v.capability) === selectedFamily)?.id ?? "";
        tabs.replaceChildren();
        for (const family of families) {
            const tab = document.createElement("button");
            tab.type = "button";
            tab.className = "si-viewer-family-tab";
            const svgNs = "http:" + "//www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNs, "svg");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "currentColor");
            svg.setAttribute("stroke-width", "1.8");
            svg.setAttribute("stroke-linecap", "round");
            svg.setAttribute("stroke-linejoin", "round");
            svg.setAttribute("aria-hidden", "true");
            svg.classList.add("si-viewer-family-icon");
            const shape = document.createElementNS(svgNs, "path");
            shape.setAttribute("d", familyIcons[family]);
            svg.append(shape);
            tab.append(svg, label("span", familyNames[family]));
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", String(family === selectedFamily));
            tab.tabIndex = family === selectedFamily ? 0 : -1;
            tab.setAttribute("aria-controls", "si-viewer-family-panel");
            tab.addEventListener("click", () => chooseViewerFamily(family));
            tab.addEventListener("keydown", ev => {
                if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft" && ev.key !== "Home" && ev.key !== "End")
                    return;
                ev.preventDefault();
                const i = families.indexOf(family);
                const next = ev.key === "Home" ? families[0] : ev.key === "End" ? families[families.length - 1] : families[(i + (ev.key === "ArrowRight" ? 1 : -1) + families.length) % families.length];
                chooseViewerFamily(next);
                tabs.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
            });
            tabs.append(tab);
        }
        panel.setAttribute("aria-label", `${familyNames[selectedFamily]} — ferramentas`);
        description.textContent = families.length ? familyDescriptions[selectedFamily] : "Nenhuma família disponível neste módulo.";
        buttons.replaceChildren();
        for (const v of allowed.filter(v => viewerFamily(v.capability) === selectedFamily)) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "si-viewer-item";
            btn.textContent = v.title;
            btn.setAttribute("aria-pressed", String(selectedViewer === v.id));
            btn.addEventListener("click", () => { if (chooseViewer(v.id))
                window.dispatchEvent(new CustomEvent("si-viewer-selected", { detail: v.id })); });
            buttons.append(btn);
        }
        output.replaceChildren();
        const chosen = activeViewer();
        if (!chosen) {
            output.append(label("p", "Não há visualizadores habilitados neste módulo."));
            return;
        }
        try {
            chosen.render(snapshot, BaseDemoSI.extensionGetRecords(), output);
        }
        catch {
            output.replaceChildren(label("p", "Visualização indisponível."));
        }
    }
    BaseDemoSI.renderViewers = renderViewers;
    function setupViewers(scene) {
        viewerScene = scene;
        registerViewer({ id: "observacao", title: "Propriedades da cena", capability: "observe", render(s, _, out) {
                const selected = s.entities.find(e => e.id === s.selectedId);
                out.append(label("h3", "Observação"), label("p", selected ? `Objeto em foco: ${selected.label}` : "Selecione um objeto na cena."));
                if (selected) {
                    const dl = document.createElement("dl");
                    for (const [k, v] of [["Tipo", selected.kind], ["Posição", `${selected.x}% × ${selected.y}%`], ["Dimensões", `${selected.width}% × ${selected.height}%`]]) {
                        const row = document.createElement("div");
                        row.append(label("dt", k), label("dd", v));
                        dl.append(row);
                    }
                    out.append(dl);
                }
            } });
        registerViewer({ id: "medicao", title: "Leituras registradas", capability: "measure", render(_, records, out) {
                out.append(label("h3", "Medições"));
                if (!records.length) {
                    out.append(label("p", "Nenhuma leitura registrada."));
                    return;
                }
                const list = document.createElement("ol");
                for (const entry of records.slice(-10).reverse())
                    list.append(label("li", `${entry.label}: ${entry.value} ${entry.unit}`.trim()));
                out.append(list);
            } });
        registerViewer({ id: "analise", title: "Distribuição dos objetos", capability: "analyze", render(s, records, out) {
                out.append(label("h3", "Análise da cena"));
                const kinds = { block: 0, circle: 0, label: 0 };
                for (const e of s.entities)
                    kinds[e.kind]++;
                const dl = document.createElement("dl");
                for (const [k, v] of [["Objetos", s.entities.length], ["Blocos", kinds.block], ["Círculos", kinds.circle], ["Etiquetas", kinds.label], ["Leituras registradas", records.length]]) {
                    const row = document.createElement("div");
                    row.append(label("dt", String(k)), label("dd", String(v)));
                    dl.append(row);
                }
                out.append(dl);
            } });
        const stored = BaseDemoSI.storage.read(viewerKey);
        if (stored && viewerRegistry.has(stored))
            selectedViewer = stored;
        const family = BaseDemoSI.storage.read(viewerFamilyKey);
        if (family && ["observar", "medir", "analisar"].includes(family))
            selectedFamily = family;
        else
            selectedFamily = viewerRegistry.has(selectedViewer) ? viewerFamily(viewerRegistry.get(selectedViewer).capability) : "observar";
        window.addEventListener("si-module-change", () => renderViewers(scene()));
        window.addEventListener("si-education-observation", () => renderViewers(scene()));
        renderViewers(scene());
    }
    BaseDemoSI.setupViewers = setupViewers;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    let education;
    let educationScene;
    let teacherSerial = 0;
    const el = (id) => document.getElementById(id);
    const text = (tag, value, className) => {
        const node = document.createElement(tag);
        node.textContent = value;
        if (className)
            node.className = className;
        return node;
    };
    function button(label, action, mode = "outline") {
        const node = document.createElement("button");
        node.type = "button";
        node.className = `button ${mode}`;
        node.textContent = label;
        node.addEventListener("click", action);
        return node;
    }
    function countReadings() { return BaseDemoSI.extensionRecordCount(); }
    /** Catálogo e leitura têm espaços próprios; nunca substituímos a bancada. */
    let returnToActivity = "";
    const guidedKey = "guided-return-v1";
    /** Vínculo validado sempre contra o catálogo carregado: sem atividade fantasma. */
    function validatedGuidedLink(value) {
        const match = /^#\/(missoes|roteiros)\?item=([a-z0-9-]{1,80})$/.exec(value);
        if (!match || !education)
            return null;
        const kind = match[1] === "missoes" ? "mission" : "script";
        const activity = education.list(kind).find(a => a.id === match[2]);
        if (!activity)
            return null;
        return { url: `#/${match[1]}?item=${encodeURIComponent(activity.id)}`, activity, progress: education.snapshot().progress[activity.id] ?? 0 };
    }
    function saveGuidedReturn(value) {
        returnToActivity = value;
        BaseDemoSI.storage.write(guidedKey, value);
        mountReturnLink();
        window.dispatchEvent(new Event("si-guided-context-changed"));
    }
    function guidedActivityContext() {
        const result = validatedGuidedLink(returnToActivity);
        return result ? { url: result.url, title: result.activity.title, kind: result.activity.kind, progress: result.progress, total: result.activity.steps.length } : null;
    }
    BaseDemoSI.guidedActivityContext = guidedActivityContext;
    const selectedParam = (key) => {
        const search = window.location.hash.split("?")[1] ?? "";
        return new URLSearchParams(search).get(key) ?? "";
    };
    function openDetail(route, key, id) {
        window.location.hash = `#/${route}?${key}=${encodeURIComponent(id)}`;
        if (BaseDemoSI.currentRoute(window.location.hash) === route)
            renderAll();
    }
    function returnToCatalog(route, id) {
        window.location.hash = `#/${route}`;
        window.setTimeout(() => {
            document.querySelector(`[data-catalog-id="${id}"]`)?.focus({ preventScroll: true });
        }, 0);
    }
    function menuActivity(kind, id) { return education?.list(kind).find(a => a.id === id); }
    BaseDemoSI.menuActivity = menuActivity;
    function menuActivityProgress(id) { return education?.snapshot().progress[id] ?? 0; }
    BaseDemoSI.menuActivityProgress = menuActivityProgress;
    function advanceActivityFromMenu(id) {
        if (!education || !educationScene)
            return { ok: false, message: "Nenhuma atividade disponível." };
        return education.advance(id, educationScene.getSnapshot(), BaseDemoSI.extensionRecordCount());
    }
    BaseDemoSI.advanceActivityFromMenu = advanceActivityFromMenu;
    function clearGuidedReturn() { saveGuidedReturn(""); }
    BaseDemoSI.clearGuidedReturn = clearGuidedReturn;
    function mountReturnLink() {
        const control = el("si-return-activity");
        if (!control)
            return;
        const guided = guidedActivityContext();
        control.hidden = !guided || BaseDemoSI.currentRoute(window.location.hash) !== "ambiente";
        if (guided)
            control.href = guided.url;
    }
    function showDetail(catalogId, detailId, open) {
        const catalog = el(catalogId), detail = el(detailId);
        if (catalog)
            catalog.hidden = open;
        if (detail)
            detail.hidden = !open;
        if (open)
            detail?.replaceChildren();
        return detail;
    }
    function renderTopics() {
        const target = el("edu-topic-list");
        if (!target)
            return;
        target.replaceChildren();
        const saved = education.snapshot();
        const active = BaseDemoSI.learningTopics.find(t => t.id === selectedParam("tema"));
        const detail = showDetail("edu-topic-list", "edu-topic-detail", !!active);
        for (const topic of BaseDemoSI.learningTopics) {
            const card = document.createElement("article");
            card.className = "edu-card";
            card.dataset.topicId = topic.id;
            card.append(text("p", saved.topicsDone.includes(topic.id) ? "Concluído" : "Tema disponível", "edu-kicker"), text("h2", topic.title), text("p", topic.summary));
            const go = button("Abrir tema", () => openDetail("aprender", "tema", topic.id), "outline");
            go.dataset.catalogId = topic.id;
            card.append(go);
            target.append(card);
        }
        if (active && detail) {
            const back = button("← Todos os temas", () => returnToCatalog("aprender", active.id));
            back.classList.add("si-detail-back");
            const heading = text("h2", active.title);
            heading.tabIndex = -1;
            detail.append(back, text("p", "LEITURA ORIENTADA", "edu-kicker"), heading, text("p", active.summary, "si-detail-lead"));
            const article = document.createElement("article");
            article.className = "si-detail-reading";
            for (const paragraph of active.paragraphs)
                article.append(text("p", paragraph));
            detail.append(article);
            detail.append(button(saved.topicsDone.includes(active.id) ? "Desmarcar conclusão" : "Marcar como concluído", () => {
                education.toggleTopic(active.id);
                BaseDemoSI.notify("Progresso de leitura atualizado.", "success");
            }, "primary"));
        }
        const stats = el("edu-topic-summary");
        if (stats)
            stats.textContent = `${saved.topicsDone.length} de ${BaseDemoSI.learningTopics.length} temas concluídos`;
    }
    function renderActivity(kind) {
        const route = kind === "mission" ? "missoes" : "roteiros";
        const listId = kind === "mission" ? "edu-mission-list" : "edu-script-list";
        const detailId = kind === "mission" ? "edu-mission-detail" : "edu-script-detail";
        const target = el(listId);
        if (!target)
            return;
        target.replaceChildren();
        const snapshot = education.snapshot();
        const activities = education.list(kind);
        const active = activities.find(a => a.id === selectedParam("item") && BaseDemoSI.currentRoute(window.location.hash) === route);
        const detail = showDetail(listId, detailId, !!active);
        for (const activity of activities) {
            const position = snapshot.progress[activity.id] ?? 0, finished = position >= activity.steps.length;
            const card = document.createElement("article");
            card.className = "edu-card";
            card.dataset.activityId = activity.id;
            card.append(text("p", `${activity.origin === "teacher" ? "Professor · " : ""}${kind === "mission" ? "Missão" : "Roteiro"} · ${finished ? "Concluído" : `${position}/${activity.steps.length} etapas`}`, "edu-kicker"), text("h2", activity.title), text("p", activity.description));
            const go = button("Ver detalhes", () => openDetail(route, "item", activity.id));
            go.dataset.catalogId = activity.id;
            card.append(go);
            target.append(card);
        }
        if (!target.children.length)
            target.append(text("p", "Nenhuma atividade disponível."));
        if (!active || !detail)
            return;
        const position = snapshot.progress[active.id] ?? 0, finished = position >= active.steps.length;
        const nextReturn = `#/${route}?item=${encodeURIComponent(active.id)}`;
        if (returnToActivity !== nextReturn)
            saveGuidedReturn(nextReturn);
        const back = button(`← Todas as ${kind === "mission" ? "missões" : "investigações"}`, () => returnToCatalog(route, active.id));
        back.classList.add("si-detail-back");
        const heading = text("h2", active.title);
        heading.tabIndex = -1;
        detail.append(back, text("p", kind === "mission" ? "MISSÃO · OBJETIVOS" : "ROTEIRO · PROCEDIMENTO", "edu-kicker"), heading, text("p", active.description, "si-detail-lead"));
        const list = document.createElement("ol");
        list.className = "edu-steps si-detail-steps";
        for (let i = 0; i < active.steps.length; i++) {
            const step = active.steps[i], item = document.createElement("li");
            item.className = i < position ? "edu-step-done" : i === position ? "edu-step-current" : "";
            item.append(text("strong", step.label));
            const criterion = step.requirement === "entities" ? `${step.minimum} objeto(s) na cena` : step.requirement === "selection" ? "Um objeto selecionado" : step.requirement === "readings" ? `${step.minimum} leitura(s) registrada(s)` : "Confirmação de realização";
            item.append(text("small", criterion));
            list.append(item);
        }
        detail.append(list);
        const actions = document.createElement("div");
        actions.className = "edu-actions";
        const bench = document.createElement("a");
        bench.className = "button primary";
        bench.href = "#/ambiente";
        bench.textContent = "Montar na bancada";
        actions.append(bench);
        if (!finished) {
            const step = active.steps[position];
            const allowed = BaseDemoSI.meetsRequirement(step, educationScene.getSnapshot(), countReadings());
            const check = button(step.requirement === "manual" ? "Confirmar etapa" : "Conferir e registrar", () => {
                const outcome = education.advance(active.id, educationScene.getSnapshot(), countReadings());
                BaseDemoSI.notify(outcome.message, outcome.ok ? "success" : "warning");
            }, "outline");
            check.disabled = !allowed;
            check.title = allowed ? "Registrar etapa" : "Conclua o critério no ambiente primeiro";
            actions.append(check);
        }
        else
            actions.append(text("span", "Atividade concluída", "edu-finished"));
        detail.append(actions);
        mountReturnLink();
    }
    function renderTeacher() {
        const target = el("edu-teacher-list");
        if (!target)
            return;
        target.replaceChildren();
        const activities = education.snapshot().teacherActivities;
        const summary = el("edu-teacher-summary");
        if (summary)
            summary.textContent = `${activities.length} / 24 atividades personalizadas`;
        if (!activities.length)
            target.append(text("p", "Nenhuma atividade personalizada. Crie uma atividade no editor abaixo."));
        for (const a of activities) {
            const card = document.createElement("article");
            card.className = "edu-teacher-item";
            const info = document.createElement("div");
            info.append(text("strong", a.title), text("small", `${a.kind === "mission" ? "Missão" : "Roteiro"} · ${a.steps.length} etapa(s)`));
            card.append(info, button("Criar link", () => BaseDemoSI.offerShareLink(a)), button("Excluir", async () => {
                const accepted = await BaseDemoSI.confirmDialog({ title: "Excluir atividade?", description: `A atividade ${a.title} e seu progresso serão excluídos deste navegador.`, confirmText: "Excluir", destructive: true });
                if (accepted && education.removeActivity(a.id))
                    BaseDemoSI.notify("Atividade removida.", "info");
            }));
            target.append(card);
        }
    }
    function renderAll() { renderTopics(); renderActivity("mission"); renderActivity("script"); renderTeacher(); mountReturnLink(); }
    const inputValue = (id) => el(id)?.value.trim() ?? "";
    const rule = (id) => el(id).value;
    const step = (prefix) => ({ label: inputValue(`${prefix}-label`), requirement: rule(`${prefix}-rule`), minimum: Number(inputValue(`${prefix}-min`) || 1) });
    function displayTeacherKind() {
        const show = el("edu-form-kind").value === "script";
        const second = el("edu-second-step");
        if (second)
            second.hidden = !show;
    }
    let currentTeacherStep = 1;
    function teacherStep(step, validate = true) {
        const form = el("edu-teacher-form");
        if (!form || step < 1 || step > 3)
            return;
        if (validate && step > currentTeacherStep) {
            for (let index = currentTeacherStep; index < step; index++) {
                const panel = form.querySelector(`[data-teacher-panel="${index}"]`);
                const inputs = Array.from(panel?.querySelectorAll("input,textarea,select") ?? []);
                const invalid = inputs.find(input => !input.disabled && !input.checkValidity());
                if (invalid) {
                    BaseDemoSI.notify("Preencha os campos obrigatórios antes de continuar.", "warning");
                    invalid.focus();
                    return;
                }
            }
        }
        currentTeacherStep = step;
        for (const panel of form.querySelectorAll("[data-teacher-panel]"))
            panel.hidden = Number(panel.dataset.teacherPanel) !== step;
        for (const control of document.querySelectorAll("[data-teacher-step]")) {
            if (Number(control.dataset.teacherStep) === step)
                control.setAttribute("aria-current", "step");
            else
                control.removeAttribute("aria-current");
        }
        const preview = el("edu-teacher-preview");
        if (preview && step === 3) {
            preview.replaceChildren();
            preview.append(text("strong", inputValue("edu-form-title") || "Título não informado"), text("p", inputValue("edu-form-description")));
            preview.append(text("p", `Tipo: ${el("edu-form-kind").value === "script" ? "Roteiro" : "Missão"}`));
            preview.append(text("p", `1. ${inputValue("edu-step-one-label")}`));
            if (el("edu-form-kind").value === "script")
                preview.append(text("p", `2. ${inputValue("edu-step-two-label")}`));
        }
    }
    function setupTeacherForm() {
        const kind = el("edu-form-kind");
        kind?.addEventListener("change", displayTeacherKind);
        for (const prefix of ["edu-step-one", "edu-step-two"]) {
            const control = el(`${prefix}-rule`);
            control?.addEventListener("change", () => {
                const min = el(`${prefix}-min`);
                min.disabled = ["manual", "selection"].includes(control.value);
                if (min.disabled)
                    min.value = "1";
            });
        }
        displayTeacherKind();
        document.querySelectorAll("[data-teacher-next],[data-teacher-previous],[data-teacher-step]").forEach(control => {
            control.addEventListener("click", () => teacherStep(Number(control.dataset.teacherNext ?? control.dataset.teacherPrevious ?? control.dataset.teacherStep)));
        });
        teacherStep(1, false);
        el("edu-teacher-form")?.addEventListener("submit", event => {
            event.preventDefault();
            const type = kind?.value;
            const created = { id: `teacher-${Date.now().toString(36)}-${(++teacherSerial).toString(36)}`, kind: type, origin: "teacher",
                title: inputValue("edu-form-title"), description: inputValue("edu-form-description"),
                steps: type === "script" ? [step("edu-step-one"), step("edu-step-two")] : [step("edu-step-one")] };
            if (!education.createActivity(created)) {
                BaseDemoSI.notify("Revise os campos: título, descrição, critérios e etapas são obrigatórios.", "warning");
                return;
            }
            el("edu-teacher-form").reset();
            displayTeacherKind();
            teacherStep(1, false);
            BaseDemoSI.notify("Atividade personalizada criada.", "success");
        });
        el("edu-export")?.addEventListener("click", () => {
            const file = new Blob([education.exportTeachers()], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(file);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "base-si-atividades-professor.json";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1200);
            BaseDemoSI.notify("Arquivo JSON preparado para download.", "success");
        });
        el("edu-import")?.addEventListener("change", async (event) => {
            const source = event.target;
            const file = source.files?.[0];
            source.value = "";
            if (!file)
                return;
            if (file.size > 65536) {
                BaseDemoSI.notify("Arquivo acima do limite de 64 KiB.", "warning");
                return;
            }
            let decoded = null;
            try {
                decoded = BaseDemoSI.parseTeacherImport(await file.text());
            }
            catch {
                decoded = null;
            }
            if (!decoded) {
                BaseDemoSI.notify("Arquivo de atividades inválido.", "warning");
                return;
            }
            const accepted = await BaseDemoSI.confirmDialog({ title: "Importar atividades?", description: "As atividades personalizadas atuais serão substituídas. O progresso dos temas e das atividades oficiais será mantido.", confirmText: "Importar atividades", destructive: true });
            if (!accepted)
                return;
            if (education.importTeachers(decoded))
                BaseDemoSI.notify("Atividades importadas e validadas.", "success");
            else
                BaseDemoSI.notify("Formato incompatível ou conteúdo inválido; nenhuma atividade foi alterada.", "warning");
        });
    }
    function setupEducation(scene) {
        educationScene = scene;
        education = BaseDemoSI.createEducationStore(BaseDemoSI.storage);
        const previous = BaseDemoSI.storage.read(guidedKey) ?? "";
        returnToActivity = validatedGuidedLink(previous)?.url ?? "";
        if (previous && !returnToActivity)
            BaseDemoSI.storage.write(guidedKey, "");
        BaseDemoSI.bindEducationForSharing(education);
        education.subscribe(() => {
            if (returnToActivity && !validatedGuidedLink(returnToActivity))
                saveGuidedReturn("");
            renderAll();
            window.dispatchEvent(new Event("si-guided-context-changed"));
        });
        scene.subscribe(() => { if (BaseDemoSI.currentRoute(window.location.hash) !== "ambiente")
            renderAll(); });
        window.addEventListener("si-education-observation", () => renderAll());
        window.addEventListener("si-route-changed", () => renderAll());
        setupTeacherForm();
        renderAll();
    }
    BaseDemoSI.setupEducation = setupEducation;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    let journal;
    let journalScene;
    let openReportId = null;
    let registered = false;
    const j = (id) => document.getElementById(id);
    function element(tag, content, className) {
        const e = document.createElement(tag);
        e.textContent = content;
        if (className)
            e.className = className;
        return e;
    }
    function action(label, callback, primary = false) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `button ${primary ? "primary" : "outline"}`;
        button.textContent = label;
        button.addEventListener("click", callback);
        return button;
    }
    function localDate(iso) {
        const [year, month, day] = iso.slice(0, 10).split("-");
        return `${day}/${month}/${year}`;
    }
    function kindName(kind) { return kind === "observacao" ? "Observação" : kind === "hipotese" ? "Hipótese" : "Conclusão"; }
    function createList(title, headings, lines) {
        const section = document.createElement("section");
        section.className = "si-report-section";
        section.append(element("h3", title));
        if (!lines.length) {
            section.append(element("p", "Nenhum registro disponível para esta seção."));
            return section;
        }
        const wrapper = document.createElement("div");
        wrapper.className = "si-report-table-wrap";
        const table = document.createElement("table");
        table.className = "si-report-table";
        const thead = document.createElement("thead"), header = document.createElement("tr");
        for (const label of headings)
            header.append(element("th", label));
        thead.append(header);
        table.append(thead);
        const tbody = document.createElement("tbody");
        for (const line of lines) {
            const tr = document.createElement("tr");
            for (const value of line)
                tr.append(element("td", value));
            tbody.append(tr);
        }
        table.append(tbody);
        wrapper.append(table);
        section.append(wrapper);
        return section;
    }
    function reportContent(report) {
        const paper = document.createElement("article");
        paper.className = "si-report-paper";
        paper.append(element("p", "BASE DEMO OFICIAL - SI · RELATÓRIO", "si-report-kicker"), element("h2", report.title));
        const subtitle = element("p", `Responsável: ${report.author || "Não informado"} · Data: ${localDate(report.sessionDate)} · Emissão: ${localDate(report.createdAt)}`);
        subtitle.className = "si-report-byline";
        paper.append(subtitle);
        if (report.objective) {
            const section = document.createElement("section");
            section.className = "si-report-section";
            section.append(element("h3", "Objetivo e descrição"), element("p", report.objective));
            paper.append(section);
        }
        if (report.options.includeScene)
            paper.append(createList("Montagem registrada", ["Objeto", "Tipo"], report.scene.map(e => [e.label, e.kind === "block" ? "Bloco" : e.kind === "circle" ? "Círculo" : "Etiqueta"])));
        if (report.options.includeReadings)
            paper.append(createList("Medições", ["Leitura", "Resultado", "Origem"], report.readings.map(r => [r.label, `${r.value} ${r.unit}`.trim(), `${r.extensionId} / ${r.instrumentId} · #${r.sequence}`])));
        if (report.options.includeNotes)
            paper.append(createList("Registros do Caderno", ["Tipo e data", "Descrição", "Referência"], report.notes.map(n => [`${kindName(n.kind)} · ${localDate(n.createdAt)}`, n.body, n.entityLabel ?? "Cena"])));
        paper.append(element("p", "Registro documental produzido localmente. Resultados científicos dependem do motor especializado conectado.", "si-report-disclaimer"));
        return paper;
    }
    function renderJournal() {
        if (!registered)
            return;
        const target = j("journal-entries");
        if (!target)
            return;
        target.replaceChildren();
        const state = journal.snapshot();
        j("journal-total").textContent = `${state.notes.length} de 80 registros`;
        j("journal-readings").textContent = `${extensionRecords().length} leituras instrumentais disponíveis`;
        if (!state.notes.length)
            target.append(element("p", "Nenhuma observação registrada. Use o formulário para iniciar o Caderno.", "si-records-empty"));
        for (const note of [...state.notes].reverse()) {
            const entry = document.createElement("article");
            entry.className = "si-journal-entry";
            const header = document.createElement("div");
            header.className = "si-journal-entry-head";
            header.append(element("strong", kindName(note.kind)), element("span", `${localDate(note.createdAt)} · ${note.entityLabel ?? "Cena"}`));
            const buttons = document.createElement("div");
            buttons.className = "si-journal-actions";
            buttons.append(action("Excluir", () => {
                void (async () => {
                    const yes = await BaseDemoSI.confirmDialog({ title: "Excluir registro?", description: "Este registro será removido do Caderno. Os relatórios já emitidos preservam suas cópias.", confirmText: "Excluir", destructive: true });
                    if (yes) {
                        if (journal.removeNote(note.id))
                            BaseDemoSI.notify("Registro removido.", "info");
                        else
                            BaseDemoSI.notify("Não foi possível excluir o registro.", "warning");
                    }
                })();
            }));
            entry.append(header, element("p", note.body), buttons);
            target.append(entry);
        }
    }
    function renderReports() {
        if (!registered)
            return;
        const state = journal.snapshot(), list = j("reports-entries"), preview = j("report-preview");
        if (!list || !preview)
            return;
        list.replaceChildren();
        preview.replaceChildren();
        j("reports-total").textContent = `${state.reports.length} de 20 relatórios`;
        if (openReportId && !state.reports.some(r => r.id === openReportId))
            openReportId = null;
        if (!openReportId)
            openReportId = state.reports[state.reports.length - 1]?.id ?? null;
        if (!state.reports.length)
            list.append(element("p", "Ainda não existem relatórios salvos.", "si-records-empty"));
        for (const report of [...state.reports].reverse()) {
            const item = document.createElement("article");
            item.className = "si-report-entry";
            if (report.id === openReportId)
                item.classList.add("is-open");
            const info = document.createElement("div");
            info.append(element("strong", report.title), element("small", `${localDate(report.sessionDate)} · ${report.author || "Sem identificação"}`));
            const actions = document.createElement("div");
            actions.className = "si-journal-actions";
            actions.append(action("Visualizar", () => { openReportId = report.id; renderReports(); }));
            actions.append(action("Excluir", () => {
                void (async () => {
                    const yes = await BaseDemoSI.confirmDialog({ title: "Excluir relatório?", description: "O relatório salvo será removido. Observações e leituras originais serão mantidas.", confirmText: "Excluir", destructive: true });
                    if (yes) {
                        if (journal.removeReport(report.id))
                            BaseDemoSI.notify("Relatório excluído.", "info");
                        else
                            BaseDemoSI.notify("Não foi possível excluir o relatório.", "warning");
                    }
                })();
            }));
            item.append(info, actions);
            list.append(item);
        }
        const selected = state.reports.find(r => r.id === openReportId);
        if (selected)
            preview.append(reportContent(selected));
        else
            preview.append(element("p", "Selecione ou crie um relatório para visualizar.", "si-records-empty"));
        for (const btnId of ["reports-print", "reports-html"]) {
            const b = j(btnId);
            if (b)
                b.disabled = !selected;
        }
    }
    function currentReport() { return journal.snapshot().reports.find(r => r.id === openReportId); }
    function exportFile(name, body, type) {
        const blob = new Blob([body], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    }
    function reportHTML(report) {
        const reportNode = reportContent(report);
        const style = `body{font:11pt/1.5 Georgia,serif;color:#1b2933;max-width:820px;margin:28px auto;padding:20px}h2{font-size:24pt}h3{font-size:13pt;margin-top:22px}p{white-space:pre-wrap;overflow-wrap:anywhere}.si-report-kicker{font:700 9pt Arial;letter-spacing:.12em}.si-report-byline{font:10pt Arial;color:#455867}table{width:100%;border-collapse:collapse;font:9pt Arial;table-layout:fixed}th,td{border:1px solid #b8c4cc;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#e7eef3}.si-report-disclaimer{font-size:9pt;margin-top:26px;border-top:1px solid #aebbc5;padding-top:10px}@page{size:A4;margin:15mm}`;
        return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório local</title><style>${style}</style></head><body>${reportNode.outerHTML}</body></html>`;
    }
    function configure() {
        j("journal-form")?.addEventListener("submit", event => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = { kind: j("journal-kind").value, body: j("journal-body").value.trim() };
            if (journal.addNote(data, journalScene.getSnapshot())) {
                form.reset();
                BaseDemoSI.notify("Registro adicionado ao Caderno.", "success");
            }
            else
                BaseDemoSI.notify("Não foi possível salvar. Verifique os campos ou o espaço disponível no navegador.", "warning");
        });
        j("reports-form")?.addEventListener("submit", event => {
            event.preventDefault();
            const i = (id) => j(id).value.trim();
            const checked = (id) => j(id).checked;
            const draft = { title: i("report-title"), author: i("report-author"), sessionDate: i("report-date"), objective: i("report-objective"),
                includeScene: checked("report-scene"), includeNotes: checked("report-notes"), includeReadings: checked("report-readings") };
            if (journal.makeReport(draft, journalScene.getSnapshot(), extensionRecords())) {
                openReportId = null;
                renderReports();
                BaseDemoSI.notify("Relatório criado com uma cópia dos registros selecionados.", "success");
            }
            else
                BaseDemoSI.notify("Relatório não salvo. Revise os campos, os limites ou o armazenamento local.", "warning");
        });
        const date = j("report-date");
        if (date && !date.value)
            date.value = (() => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); })();
        j("journal-export")?.addEventListener("click", () => exportFile("base-si-caderno-backup.json", journal.exportJSON(), "application/json;charset=utf-8"));
        j("journal-import")?.addEventListener("change", event => {
            void (async () => {
                const field = event.currentTarget, file = field.files?.[0];
                field.value = "";
                if (!file)
                    return;
                if (file.size > 300000) {
                    BaseDemoSI.notify("Arquivo acima do limite de importação.", "warning");
                    return;
                }
                let decoded = null;
                try {
                    decoded = BaseDemoSI.parseJournalImport(await file.text());
                }
                catch {
                    decoded = null;
                }
                if (!decoded || !BaseDemoSI.parseJournal(decoded.document) || decoded.format !== "base-demo-si-journal-v1") {
                    BaseDemoSI.notify("Arquivo incompatível ou inválido. O Caderno não foi alterado.", "warning");
                    return;
                }
                const yes = await BaseDemoSI.confirmDialog({ title: "Restaurar Caderno e relatórios?", description: "O conteúdo atual do Caderno e os relatórios salvos serão substituídos. Cena, extensões e atividades não serão alteradas.", confirmText: "Restaurar backup", destructive: true });
                if (yes) {
                    if (journal.importJSON(decoded)) {
                        openReportId = null;
                        BaseDemoSI.notify("Backup restaurado com validação.", "success");
                    }
                    else
                        BaseDemoSI.notify("Não foi possível restaurar o arquivo.", "warning");
                }
            })();
        });
        j("reports-print")?.addEventListener("click", () => {
            const report = currentReport(), sheet = j("si-print-sheet");
            if (!report || !sheet)
                return;
            sheet.replaceChildren(reportContent(report));
            sheet.hidden = false;
            window.print();
        });
        window.addEventListener("afterprint", () => { const sheet = j("si-print-sheet"); if (sheet) {
            sheet.hidden = true;
            sheet.replaceChildren();
        } });
        j("reports-html")?.addEventListener("click", () => {
            const report = currentReport();
            if (!report)
                return;
            exportFile(`base-si-relatorio-${report.id}.html`, reportHTML(report), "text/html;charset=utf-8");
            BaseDemoSI.notify("Relatório HTML autocontido preparado.", "success");
        });
    }
    function extensionRecords() { return BaseDemoSI.extensionGetRecords(); }
    BaseDemoSI.extensionRecords = extensionRecords;
    function setupJournal(scene) {
        if (registered)
            return;
        registered = true;
        journalScene = scene;
        journal = BaseDemoSI.createJournalStore(BaseDemoSI.storage);
        journal.subscribe(() => { renderJournal(); renderReports(); });
        window.addEventListener("si-education-observation", () => renderJournal());
        window.addEventListener("si-route-changed", () => { renderJournal(); renderReports(); });
        configure();
        renderJournal();
        renderReports();
    }
    BaseDemoSI.setupJournal = setupJournal;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    BaseDemoSI.manualTopics = Object.freeze([
        { id: "inicio", title: "Primeiros passos", routes: ["inicio"], paragraphs: ["A página inicial organiza os recursos locais. Abra Ambiente para interagir com uma cena neutra.", "A navegação usa seções independentes e mantém os dados desta instalação no navegador."] },
        { id: "bancada", title: "Bancada, docas e foco", routes: ["ambiente"], paragraphs: ["Em Montagem, crie e selecione objetos. Foco destaca o selecionado; Visão geral exibe o conjunto.", "No celular, Montagem, Ver e Dados abrem como folhas inferiores. Escape fecha painéis e diálogos."] },
        { id: "modulos", title: "Módulos configuráveis", routes: ["ambiente", "configuracoes"], paragraphs: ["Livre habilita todos os recursos; Explorar oferece manipulação e observação; Medir apresenta instrumentos; Calcular expõe análise genérica.", "Módulos limitam controles disponíveis na interface. Não substituem validação científica nem mecanismos de segurança de acesso."] },
        { id: "instrumentos", title: "Ferramentas e instrumentos", routes: ["ambiente"], paragraphs: ["Ferramentas alteram a cena; instrumentos registram leituras. A extensão ativa é escolhida nos Ajustes da doca Montagem.", "O painel Ver possui visualizações conectáveis de observação, medição e análise. Dados oferece histórico das leituras."] },
        { id: "aprendizagem", title: "Aprender, Missões e Roteiros", routes: ["aprender", "missoes", "roteiros"], paragraphs: ["Aprender apresenta temas com marcação de leitura concluída. Missões e Roteiros verificam condições da cena ou a confirmação manual.", "O botão Montar na bancada abre o ambiente; depois, retorne à atividade para conferir cada etapa."] },
        { id: "professor", title: "Atividades do professor e links", routes: ["professor", "missoes", "roteiros"], paragraphs: ["A Área do Professor cria atividades locais, exporta ou importa JSON e gera links autocontidos para uma atividade.", "O link de consulta não autoriza executar; o link de execução permite criar uma cópia local da atividade. Não há autenticação, restrição criptográfica ou controle remoto de estudantes."] },
        { id: "registros", title: "Caderno e relatórios", routes: ["caderno", "relatorios"], paragraphs: ["O Caderno reúne observações, hipóteses e conclusões. Relatórios capturam uma cópia da cena e dos registros no momento da criação.", "Os registros podem ser exportados em JSON, e os relatórios em HTML autocontido, prontos para impressão."] },
        { id: "offline", title: "Trabalhar sem internet", routes: ["configuracoes"], paragraphs: ["O standalone é um arquivo HTML com recursos incorporados. A PWA necessita de instalação e cache inicial em origem segura.", "Prefira backups JSON para garantir portabilidade. O armazenamento depende das permissões e dos limites do navegador."] },
        { id: "acessibilidade", title: "Teclado e acessibilidade", routes: ["configuracoes", "ambiente"], paragraphs: ["Use Tab para navegar, Escape para fechar painéis, as setas para deslocar o objeto selecionado e Ctrl/⌘+Z para desfazer.", "A interface adapta-se a diferentes larguras e respeita a redução de movimento configurada no dispositivo."] }
    ]);
    function searchManual(query, route) {
        const clean = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim().slice(0, 100);
        return BaseDemoSI.manualTopics.filter(topic => {
            if (route && !topic.routes.includes(route))
                return false;
            if (!clean)
                return true;
            const full = [topic.title, ...topic.paragraphs].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
            return full.includes(clean);
        });
    }
    BaseDemoSI.searchManual = searchManual;
    function manualElement(tag, content) { const n = document.createElement(tag); n.textContent = content; return n; }
    function manualSelectedTopic() {
        return new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("topic") ?? "";
    }
    function renderManual() {
        const list = document.getElementById("manual-topics"), count = document.getElementById("manual-results-count"), index = document.getElementById("manual-index");
        if (!list)
            return;
        const input = document.getElementById("manual-search");
        const searching = !!input?.value.trim();
        const results = searchManual(input?.value ?? "");
        const selected = manualSelectedTopic();
        list.replaceChildren();
        index?.replaceChildren();
        if (index) {
            index.append(manualElement("h2", "Índice do Manual"));
            const group = document.createElement("div");
            group.className = "si-manual-index-links";
            for (const topic of results) {
                const link = document.createElement("a");
                link.href = `#/manual?topic=${encodeURIComponent(topic.id)}`;
                link.textContent = topic.title;
                if (selected === topic.id)
                    link.setAttribute("aria-current", "true");
                group.append(link);
            }
            index.append(group);
        }
        for (const topic of results) {
            const article = document.createElement("article");
            article.className = "card si-manual-topic";
            article.id = "manual-" + topic.id;
            const details = document.createElement("details");
            details.open = searching || selected === topic.id;
            details.append(manualElement("summary", topic.title));
            for (const paragraph of topic.paragraphs)
                details.append(manualElement("p", paragraph));
            article.append(details);
            list.append(article);
        }
        if (count)
            count.textContent = `${results.length} de ${BaseDemoSI.manualTopics.length} orientações`;
        if (!results.length)
            list.append(manualElement("p", "Nenhuma orientação encontrada. Tente outro termo."));
    }
    function setupManual() {
        document.getElementById("manual-search")?.addEventListener("input", renderManual);
        window.addEventListener("si-route-changed", () => { if (BaseDemoSI.currentRoute(window.location.hash) === "manual")
            renderManual(); });
        document.addEventListener("keydown", event => {
            if (event.key !== "F1" || event.altKey || event.ctrlKey || event.metaKey || BaseDemoSI.isPlatformDialogOpen())
                return;
            event.preventDefault();
            const current = BaseDemoSI.currentRoute(window.location.hash);
            const topic = BaseDemoSI.manualTopics.find(t => t.routes.includes(current))?.id ?? "inicio";
            window.location.hash = `#/manual?topic=${topic}`;
        });
        document.getElementById("manual-index")?.addEventListener("click", event => {
            const link = event.target.closest("a");
            if (!link)
                return;
            // A mudança de hash conserva a seção e seleciona o item no índice.
            window.setTimeout(() => document.getElementById("manual-" + manualSelectedTopic())?.querySelector("summary")?.focus({ preventScroll: true }), 0);
        });
        renderManual();
    }
    BaseDemoSI.setupManual = setupManual;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const MAX_SHARE_CHARS = 12000;
    function encodeSharedActivity(activity, permission) {
        if (!BaseDemoSI.validTeacherActivity(activity) || !(permission === "view" || permission === "run"))
            return null;
        const text = JSON.stringify({ format: "base-si-link-v1", permission, activity });
        if (text.length > 6000)
            return null;
        const bytes = new TextEncoder().encode(text);
        let binary = "";
        for (const v of bytes)
            binary += String.fromCharCode(v);
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    BaseDemoSI.encodeSharedActivity = encodeSharedActivity;
    function decodeSharedActivity(encoded) {
        if (encoded.length < 10 || encoded.length > MAX_SHARE_CHARS || !/^[a-zA-Z0-9_-]+$/.test(encoded))
            return null;
        try {
            const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
            const binary = atob(normalized);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
            const object = JSON.parse(text);
            if (object.format !== "base-si-link-v1" || !(object.permission === "view" || object.permission === "run") || !BaseDemoSI.validTeacherActivity(object.activity))
                return null;
            if (encodeSharedActivity(object.activity, object.permission) !== encoded)
                return null;
            return { format: "base-si-link-v1", permission: object.permission, activity: object.activity };
        }
        catch {
            return null;
        }
    }
    BaseDemoSI.decodeSharedActivity = decodeSharedActivity;
    function buildShareLink(activity, permission, base) {
        const token = encodeSharedActivity(activity, permission);
        if (!token)
            return null;
        return base.split("#")[0] + `#/` + (activity.kind === "mission" ? "missoes" : "roteiros") + `?share=${token}`;
    }
    BaseDemoSI.buildShareLink = buildShareLink;
    function parseShareHash(hash) {
        const match = hash.match(/^#\/(?:missoes|roteiros)\?share=([a-zA-Z0-9_-]+)$/);
        if (!match)
            return null;
        const decoded = decodeSharedActivity(match[1]);
        if (!decoded)
            return null;
        const route = BaseDemoSI.currentRoute(hash);
        return decoded.activity.kind === (route === "missoes" ? "mission" : "script") ? decoded : null;
    }
    function renderShare() {
        const route = BaseDemoSI.currentRoute(window.location.hash);
        for (const id of ["si-shared-activity", "si-shared-mission"]) {
            const el = document.getElementById(id);
            if (el) {
                el.hidden = true;
                el.replaceChildren();
            }
        }
        if (route !== "roteiros" && route !== "missoes")
            return;
        const element = document.getElementById(route === "roteiros" ? "si-shared-activity" : "si-shared-mission");
        if (!element)
            return;
        const shared = parseShareHash(window.location.hash);
        if (!window.location.hash.includes("share="))
            return;
        element.hidden = false;
        const text = (tag, s) => { const n = document.createElement(tag); n.textContent = s; return n; };
        if (!shared) {
            element.append(text("h2", "Link de atividade inválido"), text("p", "O conteúdo não passou na validação ou é incompatível."));
            return;
        }
        const activity = shared.activity;
        element.append(text("p", "Atividade compartilhada · " + (shared.permission === "view" ? "Somente consulta" : "Execução local permitida")), text("h2", activity.title), text("p", activity.description));
        const ol = document.createElement("ol");
        for (const step of activity.steps)
            ol.append(text("li", step.label));
        element.append(ol);
        element.append(text("p", "A atividade foi incorporada ao endereço. Nenhuma informação foi enviada a terceiros. Permissões sem autenticação são apenas controles de interface."));
        if (shared.permission === "run") {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button primary";
            button.textContent = "Adicionar cópia local para executar";
            button.addEventListener("click", () => {
                const existing = educationSharePort?.snapshot().teacherActivities.some(a => a.id === activity.id);
                if (existing) {
                    BaseDemoSI.notify("Esta atividade já está na biblioteca local.", "info");
                    button.disabled = true;
                    button.textContent = "Atividade já disponível";
                    return;
                }
                // Generate collision-resistant local ID without changing the imported content.
                const clone = { ...activity, id: `teacher-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e8).toString(36)}` };
                if (educationSharePort?.createActivity(clone)) {
                    BaseDemoSI.notify("Cópia local adicionada. Continue pela lista de atividades.", "success");
                    button.disabled = true;
                    button.textContent = "Cópia adicionada";
                }
                else
                    BaseDemoSI.notify("Não foi possível adicionar a atividade. Confira o limite da biblioteca.", "warning");
            });
            element.append(button);
        }
    }
    let educationSharePort = null;
    function bindEducationForSharing(port) { educationSharePort = port; }
    BaseDemoSI.bindEducationForSharing = bindEducationForSharing;
    function setupSharedActivities() {
        const share = document.getElementById("si-sharing-link");
        document.getElementById("si-sharing-copy")?.addEventListener("click", async () => {
            if (!share?.value)
                return;
            try {
                await navigator.clipboard.writeText(share.value);
                BaseDemoSI.notify("Link copiado.", "success");
            }
            catch {
                share.focus();
                share.select();
                BaseDemoSI.notify("Selecione e copie o link manualmente.", "info");
            }
        });
        window.addEventListener("si-route-changed", renderShare);
        window.addEventListener("hashchange", renderShare);
        renderShare();
    }
    BaseDemoSI.setupSharedActivities = setupSharedActivities;
    function offerShareLink(activity) {
        const select = document.getElementById("si-sharing-mode");
        const permission = select?.value === "run" ? "run" : "view";
        const link = buildShareLink(activity, permission, window.location.href);
        const input = document.getElementById("si-sharing-link");
        if (input)
            input.value = link ?? "";
        const status = document.getElementById("si-sharing-status");
        if (status)
            status.textContent = link ? `Link de ${permission === "view" ? "consulta" : "execução local"} pronto para copiar.` : "Não foi possível criar este link.";
    }
    BaseDemoSI.offerShareLink = offerShareLink;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const precacheFiles = [
        "./", "./index.html", "./app.js", "./app.css", "./workspace.css",
        "./components.css", "./mobile-contract.css", "./extensions.css", "./education.css", "./records.css",
        "./distribution.css", "./inspection.css", "./completion.css", "./organization.css", "./environment-organization.css", "./menu-fidelity.css", "./menu-review.css", "./home-fidelity.css", "./home-context.css", "./manifest.webmanifest", "./assets/icon.svg",
        "./assets/icon-192.png", "./assets/icon-512.png", "./assets/apple-touch-icon.png", "./assets/menu-icons/mount.svg", "./assets/menu-icons/eye.svg", "./assets/menu-icons/report.svg"
    ];
    let installPrompt = null;
    let changingController = false;
    function updateStatus(message) {
        const target = document.getElementById("distribution-status");
        if (target)
            target.textContent = message;
    }
    function setInstallVisible(visible) {
        const control = document.getElementById("distribution-install");
        if (control)
            control.hidden = !visible;
        const menuControl = document.getElementById("si-drawer-install");
        if (menuControl)
            menuControl.hidden = !visible;
    }
    function setupDistribution() {
        window.addEventListener("beforeinstallprompt", event => {
            event.preventDefault();
            installPrompt = event;
            setInstallVisible(true);
        });
        window.addEventListener("appinstalled", () => {
            installPrompt = null;
            setInstallVisible(false);
            updateStatus("Aplicativo instalado. O uso offline depende da conclusão do cache inicial.");
            BaseDemoSI.notify("Aplicativo instalado.", "success");
        });
        document.getElementById("distribution-install")?.addEventListener("click", async () => {
            const current = installPrompt;
            if (!current)
                return;
            installPrompt = null;
            setInstallVisible(false);
            try {
                await current.prompt();
                const choice = await current.userChoice;
                if (choice.outcome === "dismissed")
                    updateStatus("Instalação cancelada. A aplicação permanece acessível pelo navegador.");
            }
            catch {
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
            }
            catch {
                updateStatus("A verificação da instalação offline não pôde ser concluída.");
            }
        }).catch(() => {
            updateStatus("Não foi possível registrar a PWA. A interface permanece utilizável com os arquivos locais.");
        });
    }
    BaseDemoSI.setupDistribution = setupDistribution;
    async function verifyOfflineAssets(showNotice = true) {
        if (window.location.protocol === "file:") {
            updateStatus("Modo arquivo local: o pacote standalone usa CSS, JavaScript, ícones e dados embutidos, sem arquivos externos.");
            if (showNotice)
                BaseDemoSI.notify("Standalone autocontido: sem cache PWA necessário.", "info");
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
            const cache = await caches.open(`base-demo-si-v${BaseDemoSI.manifest.version}`);
            let found = 0;
            for (const path of precacheFiles) {
                if (await cache.match(new URL(path, document.baseURI).href))
                    found++;
            }
            const complete = found === precacheFiles.length;
            updateStatus(complete
                ? `Cache offline preparado: ${found}/${precacheFiles.length} recursos locais presentes. A instalação não depende de servidores externos.`
                : `Cache offline incompleto: ${found}/${precacheFiles.length} recursos presentes. Conecte-se novamente antes de trabalhar desconectado.`);
            if (showNotice)
                BaseDemoSI.notify(complete ? "Recursos offline conferidos." : "O cache ainda não está completo.", complete ? "success" : "warning");
            return complete;
        }
        catch {
            updateStatus("Não foi possível acessar o cache. Confira as permissões do navegador.");
            if (showNotice)
                BaseDemoSI.notify("Não foi possível verificar o cache local.", "warning");
            return false;
        }
    }
    BaseDemoSI.verifyOfflineAssets = verifyOfflineAssets;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    const projectKey = "scene-project-v1";
    let store;
    let serial = 0;
    const get = (id) => document.getElementById(id);
    const selected = () => {
        const snap = store.getSnapshot();
        return snap.entities.find(e => e.id === snap.selectedId);
    };
    function announce(message) { const el = get("scene-feedback"); if (el)
        el.textContent = message; }
    function save() {
        if (!BaseDemoSI.storage.write(projectKey, BaseDemoSI.serializeScene(store.getSnapshot()))) {
            announce("Alteração aplicada, mas o navegador não permitiu salvá-la. Não feche esta sessão.");
        }
        else
            announce("Projeto salvo automaticamente neste navegador.");
    }
    function freshId() {
        let id = "";
        const known = new Set(store.getSnapshot().entities.map(e => e.id));
        do {
            id = `obj-${Date.now().toString(36)}-${(++serial).toString(36)}`;
        } while (known.has(id));
        return id;
    }
    function render() {
        const snap = store.getSnapshot();
        const board = get("scene-objects");
        if (!board)
            return;
        board.replaceChildren();
        for (const e of snap.entities) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "scene-entity";
            button.classList.add(`entity-${e.kind}`, `tone-${e.tone}`);
            if (e.id === snap.selectedId)
                button.classList.add("is-selected");
            button.hidden = snap.selectedId !== null && e.id !== snap.selectedId;
            button.dataset.entityId = e.id;
            button.style.left = `${e.x}%`;
            button.style.top = `${e.y}%`;
            button.style.width = `${e.width}%`;
            button.style.height = `${e.height}%`;
            button.setAttribute("aria-label", `${e.label}, ${e.kind === "block" ? "bloco" : e.kind === "circle" ? "círculo" : "etiqueta"}`);
            button.setAttribute("aria-pressed", String(e.id === snap.selectedId));
            const span = document.createElement("span");
            span.textContent = e.label;
            button.append(span);
            button.addEventListener("click", () => store.select(e.id));
            attachDirectManipulation(button, e, board);
            button.addEventListener("keydown", event => {
                const moves = { ArrowUp: [0, -2], ArrowDown: [0, 2], ArrowLeft: [-2, 0], ArrowRight: [2, 0] };
                const delta = moves[event.key];
                if (!delta || event.altKey || event.ctrlKey || event.metaKey)
                    return;
                event.preventDefault();
                if (!BaseDemoSI.sceneManipulationAllowed()) {
                    announce("Manipulação indisponível no módulo atual.");
                    return;
                }
                move(e.id, delta[0], delta[1]);
                board.querySelector(`[data-entity-id="${e.id}"]`)?.focus();
            });
            board.append(button);
        }
        const empty = get("scene-empty");
        if (empty)
            empty.hidden = snap.entities.length > 0;
        const counter = get("scene-count");
        if (counter)
            counter.textContent = `${snap.entities.length} / 60 objetos`;
        const undoButton = get("scene-undo");
        const redoButton = get("scene-redo");
        if (undoButton)
            undoButton.disabled = !store.canUndo();
        if (redoButton)
            redoButton.disabled = !store.canRedo();
        const clearButton = get("scene-clear");
        if (clearButton)
            clearButton.disabled = !snap.entities.length || !BaseDemoSI.sceneManipulationAllowed();
        const compactClear = get("si-compact-clear");
        if (compactClear)
            compactClear.disabled = !snap.entities.length || !BaseDemoSI.sceneManipulationAllowed();
        const inspector = get("object-inspector");
        if (inspector)
            inspector.hidden = !snap.selectedId;
        const noSelection = get("no-selection");
        if (noSelection)
            noSelection.hidden = !!snap.selectedId;
        const entity = selected();
        const canEdit = BaseDemoSI.sceneManipulationAllowed();
        for (const id of ["object-label", "object-tone", "scene-delete"]) {
            const input = get(id);
            if (input)
                input.disabled = !canEdit || !entity;
        }
        for (const btn of document.querySelectorAll("[data-move]"))
            btn.disabled = !canEdit || !entity;
        BaseDemoSI.renderWorkspaceContent(snap);
        BaseDemoSI.renderExtensions(snap);
        BaseDemoSI.renderViewers(snap);
        if (entity) {
            const field = get("object-label");
            const tone = get("object-tone");
            if (field && document.activeElement !== field)
                field.value = entity.label;
            if (tone)
                tone.value = entity.tone;
            const xy = get("object-position");
            if (xy)
                xy.textContent = `X: ${entity.x}% · Y: ${entity.y}%`;
            const objectType = get("object-type");
            if (objectType)
                objectType.textContent =
                    entity.kind === "block" ? "Bloco" : entity.kind === "circle" ? "Círculo" : "Etiqueta";
        }
    }
    /**
     * Manipulação por ponteiro: atualiza visualmente durante o gesto e confirma
     * uma única mudança ao soltar, preservando uma única posição no histórico.
     * A captura é restrita ao próprio objeto para não interceptar a rolagem da cena.
     */
    function attachDirectManipulation(button, entity, board) {
        button.addEventListener("pointerdown", event => {
            if (!event.isPrimary || event.button !== 0 || !BaseDemoSI.sceneManipulationAllowed())
                return;
            const rect = board.getBoundingClientRect();
            if (!(rect.width > 0 && rect.height > 0))
                return;
            const pointerId = event.pointerId, startX = event.clientX, startY = event.clientY;
            let moved = false, done = false;
            const movePointer = (ev) => {
                if (ev.pointerId !== pointerId || done)
                    return;
                const dx = ev.clientX - startX, dy = ev.clientY - startY;
                if (!moved && Math.hypot(dx, dy) < 5)
                    return;
                moved = true;
                const pos = BaseDemoSI.moveEntityByPixels(entity, dx, dy, rect.width, rect.height);
                if (!pos)
                    return;
                button.style.left = `${pos.x}%`;
                button.style.top = `${pos.y}%`;
                button.classList.add("is-dragging");
            };
            const finish = (ev) => {
                if (ev.pointerId !== pointerId || done)
                    return;
                done = true;
                button.removeEventListener("pointermove", movePointer);
                button.removeEventListener("pointerup", finish);
                button.removeEventListener("pointercancel", cancel);
                if (button.hasPointerCapture(pointerId))
                    button.releasePointerCapture(pointerId);
                if (!moved || !BaseDemoSI.sceneManipulationAllowed())
                    return;
                const pos = BaseDemoSI.moveEntityByPixels(entity, ev.clientX - startX, ev.clientY - startY, rect.width, rect.height);
                if (pos && store.dispatch({ type: "update", id: entity.id, changes: pos })) {
                    store.select(entity.id);
                    announce(`Objeto ${entity.label} reposicionado.`);
                }
                else
                    render();
                get("scene-objects")?.querySelector(`[data-entity-id="${entity.id}"]`)?.focus({ preventScroll: true });
            };
            const cancel = (ev) => {
                if (ev.pointerId !== pointerId || done)
                    return;
                done = true;
                button.removeEventListener("pointermove", movePointer);
                button.removeEventListener("pointerup", finish);
                button.removeEventListener("pointercancel", cancel);
                if (button.hasPointerCapture(pointerId))
                    button.releasePointerCapture(pointerId);
                button.classList.remove("is-dragging");
                button.style.left = `${entity.x}%`;
                button.style.top = `${entity.y}%`;
            };
            button.addEventListener("pointermove", movePointer);
            button.addEventListener("pointerup", finish);
            button.addEventListener("pointercancel", cancel);
            button.setPointerCapture(pointerId);
        });
    }
    function move(id, dx, dy) {
        if (!BaseDemoSI.sceneManipulationAllowed())
            return;
        const e = store.getSnapshot().entities.find(item => item.id === id);
        if (!e)
            return;
        const x = Math.max(e.width / 2, Math.min(100 - e.width / 2, e.x + dx));
        const y = Math.max(e.height / 2, Math.min(100 - e.height / 2, e.y + dy));
        store.dispatch({ type: "update", id, changes: { x, y } });
    }
    function setupScene() {
        let initial = null;
        const raw = BaseDemoSI.storage.read(projectKey);
        if (raw !== null) {
            try {
                initial = BaseDemoSI.parseScene(JSON.parse(raw));
            }
            catch {
                initial = null;
            }
        }
        store = BaseDemoSI.createSceneStore(initial);
        store.subscribe(event => { render(); if (event !== "selection")
            save(); });
        BaseDemoSI.setupWorkspace(() => store.getSnapshot(), id => store.select(id));
        window.addEventListener("si-module-change", render);
        BaseDemoSI.setupExtensions(store);
        BaseDemoSI.setupViewers(() => store.getSnapshot());
        BaseDemoSI.setupEducation(store);
        BaseDemoSI.setupJournal(store);
        BaseDemoSI.setupPresets(store);
        for (const button of document.querySelectorAll("[data-add-kind]")) {
            button.addEventListener("click", () => {
                const kind = button.dataset.addKind;
                const snap = store.getSnapshot();
                const created = store.dispatch({ type: "add", entity: BaseDemoSI.makeEntity(kind, freshId(), snap.entities.length) });
                if (!created) {
                    announce("Limite de 60 objetos atingido.");
                    BaseDemoSI.notify("Limite de 60 objetos atingido.", "warning");
                }
                else
                    BaseDemoSI.notify("Objeto adicionado à cena.", "success");
            });
        }
        get("scene-undo")?.addEventListener("click", () => { if (store.undo())
            BaseDemoSI.notify("Última alteração desfeita."); });
        get("scene-redo")?.addEventListener("click", () => { if (store.redo())
            BaseDemoSI.notify("Alteração refeita."); });
        get("scene-clear")?.addEventListener("click", async () => {
            if (!BaseDemoSI.sceneManipulationAllowed())
                return;
            const total = store.getSnapshot().entities.length;
            if (!total)
                return;
            const accepted = await BaseDemoSI.confirmDialog({ title: "Limpar cena?", description: `Os ${total} objetos serão removidos. Esta ação pode ser desfeita pelo histórico da sessão.`, confirmText: "Limpar cena", destructive: true });
            if (accepted && store.dispatch({ type: "clear" }))
                BaseDemoSI.notify("Cena limpa. Use Desfazer para recuperar.", "warning");
        });
        BaseDemoSI.setupActionMenu("scene-menu-toggle", "scene-tools-menu", action => {
            if (action === "clear") {
                get("scene-clear")?.click();
                return;
            }
            if (action === "help") {
                void BaseDemoSI.confirmDialog({ title: "Atalhos disponíveis", description: "Arrastar: mover objeto com mouse ou toque.\nSetas: mover o objeto focado.\nCtrl/⌘ + Z: desfazer.\nCtrl/⌘ + Shift + Z: refazer.\nEscape: fechar menus, diálogos e docas.\nTab: navegar pelos controles.", confirmText: "Entendi", cancelText: "Fechar" });
                return;
            }
            if (!BaseDemoSI.moduleAllows("tools")) {
                BaseDemoSI.notify("A criação de objetos não está disponível neste módulo.", "warning");
                return;
            }
            const kind = action === "add-block" ? "block" : action === "add-circle" ? "circle" : action === "add-label" ? "label" : null;
            if (!kind)
                return;
            const snap = store.getSnapshot();
            if (store.dispatch({ type: "add", entity: BaseDemoSI.makeEntity(kind, freshId(), snap.entities.length) }))
                BaseDemoSI.notify("Objeto adicionado à cena.", "success");
            else
                BaseDemoSI.notify("Não foi possível adicionar o objeto.", "warning");
        });
        get("scene-delete")?.addEventListener("click", () => {
            if (!BaseDemoSI.sceneManipulationAllowed())
                return;
            const e = selected();
            if (e && store.dispatch({ type: "remove", id: e.id }))
                BaseDemoSI.notify("Objeto excluído. A ação pode ser desfeita.", "info");
        });
        get("object-label")?.addEventListener("change", event => {
            if (!BaseDemoSI.sceneManipulationAllowed())
                return;
            const e = selected();
            if (!e)
                return;
            const input = event.currentTarget;
            const label = input.value.trim();
            if (!label || label.length > 64) {
                input.value = e.label;
                announce("Use um nome entre 1 e 64 caracteres.");
                return;
            }
            if (store.dispatch({ type: "update", id: e.id, changes: { label } }))
                BaseDemoSI.notify("Nome do objeto atualizado.", "success");
        });
        get("object-tone")?.addEventListener("change", event => {
            if (!BaseDemoSI.sceneManipulationAllowed())
                return;
            const e = selected();
            if (!e)
                return;
            const tone = event.currentTarget.value;
            if (store.dispatch({ type: "update", id: e.id, changes: { tone } }))
                BaseDemoSI.notify("Aparência do objeto atualizada.", "success");
        });
        for (const button of document.querySelectorAll("[data-move]")) {
            button.addEventListener("click", () => {
                const e = selected();
                if (!e)
                    return;
                const step = { up: [0, -2], down: [0, 2], left: [-2, 0], right: [2, 0] };
                const delta = step[button.dataset.move ?? ""];
                if (delta)
                    move(e.id, ...delta);
            });
        }
        get("scene-objects")?.addEventListener("click", event => {
            if (event.target === event.currentTarget)
                store.select(null);
        });
        document.addEventListener("keydown", event => {
            const element = event.target;
            if (element?.matches("input,select,textarea,[contenteditable]") || BaseDemoSI.isPlatformDialogOpen())
                return;
            const accel = event.ctrlKey || event.metaKey;
            if (!accel || event.altKey || event.key.toLowerCase() !== "z")
                return;
            event.preventDefault();
            if (event.shiftKey)
                store.redo();
            else
                store.undo();
        });
        render();
        if (raw !== null && !initial)
            announce("Projeto salvo inválido ou incompatível; uma cena vazia foi aberta sem sobrescrever os dados anteriores.");
        else if (initial)
            announce("Projeto local restaurado.");
    }
    BaseDemoSI.setupScene = setupScene;
})(BaseDemoSI || (BaseDemoSI = {}));
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Indicadores reais do catálogo, sem conteúdo disciplinar na Home. */
    function updateHomeIndicators() {
        const setText = (id, text) => { const node = document.getElementById(id); if (node)
            node.textContent = text; };
        const officialMissions = BaseDemoSI.officialActivities.filter(a => a.kind === "mission").length;
        const officialScripts = BaseDemoSI.officialActivities.filter(a => a.kind === "script").length;
        let saved = null;
        let journal = null;
        try {
            const value = BaseDemoSI.storage.read("education-document-v1");
            if (value)
                saved = BaseDemoSI.parseEducation(JSON.parse(value));
        }
        catch { /* Sem dados acessíveis: catálogo ainda funciona. */ }
        try {
            const value = BaseDemoSI.storage.read("journal-document-v1");
            if (value)
                journal = BaseDemoSI.parseJournal(JSON.parse(value));
        }
        catch { /* Falha de armazenamento não bloqueia a Home. */ }
        const topicsDone = saved?.topicsDone.length ?? 0;
        const extraMissions = saved?.teacherActivities.filter(a => a.kind === "mission").length ?? 0;
        const extraScripts = saved?.teacherActivities.filter(a => a.kind === "script").length ?? 0;
        const notes = journal?.notes.length ?? 0;
        setText("si-home-learning-meta", `${BaseDemoSI.learningTopics.length} temas · ${topicsDone} concluído${topicsDone === 1 ? "" : "s"}`);
        setText("si-home-missions-meta", `${officialMissions + extraMissions} desafios para investigar`);
        setText("si-home-scripts-meta", `${officialScripts + extraScripts} investigações orientadas`);
        setText("si-home-notebook-meta", notes ? `${notes} registro${notes === 1 ? "" : "s"} salvo${notes === 1 ? "" : "s"}` : "Pronto para seus registros");
        const active = BaseDemoSI.guidedActivityContext();
        const resume = document.getElementById("si-home-resume");
        const resumeLink = document.getElementById("si-home-resume-link");
        const benchLink = document.getElementById("si-home-resume-bench");
        if (resume)
            resume.hidden = !active;
        if (active) {
            setText("si-home-resume-title", active.title);
            setText("si-home-resume-meta", `${active.kind === "mission" ? "Missão" : "Roteiro"} · ${Math.min(active.progress, active.total)}/${active.total} etapa(s) ${active.progress >= active.total ? "concluídas" : "registradas"}`);
            if (resumeLink) {
                resumeLink.href = active.url;
                resumeLink.textContent = active.progress >= active.total ? "Rever atividade" : "Retomar atividade";
            }
            if (benchLink)
                benchLink.href = "#/ambiente";
        }
        let scene = null;
        try {
            const raw = BaseDemoSI.storage.read("scene-project-v1");
            if (raw)
                scene = BaseDemoSI.parseScene(JSON.parse(raw));
        }
        catch { /* Projeto não válido: nenhuma retomada é exibida. */ }
        const count = scene?.entities.length ?? 0;
        const sceneInfo = document.getElementById("si-home-scene-summary");
        if (sceneInfo) {
            sceneInfo.hidden = count === 0;
            sceneInfo.textContent = count === 1 ? "1 objeto salvo na bancada" : `${count} objetos salvos na bancada`;
        }
    }
    BaseDemoSI.updateHomeIndicators = updateHomeIndicators;
    function setupHome() {
        let pendingFromHome = null;
        window.addEventListener("si-route-changed", () => {
            const current = BaseDemoSI.currentRoute(window.location.hash);
            if (current === "inicio")
                updateHomeIndicators();
            if (current !== pendingFromHome)
                return;
            pendingFromHome = null;
            // Atualizar a rota antes de mover o foco: cabeçalhos ocultos não recebem foco.
            window.requestAnimationFrame(() => {
                const view = document.querySelector(`[data-view="${current}"]`);
                const heading = view?.querySelector("h1,h2");
                if (heading) {
                    heading.tabIndex = -1;
                    heading.focus({ preventScroll: true });
                }
                else
                    document.getElementById("conteudo")?.focus({ preventScroll: true });
            });
        });
        window.addEventListener("si-guided-context-changed", () => {
            if (BaseDemoSI.currentRoute(window.location.hash) === "inicio")
                updateHomeIndicators();
        });
        // O clique apenas marca o destino; a restauração de foco aguarda a rota realmente visível.
        document.querySelectorAll(".si-home-family a[href^='#/']").forEach(link => {
            link.addEventListener("click", () => {
                const next = BaseDemoSI.currentRoute(link.getAttribute("href") ?? "");
                if (next !== "inicio")
                    pendingFromHome = next;
            });
        });
        updateHomeIndicators();
    }
    BaseDemoSI.setupHome = setupHome;
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
        BaseDemoSI.setupComponents();
        BaseDemoSI.setupScene();
        BaseDemoSI.updateRoute();
        window.addEventListener("hashchange", BaseDemoSI.updateRoute);
        BaseDemoSI.setupNavigationDrawer();
        BaseDemoSI.setupMenuReview();
        BaseDemoSI.setupDistribution();
        BaseDemoSI.setupModules();
        BaseDemoSI.setupManual();
        BaseDemoSI.setupSharedActivities();
        BaseDemoSI.setupHome();
    }
    BaseDemoSI.initialize = initialize;
})(BaseDemoSI || (BaseDemoSI = {}));
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", BaseDemoSI.initialize, { once: true });
}
else {
    BaseDemoSI.initialize();
}
