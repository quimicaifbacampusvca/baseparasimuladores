# Aceite técnico — Ambientes educacionais 0.6.0

## Contrato desta camada

1. Manter a identidade, rotas existentes, workspace, docas, mobile, estado e extensões das versões anteriores.
2. Introduzir Aprender, Missões, Roteiros e Área do Professor sem conteúdo científico fixado no núcleo.
3. Permitir concluir/desmarcar temas de leitura com persistência local.
4. Exigir que cada etapa de missão/roteiro verifique o critério correspondente antes de avançar; passos manuais dependem de confirmação explícita.
5. Criar, listar e excluir atividades personalizadas sem afetar atividades oficiais.
6. Exportar/importar JSON com validação estrita de títulos, quantidades, etapas, identificadores e limites, sem executar código ou HTML armazenado.
7. Na importação, preservar o progresso de atividades oficiais e exigir confirmação antes de substituir atividades personalizadas.
8. Garantir que todos os recursos necessários estejam embutidos na distribuição (sem CDN, login ou API obrigatória).
9. Respeitar navegação por teclado, rótulos, foco visível, redução de movimento e layouts compactos.
10. Testar restauração, dados inválidos e regressões das cinco camadas anteriores.

## Escopo implementado

- Catálogo demonstrativo: 3 temas, 3 missões e 2 roteiros oficiais.
- Editor local: missões de 1 etapa e roteiros de 2 etapas, 4 tipos de critério, até 24 atividades personalizadas.
- Indicador de conclusão sem pontos ou ranking.
- Armazenamento separado do projeto de cena e do histórico de instrumentos.

## Limites declarados

- Sem links de aluno com permissões e compartilhamento remoto nesta série.
- A validação só examina o estado atual e o total de leituras; não rastreia autoria temporal de cada passo.
- Não há sincronização entre dispositivos nem mecanismo de autenticação.
- Testes cross-browser e PWA em dispositivos reais: pendentes da homologação específica.
