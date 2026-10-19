# Base Demo Oficial - SI · Bloco 05 · Contrato mobile 0.9.8

## Objetivo

Padronizar a operação mobile dos simuladores da família, mantendo uma cena central de dimensão estável e controles comuns em todas as extensões. O escopo não inclui novas regras científicas.

## Critérios de aceite

- Cena central não altera a altura quando Montagem, Ver e Dados são abertos, trocados ou fechados.
- A tela mantém uma barra inferior com três lançadores de alvos de toque ao menos 44 px; os painéis usam folhas independentes da cena.
- A folha mantém cabeçalho e categorias visíveis, limita sua altura ao viewport e aplica rolagem apenas ao conteúdo.
- A troca de painel reseta a posição interna de rolagem; o fechamento por Escape devolve o foco ao lançador correto.
- Campos editáveis da folha recebem rolagem para dentro do painel, sem alterar o tamanho da cena.
- O viewport visual alimenta variáveis CSS para adaptação ao teclado virtual, respeitando áreas seguras.
- Em telas de até 420 px, o botão destrutivo Limpar cena passa a Mais, mas ainda exige confirmação e participa de Desfazer/Refazer.
- A contagem permanece legível em modo compacto e anunciável integralmente para tecnologias assistivas.
- O layout não produz rolagem horizontal nas larguras de 320, 360, 390, 414, 768, 844, 1024 e 1440 px, além da paisagem 667 px.
- Preservar os mesmos dados, objetos, módulos, docas e registros; a documentação não depende de um simulador particular.

## Verificações executadas

- Compilação TypeScript e geração de standalone com CSS e JavaScript locais.
- 17 conjuntos de testes Node (16 anteriores e 1 novo).
- Chromium em nove resoluções, com verificação de estabilidade da cena, abertura/troca das docas, rolagem da folha, alvos de toque, operação Limpar via Mais, confirmação, cancelamento e recuperação pelo histórico.
- Regressão de navegação das docas, famílias de visualizadores e permissões.

## Limitações

A execução visual usou carregamento isolado do HTML. As navegações por `file://` e `http://127.0.0.1` foram bloqueadas pelo ambiente, portanto não há evidência de instalação PWA, atualização offline ou persistência após recarga real neste ciclo. Firefox, WebKit/Safari, leitores de tela e dispositivos móveis físicos continuam pendentes. O suporte ao teclado virtual foi coberto por testes de geometria e lógica, não por teclado físico de um aparelho. Não declarar homologação 1.0.0.
