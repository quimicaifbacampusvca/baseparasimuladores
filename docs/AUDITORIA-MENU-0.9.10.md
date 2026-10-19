# Auditoria funcional — Menu 0.9.10

## Escopo
Montagens prontas, Tour orientado, apresentação e filtros de visão de cores. Esta documentação descreve apenas a Base Demo Oficial - SI.

## Contrato de montagens
- Três modelos neutros incorporados localmente e até oito guardados pelo usuário.
- A aplicação das montagens altera o estado por um único comando atômico reversível.
- A substituição de objetos exige confirmação; cancelamento preserva o projeto.
- Identificadores, nomes, limites geométricos e dados locais passam por validação.
- Em módulos que bloqueiam manipulação, o botão Montar fica desabilitado.
- Guardar não substitui um backup exportado: os dados permanecem no armazenamento local do navegador.

## Contrato do Tour
- Cinco etapas relativas a cena, Montagem, Foco/Visão geral, Ver e Dados.
- Destaque geométrico do alvo e cartão reposicionado no espaço disponível.
- Escape, Pular e Concluir fecham o diálogo e restituem o foco ao menu principal.
- Tour não é executado durante atividade orientada.

## Apresentação e acessibilidade
- Preferências globais de tema, alto contraste, texto, movimento, leitura e modo projetor persistidas localmente.
- Simulações aproximadas de protanopia, deuteranopia e tritanopia por matrizes SVG e acromatopsia por escala de cinza.
- Disponibilidade offline de Libras, sonorização e vibração: não homologada, controles não fingem execução.

## Evidências e limites
- Compilação TypeScript e testes de estado e integração do menu executados.
- Execução em navegador verificada nos cenários disponíveis; testes em navegadores e dispositivos físicos externos continuam pendentes.
