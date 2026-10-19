# Aceite técnico — Organização interna 0.9.3

## Objetivo

Uniformizar os percursos de descoberta, seleção, leitura, execução e retorno, sem introduzir conteúdo científico no núcleo universal.

## Contratos funcionais

- **Aprender:** catálogo de temas → página de leitura → marcador de conclusão → retorno ao catálogo.
- **Missões:** catálogo → detalhamento de objetivos → bancada → retorno com preservação do progresso → conferência.
- **Roteiros:** catálogo → procedimentos com critérios → montagem → retorno ao roteiro sem reiniciar etapas.
- **Área do Professor:** identificação → procedimentos e regras → revisão e geração → biblioteca, link e exportação.
- **Manual:** busca, índice navegável, abertura contextual por F1 e acesso por tópico.
- **Mobile:** cabeçalhos, botões e índice ajustados sem introduzir rolagem horizontal da página; preservação da bancada e das docas.
- **Offline:** CSS incluído na PWA e no HTML standalone; nenhuma requisição externa obrigatória.

## Não implementado

Os links locais de atividades não representam controle de acesso autenticado. A equivalência visual total, impressão física, instalação PWA, navegadores Firefox e Safari/WebKit e testes em dispositivos reais permanecem em homologação.

## Critérios de aceite

Compilação TypeScript; testes do núcleo e da camada organizacional; testes de navegação, retorno à bancada, execução de etapas, formulário do professor, Manual e layout desktop/mobile. O código e a documentação da base permanecem livres de identificadores de aplicações específicas.

## Prévia de homologação — Bloco 02 / Home

A Home agora reproduz a planta de entrada da família: apresentação simples, ambiente primário vertical no desktop com dois níveis de cartões secundários, compactação em duas colunas no mobile e organização de uma coluna nas menores larguras. Os indicadores foram conectados aos documentos locais validados. Os testes Chromium foram aprovados em oito tamanhos, sem erros de execução nem rolagem horizontal. A revisão humana e a homologação cross-browser seguem pendentes.
