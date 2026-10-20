# Aceitação — 0.9.16: Recuperação e conflitos

## Escopo

A Base Demo mantém documentos locais separados para a cena, a biblioteca educacional, o Caderno, os checkpoints e as sessões em andamento. A versão 0.9.16 restringe substituições destrutivas enquanto há atividade orientada. A escrita de documentos críticos verifica se o valor que esta aba observou continua sendo o valor atual, e a escuta do evento `storage` detecta mudanças de outras abas. Ao haver divergência, a aba bloqueia novas operações na cena, no progresso e no armazenamento crítico, orientando a recarga. As demais abas não são encerradas à força.

## Critérios de aceitação

1. A escrita de um documento crítico não pode sobrescrever um valor externo diferente do que foi lido localmente.
2. Operações da cena, Desfazer e avanço educacional são impedidos após a detecção de conflito, inclusive quando o evento de armazenamento ainda não chegou.
3. Edições de preferências não geram bloqueio dos documentos científicos.
4. A importação do Caderno é recusada durante uma investigação orientada antes e depois de eventual confirmação assíncrona.
5. Uma falha ao importar atividades não deve deixar checkpoints antigos apagados sem tentativa de restauração, e falha ao encerrar a sessão deve restaurar o checkpoint prévio.
6. Falhas de escrita continuam sendo relatadas sem declarar a atividade salva.

## Limites

`localStorage` não fornece transações atômicas entre chaves e abas, e o evento `storage` é assíncrono. O bloqueio reduz perdas por concorrência, mas **não garante exclusão mútua** para operações absolutamente simultâneas. Para colaboração multiusuário real seria necessário outro mecanismo transacional. Armazenamento indisponível não equivale a armazenamento íntegro. O teste `file://` e PWA instalada em origem real, Firefox e Safari/WebKit seguem pendentes por limitações da execução disponível.

**Verificação:** `npm run check` executa compilação, standalone e regressão; `node tests/exception-recovery.test.cjs` exerce conflito com/sem evento, recusa de edições e recuperação.
