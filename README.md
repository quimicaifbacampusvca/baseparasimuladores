# Base Demo Oficial - SI

**Versão 0.1.0 — Fundações**. Plataforma-base universal para simuladores educacionais, construída por etapas tomando a experiência operacional do SIAB 1.0.0 como referência. O núcleo não inclui o motor ácido-base ou conteúdos científicos.

## Como abrir

- **Standalone de arquivos locais nesta etapa:** abra `index.html` no navegador, inclusive sem internet. Este pacote de arquivos ainda não é a distribuição final de HTML único.
- **Servidor / PWA:** execute `python3 -m http.server 8080`, entre em `http://localhost:8080` e teste a instalação PWA. O service worker armazena todos os arquivos de execução.
- **Desenvolvimento:** `npm install` (apenas para obter o compilador TypeScript), `npm run build`, `npm test`. `app.js` compilado já acompanha a distribuição, por isso nenhuma instalação é necessária para uso.

## O que a 0.1.0 oferece

Identidade configurada, HTML semântico, CSS responsivo, navegação interna, preferências de tema com armazenamento local seguro, registro de versão, manifesto PWA, service worker offline e contratos TypeScript iniciais. Não há bibliotecas, APIs, fontes ou CDNs de execução externas.

**Não estão implementados:** ambiente científico, entidade, seleção, comandos, histórico, instrumentos, missões, relatórios, atividade docente, experiência fiel de workspace SIAB ou standalone de arquivo HTML único. A tela "Ambiente" mostra apenas a reserva de espaço da futura interface.

## Governança

- O ZIP original do SIAB **não é modificado** nem importado para dentro deste repositório.
- Cada fase terá escopo, testes e documentação de aceite; falhas não são ocultadas por rótulos de concluído.
- Nenhuma biblioteca de execução poderá depender da internet; bibliotecas de desenvolvimento não são carregadas pelo usuário final.
- Tipagem fica no código-fonte (`src/`) e é compilada para `app.js` único, sem importações dinâmicas que falhem em `file://`.
- Este repositório já possui licença GNU GPL-3.0 (arquivo LICENSE do GitHub). Os arquivos atuais foram escritos de forma independente; qualquer código reaproveitado do SIAB e bibliotecas de terceiros exigirá preservação de avisos e licenças.

Consulte [o plano por camadas](docs/PLANO-DE-CONSTRUCAO.md) e [os critérios da fundação](docs/ACEITE-0.1.0.md).
