# Auditoria do menu — 0.9.11

## Escopo

Revisão de Som e toque: manter consentimento explícito, preservar mensagens visuais,
oferecer sinais locais quando o dispositivo suportar e não depender de serviços externos.

## Contrato

- Feedback sonoro: desligado inicialmente, gerado por Web Audio, mediante opção da pessoa.
- Vibração: desligada inicialmente; somente habilitada quando `navigator.vibrate` está disponível.
- Ao ativar, é executado um sinal curto de teste por gesto de usuário.
- Resultados das extensões sinalizam sucesso e alerta, sem ler ou inferir valores científicos.
- A persistência mantém os novos campos `sound`/`vibrate` junto às preferências anteriores.
- Restaurar padrões desativa ambos.
- Preferências não substituem as notificações visuais de status.
- Nenhum recurso remoto incluído; Libras permanece indisponível até homologação local.

## Homologação

Testes automatizados de recursos suportados/não suportados, preferência, eventos e ausência
de áudio não solicitado. Verificação de regressão e integridade da distribuição.
Os testes em dispositivos reais são necessários para concluir áudio e vibração física.
