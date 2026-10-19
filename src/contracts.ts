/**
 * Contratos iniciais do núcleo. Não contêm vocabulário de nenhum domínio científico.
 * Nesta primeira versão os contratos definem o shell; cena e engine virão depois.
 */
namespace BaseDemoSI {
  export type RouteId = "inicio" | "ambiente" | "aprender" | "missoes" | "roteiros" | "professor" | "caderno" | "relatorios" | "manual" | "configuracoes" | "sobre";
  export type ThemePreference = "sistema" | "claro" | "escuro";

  export interface RouteDefinition {
    readonly id: RouteId;
    readonly title: string;
    readonly subtitle: string;
  }

  export interface PlatformManifest {
    readonly id: string;
    readonly name: string;
    readonly shortName: string;
    readonly version: string;
    readonly language: string;
    readonly routes: readonly RouteDefinition[];
    readonly requiresNetwork: false;
  }

  export interface PreferenceState {
    readonly theme: ThemePreference;
  }

  export interface StoragePort {
    read(key: string): string | null;
    write(key: string, value: string): boolean;
  }
}
