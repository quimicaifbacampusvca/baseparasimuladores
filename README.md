# Base Demo Oficial - SI · 0.6.0

Plataforma universal de simuladores, **0.6.0 — Ambientes educacionais**.

## Execução

- Abra `index.html` para utilizar a aplicação local. Não são necessárias dependências externas em execução.
- Em hospedagem HTTPS/localhost a versão PWA oferece cache dos arquivos operacionais para uso offline após instalação/carregamento inicial.
- Para desenvolvimento: `npm run build`, `npm test` ou `npm run check`. O TypeScript 5.8.3 é uma dependência **apenas de compilação**; o JavaScript distribuído já está incluído.

## Recursos da etapa 0.6.0

- **Aprender:** três temas de referência com leitura contextual e marcador de conclusão local, sem placares.
- **Missões:** critérios verificáveis sobre quantidade de objetos, seleção e número de leituras realizadas.
- **Roteiros:** procedimentos sequenciais e botão “Montar na bancada”, retomando a etapa corrente após navegação.
- **Área do Professor:** criação de missões e roteiros de duas etapas com critérios configuráveis, exclusão confirmada e biblioteca local de atividades.
- **Intercâmbio JSON:** exportação e importação validada das atividades do professor, com confirmação explícita e sem sobrescrever o progresso oficial.
- **Persistência:** tópicos concluídos, andamento de missões/roteiros e atividades personalizadas são mantidos em armazenamento local separado da cena.

## Decisões e limitações

- As missões e roteiros oficiais são **demonstrações universais**; seus critérios não introduzem conteúdos científicos fixos.
- O editor usa critérios estruturais disponíveis no núcleo: confirmação manual, quantidade de objetos, seleção e leituras.
- Não há login, serviços remotos, ranking ou pontuação.
- Um JSON exportado permite transportar atividades para outra instalação. Links de aluno com permissões restritas **ainda não foram implementados**; não substitua o JSON por URLs fictícias.
- O registro de conclusão é explícito. Um critério verificável precisa estar atendido no momento da confirmação.
- A interface de bancada, docas, visualização, instrumentos e ações permanece compatível com a série 0.5.x.
- O funcionamento real em Firefox/WebKit e a instalação PWA em dispositivos físicos ainda exigem homologação.

## Arquivos principais

- `src/education-contracts.ts` — tipos e interfaces educacionais.
- `src/education.ts` — modelo e validações sem DOM.
- `src/education-ui.ts` — integração com a interface existente.
- `education.css` — componentes visuais das seções educacionais.
- `tests/education.test.cjs` — testes unitários e validação de importação.
- `docs/ACEITE-0.6.0.md` — critérios de aceite e limites.

## Licença

Consulte `LICENSE` (GPL-3.0), distribuído com o programa.
