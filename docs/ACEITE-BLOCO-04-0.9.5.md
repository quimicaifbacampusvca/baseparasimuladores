# Base Demo Oficial - SI — Bloco 04: docas e painéis contextuais (0.9.5)

## Responsabilidade

Estruturar três entradas universais — **Montagem, Ver, Dados** — com navegação de múltiplos níveis, preservando cena, extensões e permissões, sem regras de um motor científico específico.

## Contrato da montagem

- **Resumo:** quantidade de objetos, objeto em foco e ações de preparação;
- **Preparo:** inclusão de objetos pela API da cena já consolidada;
- **Objetos:** seleção, edição, deslocamento e exclusão sujeitas a permissões;
- **Módulo:** escolha de extensões e ferramentas conectadas;
- **Missão:** contexto da atividade orientada e retorno ao procedimento, quando disponível.

Os marcadores de aba são exclusivos e a troca de categoria não altera a cena. A preferência antiga `montagem`, `objetos` ou `ajustes` continua legível.

## Contrato Ver e Dados

- **Ver:** catálogo de visualizações disponíveis para o módulo; escolher abre detalhe com botão de retorno sem perder os objetos; instrumentos permanecem dentro do detalhe;
- **Dados:** inventário agregado, histórico de leituras e acesso a Caderno/Relatórios;
- **Expandir:** a visualização à direita assume o espaço de trabalho em desktop e é restaurável; não depende do motor científico.

## Responsividade e acessibilidade

- Até 900 px, docas em folhas inferiores; o conteúdo rola dentro da folha, sem provocar mudança de altura da cena; barra inferior preservada e toque com alvo mínimo de 44 px.
- Abaixo de 1280 px, uma única doca pode permanecer aberta por vez; no desktop amplo, ambas podem coexistir.
- `Escape` fecha, foco retorna ao acionador, `Tab` fica contido na folha modal; preferência mantém apenas a categoria e o modo de visualização, nunca abre modais inesperadamente após recarga.
- Comandos fora das capacidades habilitadas permanecem bloqueados pela infraestrutura do módulo.

## Vistoria técnica

Rodar `npm run check` e `python3 tests/browser_docks.py`. Comparação visual e de gestos com a referência externa, Firefox, Safari/WebKit, PWA instalada e `file://` real permanecem critérios de homologação final.

**Não equivale a homologação 1.0.0.**
