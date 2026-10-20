# Base Demo Oficial - SI · 0.9.17

Plataforma universal para simuladores educacionais, autocontida e sem dependências externas obrigatórias durante a execução. **Versão 0.9.17 — Caderno, exportação CSV, impressão e folhas de relatório para preenchimento manual.**

## Executar

- **Standalone:** abra `standalone.html` para utilizar CSS, JavaScript e ícones incorporados em um HTML. O armazenamento depende das permissões do navegador.
- **PWA:** abra `index.html` por HTTPS ou localhost, complete a primeira instalação/cache e utilize desconectado após verificar os recursos offline.
- **Desenvolvimento:** `npm run check` recompila, cria o standalone e executa regressões e testes de contratos. `python3 tests/browser_smoke.py` verifica fluxos no Chromium quando Playwright e Chromium estiverem disponíveis.

## Recursos consolidados

- Manual local com pesquisa, ajuda contextual via tecla F1 e nove temas de orientação.
- Módulos **Livre, Explorar, Medir, Calcular**, com capacidades explicitamente declaradas e bloqueio de ferramentas/instrumentos não permitidos na camada de extensões.
- Sistema de visualizadores com contrato de registro e três modos genéricos: Observar, Medir e Analisar.
- Link autocontido por atividade personalizada, com modos **Consultar** e **Consultar e executar localmente**; validação de conteúdo antes de qualquer cópia para a biblioteca.
- Preservação do workspace, dos objetos, dos registros, dos roteiros e das distribuições anteriores.

## Privacidade, offline e limitações

Todas as bibliotecas necessárias à execução e dados de demonstração estão incluídos localmente. Não há login nem comunicação obrigatória com servidores externos. Os links são interpretados pelo aplicativo no navegador, com cópia da atividade codificada após `#`.

**Permissões dos links são controles de interface, não segurança ou autenticação.** O conteúdo do endereço pode ser modificado por terceiros; não utilize links como mecanismo para proteger informações confidenciais. Links `file://` não são portáveis entre dispositivos sem distribuir o próprio aplicativo.

A 0.9.8 **não é a homologação 1.0.0**. Consulte `docs/ACEITE-BLOCO-05-0.9.8.md`, `docs/CONTRATO-FAMILIA-SIMULADORES.md` e `docs/VISTORIA-FUNCIONAL-0.9.0.md`.

## Licença

GPL-3.0, conforme `LICENSE`.

## Organização interna — 0.9.4

Catálogos separados de páginas de conteúdo; retorno contextual à bancada; preparação de atividades em três etapas; Manual com índice navegável e ajuda contextual; layout responsivo com estilos locais. Veja `docs/ACEITE-0.9.4.md`.

## Padronização entre simuladores

O contrato de menus, manipulação e organização compartilhada está descrito em `docs/CONTRATO-FAMILIA-SIMULADORES.md`. A equivalência total depende da homologação individual dos componentes e dos navegadores.

## Bloco 02 — Home e caminhos de entrada (aprovado)

A Home foi reestruturada segundo o contrato comum de navegação: ambiente de destaque vertical no desktop, quatro acessos secundários à direita, reorganização responsiva em tablets e celulares, indicadores reais do progresso local e atalhos secundários de ajuda. Não foram adicionadas regras científicas. Consulte `docs/REVISAO-BLOCO-02-HOME.md`. O Bloco 01 (menu) permanece em revisão funcional e seus ajustes são publicados progressivamente.

## Bloco 03 — Workspace e manipulação

Controles diretos por mouse/toque, movimento relativo à cena com limites, uma alteração no histórico por arraste e permissões por módulo. Ver `docs/ACEITE-BLOCO-03-0.9.4.md`.

## Bloco 04 — Docas e investigação contextual (0.9.7)

