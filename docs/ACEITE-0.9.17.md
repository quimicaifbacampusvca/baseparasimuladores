# Aceitação 0.9.17 — Caderno, Relatórios e impressão

Auditoria documental da família de simuladores, sem dependência de motores especializados.

## Entregas

- Exportação CSV em UTF-8, com separador ponto e vírgula, escape de aspas e proteção contra fórmulas de planilhas.
- Filtro da linha do tempo por observação, hipótese e conclusão, sem alterar os registros guardados.
- Impressão do Caderno em folha própria; mantém intactos registros e relatórios.
- Limpeza do Caderno com confirmação; impede limpeza durante investigação orientada; relatórios permanecem preservados.
- Folha de relatório para preenchimento à mão, gerada a partir da identificação corrente, sem gravar dados artificiais.
- Impressão existente de relatórios salvos mantida e unificada com o fluxo de impressão.
- Armazenamento e importação JSON antigos mantidos no mesmo esquema documental.

## Limites de homologação

A impressão física, a recuperação após recarga em PWA instalada e os navegadores Firefox e WebKit devem ser verificados em ambiente com suporte a essas execuções. A impressão em Chromium emulado é teste de fluxo, não valida impressão em papel. A edição de notas já emitidas não faz parte da mecânica documental homologada nesta fase.
