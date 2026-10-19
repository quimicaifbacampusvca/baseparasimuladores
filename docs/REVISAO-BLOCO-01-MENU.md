# Bloco 01 — Menu principal e navegação

Projeto: Base Demo Oficial - SI. Etapa de pré-homologação 0.9.3.

## Implementado e testado

- Menu de gaveta modal à esquerda, com largura máxima de 360 CSS px e limite de 88% da tela.
- Cabeçalho fixo, conteúdo com rolagem interna e categorias Agora, Navegar, Recursos, Professor e Preferências.
- Navegação com indicação semântica do destino atual.
- Abrir/fechar sem redesenhar o workspace ou deslocar a cena principal.
- Fechar pelo botão ×, por Escape, pelo fundo e pela seleção de destino.
- Restaurar o foco ao menu ao fechar sem trocar de rota.
- Abertura corrigida para colocar o foco dentro da gaveta, inclusive durante animação.
- Grupo Navegar expansível e recolhível.
- Layout testado em 320×700, 390×844, 844×390 e 1440×900 no Chromium com HTML injetado.

## Ainda não equivalente em todos os aspectos

1. Os controles principais de acessibilidade já existem dentro do menu; feedback sonoro/toque, Libras offline e perfis adicionais de visão de cores ainda requerem implementação ou homologação.
2. O tour local está implementado; Montagens prontas permanece desabilitado enquanto não existir um catálogo universal.
3. A seção de atividade em andamento dispõe de comandos condicionais; o encerramento e a finalização dependem do estado verificável da atividade, e fluxos específicos seguem em revisão.
4. As distribuições por `file://` e PWA instalada e os navegadores Firefox/WebKit/Safari ainda precisam de validação.

## Validação humana

Conferir separadamente: disposição dos grupos, localização dos controles, dimensão do cabeçalho, altura dos itens, rolagem da gaveta, menu sobre a cena em celular e paisagem e comportamento do botão Continuar.

O bloco deve ser considerado **prévia**, não equivalente homologado, até revisão e conclusão das pendências acima.
