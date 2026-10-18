# Aceite técnico — Caderno e relatórios 0.7.0

## Escopo implementado

- O Caderno recebe registros classificados como observação, hipótese ou conclusão. Quando existir um objeto selecionado, o registro guarda sua identidade e nome à época do salvamento.
- O Caderno aceita até 80 registros, com texto de 1 a 1.200 caracteres. Cada item recebe ID e instante de criação.
- Instrumentos seguem mantendo suas leituras no subsistema de extensões; a camada documental consulta os registros já produzidos, sem escrever em sua área de persistência.
- O gerador de relatórios aceita título obrigatório, responsável opcional, data civil válida, objetivo opcional e seleção independente de três seções: montagem, observações e leituras.
- Um relatório armazena **cópias** dos dados selecionados no momento de sua emissão. Alterações ou exclusões futuras na cena ou no Caderno não modificam os relatórios antigos.
- São admitidos até 20 relatórios locais; exportação HTML totalmente autocontida e impressão A4 via CSS com isolamento dos demais controles.
- Exportação e importação de backup JSON com validação integral, tamanho máximo de entrada e confirmação antes de substituir o Caderno e os relatórios.
- A importação não substitui projetos de cena, preferências, atividades, progresso ou estado das extensões.

## Compatibilidade e privacidade

- Os dados permanecem no navegador, sem pedidos obrigatórios a servidores e sem scripts ou fontes remotos.
- Interfaces textuais são montadas com `textContent`. O HTML exportado deriva da árvore de documentos, para escapar o conteúdo inserido pelo usuário.
- Os componentes desta etapa não alteram a geometria nem os controladores do Workspace Universal.
- A interface é adaptada a 320, 390, 1024 e 1440 pixels. Impressão, importação e interações devem ser verificadas no navegador antes da homologação.

## Critérios de teste

1. Compilação TypeScript e regressão das camadas 0.1–0.6 aprovadas.
2. Testes positivos e negativos de nota, leitura, relatório, restauração e capacidade de armazenamento.
3. Persistência após recriação do subsistema e imutabilidade dos relatórios históricos.
4. Confirmação de exclusão/importação; nenhuma alteração de dados em caso de cancelamento.
5. Renderização sem rolagem horizontal e sem erros JavaScript em desktop e mobile.
6. Conferência de impressão e HTML autocontido, sem imagem/URL remota.

## Limitações explícitas

- Não existe mecanismo científico na plataforma-base; interpretação de leituras depende do simulador especializado.
- A exportação HTML é um documento estático, não executa nem restaura uma sessão da bancada.
- O backup JSON é restrito ao Caderno e a seus relatórios; o limite de 300.000 caracteres pode exigir a redução de registros antes do intercâmbio.
- A sincronização entre dispositivos e o envio automático de relatórios não fazem parte desta versão.
- Firefox, Safari/WebKit, PWA instalada e funcionamento por `file://` permanecem para homologação independente.
