# Base Demo Oficial - SI — Inventário de equivalência funcional 0.9.0

Este documento é independente de qualquer produto ou programa anterior. Compara as funcionalidades **exigidas para a Base Demo Oficial - SI** com sua implementação atual; nenhuma marca comercial ou simulador específico participa do modelo.

## Camadas implantadas

- **Fundações:** identidade parametrizada, páginas por rota, preferências, tema e empacotamento.
- **Entidades e histórico:** objetos genéricos, seleção, alteração, exclusão, desfazer/refazer e validação de dados.
- **Workspace:** Montagem, painel direito Ver/Dados, cena, foco, visão geral, docas desktop e folhas inferiores mobile.
- **Componentes:** menus, avisos e confirmações acessíveis com foco controlado.
- **Extensões:** contratos locais para instrumentos, ferramentas, leituras e operações, sem modelo científico incorporado.
- **Educação:** temas, missões, roteiros e autoria simples de atividades pelo professor.
- **Documentação de atividades:** observações em Caderno, snapshots de relatório, impressão e exportação de backup.
- **Distribuição:** PWA cacheável e arquivo único standalone gerados a partir do mesmo código-fonte.

## Bloqueadores da equivalência completa

| Prioridade | Capacidade faltante ou parcial | Razão para não declarar equivalência |
| --- | --- | --- |
| Alta | Manual do usuário com ajuda contextual | Conteúdo e mecanismo de busca/navegação ainda ausentes |
| Alta | Sistema de módulos configuráveis | O núcleo não alterna capacidades por módulo declarado |
| Alta | Sessões guiadas com compartilhamento por link e permissões | JSON de atividades não substitui links restritos nem sessão do estudante |
| Alta | Homologação de PWA, standalone e preservação dos dados em navegadores reais | Evidência atual é principalmente estática e Chromium por HTML injetado |
| Média | Visualizadores conectáveis de observação, medição e análise | A leitura de instrumentos existe, mas a seleção de visualizadores é incompleta |
| Média | Auditoria ampliada de acessibilidade | Falta ciclo sistemático com teclado integral, zoom, SR, contraste forçado e dispositivos |
| Média | Sistema robusto de importação/exportação de estado global e migração | Há backups específicos, mas ainda não um formato único versionado de toda sessão |

## Regra de aceitação

Não utilizar a expressão **equivalência completa** antes de demonstrar todos os fluxos necessários com testes por cenários e evidências de interface. Implementação da estrutura não significa cobertura de todos os comportamentos. As lacunas restantes deverão integrar uma rodada posterior planejada e especificada, sem alargar artificialmente o escopo de correção 0.9.0.