A doca de Montagem apresenta Resumo, Preparo, Objetos e Módulo; Missão é exibida somente durante uma atividade orientada. A doca Ver apresenta catálogo → detalhe → retorno, preservando instrumentos e visualizadores conectáveis. Dados reúne o inventário e os registros, com acesso ao Caderno e Relatórios. No celular as mesmas funções aparecem em folhas inferiores e a cena permanece independente da altura do conteúdo. Consulte `docs/ACEITE-BLOCO-04-0.9.7.md`.

## Bloco 04.2 — Ver e Dados

- Ver apresenta as famílias Observar, Medir e Analisar conforme as capacidades do módulo.
- Cada família reúne visualizadores registrados localmente, com detalhe e retorno ao catálogo.
- Instrumentos aparecem apenas nas visualizações de medição, nunca em observações ou análises.
- Dados é aberto pelo lançador próprio, exibindo informações da cena, leituras e acesso aos documentos.
- A navegação é operável por teclado e adapta-se à doca desktop e à folha inferior mobile.
- Módulos, estado da bancada e recursos já aprovados permanecem compatíveis.

## Bloco 05 — Contrato responsivo e interação mobile (0.9.8)

A cena permanece geometricamente estável ao abrir/trocar Montagem, Ver e Dados; as folhas inferiores usam rolagem própria e seus controles têm alvos mínimos de 44 px. Em telas estreitas, a ação de limpar fica no menu Mais e conserva confirmação, Desfazer e recuperação. A altura visível e o teclado virtual são considerados no posicionamento das folhas, sem redesenhar o estado científico. Novos estilos de geometria compacta ficam concentrados em `mobile-contract.css`. Consulte `docs/ACEITE-BLOCO-05-0.9.8.md`.

**Escopo dos testes:** Chromium por carregamento isolado do HTML em nove tamanhos; abrir `file://`, HTTPS/localhost, PWA instalada e outros navegadores requer validação adicional.

## Auditoria funcional do menu · 0.9.9

A gaveta mantém os SVGs locais e a navegação existente. O menu contextual reconhece missões, roteiros e atividades do professor, apresenta o progresso real, valida critérios ao registrar etapas e retorna ao catálogo correspondente ao encerrar com confirmação. As preferências de leitura, espaçamento e tamanho da fonte passam a atingir a aplicação e não somente a gaveta. Montagens prontas neutras e Tour guiado foram incorporados na 0.9.10; Libras offline e o feedback de extensões ainda aguardam implementação compatível. Consulte `docs/AUDITORIA-MENU-0.9.9.md`.

## Revisão de menu · 0.9.10

- Montagens prontas neutras, incluindo criação e exclusão de modelos locais (até 8) com validação; substituição da cena com confirmação e uma única operação Desfazer.
- Tour guiado de cinco etapas com destaque dos controles reais, botões Voltar, Próximo e Pular, ESC e foco devolvido ao comando.
- Perfis de visão de cores: filtros de simulação aproximada com matrizes locais, não critérios clínicos nem substitutos dos rótulos textuais.
- Modo projetor e preferência de tela inicial preservados e sem interferir em atividades orientadas.
- Sonorização, vibração e Libras permanecem indisponíveis sem extensões locais homologadas; a aplicação não importa bibliotecas por CDN.
- Homologação real de WebKit/Safari, Firefox, PWA instalada e dispositivos físicos continua pendente.

Consulte `docs/AUDITORIA-MENU-0.9.10.md`.

## Auditoria da Home · 0.9.12

A Home mantém a identidade visual e os cinco caminhos aprovados. Quando existe uma atividade orientada válida, oferece ações para rever ou retomar essa atividade e para voltar à bancada, sempre consultando o catálogo oficial ou local e o progresso registrado. O vínculo é preservado no armazenamento local, validado a cada abertura e apagado ao encerrar a atividade; referências a atividades excluídas são ignoradas. O resumo de objetos é calculado a partir do projeto válido salvo, sem criar um segundo estado da cena. A navegação pelo teclado transfere o foco ao destino, e o layout adapta as ações contextualizadas a telefones estreitos. Ver `docs/AUDITORIA-HOME-0.9.12.md`.

