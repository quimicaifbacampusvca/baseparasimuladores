# Construção da Base Demo Oficial - SI — por camadas

## Princípios invariantes

1. Sem copiar motor ou conceitos químicos para o núcleo universal.
2. O SIAB é referência operacional; a equivalência deve ser aferida por testes de fluxo e de layout, não afirmada por semelhança visual.
3. Sem serviços, CDNs ou APIs obrigatórias para usar o simulador; dependências de execução serão locais.
4. Uma fonte de código deverá produzir distribuições web/PWA e standalone compatíveis com as restrições do navegador.
5. O que estiver consolidado e testado não deverá ser reconstruído sem causa documentada.
6. Priorizar navegação por teclado, toque, foco visível, responsividade e contraste desde a fundação.

## Etapas propostas

| Etapa | Analogia | Versões | Entrega observável | Não incluir prematuramente |
|---|---|---|---|---|
| 1 | Alicerces | 0.1.x | Identidade, shell, rotas, contratos, preferências, organização e offline básico | Bancada científica |
| 2 | Colunas estruturais | 0.2.x | Entidades universais, estado, comandos, seleção, desfazer e persistência | Regras de fenômenos específicos |
| 3 | Laje e planta | 0.3.x | Workspace real, docas, foco, visão geral, modo mobile e controles | Instrumentos especializados |
| 4 | Paredes e componentes | 0.4.x | Design system, menus, modais, painéis, caixas de seleção, ações e notificações | Conteúdo de disciplinas |
| 5 | Infraestrutura plugável | 0.5.x | Registries para motores, objetos, ferramentas, instrumentos, visualizações | Acoplamento a um motor fixo |
| 6 | Salas de aprendizagem | 0.6.x | Aprender, missões, roteiros, módulos, professor e permissões | Missões químicas do SIAB |
| 7 | Instalações de dados | 0.7.x | Registros, relatórios, caderno, exportação, impressão e importação | pH/titulação obrigatórios |
| 8 | Acabamento e distribuição | 0.8.x | Identidade amadurecida, PWA completo, standalone de HTML único e acessibilidade refinada | Recursos remotos obrigatórios |
| 9 | Vistoria | 0.9.x | Casos de uso SIAB reproduzidos com domínio neutro; cross-browser, mobile, offline, integridade | Declarar paridade sem evidência |
| 10 | Habite-se | 1.0.0 | Base universal demonstravelmente equivalente em capacidades operacionais, sem ciência fixa | Funcionalidade não homologada |

### Política de versões

- `x.y.0`: implementação completa do escopo de uma etapa.
- `x.y.1` e seguintes: correções de bugs, acessibilidade e regressões da etapa.
- Não antecipar funcionalidades para apenas preencher números de versão.

### Como comprovar equivalência ao SIAB

A matriz de aceitação final comparará, em desktop e mobile: início, navegação, modos, workspace, docas, seleção de objetos, registros, ferramentas, Aprender, Missões, Roteiros, Professor, relatórios, acessibilidade, impressão e comportamento offline. O SIAB original continua externo ao núcleo universal.
