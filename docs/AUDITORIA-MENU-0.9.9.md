# Auditoria funcional — Menu e contexto de atividades · 0.9.9

## Escopo

Corrigir regras operacionais da gaveta e de suas preferências, sem modificar a arquitetura dos motores de extensão ou o fluxo geral da bancada.

## Cenários verificados

- A atividade deve ser reconhecida pelo identificador, independentemente de sua origem oficial ou criação local.
- A ação **Finalizar atividade** deve conferir o critério efetivo da etapa em vez de apenas navegar.
- O avanço deve persistir no sistema educacional existente, sem duplicar o progresso no menu.
- **Encerrar atividade** solicita confirmação, limpa o contexto de retorno à cena e volta ao catálogo de origem (missões ou roteiros). Cancelar preserva a atividade.
- O tamanho do texto deve atuar na aplicação inteira, em escala de 80% a 200%.
- Leitura simples, espaçamento e redução de movimento devem afetar toda a interface.
- A opção Tela inicial deve expor corretamente seu estado expandido ao leitor de tela.
- Devem permanecer locais os ícones, estilos e scripts necessários.

## Não concluído nesta rodada

- Catálogo de montagens prontas, atualmente desabilitado.
- Tradução em Libras offline, ainda sem pacote local.
- Filtros visuais para protanopia, deuteranopia e tritanopia, ainda sem validação.
- Execução em Safari/WebKit e Firefox em dispositivos físicos.
- Instalação PWA e modo `file://` reais, dependentes de homologação específica.

## Segurança e continuidade

A plataforma usa armazenamento local e não depende de autenticação remota. Os controles de atividades não constituem barreira contra alterações maliciosas no cliente. Preservar o histórico Git, sem alterar o esquema de dados de projetos já armazenados.
