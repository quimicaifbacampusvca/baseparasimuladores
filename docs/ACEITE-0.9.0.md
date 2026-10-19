# Aceite técnico — Vistoria funcional 0.9.0

## Objetivo

Auditar as camadas existentes e corrigir regressões verificáveis sem substituir o workspace, introduzir conteúdo científico ou tornar o programa dependente de conexões externas. **Esta versão não representa homologação final.**

## Correções de escopo

1. **Menu lateral em telas compactas:** sobreposição explícita, fundo modal, acesso ao menu por teclado, retenção de foco e restauração por Escape, botão e toque no fundo. A região principal torna-se inerte enquanto o menu estiver aberto.
2. **Persistência indisponível:** toda falha de leitura ou gravação por restrições do navegador deve exibir aviso duradouro; não afirmar que o projeto foi salvo. Exportação voluntária continua sendo a alternativa de portabilidade.
3. **Estados ocultos:** elementos com atributo `hidden` não devem ser expostos por regras de `display` de componentes, incluindo o botão de instalação.
4. **Offline e distribuição:** o cache da PWA usa a versão 0.9.0 e inclui os recursos locais da vistoria; o standalone incorpora o novo estilo. A versão 0.9.0 é construída da mesma fonte nas duas distribuições.
5. **Regressão:** execução automatizada de todos os contratos das camadas 0.1 a 0.8, além da nova bateria de vistoria. Não remover ou redesenhar componentes antigos.

## Matriz de aceitação

| Função | Situação na 0.9.0 | Critério de aceite | Limitação |
| --- | --- | --- | --- |
| Navegação e temas | Implementada, em vistoria | Links, rotas e preferências sem erro | Teclado e leitores de tela reais requerem ensaios dedicados |
| Estado e objetos | Implementada, em vistoria | Manipulação e histórico com validação | Objetos demonstrativos, não objetos científicos |
| Workspace e docas | Implementada, em vistoria | Foco/visão geral, abertura, fechamento, mobile e desktop | Sem certificação de equivalência geométrica pixel a pixel |
| Menus e diálogos | Corrigida nesta rodada | Bloqueio do fundo, Escape, Tab e retorno do foco | Safari e Firefox ainda requerem execução real |
| Ferramentas e instrumentos | Implementada, parcial | Contratos de extensão e leituras | Não fornece biblioteca universal de motores científicos |
| Aprender, missões e roteiros | Implementada, parcial | Critérios verificáveis e progresso local | Não há todos os modelos de atividade e capacidades |
| Área do Professor | Implementada, parcial | Autoria local e JSON validado | Links de estudante e restrições por capacidade ainda não implementados |
| Caderno e relatórios | Implementada, em vistoria | Snapshot, exportação e impressão declarativa | Impressão física/PDF precisa ser homologada |
| Manual contextual | **Pendente** | Navegação e ajuda contextual reutilizáveis | Ainda não implementado |
| Módulos configuráveis | **Pendente** | Alternância por manifesto, capacidades por módulo | Não há sistema geral de módulos |
| Portabilidade PWA/standalone | Implementada, em vistoria | Empacotamento autocontido e cache completo | Testes PWA instalada offline e `file://` reais pendentes |
| Acessibilidade | Parcial | Foco, contraste, teclado, movimento reduzido e zoom | Avaliação de leitor de tela, 200% e dispositivos reais pendente |

## Testes automatizados e validação

- `npm run check`: compila TypeScript, gera `standalone.html`, executa regressões de todas as camadas e verificação de integridade.
- `python3 tests/browser_smoke.py`: executa cenários visuais no Chromium local, por injeção do HTML autocontido em um contexto de teste; não equivale a abrir por `file://` nem a instalar uma PWA.
- É obrigatório declarar os ambientes não testados como **pendentes**, sem inferir aprovação por similaridade entre motores.

## Critérios para continuar

A 0.9.0 pode ser publicada como versão de vistoria após compilação, testes de contrato, testes Chromium disponíveis e conferência de distribuição. A versão **1.0.0 só poderá ser homologada** após resolver os bloqueadores funcionais essenciais, executar os testes multiplataforma e verificar o funcionamento realmente offline das duas distribuições.
