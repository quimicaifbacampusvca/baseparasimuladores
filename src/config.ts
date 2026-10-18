namespace BaseDemoSI {
  /** Fonte de identidade; nenhum conteúdo científico é carregado no núcleo. */
  export const manifest: PlatformManifest = Object.freeze({
    id: "base-demo-oficial-si",
    name: "Base Demo Oficial - SI",
    shortName: "SI",
    version: "0.5.0",
    language: "pt-BR",
    requiresNetwork: false,
    routes: Object.freeze<RouteDefinition[]>([
      { id: "inicio", title: "Início", subtitle: "Workspace universal" },
      { id: "ambiente", title: "Ambiente", subtitle: "Extensões, docas e visão geral" },
      { id: "configuracoes", title: "Preferências", subtitle: "Personalização local" },
      { id: "sobre", title: "Sobre a base", subtitle: "Identidade e arquitetura" }
    ])
  });
}
