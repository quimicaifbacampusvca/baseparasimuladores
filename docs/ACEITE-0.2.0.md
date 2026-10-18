# Aceite técnico — Colunas estruturais 0.2.0

## Objetivo

Estabelecer estado de cena e comandos para objetos neutros, independentes de fenômenos e motores especializados. Esta fase cria fundamentos de interação; não representa o workspace definitivo.

## Critérios implementados

- [x] Tipos explícitos de entidade, posição normalizada, dimensões, nome e aparência.
- [x] Estado imutável por cópia e acesso independente do DOM.
- [x] Comandos para adicionar, atualizar, excluir e limpar objetos.
- [x] Seleção de objeto sem acrescentar passos ao histórico.
- [x] Desfazer e refazer, com histórico limitado a 50 alterações.
- [x] Persistência automática por projeto, com serialização versionada.
- [x] Rejeição integral de dados inválidos e preservação de dados incompatíveis.
- [x] Seleção e deslocamento por teclado; controles de toque e mouse.
- [x] Fluxos de criação, edição, desfazer/refazer e responsividade conferidos no Chromium por injeção local do aplicativo.
- [x] Interface de demonstração sem domínio científico e sem recursos remotos.
- [x] Testes automatizados dos comandos, limites, isolamento e restauração.

## Verificações adicionais para homologação

- [ ] Exercitar carregamento HTTP/`file://` e recarga persistente em navegadores reais (navegação bloqueada pela política do ambiente de teste).
- [ ] Exercitar Firefox e WebKit em ambientes reais, inclusive dispositivos móveis.
- [ ] Revisar acessibilidade com ferramenta especializada e tecnologias assistivas.
- [ ] Verificar operação offline após atualização/instalação PWA em dispositivos reais.

## Fora do escopo nesta versão

Workspace e docas finais, motores especializados, drag-and-drop livre, instrumentos, roteiros, área docente, relatórios, exportação/importação e edição de múltiplos projetos. A interface desta fase não é o desenho definitivo da plataforma.
