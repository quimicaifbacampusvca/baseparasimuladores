# Aceite técnico — Distribuição e acabamento 0.8.0

## Objetivo

Publicar uma base universal utilizável com todos os recursos de execução locais, mantendo os contratos das camadas 0.1–0.7. Sem dependências em CDN, APIs, fontes ou serviços remotos.

## Distribuições

- **PWA (`index.html`)**: manifest com ícones PNG 192 e 512, service worker com cache versionado e lista explícita de todos os 15 recursos essenciais. É instalada/armazenada após primeira visita por HTTPS ou localhost. A instalação do cache é indivisível: qualquer recurso faltante impede a ativação da nova versão.
- **Standalone (`standalone.html`)**: um HTML único, com todos os estilos, o JavaScript compilado e o ícone SVG embutidos. O build gera hashes CSP para os estilos e para o script, bloqueia conexões de rede e mantém uso sem servidor.
- **Código-fonte**: TypeScript compilável localmente; a versão distribuída já contém o resultado do build, sem precisar instalar TypeScript para utilização.

## Interface e manutenção

- A seção Preferências informa o modo de execução, oferece teste do cache quando disponível e mostra instalação apenas se o navegador fornecer o evento de instalação.
- O workspace e suas docas, a cena, os roteiros, os instrumentos, o Caderno, os relatórios e as permissões já implementadas não sofrem alteração contratual nesta etapa.
- Nenhum dado local pode ser removido automaticamente em atualizações de versão. O cache de *recursos* pode ser trocado, mas não o armazenamento da cena ou dos registros.
- Ao mudar o cache durante uma sessão, a interface recomenda recarregar manualmente, sem forçar reinicialização.

## Critérios de aceite

1. Compilação TypeScript e regressão automatizada de todas as versões.
2. Recursos obrigatórios previstos no pré-cache e com existência verificada.
3. `standalone.html` sem links relativos, carregamentos de rede, arquivos JavaScript/CSS externos ou manifest web externo; hashes CSP idênticos aos arquivos incorporados.
4. Teste de execução do standalone por `file://`, navegação e manipulação de objetos.
5. Teste PWA em localhost: criação do cache, recarregamento sem rede e abertura de seções após desconexão.
6. Verificação de responsividade em 320, 390, 1024 e 1440 px, sem rolagem lateral e sem erros JavaScript.
7. Preparação para testes independentes em Firefox, Safari/WebKit, Android/iOS e impressão física.

## Limites da homologação

- A disponibilidade do comando “Instalar” depende da compatibilidade e das regras do navegador; o botão pode permanecer oculto.
- PWA precisa de instalação/cache completo sob origem segura para funcionar offline; execução independente por arquivo utiliza `standalone.html`.
- Armazenamento local via navegador ou `file://` pode estar sujeito a restrições ou políticas do dispositivo. A portabilidade de dados depende de backups exportados pelo usuário.
- A fase 0.9.x será destinada à vistoria cross-browser e testes em dispositivos reais; 0.8.0 não equivale a homologação final.
