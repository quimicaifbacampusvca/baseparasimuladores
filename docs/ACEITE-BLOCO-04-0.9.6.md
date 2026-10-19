# Base Demo Oficial - SI · Correção da organização da Montagem · 0.9.6

## Escopo

Correção do contrato de navegação interna das docas, sem adicionar capacidades científicas ou alterar o núcleo de objetos.

## Categorias canônicas

- **Resumo**: apresenta a configuração corrente da cena; o cabeçalho contextual identifica esse nível como "Montagem".
- **Preparo**: contém as ações universais disponíveis para preparar a cena.
- **Objetos**: exibe seleção e edição dos objetos, quando o módulo permite modificações.
- **Módulo**: concentra modo de trabalho e configuração das extensões locais.
- **Missão**: aparece somente durante uma atividade orientada ativa.

A barra inferior mantém **Montagem, Ver, Dados**, sem expor categorias internas na navegação global. Em atividade guiada a aba **Missão** substitui a aba **Módulo**. Em módulos sem autorização de manipulação, **Preparo** e **Objetos** são ocultados, mas a navegação do Módulo permanece acessível para permitir mudanças.

## Contratos

1. Não expor **Montagem** ou **Ajustes** como abas internas: o primeiro nome é o acesso ao painel; ajustes devem integrar o painel funcional correspondente.
2. Nunca deixar um painel ativo se a respectiva aba ficou indisponível por mudança de contexto.
3. Preservar acesso por teclado, foco visível, áreas clicáveis com mínimo de 44 px, ausência de rolagem horizontal e estabilidade da cena ao abrir painéis mobile.
4. Não perder dados de preferências anteriores. `workspace-layout-v1` com `leftTab=montagem` migra para `preparo` e `leftTab=ajustes` para `modulo`. Novas preferências usam `schemaVersion=2`.
5. Todos os SVGs usados na interface devem estar incorporados localmente no HTML autossuficiente e/ou no pacote offline; nenhuma dependência remota em tempo de execução.
6. Sem sessões guiadas não mostrar aba Missão. A presença de Missão não é dependente de detalhes científicos do módulo.

## Limites da homologação

A vistoria desta rodada cobre a doca Montagem e a normalização de seus controles. As demais superfícies da Base Demo Oficial - SI demandam inspeção visual específica e os navegadores Firefox, WebKit/Safari e a execução real de instalação PWA e `file://` permanecem sujeitos a homologação dedicada.
