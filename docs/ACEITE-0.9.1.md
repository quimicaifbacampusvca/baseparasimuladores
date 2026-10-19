# Base Demo Oficial - SI — Aceite técnico 0.9.1

## Objetivo

Completar contratos operacionais sem introduzir um motor científico no núcleo e sem alterar a geometria consolidada do ambiente.

## Funcionalidades entregues

1. **Manual contextual:** acesso pela navegação e F1, busca textual sem acentos, tópicos por seção, conteúdo local.
2. **Módulos configuráveis:** Livre, Explorar, Medir e Calcular; capacidades declaradas, persistidas localmente e aplicadas às ferramentas e aos instrumentos (inclusive validação de comandos na camada de extensões).
3. **Visualizadores:** registro de visualizadores por identificador e capacidade, seleção acessível, implementações neutras de Observar, Medir e Analisar e validação de registros duplicados.
4. **Atividades por link:** geração de endereço com payload autocontido, validação estrita, opção **Consultar** (apenas visualização) ou **Consultar e executar localmente** (importa uma cópia local). Nenhum login ou servidor necessário para interpretar o endereço.

## Limitações explícitas

- Os controles de permissão **não são autenticação nem autorização resistente a adulteração**. Qualquer pessoa que receba ou edite um URL pode modificar seu conteúdo. A operação de consulta não modifica a biblioteca local; a de execução requer uma ação voluntária para importar uma cópia.
- Links gerados em `file://` apontam para um caminho local; não são transportáveis para outro dispositivo sem compartilhar também o arquivo standalone. Para links entre dispositivos, é necessário um mesmo endereço de hospedagem web, ainda que o funcionamento do aplicativo seja offline após instalação.
- A seleção de módulos controla capacidades da interface e do runtime de ferramentas, não a validade científica de um motor futuro. Edição básica da cena permanece disponível como função do núcleo.
- Visualizadores padrão apresentam apenas características neutras. Um simulador específico deverá fornecer renderizadores especializados.
- Firefox, WebKit/Safari, PWA instalada e teste de `file://` real em vários dispositivos permanecem pendentes de homologação integral.

## Testes mínimos

Compilação TypeScript; regressão das camadas anteriores; manual, normalização e navegação; módulos persistidos e bloqueio de operações; links e adulteração; visualizadores duplicados; manifesto PWA, standalone e CSP; testes de fluxo Chromium em desktop e mobile.

**Aceite:** publicação de correção incremental `0.9.1` após aprovação da suíte e revisão das limitações. Esta não constitui homologação 1.0.0.
