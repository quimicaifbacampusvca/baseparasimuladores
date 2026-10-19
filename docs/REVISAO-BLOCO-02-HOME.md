# Bloco 02 — Home e caminhos de entrada

Projeto: **Base Demo Oficial - SI**. Etapa 0.9.3 — estrutura da família de simuladores.

## Contrato comum

A Home não é um painel de configuração técnica. É a porta de entrada consistente para qualquer simulador criado com a plataforma. A hierarquia é: apresentação breve, escolha do próximo passo, ambiente de exploração como caminho primário, quatro caminhos secundários, apoio e configurações.

### Estrutura de desktop

- Cabeçalho com título temático parametrizável, lema curto e símbolo local, sem um cartão técnico contornando toda a introdução.
- Separador antes do título “Escolha seu próximo passo”.
- A partir de 961 CSS px, grade com três colunas: **Ambiente** à esquerda, atravessando duas linhas; **Aprender e Missões** na primeira linha à direita; **Roteiros Experimentais e Caderno** na segunda linha.
- O caminho principal possui etiqueta de exploração livre, descrição, identidade visual neutra e faixa de ação com alvo clicável integral.
- Os caminhos secundários possuem ícone, título, descrição, indicador real e acesso integral pelo cartão.

### Responsividade nativa

- Até 960 CSS px: Ambiente ocupa toda a primeira linha; os quatro caminhos restantes organizam-se em duas colunas.
- Até 370 CSS px: cada caminho utiliza uma linha própria; cartões secundários ficam horizontais e compactos, com ícone à esquerda do texto.
- A navegação inferior mantém seus controles e suas safe areas, sem sobrepor a área de interação quando o usuário entra no Ambiente.
- Nenhum conteúdo da Home pode exigir rolagem horizontal ou gestos de precisão.

### Comportamento e dados

- Cada cartão navega para uma rota existente da plataforma; não há ação de demonstração falsa.
- Ao retornar à Home, os indicadores são derivados dos documentos locais **validados**: quantidade de temas/concluídos, missões, roteiros e notas.
- Não ler nem exibir o nome, a descrição ou a identidade de um motor científico como condição para iniciar o ambiente.
- Erro ou indisponibilidade de armazenamento não impede o uso dos caminhos; contadores do catálogo continuam disponíveis.
- Manual, Professor e Preferências ficam acessíveis em uma área de apoio sem competir com os caminhos principais.

## Testes da implementação

- Compilação TypeScript e 13 conjuntos automatizados de regressão: aprovados.
- Chromium por HTML autocontido injetado: **320 × 700, 360 × 740, 390 × 844, 414 × 896, 768 × 1024, 1024 × 768, 1440 × 900, 844 × 390**.
- Em todas essas dimensões: grade correta, ausência de overflow, acesso a Aprender e ao Ambiente, retorno de rotas, indicadores de catálogo e ausência de erros JavaScript.
- A gravação de dados locais em uma origem HTTP/HTTPS, PWA realmente instalada, execução `file://`, Firefox/WebKit e dispositivos físicos **não foram homologados** nesta rodada.

## Estado

**Bloco 02 aprovado na revisão funcional e visual.** A homologação global da aplicação ainda exige inspeção em outros navegadores, acessibilidade e dispositivos reais.
