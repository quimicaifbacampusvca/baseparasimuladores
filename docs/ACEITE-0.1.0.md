# Aceite técnico — Fundações 0.1.0

## Implementado nesta etapa

- [x] Marca textual exata: **Base Demo Oficial - SI**.
- [x] Manifesto de identidade e versão isolado no TypeScript.
- [x] Navegação de quatro rotas com indicador `aria-current` e fallback para início.
- [x] HTML com landmarks, link para pular navegação, foco visível e labels.
- [x] Layout adaptável a tela estreita, sem componentes científicos.
- [x] Preferências de tema e fallback se o storage estiver bloqueado.
- [x] Compilação TypeScript para JavaScript clássico que funciona com `file://`.
- [x] Execução sem dependências de rede e sem CDN.
- [x] Manifesto PWA e precache de todos os recursos principais.
- [x] Testes estáticos e de contratos executáveis no Node.

## Critérios de verificação visual e real

- [ ] Navegação ponta a ponta no Chromium, Firefox e WebKit reais.
- [ ] Teste offline PWA após primeiro carregamento, com navegador sem rede.
- [ ] Instalação PWA e ícone em dispositivo real (SVG pode precisar de ícones PNG em sistemas específicos).
- [ ] Auditoria WCAG com ferramenta especializada.

Os testes pendentes não bloqueiam o uso inicial da fundação, mas impedem chamar a etapa de **homologada multiplataforma**.

## Próxima etapa

`0.2.0 — Colunas estruturais`: entidades neutras, estado de cena, comandos e desfazer, com gravação e restauração por projeto. Nenhum tipo de tubo ou dado químico fará parte desse modelo.
