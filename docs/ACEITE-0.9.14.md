# Base Demo Oficial - SI — Auditoria funcional 0.9.14

## Identificação, sessão experimental e relatório

Nesta rodada foi consolidado o vínculo entre a atividade educacional, sua tentativa e o registro documental. Nenhuma mudança científica específica foi incorporada. Mantêm-se as rotas, as docas e as permissões existentes.

### Contratos

1. Consultar os detalhes não cria sessão nem relatório. O comando **Montar na bancada** cria a tentativa, depois de validar os campos de identificação (nome, turma, data, professor e grupo; data obrigatória).
2. A identificação pertence à tentativa, é editável durante a investigação, persiste na sessão local e acompanha checkpoints interrompidos. Atividades salvas sem esses campos são migradas com valores iniciais seguros.
3. Cada tentativa recebe identificador próprio. O Caderno associa novas notas ao identificador de tentativa; relatórios orientados incluem **somente** as notas correspondentes. Leituras anteriores à linha de base da tentativa são excluídas. As opções dos relatórios livres permanecem inalteradas.
4. O relatório da tentativa preserva a identificação, atividade, módulo, objetivo, etapas concluídas/pendentes, montagem, notas e leituras capturadas. Relatórios já emitidos são cópias imutáveis. Importação inválida não substitui documentos existentes.
5. Ao encerrar uma tentativa com trabalho registrado, uma cópia documental é arquivada **antes** da restauração da bancada livre. Uma tentativa retomada pode produzir registros parciais e finais distintos; reencerrar um estado já arquivado não duplica a cópia. Sem espaço para preservar os dados, a saída é recusada com aviso.
6. Uma tentativa sem evidências não gera um relatório vazio. Módulos de medição com objeto neutro inicial não contam a mera presença desse objeto como realização.
7. O seletor visual de módulos fica bloqueado durante uma atividade orientada; sua configuração anterior é restaurada após o encerramento.

### Validações executadas

- Compilação TypeScript estrita e standalone com CSS/JavaScript embutidos, CSP por hashes;
- 23 conjuntos automatizados, incluindo relatórios por tentativa, filtragem de leituras e notas, backups e validação;
- Chromium 1440 × 900, 390 × 844 e 320 × 700: identificação, Caderno, relatório, conclusão, encerramento e ausência de sobreposição horizontal;
- Chromium 1440 × 900 e 390 × 844: interrupção, recuperação da cena e da identificação, emissão de relatório parcial e final;
- Regressão de jornada educacional anterior em 1440 × 900, 390 × 844 e 320 × 700.

### Limites de homologação

A impressão física em papel, persistência em `file://`, instalação PWA real e execução em Firefox/Safari/WebKit e dispositivos físicos ainda exigem verificação separada. Os testes Chromium foram executados por carregamento isolado do HTML autocontido. O armazenamento local é condicionado às permissões do navegador. O histórico de leituras das extensões é limitado e o relatório só pode preservar leituras ainda disponíveis nesse histórico; não se deve presumir recuperação de dados descartados por esse limite. A exportação HTML e a impressão usam a estrutura do relatório, mas não substituem a conferência física em impressora.

**Resultado:** contratos e percursos desta rodada aprovados nos cenários acima. Equivalência integral e homologação multiplataforma ainda pendentes.
