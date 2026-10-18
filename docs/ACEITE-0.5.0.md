# Aceite técnico — Extensões universais 0.5.0

## Objetivo

Criar contratos reusáveis para integrar ferramentas, estados e instrumentos de diferentes simuladores, mantendo as estruturas de navegação, bancada, cenas e docas preexistentes.

## Requisitos de aceitação

1. Identificação inequívoca da extensão por ID e versão semântica; duplicidades recusadas.
2. Registro local tipado, ativação e desativação sem destruir objetos da cena.
3. Contexto com cópias da cena, objeto selecionado e estado; sem acesso obrigatório ao DOM.
4. Ferramentas registradas executam comandos universais validados por `SceneStore`.
5. O estado da extensão só é persistido quando a operação é aceita; saídas inválidas devem ser recusadas.
6. Instrumentos registrados retornam leituras numéricas finitas e rotuladas; até 40 registros persistidos.
7. Seleção obrigatória quando requerida por ferramenta/instrumento; ausência da seleção bloqueia ação.
8. Ferramentas acessíveis em Montagem/Ajustes, medições em Ver, histórico em Dados.
9. Preservar menus, notificações, histórico de cena, docas, modo Foco, Visão geral e mobile.
10. Referências remotas inexistentes; CSS da extensão incluído no pré-cache local; CSP do aplicativo preservada.
11. Dados incompatíveis ou corrompidos não podem ser executados nem aplicados como estado válido.
12. Compilação, testes unitários e regressão responsiva sem erros JavaScript ou overflow.

## Exemplo neutro

- Uma extensão de operações sobre objetos altera posição e aparência.
- Instrumentos observam posição X, quantidade de objetos e número de ferramentas executadas.
- Os resultados são estritamente demonstrações das interfaces de extensão; não são um modelo de uma ciência.

## Limitações explícitas

- Plugins dinâmicos externos não são executados nem carregados automaticamente.
- O núcleo não define unidades científicas ou fórmulas de domínio.
- Histórico de cena, estado da extensão e registros de instrumentos possuem ciclos de vida distintos nesta série. Desfazer/refazer afeta comandos de cena, não reverte registros nem contadores da extensão.
- Homologação efetiva em todos os navegadores e plataformas continua separada da aprovação de testes unitários.
