# Base Demo Oficial - SI

**Versão 0.2.0 — Colunas estruturais.** Plataforma universal para a construção progressiva de simuladores educacionais, independente de qualquer domínio científico.

## Executar

- **Arquivos locais:** abra `index.html` diretamente no navegador; o JavaScript já está compilado. Não é preciso baixar bibliotecas, instalar pacotes ou acessar a internet.
- **PWA / servidor local:** inicie `python3 -m http.server 8080` e abra `http://localhost:8080` para ativar o cache offline e testar a instalação.
- **Desenvolvimento:** `npm install` fornece apenas o compilador TypeScript; `npm run build`, `npm test`, `npm run check`. O usuário final não precisa executar esses comandos.

## Conteúdo da etapa

- Identidade, navegação e preferências; layout responsivo de demonstração.
- Estado central de cena: objetos universais (bloco, círculo e etiqueta), seleção e edição.
- Comandos: adicionar, renomear, alterar cor, deslocar, excluir e limpar.
- Histórico de desfazer/refazer e gravação local automática da cena.
- Validação de dados armazenados; esquema v1 com limites de geometria, identidade e quantidade.
- Arquivos HTML/CSS/JS e ícone locais; PWA com cache dos recursos fundamentais.

**Limites:** um projeto local por navegador nesta etapa; sem exportação de backup, sem múltiplas cenas e sem motor especializado. Arquivos locais usam as regras de armazenamento de cada navegador; sempre teste retenção de dados no ambiente de uso. Compatibilidade plena ainda depende de homologação em mais de um navegador.

## Princípios

1. A plataforma não contém regras de um domínio científico no seu núcleo.
2. Nenhuma dependência de execução exige CDN, servidor remoto ou serviço externo.
3. Cada fase implementa seu escopo completo, acompanhada de testes e critérios de aceite.
4. Código-fonte em TypeScript, execução em JavaScript clássico para compatibilidade inclusive com `file://`.
5. Dados são tratados como não confiáveis ao recuperar uma sessão.

Consulte [plano de construção](docs/PLANO-DE-CONSTRUCAO.md), [aceite desta versão](docs/ACEITE-0.2.0.md) e [aceite da fundação](docs/ACEITE-0.1.0.md).
