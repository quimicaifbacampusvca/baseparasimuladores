# Base Demo Oficial - SI · 0.9.8

Plataforma universal para simuladores educacionais, autocontida e sem dependências externas obrigatórias durante a execução. **Versão 0.9.8 — Bloco 05: manipulação e estabilidade mobile.**

## Executar

- **Standalone:** abra `standalone.html` para utilizar CSS, JavaScript e ícones incorporados em um HTML. O armazenamento depende das permissões do navegador.
- **PWA:** abra `index.html` por HTTPS ou localhost, complete a primeira instalação/cache e utilize desconectado após verificar os recursos offline.
- **Desenvolvimento:** `npm run check` recompila, cria o standalone e executa regressões e testes de contratos. `python3 tests/browser_smoke.py` verifica fluxos no Chromium quando Playwright e Chromium estiverem disponíveis.

## Recursos consolidados

- Manual local com pesquisa, ajuda contextual via tecla F1 e nove temas de orientação.
- Módulos **Livre, Explorar, Medir, Calcular**, com capacidades explicitamente declaradas e bloqueio de ferramentas/instrumentos não permitidos na camada de extensões.
- Sistema de visualizadores com contrato de registro e três modos genéricos: Observar, Medir e Analisar.
- Link autocontido por atividade personalizada, com modos **Consultar** e **Consultar e executar localmente**; validação de conteúdo antes de qualquer cópia para a biblioteca.
- Preservação do workspace, dos objetos, dos registros, dos roteiros e das distribuições anteriores.

## Privacidade, offline e limitações

Todas as bibliotecas necessárias à execução e dados de demonstração estão incluídos localmente. Não há login nem comunicação obrigatória com servidores externos. Os links são interpretados pelo aplicativo no navegador, com cópia da atividade codificada após `#`.

**Permissões dos links são controles de interface, não segurança ou autenticação.** O conteúdo do endereço pode ser modificado por terceiros; não utilize links como mecanismo para proteger informações confidenciais. Links `file://` não são portáveis entre dispositivos sem distribuir o próprio aplicativo.

A 0.9.8 **não é a homologação 1.0.0**. Consulte `docs/ACEITE-BLOCO-05-0.9.8.md`, `docs/CONTRATO-FAMILIA-SIMULADORES.md` e `docs/VISTORIA-FUNCIONAL-0.9.0.md`.

## Licença

GPL-3.0, conforme `LICENSE`.

## Organização interna — 0.9.4

Catálogos separados de páginas de conteúdo; retorno contextual à bancada; preparação de atividades em três etapas; Manual com índice navegável e ajuda contextual; layout responsivo com estilos locais. Veja `docs/ACEITE-0.9.4.md`.

## Padronização entre simuladores

O contrato de menus, manipulação e organização compartilhada está descrito em `docs/CONTRATO-FAMILIA-SIMULADORES.md`. A equivalência total depende da homologação individual dos componentes e dos navegadores.

## Bloco 02 — Home e caminhos de entrada (aprovado)

A Home foi reestruturada segundo o contrato comum de navegação: ambiente de destaque vertical no desktop, quatro acessos secundários à direita, reorganização responsiva em tablets e celulares, indicadores reais do progresso local e atalhos secundários de ajuda. Não foram adicionadas regras científicas. Consulte `docs/REVISAO-BLOCO-02-HOME.md`. O Bloco 01 (menu) permanece em revisão funcional e seus ajustes são publicados progressivamente.

## Bloco 03 — Workspace e manipulação

Controles diretos por mouse/toque, movimento relativo à cena com limites, uma alteração no histórico por arraste e permissões por módulo. Ver `docs/ACEITE-BLOCO-03-0.9.4.md`.

## Bloco 04 — Docas e investigação contextual (0.9.7)

A doca de Montagem apresenta Resumo, Preparo, Objetos e Módulo; Missão é exibida somente durante uma atividade orientada. A doca Ver apresenta catálogo → detalhe → retorno, preservando instrumentos e visualizadores conectáveis. Dados reúne o inventário e os registros, com acesso ao Caderno e Relatórios. No celular as mesmas funções aparecem em folhas inferiores e a cena permanece independente da altura do conteúdo. Consulte `docs/ACEITE-BLOCO-04-0.9.7.md`.

## Bloco 04.2 — Ver e Dados

- Ver apresenta as famílias Observar, Medir e Analisar conforme as capacidades do módulo.
- Cada família reúne visualizadores registrados localmente, com detalhe e retorno ao catálogo.
- Instrumentos aparecem apenas nas visualizações de medição, nunca em observações ou análises.
- Dados é aberto pelo lançador próprio, exibindo informações da cena, leituras e acesso aos documentos.
- A navegação é operável por teclado e adapta-se à doca desktop e à folha inferior mobile.
- Módulos, estado da bancada e recursos já aprovados permanecem compatíveis.

## Bloco 05 — Contrato responsivo e interação mobile (0.9.8)

A cena permanece geometricamente estável ao abrir/trocar Montagem, Ver e Dados; as folhas inferiores usam rolagem própria e seus controles têm alvos mínimos de 44 px. Em telas estreitas, a ação de limpar fica no menu Mais e conserva confirmação, Desfazer e recuperação. A altura visível e o teclado virtual são considerados no posicionamento das folhas, sem redesenhar o estado científico. Novos estilos de geometria compacta ficam concentrados em `mobile-contract.css`. Consulte `docs/ACEITE-BLOCO-05-0.9.8.md`.

**Escopo dos testes:** Chromium por carregamento isolado do HTML em nove tamanhos; abrir `file://`, HTTPS/localhost, PWA instalada e outros navegadores requer validação adicional.
