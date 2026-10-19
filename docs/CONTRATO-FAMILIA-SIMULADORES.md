# Contrato de manipulação da família de simuladores

Versão de referência do contrato: 0.9.3 · Base Demo Oficial - SI.

## Propósito

Qualquer simulador criado com a plataforma compartilha uma única gramática de operação. Alterações de conteúdo, identidade, elementos, instrumentos ou motor de fenômenos não devem mudar a forma de navegar, selecionar, manipular e documentar uma investigação.

## Separação de responsabilidades

1. **Núcleo imutável da família:** navegação, menu, rotas, janela modal, foco, teclado, notificações, workspace, docas, apresentação mobile, comandos, histórico, atividades, registros e persistência.
2. **Configuração declarativa:** marca visual, título, mensagens, destinos habilitados, permissões de atividade, módulos e ferramentas instaladas.
3. **Extensões:** modelos científicos, dados, objetos especializados, fenômenos, instrumentos específicos e visualizações próprias.

Nenhuma extensão pode redefinir o contrato de operação de controles compartilhados ou impor uma reorganização alternativa de telas.

## Ordem de homologação

| Bloco | Invariante da família | Cenários obrigatórios |
| --- | --- | --- |
| 01 · Navegação | Cabeçalho, menu modal, categorias, continuidade, rotas e navegação inferior | Desktop, celular, paisagem, teclado, toque, leitores de tela |
| 02 · Home | Caminhos de entrada, resumo, retomada e identidade configurável | 320–1440 px; estados vazio/retomada |
| 03 · Workspace | Cena, foco, visão geral, objetos e área de interação estável | Sem deslocamentos por textos, notificações e painéis |
| 04 · Docas | Montagem, Ver, Dados, expandir, recolher, fechar e retorno ao contexto | Desktop e folhas inferiores mobile |
| 05 · Manipulação | Seleção, comandos, histórico, desfazer/refazer, medição e registros | Mouse, toque, teclado, persistência |
| 06 · Aprender | Catálogo, conteúdo individual, conclusão, retorno | Sem perda do ponto de leitura |
| 07 · Missões e Roteiros | Catálogo, detalhe, execução guiada, retorno e progresso | Respeito a permissões e requisitos |
| 08 · Professor | Editor por etapas, configuração, publicação local e recuperação | Importação/validação e compartilhamento |
| 09 · Caderno e relatórios | Observações, medição, histórico, impressão, exportação e recuperação | Dados íntegros e consistentes |
| 10 · Manual e preferências | Ajuda contextual, busca, acessibilidade e aparência | Mesma semântica em toda a família |
| 11 · Distribuição | PWA, standalone, dependências locais, atualização segura | Sem internet após preparação pertinente |

## Contrato 01 — Menu principal

**Geometria e hierarquia:** menu em gaveta modal lateral com largura máxima de 360 px e limite de 88% da viewport, cabeçalho fixo, rolagem interna, categorias Agora, Navegar, Recursos, Professor e Preferências. Não usar barra lateral permanente como substituta do menu.

**Estados:** fechado, aberto, grupo Navegar expandido/recolhido, opção ativa, contexto de atividade, preferências expandidas. O fechamento por Escape, botão ×, backdrop ou seleção de destino é obrigatório; ao fechar sem navegar, o foco volta ao acionador.

**Interação:** ao abrir, o conteúdo exterior fica inerte e o foco permanece dentro da gaveta até seu fechamento. A opção ativa é identificada semanticamente. A interação por toque não depende de hover. Alvos operacionais possuem área mínima de 44 × 44 CSS px.

**Mobile:** menu sobreposto, sem empurrar nem redimensionar a cena; rolagem somente dentro da gaveta; respeitar safe areas, orientação horizontal e teclado virtual. A navegação inferior fica disponível fora da bancada e desaparece no ambiente quando seus comandos inferiores estiverem ativos.

**Personalização permitida:** logo, sigla, paleta, destinos habilitados, nomes das categorias científicas e textos contextuais. **Personalização proibida:** mudar as ações dos botões compartilhados, inverter a lógica de abertura/fechamento, trocar o modelo de navegação mobile ou interferir na posição da cena.

**Critério de aceite:** todos os casos de teclado, toque, foco, navegação e orientação precisam passar; comportamento parcial não recebe selo de equivalência. Alterações no contrato exigem teste de regressão contra toda a família.

## Pendências reconhecidas em 0.9.3

- O painel contextual de atividade depende de integração completa entre menu e sessões guiadas.
- Controles de acessibilidade completos (além da aparência) ainda não possuem paridade de recursos.
- Recursos como tour guiado e montagens prontas requerem subsistemas funcionais; não devem aparecer como comandos sem ação real.
- Os testes Chromium por HTML injetado não substituem execução `file://`, instalação PWA e testes em Firefox/WebKit/Safari.

## Documentação da plataforma

O presente documento descreve apenas a Base Demo Oficial - SI e seus contratos. Nomes, mecanismos ou modelos científicos de aplicações individuais não integram o contrato comum.
