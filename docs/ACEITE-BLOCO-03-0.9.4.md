# Base Demo Oficial - SI · Bloco 03 — Workspace e manipulação (0.9.4)

## Objetivo

Garantir continuidade das mecânicas operacionais da cena, com seleção, arraste responsivo, teclado, Foco/Visão geral e docas adaptáveis. A plataforma permanece independente de qualquer motor científico.

## Contratos

1. Todo objeto é representado por identificador estável e coordenadas relativas à cena, não à dimensão do dispositivo.
2. Arrastar com mouse, caneta ou toque pré-visualiza a posição; apenas o encerramento confirmado do gesto grava uma operação, permitindo **Desfazer/Refazer em um único passo**.
3. Cancelar o gesto não altera o estado persistido. Coordenadas e dimensões permanecem dentro dos limites da cena.
4. Clique/toque simples seleciona; setas movimentam o objeto focado. Manipulação é restrita aos módulos que concedem a capacidade `tools`.
5. Painéis de Montagem, Ver e Dados não devem exigir modificar o motor de objetos; no mobile, ficam em folhas inferiores com cena preservada.
6. O modo Foco e a Visão geral são estados independentes da seleção e persistem entre reinicializações conforme o contrato anterior.
7. O núcleo operacional não pode baixar recursos obrigatórios da rede.

## Verificações

- TypeScript ES2020 e regressão das versões anteriores.
- Movimentos em percentuais, limites físicos, cancelamento, permissão de módulo e histórico.
- Chromium testado em 1440×900, 1024×768, 390×844, 320×700 com arraste, desfazer/refazer, Foco/Visão geral, docas e ausência de overflow; toque CDP em 390 px com bloqueio por módulo. Rodar `python3 tests/browser_workspace.py` no ambiente de desenvolvimento.
- Outros navegadores, instalação PWA e `file://` devem ser homologados separadamente.

## Homologação

Implementação do bloco concluída após testes disponíveis; equivalência de todas as mecânicas da família sujeita à rodada posterior de comparação ação a ação. Não declarar a plataforma integralmente homologada.
