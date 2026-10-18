# Base Demo Oficial - SI · 0.7.0

Plataforma universal para simuladores educacionais. **Versão 0.7.0 — Caderno e relatórios**.

## Como executar

Abra `index.html` em um navegador para utilizar a aplicação autocontida, sem bibliotecas remotas. No HTTPS ou localhost, a aplicação também dispõe de Service Worker com os arquivos operacionais no pré-cache. A execução via `file://` e a instalação PWA em dispositivos físicos ainda precisam de homologação específica.

Para desenvolvimento: `npm run build`, `npm test` ou `npm run check`. O TypeScript 5.8.3 é necessário apenas para compilar o código-fonte. O aplicativo já é distribuído com `app.js` gerado e todas as folhas de estilo.

## Funcionalidades existentes

- **Estrutura:** identificação da plataforma, navegação, preferências e interface responsiva.
- **Bancada universal:** objetos, seleção, ferramentas, histórico Desfazer/Refazer, painéis Montagem, Ver e Dados, visão geral e foco.
- **Extensões:** registro local de motores, ferramentas e instrumentos, com medições, validação e armazenamento separado do núcleo.
- **Aprender:** temas independentes com marcador de conclusão.
- **Missões e Roteiros:** atividades com critérios verificáveis, progresso local e retomada na bancada.
- **Área do Professor:** criação, importação e exportação de atividades JSON com validação.
- **Caderno:** observações, hipóteses e conclusões, inclusive vínculo ao objeto selecionado; histórico independente dos instrumentos e backup JSON validado.
- **Relatórios:** cabeçalho configurável, captura imutável de cena, observações e medições; impressão A4 e HTML estático autocontido.

## Contratos e limites

- Nenhuma camada do núcleo contém conteúdo exclusivo de uma ciência. Os instrumentos são definidos pelas extensões conectadas.
- Os relatórios são instantâneos históricos e não são recalculados depois de gerados.
- Até 80 registros e 20 relatórios no Caderno local. O armazenamento é do navegador e não sincroniza dispositivos.
- O backup do Caderno substitui somente registros e relatórios após confirmação; os dados da cena e as atividades são preservados.
- Não há login, conexão externa obrigatória, ranking nem pontuação.
- Os links de atividades com permissões restritas ainda não foram incluídos.

## Novos arquivos

- `src/records-contracts.ts`: contratos de registros e relatórios.
- `src/records.ts`: modelo, validação, persistência e intercâmbio.
- `src/records-ui.ts`: interface, prévia, impressão e exportação HTML.
- `records.css`: estilos responsivos e regra de impressão.
- `tests/records.test.cjs`: testes unitários e negativos.
- `docs/ACEITE-0.7.0.md`: critérios técnicos e limitações da série.

## Licença

GPL-3.0, consulte `LICENSE`.
