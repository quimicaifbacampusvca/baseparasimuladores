# Base Demo Oficial - SI · Bloco 04.2 — Ver e Dados · 0.9.7

## Objetivo

Alinhar as docas de observação e registros aos contratos operacionais universais, sem incorporar qualquer motor científico específico.

## Contrato do painel Ver

- Organizar visualizações nas famílias **Observar**, **Medir** e **Analisar**.
- Mostrar apenas famílias e ferramentas habilitadas pelo módulo atual.
- Manter nível de catálogo, nível de detalhe e botão de retorno, sem alterar o estado da cena.
- Navegação por clique, toque, Tab, setas, Home/End e Escape quando cabível.
- Manter instrumentos conectados somente em um detalhe da família Medir.
- Atualizar nomes e disponibilidade quando o módulo ou a seleção mudar.
- Permitir registro de novas visualizações por extensão, sem nomes científicos fixos no núcleo.

## Contrato do painel Dados

- Acesso pelo lançador **Dados**, sem aba interna redundante.
- Resumo real de objetos, tipos e registros produzidos localmente.
- Histórico formatado, estado vazio legível e ações para Caderno e Relatórios.
- Tipografia e controles coerentes com os demais painéis, com foco visível.

## Regressão obrigatória

Manter o contrato da Montagem, manipulação por mouse/toque, Desfazer/Refazer, configurações persistidas, rotas da Home e acesso offline. Em mobile, a folha inferior usa rolagem interna e não redimensiona a cena.

## Limites de homologação

Testes com HTML carregado no Chromium não equivalem a homologação com PWA instalada, `file://`, Firefox, Safari ou dispositivos físicos. Os cenários não executados permanecem pendentes.
