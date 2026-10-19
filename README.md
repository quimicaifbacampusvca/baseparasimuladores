# Base Demo Oficial - SI · 0.9.0

Plataforma universal para simuladores educacionais. **Versão 0.9.0 — Vistoria funcional e correções de regressão.** A organização do workspace, os componentes educacionais e os contratos de extensão são preservados.

## Executar

- **Standalone:** abra `standalone.html`, arquivo HTML autocontido sem links ou bibliotecas de execução externos. A disponibilidade de armazenamento depende das permissões do navegador.
- **PWA:** sirva `index.html` por HTTPS ou localhost. Os recursos essenciais são armazenados pelo Service Worker; a primeira carga precisa completar antes do uso desconectado.
- **Desenvolvimento:** `npm run check` compila o JavaScript, recria o standalone, verifica contratos e regressões das nove camadas. `python3 tests/browser_smoke.py` executa cenários no Chromium local quando Playwright e Chromium estiverem instalados.

## O que mudou na vistoria

- Menu de navegação mobile com fundo modal, contenção de foco, fechamento por toque/Escape e bloqueio do restante da interface.
- Aviso persistente e visível sempre que o navegador bloquear leitura ou gravação do armazenamento local. O sistema não promete salvamento nesse caso.
- Estados ocultos protegidos contra regras CSS conflitantes, inclusive instalação PWA quando indisponível.
- Atualização do cache offline, dos testes e da documentação de critérios de aceite.

## Capacidades da plataforma

Navegação, preferências, cena e histórico universal, docas Montagem e Ver/Dados, extensões locais para instrumentos e ferramentas, temas, missões, roteiros, Área do Professor, Caderno, relatórios e backups. Não há motor científico específico ou serviços de execução remotos.

## Limites de homologação

Esta versão **não corresponde à 1.0.0 homologada**. Permanecem pendentes, entre outros, Manual contextual, módulo configurável, links de atividade com permissões, avaliações aprofundadas de acessibilidade, Firefox, WebKit/Safari, PWA realmente instalada offline e abertura real por `file://` nos navegadores. Consulte `docs/ACEITE-0.9.0.md` e `docs/VISTORIA-FUNCIONAL-0.9.0.md`.

## Licença

GPL-3.0. Consulte `LICENSE`.
