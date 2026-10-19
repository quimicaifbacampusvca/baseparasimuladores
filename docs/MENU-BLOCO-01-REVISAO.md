# Base Demo Oficial - SI — Contrato do Menu Principal · revisão do Bloco 01

**Estado:** prévia funcional para validação visual e operacional. Ainda não homologado.

## 1. Critério de identidade

O menu da família é uma gaveta modal ancorada à esquerda: largura limitada a 360 px, borda discreta, fundo escurecido, título e botão de fechamento fixos e corpo com rolagem independente. O conteúdo externo torna-se inerte enquanto a gaveta está aberta. No mobile, a gaveta ocupa até 88% da largura, sem deslocar a cena ou a navegação inferior. Abrir, fechar, Esc, tocar fora, Tab e retorno do foco obedecem ao mesmo contrato nas plataformas.

## 2. Organização definitiva proposta

| Região | Itens e regra operacional | Condição atual |
|---|---|---|
| Atividade em andamento | Sobre, Ajuda, Relatório, Finalizar e Encerrar; só visível com contexto verificável | Integrado aos detalhes de missões/roteiros, com encerramento sem perda de progresso |
| Agora | Nome da tela, contexto atual e comando Continuar | Integrado à rota |
| Navegar | Início, Aprender, Missões, Roteiros Experimentais, Ambiente, Caderno, Manual | Navegação funcional; grupo inicialmente expandido em desktop e mobile |
| Recursos | Montagens prontas e Tour da bancada | Tour de orientação neutra ativo; Montagens prontas desabilitado até existir catálogo universal |
| Professor | Área do Professor, Apoio pedagógico e Ideias para aula acessível | Navegação funcional; apoio contextual no Manual ainda simplificado |
| Preferências | Aparência, acessibilidade, visão de cores, som/toque, apresentação e tela inicial | Controles locais funcionais nos itens explicitados abaixo |
| Aplicativo | Instalar app quando disponível, Sobre, versão | Integrado à capacidade do navegador e à rota de informações |

## 3. Ícones originais e fidelidade

Os ícones foram recuperados do registro vetorial próprio do programa fornecido pelo autor: 23 formas semânticas exportadas como SVG e usadas diretamente nas linhas do menu, mantendo exatamente os caminhos `path d`, viewBox `0 0 24 24`, traço de 1,8 e terminações arredondadas. As 11 formas SVG internas das linhas de acessibilidade também foram reaproveitadas. Nenhuma fonte de ícones ou CDN é necessária. Os recursos estão em `assets/menu-icons/`; a interface utiliza os mesmos traços embutidos no HTML, inclusive no standalone.

## 4. Funcionalidades verificadas

- Gaveta: abrir/fechar por botão, clique externo e Escape; foco contido no menu.
- Destinos do grupo Navegar: rotas reais, estado atual marcado, retorno ao conteúdo.
- Preferências: modo escuro, alto contraste, tamanho do texto (80 a 200%), espaçamento, redução de movimento, leitura simples, modo projetor e tela inicial. Valores locais e restauração.
- Simulação de acromatopsia: escala de cinza. Outros perfis de visão são registráveis, mas sua transformação visual **ainda não é cientificamente validada** e o programa apresenta aviso explícito.
- Instalação: botão somente quando a PWA pode apresentar a oferta de instalação.
- Tour: orientações neutras pela cena, docas e histórico.
- Atividades: comandos condicionais em missão/roteiro selecionado; finalização redireciona para avaliação dos critérios, sem concluir indevidamente.

## 5. Pendências bloqueadoras

- Catálogo universal de Montagens prontas com aplicação real à cena.
- Guia do professor mais detalhado e navegação à seção específica de acessibilidade pedagógica.
- Integração de eventos de extensões com feedback sonoro e vibração. Os controles permanecem desabilitados enquanto não houver contrato científico-operacional.
- Tradutor de Libras totalmente embarcado, com bibliotecas e recursos licenciados que funcionem offline. Nenhum serviço remoto obrigatório será introduzido.
- Simulações adicionais de alterações de visão de cores exigem método verificado antes de serem ativadas.
- Homologação em Firefox, WebKit/Safari, PWA instalada e execução real por `file://`.

## 6. Critérios de aceite do Bloco 01

Aprovar somente após avaliar a aparência no desktop e mobile, a fidelidade dos 23 SVGs, a ordem e o estado das seções, a presença do painel de acessibilidade dentro da gaveta, a ausência de botões enganosamente operantes e a preservação da bancada durante abertura/fechamento do menu.

**Esta documentação é autônoma e não contém referências nominais a outros simuladores.**
