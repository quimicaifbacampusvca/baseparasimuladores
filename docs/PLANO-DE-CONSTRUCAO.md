# Construção da Base Demo Oficial - SI — por camadas

## Princípios

1. O núcleo é independente de motores e conteúdos especializados.
2. A equivalência funcional será demonstrada por testes de fluxos e de interface, nunca por aparência superficial.
3. Execução sem CDNs, APIs externas ou rede obrigatória; recursos de execução empacotados.
4. Uma fonte deverá gerar distribuições web/PWA e standalone adequadas às restrições dos navegadores.
5. Estruturas homologadas não serão reconstruídas sem justificativa e testes de regressão.
6. Teclado, toque, foco, responsividade e contraste são requisitos desde a origem.

## Etapas

| Fase | Analogia | Versões | Entrega observável |
|---|---|---|---|
| 1 | Alicerces | 0.1.x | Identidade, navegação, base responsiva e offline inicial |
| 2 | Colunas | 0.2.x | Entidades, cena, comandos, seleção, histórico, persistência |
| 3 | Laje | 0.3.x | Workspace, docas, foco, visão geral e mobile |
| 4 | Paredes | 0.4.x | Design system, painéis, diálogos e interações |
| 5 | Infraestrutura | 0.5.x | Contratos para motores, objetos, instrumentos e visualizações |
| 6 | Salas | 0.6.x | Aprendizagem, missões, roteiros, módulos e recursos docentes |
| 7 | Instalações | 0.7.x | Medições, registros, relatórios, exportação e impressão |
| 8 | Acabamento | 0.8.x | Identidade madura, PWA completo e standalone |
| 9 | Vistoria | 0.9.x | Homologação de fluxos, navegadores, acessibilidade e offline |
| 10 | Entrega | 1.0.0 | Base funcional e homologada |

## Versionamento

- `x.y.0`: entrega da responsabilidade integral da etapa.
- `x.y.1+`: apenas correções, melhorias de acessibilidade e regressões identificadas.
- O avanço depende do cumprimento dos critérios de aceite de cada fase.

## Comprovação final

Testar início, navegação, modos, workspace, docas, seleção de objetos, ferramentas, atividades, recursos docentes, relatórios, acessibilidade, impressão, persistência e comportamento offline em desktop e mobile.
