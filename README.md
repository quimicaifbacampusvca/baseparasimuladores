# Base Demo Oficial - SI · 0.9.3

Plataforma universal para simuladores educacionais, autocontida e sem dependências externas obrigatórias durante a execução. **Versão 0.9.3 — Organização interna, menu operacional e contratos compartilhados de interação.**

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

A 0.9.3 **não é a homologação 1.0.0**. Consulte `docs/ACEITE-0.9.3.md`, `docs/CONTRATO-FAMILIA-SIMULADORES.md` e `docs/VISTORIA-FUNCIONAL-0.9.0.md`.

## Licença

GPL-3.0, conforme `LICENSE`.

## Organização interna — 0.9.3

Catálogos separados de páginas de conteúdo; retorno contextual à bancada; preparação de atividades em três etapas; Manual com índice navegável e ajuda contextual; layout responsivo com estilos locais. Veja `docs/ACEITE-0.9.3.md`.

## Padronização entre simuladores

O contrato de menus, manipulação e organização compartilhada está descrito em `docs/CONTRATO-FAMILIA-SIMULADORES.md`. A equivalência total depende da homologação individual dos componentes e dos navegadores.

## Bloco 02 — Home e caminhos de entrada (aprovado)

A Home foi reestruturada segundo o contrato comum de navegação: ambiente de destaque vertical no desktop, quatro acessos secundários à direita, reorganização responsiva em tablets e celulares, indicadores reais do progresso local e atalhos secundários de ajuda. Não foram adicionadas regras científicas. Consulte `docs/REVISAO-BLOCO-02-HOME.md`. O Bloco 01 (menu) permanece em revisão funcional e seus ajustes são publicados progressivamente.
