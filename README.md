# Descrypted 

Nome exato: "Descrypted" (com Y). Siga a estrutura e o tom abaixo, que replica a landing real da strix.ai — direta, focada em produto (Saas AI)

ESTÉTICA
- Fundo preto sólido (#000 ou #050505)
- Tipografia branca/cinza limpa, sans-serif moderna, peso bold nos títulos
- Acento de cor único, usado só em status/badges pequenos (verde para "concluído", vermelho para "crítico", etc) — nunca no título ou como glow
- Sem terminal decorativo, sem grid de fundo, sem scanline
- Cards com borda 1px cinza escuro, cantos levemente arredondados
- Tudo responsivo, muito espaço em branco

HEADER
- Logo "Descrypted" à esquerda
- Nav: Produto, Enterprise, Blog, Preços
- Direita: "Demo" (outline) + "Começar teste" (botão branco sólido, texto preto)

HERO
- Título direto e técnico, 2 linhas, sem frase de efeito vazia. Exemplo de tom (adapte): "Segurança contínua. A cada deploy." — subtítulo: "Proteja todo o seu stack com pentest autônomo. Encontre e corrija vulnerabilidades 24/7."
- Um único botão: "Começar teste"
- Logo abaixo: "Usado por times de segurança em" + logos em escala de cinza (placeholders de empresas brasileiras conhecidas de tech/fintech)

PAINEL DO PRODUTO (seção central, a mais importante)
- Mockup de dashboard: tabela com colunas Pentest / Status / Problemas / Data, linhas tipo "api.empresa.com — Concluído — 3 críticos, 7 altos — há 2h", "staging.app.io — Rodando — agora"
- Três sub-blocos lado a lado ou empilhados, cada um com ícone + título + descrição curta + mini visual:
  1. "APIs e Web Apps" — cobertura completa em REST, GraphQL e aplicações web, com prova de exploração para cada achado. Mostrar um card de exemplo tipo "🔴 IDOR no endpoint de download de fatura — Severidade: Alta — CWE-639" com trecho de código sugerindo a correção
  2. "Código e Pull Requests" — análise de código e PRs direto no pipeline de CI, pega vulnerabilidade na origem
  3. "Infraestrutura e Nuvem" — encontra configurações erradas e exposições antes que um atacante encontre. Mostrar tabela de exemplo: "Bucket S3 público — Crítico — 9.8", "Política IAM com wildcard — Crítico — 9.1"

DEPOIMENTO
- Bloco de citação de cliente fictício, com nome, cargo e empresa (placeholder crível), elogiando velocidade e precisão

DO ACHADO À CORREÇÃO
- Seção mostrando o fluxo: problema encontrado → reproduzido com prova → corrigido automaticamente com PR pronto pra merge
- Mockup de um ticket de vulnerabilidade real: título, severidade, CVSS, impacto, localização no código, e um diff mostrando a correção sugerida
- Destaque: "Verificação confirmada — vulnerabilidade não é mais explorável" + link de PR pronto

DEPLOY COM CONFIANÇA (grid de 6 cards pequenos)
- Toda PR revisada antes do merge
- Bloqueia deploy com vulnerabilidade
- Monitora a superfície de ataque continuamente
- Validação em tempo real, com prova de exploração
- Pentest consciente do contexto (entende stack, arquitetura e lógica de negócio)
- Aprendizado contínuo entre pentests

RECURSOS (3 colunas com imagem/mockup)
- Postura de segurança em tempo real
- Achados validados com prova
- Correção automática com PR pronto pra merge

ENTERPRISE
- Deploy self-hosted (VPC, on-premise)
- Teste de infraestrutura interna, não só superfície externa
- Retenção zero de dados — código nunca é usado para treinar modelo
- Suporte dedicado, SLA customizado, conformidade (LGPD, ISO 27001, SOC 2)

BLOG (preview de 3 posts, placeholder)

CTA FINAL
- "Teste sua aplicação hoje. Configuração em minutos, resultado instantâneo."
- Botão "Rodar um pentest" + link "Ver preços"

RODAPÉ
- Colunas: Produto (recursos individuais), Empresa (Blog, Carreiras, Contato, Suporte), Comunidade (Discord, GitHub), Ferramentas (Calculadora CVSS, etc)
- Selo de "todos os sistemas operacionais" + badges SOC 2 / ISO 27001
- Copyright

-inclua  legalidade, ética de hacking

REGRAS IMPORTANTES
- NÃO use frases de vendedor tipo "hackeamos sua empresa antes de quem não deveria" — o tom é técnico e direto, como um produto de segurança de verdade, não uma oferta de serviço.
- Toda a cópia deve soar como documentação de produto, não copywriting de vendas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://proofpulse-security-platform.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d531c751-b889-4a2f-ba60-023f4b58d4be).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
