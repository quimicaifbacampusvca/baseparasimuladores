# Base Demo Oficial - SI · 0.8.0

Plataforma universal para simuladores educacionais. **Versão 0.8.0 — Acabamentos, PWA e standalone.**

## Executar sem rede

- **Standalone recomendado para distribuição direta:** abra `standalone.html`. É um único arquivo HTML com interface, estilos, código e identidade embutidos. Não exige instalação nem CDN; o armazenamento do navegador ainda pode sofrer limitações de privacidade/permissão.
- **PWA/web:** abra `index.html` sob HTTPS ou localhost. Após o cache inicial completar, a interface pode ser utilizada offline. A instalação pela interface é oferecida somente quando o navegador a suporta.
- **Desenvolvimento:** execute `npm run build` para compilar `app.js` e gerar o standalone, `npm test` para validar as camadas ou `npm run check` para compilar e testar. O TypeScript só é necessário no ambiente de desenvolvimento.

## Recursos preservados

- Navegação, preferências, cena com objetos universais, comandos e histórico Desfazer/Refazer.
- Workspace com docas Montagem, Ver e Dados, foco e visão geral, mobile responsivo.
- Extensões locais de ferramentas e instrumentos e histórico de leituras.
- Aprender, Missões, Roteiros e autoria de atividades na Área do Professor.
- Caderno de observações, hipóteses e conclusões; relatórios históricos com impressão, HTML autocontido e backups JSON.

## Distribuição técnica

`index.html`, `app.js`, CSS e ícones são recursos locais. O Service Worker versionado pré-armazenará os recursos em uma origem HTTPS ou localhost, sem guardar dados pessoais. O standalone é gerado pelo script `scripts/build_standalone.py`, com CSS, JS e ícones incorporados e CSP por hash.

A cópia standalone não utiliza Service Worker. Nem PWA nem standalone sincronizam informações com servidores: dados e backups ficam sob controle do usuário.

## Verificação e limites

A bateria `npm run check` valida os contratos das oito camadas, a existência dos arquivos do pré-cache e a integridade estrutural do standalone. Testes manuais e de navegador, incluindo uso realmente desconectado, constam de `docs/ACEITE-0.8.0.md`.

Ações com permissões de link e homologação em Firefox, Safari/WebKit, aparelhos físicos e impressão permanecem etapas posteriores. A base não contém motor científico especializado e não possui login ou conexão obrigatória.

## Licença

GPL-3.0, consulte `LICENSE`.
