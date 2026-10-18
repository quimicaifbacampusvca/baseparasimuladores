"use strict";
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Fonte de identidade; nenhum conteúdo científico é carregado no núcleo. */
    BaseDemoSI.manifest = Object.freeze({
        id: "base-demo-oficial-si",
        name: "Base Demo Oficial - SI",
        shortName: "SI",
        version: "0.3.0",
        language: "pt-BR",
        requiresNetwork: false,
        routes: Object.freeze([
            { id: "inicio", title: "Início", subtitle: "Workspace universal" },
            { id: "ambiente", title: "Ambiente", subtitle: "Docas, foco e visão geral" },
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
        document.body.classList.toggle("route-ambiente", selected === "ambiente");
        window.dispatchEvent(new CustomEvent("si-route-changed", { detail: selected }));
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
    function initialWorkspace() {
        return { view: "focus", left: "collapsed", right: "collapsed", leftTab: "montagem", rightTab: "ver", presentation: "standard" };
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
                        leftTab: tab === "objetos" || tab === "ajustes" ? tab : "montagem" };
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
    function parseWorkspacePreference(raw) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw))
            return null;
        const t = raw;
        if (t.schemaVersion !== 1)
            return null;
        if (!["focus", "overview"].includes(String(t.view)) || !["montagem", "objetos", "ajustes"].includes(String(t.leftTab)) || !["ver", "dados"].includes(String(t.rightTab)))
            return null;
        // Abrir painéis automaticamente ao recarregar um telefone produz modal inesperado.
        return { ...initialWorkspace(), view: t.view, leftTab: t.leftTab, rightTab: t.rightTab };
    }
    BaseDemoSI.parseWorkspacePreference = parseWorkspacePreference;
    function serializeWorkspacePreference(s) {
        return JSON.stringify({ schemaVersion: 1, view: s.view, leftTab: s.leftTab, rightTab: s.rightTab });
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
    let lastTrigger = null;
    let lastSide = "left";
    const node = (id) => document.getElementById(id);
    const mobile = () => window.matchMedia("(max-width: 900px)").matches;
    const compact = () => window.innerWidth < 1280;
    const activeSide = () => workspaceState.right === "open" ? "right" : workspaceState.left === "open" ? "left" : null;
    function dock(side) { return node(`si-dock-${side}`); }
    function persistWorkspace() { BaseDemoSI.storage.write(WORKSPACE_KEY, BaseDemoSI.serializeWorkspacePreference(workspaceState)); }
    function focusReturn(side) {
        const button = lastTrigger?.isConnected ? lastTrigger : document.querySelector(`[data-open-dock="${side === "left" ? "montagem" : workspaceState.rightTab}"]`);
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
        for (const b of document.querySelectorAll("[data-left-tab]"))
            b.setAttribute("aria-pressed", String(workspaceState.leftTab === b.dataset.leftTab));
        for (const b of document.querySelectorAll("[data-right-tab]"))
            b.setAttribute("aria-pressed", String(workspaceState.rightTab === b.dataset.rightTab));
        for (const panel of document.querySelectorAll("[data-left-panel]"))
            panel.hidden = panel.dataset.leftPanel !== workspaceState.leftTab;
        for (const panel of document.querySelectorAll("[data-right-panel]"))
            panel.hidden = panel.dataset.rightPanel !== workspaceState.rightTab;
        const lh = node("si-left-title");
        if (lh)
            lh.textContent = { montagem: "Montagem", objetos: "Objetos", ajustes: "Ajustes" }[workspaceState.leftTab];
        const rh = node("si-right-title");
        if (rh)
            rh.textContent = workspaceState.rightTab === "dados" ? "Dados" : "Ver";
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
        lastTrigger = trigger;
        lastSide = side;
        changeWorkspace({ type: "open", side, tab });
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
        const vv = window.visualViewport;
        const root = node("si-workspace");
        if (root && mobile() && vv)
            root.style.setProperty("--si-visible-height", `${vv.height}px`);
        else
            root?.style.removeProperty("--si-visible-height");
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
            closeWorkspace(lastSide);
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
            openWorkspace(which === "montagem" ? "left" : "right", which === "montagem" ? "montagem" : which, b);
        }));
        document.querySelectorAll("[data-close-dock]").forEach(b => b.addEventListener("click", () => closeWorkspace(b.dataset.closeDock)));
        document.querySelectorAll("[data-left-tab]").forEach(b => b.addEventListener("click", () => changeWorkspace({ type: "left-tab", tab: b.dataset.leftTab })));
        document.querySelectorAll("[data-right-tab]").forEach(b => b.addEventListener("click", () => changeWorkspace({ type: "right-tab", tab: b.dataset.rightTab })));
        node("si-expand")?.addEventListener("click", () => changeWorkspace({ type: "expand" }));
        node("si-sheet-backdrop")?.addEventListener("click", () => { const side = activeSide(); if (side)
            closeWorkspace(side); });
        document.addEventListener("keydown", keyboardHandler);
        window.addEventListener("resize", updateViewport);
        window.visualViewport?.addEventListener("resize", updateViewport);
        window.addEventListener("si-route-changed", (event) => {
            if (event.detail !== "ambiente") {
                workspaceState = { ...workspaceState, left: "collapsed", right: "collapsed", presentation: "standard" };
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
            button.addEventListener("keydown", event => {
                const moves = { ArrowUp: [0, -2], ArrowDown: [0, 2], ArrowLeft: [-2, 0], ArrowRight: [2, 0] };
                const delta = moves[event.key];
                if (!delta || event.altKey || event.ctrlKey || event.metaKey)
                    return;
                event.preventDefault();
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
            clearButton.disabled = !snap.entities.length;
        const inspector = get("object-inspector");
        if (inspector)
            inspector.hidden = !snap.selectedId;
        const noSelection = get("no-selection");
        if (noSelection)
            noSelection.hidden = !!snap.selectedId;
        const entity = selected();
        BaseDemoSI.renderWorkspaceContent(snap);
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
    function move(id, dx, dy) {
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
        for (const button of document.querySelectorAll("[data-add-kind]")) {
            button.addEventListener("click", () => {
                const kind = button.dataset.addKind;
                const snap = store.getSnapshot();
                const created = store.dispatch({ type: "add", entity: BaseDemoSI.makeEntity(kind, freshId(), snap.entities.length) });
                if (!created)
                    announce("Limite de 60 objetos atingido.");
            });
        }
        get("scene-undo")?.addEventListener("click", () => store.undo());
        get("scene-redo")?.addEventListener("click", () => store.redo());
        get("scene-clear")?.addEventListener("click", () => {
            if (window.confirm("Limpar todos os objetos? É possível desfazer esta ação."))
                store.dispatch({ type: "clear" });
        });
        get("scene-delete")?.addEventListener("click", () => {
            const e = selected();
            if (e)
                store.dispatch({ type: "remove", id: e.id });
        });
        get("object-label")?.addEventListener("change", event => {
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
            store.dispatch({ type: "update", id: e.id, changes: { label } });
        });
        get("object-tone")?.addEventListener("change", event => {
            const e = selected();
            if (!e)
                return;
            const tone = event.currentTarget.value;
            store.dispatch({ type: "update", id: e.id, changes: { tone } });
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
            if (element?.matches("input,select,textarea,[contenteditable]"))
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
    function initialize() {
        document.documentElement.lang = BaseDemoSI.manifest.language;
        for (const version of document.querySelectorAll("[data-app-version]")) {
            version.textContent = BaseDemoSI.manifest.version;
        }
        for (const name of document.querySelectorAll("[data-app-name]")) {
            name.textContent = BaseDemoSI.manifest.name;
        }
        BaseDemoSI.setupPreferences();
        BaseDemoSI.setupScene();
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
