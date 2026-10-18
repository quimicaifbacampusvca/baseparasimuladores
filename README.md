# Base Demo Oficial - SI · 0.5.0

Plataforma universal de simuladores, **versão 0.5.0 — Infraestrutura de extensões**.

## Executar

Abra `index.html` num navegador atual para utilizar a interface local. Nenhuma CDN, API remota, biblioteca remota ou conta de usuário é necessária para executar a aplicação. A instalação PWA e seu Service Worker exigem HTTPS ou localhost. A distribuição standalone tem comportamento de cache distinto da PWA.

## O que esta versão implementa

- Mantém as camadas anteriores: navegação, preferências, objetos universais, comandos, seleção, histórico, docas, foco/visão geral, menus e notificações.
- Introduz um **registro tipado de extensões locais**, desacoplado do HTML e do funcionamento do workspace.
- Permite ativar/desativar uma extensão sem apagar o conteúdo da cena.
- Define contratos para ferramentas que produzem comandos universais e estados internos validados, e instrumentos que produzem leituras numéricas identificadas.
- Mantém a persistência das extensões e até 40 leituras recentes no armazenamento local, em documento separado do projeto da cena.
- Permite a extensões operar com cenas e objetos selecionados mediante contextos de leitura isolados.
- Inclui uma **extensão neutra demonstrativa**, composta por duas ferramentas (deslocar posição e alternar aparência) e três instrumentos (posição X, quantidade e operações).
- Expõe ferramentas na doca **Montagem → Ajustes**, instrumentos na doca **Ver** e registros na doca **Dados**.
- Valida identificadores, versões, estados serializáveis, leituras e comandos antes da aplicação; recusa resultados inválidos.

## Limites desta etapa

- A extensão demonstrativa não representa fenômenos científicos e não pretende substituir um motor de simulação especializado.
- A versão aceita extensões **incorporadas ao pacote na etapa de desenvolvimento**; não executa plugins arbitrários recebidos do usuário nem JavaScript remoto. O registro executa código confiável já integrado à distribuição.
- Desfazer/refazer recupera **comandos de cena**. O contador de operações da extensão e o histórico de medições são registros independentes e não são revertidos pelo histórico da cena. Transações unificadas permanecem fora do escopo da 0.5.0.
- A interface utiliza um renderizador de demonstração. Renderizadores científicos especializados serão definidos em versões subsequentes.
- A homologação de navegador real em Firefox, Safari/WebKit, PWA instalado e `file://` será registrada separadamente conforme executada.

## Compilar e testar

```sh
tsc -p tsconfig.json
npm test
```

O compilador TypeScript é usado **apenas no desenvolvimento**. `index.html` usa `app.js` compilado e CSS local, sem exigir npm/Node.js para execução.

## Organização dos contratos

- `src/extension-contracts.ts` — interfaces tipadas de extensão, ferramenta, instrumento, contexto e medição.
- `src/extensions.ts` — registro, ativação, execução, validação, persistência e leitura.
- `src/extensions-demo.ts` — extensão neutra autocontida de demonstração.
- `src/extensions-ui.ts` e `extensions.css` — integração às docas existentes, sem recriar o workspace.
- `docs/ACEITE-0.5.0.md` — critérios técnicos e limites.

Licença do repositório: GPL-3.0, conforme `LICENSE`.