## Auditoria dos ambientes educacionais · 0.9.15

Aprender permite consultar os temas e marcar sua revisão sem iniciar uma atividade. Missões e Roteiros possuem detalhe separado do ato de **Montar na bancada**. A sessão orientada preserva a bancada livre, utiliza uma cena própria e mantém seu módulo de execução. O encerramento restaura a cena e o módulo anteriores, enquanto as tentativas incompletas podem retomar sua própria montagem por checkpoints locais. Os critérios de leitura utilizam a sequência de medições para evitar contar dados anteriores à tentativa.

O editor do professor aceita missões de uma etapa e roteiros de duas a cinco etapas, com módulo declarado. Atividades locais já existentes sem o campo de módulo são aceitas por compatibilidade e utilizam a configuração Livre. Consulte `docs/AUDITORIA-EDUCACIONAL-0.9.15.md` para testes, limites e pendências.

## 0.9.15 — Identificação e relatório por tentativa

A identificação do participante acompanha a investigação orientada e seus checkpoints. A geração de relatórios agora vincula a atividade, o módulo e suas etapas aos registros da tentativa, filtrando notas e leituras anteriores. Ao encerrar com evidências, o documento é preservado antes da restauração da bancada livre; não há relatórios vazios ou duplicação do mesmo estado. [Contrato de aceitação](docs/ACEITE-0.9.15.md).

## 0.9.15 — Integridade do ciclo de vida das atividades

As transições entre a bancada livre e uma investigação orientada não compartilham mais o histórico de Desfazer/Refazer. A retomada preserva o identificador e os campos de identificação da **mesma tentativa** após recarregar checkpoints; registrar etapas, iniciar e encerrar dependem de confirmação de armazenamento. Vínculos legados incompletos não substituem a bancada livre. Consulte [a auditoria de aceitação 0.9.15](docs/ACEITE-0.9.15.md) para os critérios e testes.


## 0.9.16 — Auditoria de recuperação e segurança operacional

- **Conflitos entre abas:** a versão observada dos documentos críticos (cena, educação, relatórios, sessão e checkpoints) é conferida antes de gravar. O evento `storage` alerta sobre alterações externas; em caso de divergência, a aba interrompe modificações e solicita recarga, evitando sobrescritas silenciosas. Não equivale a transações atômicas entre abas: ações simultâneas no mesmo milissegundo e falhas totais do dispositivo ainda precisam de validação adicional.
- **Importação de Caderno:** backups não substituem registros durante uma investigação ativa, inclusive se a atividade começar durante a confirmação.
- **Importação de atividades:** limpeza dos checkpoints passa a preceder a troca da biblioteca, com restauração da cópia anterior se a gravação da nova biblioteca falhar. Não há garantia de transação multichave diante de desligamento abrupto.
- **Encerramento:** se a sessão não puder ser removida do armazenamento, o checkpoint anterior é restaurado e a investigação permanece ativa.
- **Offline:** sem serviços de rede ou bibliotecas novas. Testes de execução em PWA instalada e navegadores alternativos continuam pendentes.

Consulte `docs/ACEITE-0.9.16.md` para o escopo e os resultados dos testes.

## 0.9.17 — Auditoria documental

- **Caderno:** filtros por observações, hipóteses e conclusões, com cronologia preservada.
- **Exportações:** backup JSON continua completo; CSV independente oferece codificação UTF-8, tratamento de campos, aspas e valores potencialmente interpretados como fórmulas.
- **Impressão:** Caderno com cabeçalhos e entradas históricas e relatório para preenchimento manual com identificação e campos de escrita. O modelo manual não cria dados ou relatórios artificiais.
- **Limpeza:** apagar registros exige confirmação, é bloqueado durante atividades e não remove cópias históricas dos relatórios emitidos.
- **Compatibilidade:** contratos JSON, edição de cena e fluxo educacional das versões anteriores preservados.

Consulte `docs/ACEITE-0.9.17.md` para os cenários executados e as limitações de homologação.
