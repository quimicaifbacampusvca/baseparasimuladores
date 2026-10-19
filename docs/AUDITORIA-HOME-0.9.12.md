# Auditoria da Home — 0.9.12

## Escopo
- Cinco caminhos principais, título, marca e grid anteriores foram preservados.
- Ação contextual visível apenas quando há atividade orientada validada no catálogo da instalação.
- Vínculo de retorno persistido em armazenamento local e validado no início da sessão.
- Atividades ausentes, excluídas ou de tipo conflitante não criam botões de retomada.
- Progresso obtido do subsistema educacional; número de objetos obtido do projeto local válido.
- Encerramento limpa o vínculo, mantendo o progresso registrado.
- Atalhos da Home transferem o foco para o destino de navegação.
- Nenhum conteúdo disciplinar, licença remota ou função científica extra.

## Critérios e limitações
A validação local cobre estrutura do HTML, integridade do standalone, testes automatizados, interação Chromium em dimensões móveis e desktop e rotas. O armazenamento pode ser bloqueado por política de origem `file://`; nesses casos o link ativo opera apenas durante a sessão em memória. A comparação completa com outros navegadores, PWA instalada, sessões simultâneas e dispositivos físicos permanece pendente.
