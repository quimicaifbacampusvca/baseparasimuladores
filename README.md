# Base Demo Oficial - SI · 0.9.2

Plataforma modular de simuladores educacionais, independente de motores científicos específicos.

## Organização

Navegação horizontal em desktop, menu auxiliar em todas as resoluções e barra inferior contextual em celulares. A Home organiza os principais caminhos de uso. O workspace preserva cena central, montagem, visualização e dados, com docas no desktop e folhas inferiores no mobile. Ferramentas, instrumentos, atividades, registros e relatórios continuam integrados.

## Distribuição

- **PWA:** hospedar os arquivos em HTTPS ou localhost e aguardar a instalação do cache para uso sem conexão.
- **Standalone:** abrir `standalone.html`, com estilos, scripts e ícone incorporados, sujeito às permissões do navegador para armazenamento local.
- **Desenvolvimento:** `npm run build`, `npm test`, `npm run check`. O TypeScript é uma dependência de desenvolvimento e não de execução.

## Garantias e limites

O núcleo não contém motor científico nem requer serviços externos. Dados são armazenados no navegador em uso; usar as opções de exportação para preservar registros. As permissões declaradas em links de atividades são operacionais, não uma barreira de autenticação. A certificação multiplataforma depende de testes adicionais documentados em `docs/ACEITE-0.9.2.md`.
