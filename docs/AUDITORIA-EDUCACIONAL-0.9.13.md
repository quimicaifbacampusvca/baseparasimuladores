# Auditoria de fluxos educacionais — 0.9.13

## 1. Escopo e responsabilidades

A presente rodada abrange **Temas (Aprender), Missões, Roteiros Experimentais e autoria local do professor**. São contratos de navegação, investigação e persistência independentes de qualquer domínio científico específico. A interface da Home, o Workspace, as docas e a identidade visual permanecem os mesmos, salvo as correções necessárias ao comportamento orientado.

## 2. Ciclo de vida da investigação

1. **Consultar** a atividade: acessar o catálogo e ler o objetivo **não inicia** nem altera a bancada ou o progresso.
2. **Montar na bancada**: cria ou recupera a tentativa selecionada, guarda a bancada livre, aplica o módulo da atividade e abre uma cena de trabalho separada.
3. **Investigar**: os objetos, a seleção e os registros instrumentais compõem os critérios previstos na atividade. As leituras são contadas a partir de uma sequência registrada no início da tentativa, não do tamanho global do histórico (limitado a quarenta leituras).
4. **Conferir e registrar**: só registra a etapa quando o critério do passo atual é satisfeito e quando aquela atividade está de fato em andamento. A confirmação manual permanece explícita.
5. **Encerrar**: requer confirmação, restaura bancada e módulo livres e preserva etapas e, se incompleta, o último estado da montagem orientada para posterior retomada.
6. **Iniciar nova tentativa**: após concluir, requer nova confirmação, limpa o checkpoint daquela atividade e reinicia seu progresso. Uma atividade diferente não toma a sessão ativa sem encerramento anterior.

## 3. Catalogação e autoria

- Temas permanecem textos independentes, com marcador simples de conclusão e acessos contextualizados para investigar, consultar missões ou consultar roteiros.
- Missões oficiais e criadas pelo professor continuam usando uma etapa; roteiros do professor aceitam de **duas a cinco etapas** com critérios de confirmação manual, quantidade de objetos, seleção e medições.
- Cada atividade nova possui módulo declarado: Livre, Explorar, Medir ou Calcular. Atividades existentes sem campo de módulo continuam válidas e são interpretadas como Livre, sem alterar seus IDs, dados ou progresso.
- A atividade no modo Medir/Calcular recebe um objeto demonstrativo neutro, não selecionado, que permite observação em módulos sem ferramenta de criação. O objeto não é apresentado como fenômeno científico validado.
- Exportação/importação JSON e links de consulta/execução permanecem locais; a permissão do link é uma configuração de interface, **não autenticação**.

## 4. Regressões realizadas

- Compilação TypeScript e geração do standalone com CSS/JavaScript/SVG embutidos e política CSP por hashes.
- **22 conjuntos de testes Node**: fundação, cena, histórico, módulos, extensões, educação, registros, distribuição, continuidade da Home e novo ciclo de sessão orientada.
- Browser Chromium, HTML autocontido: **1440×900, 390×844 e 320×700** — consulta sem ativação, iniciar, isolamento da cena livre, adicionar objetos, conferir etapa, encerrar, restaurar bancada e conferir ausência de erros JavaScript/overflow.
- Professor Chromium **1440×900 e 390×844** — roteiro personalizado de três etapas, vínculo com Medir, inclusão no catálogo, início com objeto neutro e recuperação do módulo Livre.
- Revisão das docas Chromium **1440×900, 1024×768, 390×844, 320×700 e 844×390** — mudança de módulos, categoria Missão somente com sessão real e estabilidade da cena.
- Home Chromium **1440, 390 e 320 px** — rota, foco, retomada contextual e preservação da sessão.

## 5. Limites de homologação

A equivalência operacional **não é total** nesta versão. Ainda faltam o cabeçalho de identificação do participante para cada atividade, o relatório específico da tentativa com todos os registros associados, regras completas de restrição de navegação/compartilhamento de contextos orientados, uma auditoria detalhada da pedagogia de cada módulo, execução real com instalação PWA/`file://`, Firefox, Safari/WebKit e dispositivos físicos. A camada demonstrativa de ciência permanece intencionalmente genérica.

Os testes Chromium foram executados com o mesmo standalone carregado no navegador em ambiente sem origem HTTP. Isso verifica interações reais de interface, **não comprova** o ciclo completo de armazenamento entre reinicializações do navegador nem a instalação PWA; a restauração do estado persistido também foi verificada por teste automatizado com armazenamento simulado.

**Status:** rodada 0.9.13 implementada e verificada nos cenários indicados; sem declaração de homologação integral da plataforma.
