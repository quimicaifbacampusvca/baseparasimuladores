# Base Demo Oficial - SI · 0.9.1

Plataforma universal para simuladores educacionais, autocontida e sem dependências externas obrigatórias durante a execução. **Versão 0.9.1 — Manual, módulos, visualizadores e compartilhamento local de atividades.**

## Executar

- **Standalone:** abra `standalone.html` para utilizar CSS, JavaScript e ícones incorporados em um HTML. O armazenamento depende das permissões do navegador.
- **PWA:** abra `index.html` por HTTPS ou localhost, complete a primeira instalação/cache e utilize desconectado após verificar os recursos offline.
- **Desenvolvimento:** `npm run check` recompila, cria o standalone e executa regressões e testes de contratos. `python3 tests/browser_smoke.py` verifica fluxos no Chromium quando Playwright e Chromium estiverem disponíveis.

## Recursos da 0.9.1

- Manual local com pesquisa, ajuda contextual via tecla F1 e nove temas de orientação.
- Módulos **Livre, Explorar, Medir, Calcular**, com capacidades explicitamente declaradas e bloqueio de ferramentas/instrumentos não permitidos na camada de extensões.
- Sistema de visualizadores com contrato de registro e três modos genéricos: Observar, Medir e Analisar.
- Link autocontido por atividade personalizada, com modos **Consultar** e **Consultar e executar localmente**; validação de conteúdo antes de qualquer cópia para a biblioteca.
- Preservação do workspace, dos objetos, dos registros, dos roteiros e das distribuições anteriores.

## Privacidade, offline e limitações

Todas as bibliotecas necessárias à execução e dados de demonstração estão incluídos localmente. Não há login nem comunicação obrigatória com servidores externos. Os links são interpretados pelo aplicativo no navegador, com cópia da atividade codificada após `#`.

**Permissões dos links são controles de interface, não segurança ou autenticação.** O conteúdo do endereço pode ser modificado por terceiros; não utilize links como mecanismo para proteger informações confidenciais. Links `file://` não são portáveis entre dispositivos sem distribuir o próprio aplicativo.

A 0.9.1 **não é a homologação 1.0.0**. Consulte `docs/ACEITE-0.9.1.md` e `docs/VISTORIA-FUNCIONAL-0.9.0.md`.

## Licença

GPL-3.0, conforme `LICENSE`.
