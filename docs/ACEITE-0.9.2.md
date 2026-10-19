# Base Demo Oficial - SI — Aceite estrutural 0.9.2

## Propósito

Consolidar a organização dos ambientes, a hierarquia de navegação e a responsividade nativa da plataforma, sem reconstruir o núcleo funcional ou introduzir conteúdo científico.

## Contrato organizacional

- **Cabeçalho:** marca da plataforma, navegação horizontal em telas amplas, menu auxiliar acessível e entrada para preferências.
- **Página inicial:** convite central ao ambiente livre; caminhos próprios para Aprender, Missões, Roteiros e Caderno; links secundários para Manual e Área do Professor.
- **Ambientes internos:** rotas existentes, subsistemas e dados preservados; sem duplicar telas ou reconstruir funcionalidades.
- **Workspace:** mantém Montagem, cena central, Ver/Dados, Foco, Visão geral, histórico, ferramentas e controles contextuais.
- **Mobile:** navegação inferior com quatro destinos fora do workspace; dentro dele, prioridade da cena e folhas inferiores de Montagem e Ver/Dados, sem empilhar uma segunda barra de navegação.
- **Menu auxiliar:** disponível no desktop e mobile, com fechamento por Escape, foco contido e plano de fundo bloqueado enquanto aberto.
- **Adaptabilidade:** considerar 320, 360, 390, 414, 768, 1024 e 1440 pixels, orientação paisagem, áreas seguras, teclado e zoom.

## Regras de aceite

1. O menu não ocupa uma coluna fixa nas telas desktop.
2. A Home apresenta caminhos reais e acessíveis, não um inventário técnico da versão.
3. A navegação inferior não deve interferir com a região experimental e suas folhas modais.
4. Nenhum elemento da cena deve ser reposicionado por texto informativo periférico.
5. Os arquivos de distribuição permanecem autocontidos e sem CDN.
6. As versões anteriores devem permanecer utilizáveis, e os testes de regressão precisam passar.

## Evidências disponíveis

Compilação TypeScript e 11 conjuntos de testes Node aprovados. Verificação E2E em Chromium por HTML autocontido injetado, nas dimensões 320×700, 360×740, 390×844, 414×896, 768×1024, 1024×768, 1440×900 e 844×390. Inclui checagem da geometria do cartão principal, abertura/fechamento do menu, bloqueio da tela de fundo, acesso à bancada, abertura de Montagem, criação de objeto, ausência de transbordamento e área experimental útil em paisagem compacta.

## Limites de homologação

O teste em navegador com injeção do HTML autocontido valida layout e eventos naquela execução, mas não comprova por si só instalação PWA, operação direta por `file://`, Firefox, WebKit/Safari ou acessibilidade assistiva. Essas verificações requerem homologação separada. A 0.9.2 não constitui ainda a certificação da versão 1.0.0.
