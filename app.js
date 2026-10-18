"use strict";
var BaseDemoSI;
(function (BaseDemoSI) {
    /** Fonte de identidade; nenhum conteúdo científico é carregado no núcleo. */
    BaseDemoSI.manifest = Object.freeze({
        id: "base-demo-oficial-si",
        name: "Base Demo Oficial - SI",
        shortName: "SI",
        version: "0.6.0",
        language: "pt-BR",
        requiresNetwork: false,
        routes: Object.freeze([
            { id: "inicio", title: "Início", subtitle: "Workspace universal" },
            { id: "ambiente", title: "Ambiente", subtitle: "Extensões, docas e visão geral" },
            { id: "aprender", title: "Aprender", subtitle: "Temas e orientações" },
            { id: "missoes", title: "Missões", subtitle: "Atividades verificáveis" },
            { id: "roteiros", title: "Roteiros", subtitle: "Percursos guiados" },
            { id: "professor", title: "Professor", subtitle: "Editor de atividades" },
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
    const validRoutes = new Set(["inicio", "ambiente", "aprender", "missoes", "roteiros", "professor", "configuracoes", "sobre"]);
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
                button.disabled = item.requiresSelection && !snapshot.selectedId;
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
        renderExtensions(scene.getSnapshot());
    }
    BaseDemoSI.setupExtensions = setupExtensions;
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
    function renderTopics() {
        const target = el("edu-topic-list");
        if (!target)
            return;
        target.replaceChildren();
        const saved = education.snapshot();
        for (const topic of BaseDemoSI.learningTopics) {
            const card = document.createElement("article");
            card.className = "edu-card";
            card.dataset.topicId = topic.id;
            card.append(text("p", saved.topicsDone.includes(topic.id) ? "Concluído" : "Tema", "edu-kicker"), text("h2", topic.title), text("p", topic.summary));
            const details = document.createElement("details");
            const summary = text("summary", "Ler conteúdo");
            details.append(summary);
            const body = document.createElement("div");
            body.className = "edu-body";
            for (const paragraph of topic.paragraphs)
                body.append(text("p", paragraph));
            details.append(body);
            card.append(details);
            card.append(button(saved.topicsDone.includes(topic.id) ? "Desmarcar conclusão" : "Marcar como concluído", () => { if (education.toggleTopic(topic.id)) {
                const next = target.querySelector(`[data-topic-id="${topic.id}"] button`);
                next?.focus({ preventScroll: true });
            } }));
            target.append(card);
        }
        const stats = el("edu-topic-summary");
        if (stats)
            stats.textContent = `${saved.topicsDone.length} de ${BaseDemoSI.learningTopics.length} temas concluídos`;
    }
    function renderActivity(kind) {
        const target = el(kind === "mission" ? "edu-mission-list" : "edu-script-list");
        if (!target)
            return;
        target.replaceChildren();
        const snapshot = education.snapshot();
        for (const a of education.list(kind)) {
            const card = document.createElement("article");
            card.className = "edu-card";
            card.dataset.activityId = a.id;
            const position = snapshot.progress[a.id] ?? 0, finished = position >= a.steps.length;
            card.append(text("p", `${a.origin === "teacher" ? "Professor · " : ""}${kind === "mission" ? "Missão" : "Roteiro"} · ${finished ? "Concluído" : `${position}/${a.steps.length} etapas`}`, "edu-kicker"), text("h2", a.title), text("p", a.description));
            const list = document.createElement("ol");
            list.className = "edu-steps";
            for (let i = 0; i < a.steps.length; i++) {
                const step = a.steps[i], item = document.createElement("li");
                item.className = i < position ? "edu-step-done" : i === position ? "edu-step-current" : "";
                item.append(text("strong", step.label));
                const criterion = step.requirement === "entities" ? `${step.minimum} objeto(s) na cena` : step.requirement === "selection" ? "Um objeto selecionado" : step.requirement === "readings" ? `${step.minimum} leitura(s) registrada(s)` : "Confirmação de realização";
                item.append(text("small", criterion));
                list.append(item);
            }
            card.append(list);
            const actions = document.createElement("div");
            actions.className = "edu-actions";
            const go = document.createElement("a");
            go.className = "button outline";
            go.href = "#/ambiente";
            go.textContent = "Montar na bancada";
            actions.append(go);
            if (!finished) {
                const step = a.steps[position];
                const allowed = BaseDemoSI.meetsRequirement(step, educationScene.getSnapshot(), countReadings());
                const confirm = button(step.requirement === "manual" ? "Confirmar etapa" : "Conferir e registrar", () => {
                    const outcome = education.advance(a.id, educationScene.getSnapshot(), countReadings());
                    BaseDemoSI.notify(outcome.message, outcome.ok ? "success" : "warning");
                    if (outcome.ok) {
                        const current = target.querySelector(`[data-activity-id="${a.id}"]`);
                        (current?.querySelector("button") ?? current?.querySelector("a"))?.focus({ preventScroll: true });
                    }
                }, "primary");
                confirm.disabled = !allowed;
                confirm.title = allowed ? "Registrar etapa" : "Conclua o critério no ambiente primeiro";
                actions.append(confirm);
            }
            else
                actions.append(text("span", "Atividade finalizada", "edu-finished"));
            card.append(actions);
            target.append(card);
        }
        if (!target.children.length)
            target.append(text("p", "Nenhuma atividade disponível."));
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
            card.append(info, button("Excluir", async () => {
                const accepted = await BaseDemoSI.confirmDialog({ title: "Excluir atividade?", description: `A atividade ${a.title} e seu progresso serão excluídos deste navegador.`, confirmText: "Excluir", destructive: true });
                if (accepted && education.removeActivity(a.id))
                    BaseDemoSI.notify("Atividade removida.", "info");
            }));
            target.append(card);
        }
    }
    function renderAll() { renderTopics(); renderActivity("mission"); renderActivity("script"); renderTeacher(); }
    const inputValue = (id) => el(id)?.value.trim() ?? "";
    const rule = (id) => el(id).value;
    const step = (prefix) => ({ label: inputValue(`${prefix}-label`), requirement: rule(`${prefix}-rule`), minimum: Number(inputValue(`${prefix}-min`) || 1) });
    function displayTeacherKind() {
        const show = el("edu-form-kind").value === "script";
        const second = el("edu-second-step");
        if (second)
            second.hidden = !show;
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
        education.subscribe(renderAll);
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
        BaseDemoSI.renderExtensions(snap);
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
        BaseDemoSI.setupExtensions(store);
        BaseDemoSI.setupEducation(store);
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
            const total = store.getSnapshot().entities.length;
            if (!total)
                return;
            const accepted = await BaseDemoSI.confirmDialog({ title: "Limpar cena?", description: `Os ${total} objetos serão removidos. Esta ação pode ser desfeita pelo histórico da sessão.`, confirmText: "Limpar cena", destructive: true });
            if (accepted && store.dispatch({ type: "clear" }))
                BaseDemoSI.notify("Cena limpa. Use Desfazer para recuperar.", "warning");
        });
        BaseDemoSI.setupActionMenu("scene-menu-toggle", "scene-tools-menu", action => {
            if (action === "help") {
                void BaseDemoSI.confirmDialog({ title: "Atalhos disponíveis", description: "Setas: mover o objeto selecionado quando estiver em foco.\nCtrl/⌘ + Z: desfazer.\nCtrl/⌘ + Shift + Z: refazer.\nEscape: fechar menus, diálogos e docas.\nTab: navegar pelos controles.", confirmText: "Entendi", cancelText: "Fechar" });
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
            const e = selected();
            if (e && store.dispatch({ type: "remove", id: e.id }))
                BaseDemoSI.notify("Objeto excluído. A ação pode ser desfeita.", "info");
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
            if (store.dispatch({ type: "update", id: e.id, changes: { label } }))
                BaseDemoSI.notify("Nome do objeto atualizado.", "success");
        });
        get("object-tone")?.addEventListener("change", event => {
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
