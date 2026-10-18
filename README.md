# Base Demo Oficial - SI · 0.3.0

Base universal de simuladores — versão **0.3.0 (Workspace Universal)**.

## Execução

Abrir `index.html` com navegador moderno, sem servidor ou conexão obrigatória. A distribuição PWA necessita de `HTTPS` ou `localhost` para instalar Service Worker; a versão local permanece utilizável mesmo quando não pode ser instalada.

## Capacidades verificáveis

- Foco e Visão geral de uma cena de objetos genéricos.
- Docas **Montagem**, **Ver** e **Dados**, com fechamento, alternância e expansão do painel de informações em desktop.
- Desktop: painéis laterais sobrepostos à área experimental, preservando a cena; em viewport compacto, uma doca por vez.
- Mobile: botões fixos inferiores, docas como folhas inferiores modais, backdrop, Escape e retorno de foco.
- Histórico, persistência local, seleção e edição de objetos preservados da 0.2.0.
- Sem motor científico e sem serviços externos obrigatórios.

## Desenvolvimento

```sh
npm install  # apenas desenvolvimento, quando dependências de build não estão disponíveis
npm run check
```

Para compilar sem instalar dependências caso exista `tsc` disponível:

```sh
tsc -p tsconfig.json
node tests/foundation.test.cjs
node tests/scene.test.cjs
node tests/workspace.test.cjs
```

## Critérios e limites

Ver `docs/ACEITE-0.3.0.md` e `docs/PLANO-DE-CONSTRUCAO.md`. A 0.3.0 entrega o contrato de apresentação do ambiente; não inclui instrumentos reais, simulação científica, roteiros ou sistema de professor. Homologação real em navegadores e dispositivos é requisito das versões subsequentes.

Licença: GPL-3.0, conforme `LICENSE` do repositório oficial.
