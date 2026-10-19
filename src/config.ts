namespace BaseDemoSI {
  /** Fonte de identidade; nenhum conteúdo científico é carregado no núcleo. */
  export const manifest: PlatformManifest = Object.freeze({
    id: "base-demo-oficial-si",
    name: "Base Demo Oficial - SI",
    shortName: "SI",
    version: "0.9.8",
    language: "pt-BR",
    requiresNetwork: false,
    routes: Object.freeze<RouteDefinition[]>([
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
}
