# Critérios de aceite — Workspace Universal 0.3.0

## Contrato de apresentação

O ambiente mantém quatro regiões reconhecíveis: barra superior de modos e painéis, cena central, barra de ações e faixa horizontal de objetos. As docas Montagem (esquerda) e Ver/Dados (direita) são componentes de apresentação que não dependem de conteúdos científicos. A janela de demonstração não é o produto final de cada simulador.

### Desktop (>900 px)

- Docas sobrepostas à cena, com abertura, fechamento e conteúdo contextual.
- Em largura >=1280 px, duas docas podem ficar abertas; abaixo dessa largura, apenas uma por vez.
- Expansão do painel de Ver oculta a cena e devolve o estado anterior ao restaurar.
- A cena apresenta apenas o objeto selecionado no modo Foco e a coleção completa na Visão geral; nenhum texto de doca deve deslocá-la ou gerar overflow horizontal.

### Mobile (<=900 px)

- Alternância Foco/Visão geral permanece no topo; Montagem, Ver e Dados ficam na barra inferior.
- As docas tornam-se folhas inferiores com backdrop, `role=dialog`, `aria-modal=true`, foco inicial no botão Fechar, contenção de Tab e retorno do foco ao acionador.
- Mudanças no conteúdo dos painéis não devem deslocar a cena nem impedir o acesso ao objeto.
- O conteúdo interno das docas rola separadamente da cena.

### Estado e regressões

- O estado estrutural mantém docas, modos e apresentações independentes do estado de objetos.
- A preferência de visualização e guias é salva com validação, sem reabrir modais após recarga.
- Entidades, seleção, movimentos, desfazer, refazer e dados salvos da 0.2.x permanecem compatíveis.
- Bibliotecas obrigatórias de terceiros e conexões externas: nenhuma.

## Evidência e pendências

Testes automatizados de compilação, comandos, estado do workspace e documentos não representam homologação visual em todos os navegadores. Verificações manuais específicas de Firefox, WebKit/Safari, PWA instalado e dispositivos físicos continuam pendentes até execução comprovada.
