# Base Demo Oficial - SI — Auditoria 0.9.15

## Ciclo de vida, recuperação e integridade da atividade

Esta rodada reforça a separação entre bancada livre, investigação orientada e registros do estudante. O núcleo continua universal, sem dependências disciplinares ou alterações dos motores de extensão.

### Contratos verificados

1. **Isolamento entre contextos.** A entrada na investigação abre uma cena de trabalho própria, com histórico de Desfazer/Refazer limpo. Durante a atividade, somente ações feitas nessa cena entram no histórico. Ao encerrar, a cena livre é restaurada com histórico limpo; Desfazer não reabre a investigação nem importa objetos de outra bancada. A substituição reversível de Montagens prontas permanece inalterada.
2. **Continuidade da tentativa.** Checkpoints interrompidos recuperam não só objetos e a linha de base de leituras, mas também o identificador da tentativa e sua identificação (nome, turma, data, professor e grupo). A sessão ativa é recuperada após a reinicialização do motor, com o módulo da atividade; o módulo livre anterior volta quando ela termina.
3. **Gravação confirmada.** Uma etapa só é marcada como registrada se a gravação do documento educacional tiver sucesso. O início de uma atividade é recusado se o vínculo da sessão não puder ser salvo. O encerramento não descarta a sessão caso falhe o arquivamento documental, a gravação do checkpoint ou a limpeza persistida da sessão.
4. **Compatibilidade segura.** Vínculos antigos que apontam para atividades, mas não trazem um retrato confiável da bancada livre, **não são transformados** em sessões artificiais: a cena existente é preservada e o vínculo incompleto é limpo. Documentos educacionais, Caderno, relatórios e projetos antigos continuam utilizando seus contratos anteriores.
5. **Reinício controlado.** Reiniciar uma atividade concluída elimina o checkpoint anterior antes de abrir uma nova tentativa, com confirmação. Excluir ou importar atividades é bloqueado enquanto existir uma investigação ativa, evitando alterações no catálogo que invalidem a sessão.
6. **Nenhum avanço fictício.** O progresso e o conteúdo do relatório continuam vinculados à tentativa, não à simples consulta de uma ficha.

### Testes executados

- TypeScript em modo estrito; 24 conjuntos automatizados, incluindo novo teste de recarga simulada, checkpoint, identidade, módulo, falha de gravação, início/encerramento bloqueados e isolamento de Desfazer.
- Chromium com HTML autocontido em 1440 × 900, 390 × 844 e 320 × 700: jornada educacional, bancada livre, início, critérios e encerramento.
- Chromium em 1440 × 900, 390 × 844 e 320 × 700: identificação, registros, relatórios e ausência de transbordamento horizontal.
- Chromium em 1440 × 900 e 390 × 844: interrupção, retomada, relatórios parciais e finais.
- Chromium em 1440 × 900, 390 × 844 e 320 × 700: isolamento explícito do histórico de Desfazer dentro/fora da investigação.
- Standalone regenerado com CSS/JS embutidos e política CSP por hashes. Pacote ZIP e SHA-256 conferidos após a geração.

### Limites de homologação

A recarga foi reproduzida em processo isolado com armazenamento compartilhado de teste, não por navegação direta `file://` ou PWA instalada. As operações sobre múltiplas chaves de armazenamento são protegidas por verificações de sucesso, mas o `localStorage` do navegador não fornece uma transação atômica entre chaves. Persistência com quota real, concorrência entre abas, impressão física, Firefox, Safari/WebKit e instalação PWA continuam exigindo testes próprios. O histórico de leituras possui limite na extensão; não deve ser confundido com armazenamento ilimitado de dados científicos.

**Situação:** contratos desta rodada aprovados nos cenários enumerados; ainda não representa homologação multiplataforma ou equivalência funcional integral.
