# Racha Manager: O Jogo Perfeito

Crie uma aplicação Web Mobile (Mobile-first/PWA) para o aplicativo "Racha Manager", um sistema de organização e gerenciamento de partidas esportivas de futebol amador.

DADOS DA API:

- A documentação Swagger OpenAPI da API está disponível no endpoint JSON: http://35.171.106.158:8080/v3/api-docs

- Todas as chamadas HTTP (Axios/Fetch) devem utilizar uma variável de ambiente VITE_API_BASE_URL (padrão local: http://localhost:8080 ou IP do servidor: http://35.171.106.158:8080).

VISUAL E PALETA DE CORES (IDENTIDADE DA MARCA):

- Estilo: Dark Mode esportivo, moderno, dinâmico e estilizado.

- Fundo Principal: Preto/Grafite Escuro (#0D0F12 ou #12151A).

- Cor Primária (Ações/Destaques principais/Botões): Laranja vibrante (#FF5500 ou #F95700).

- Cor Secundária (Acentos/Badges/Detalhes): Azul Elétrico / Azul Vivo (#0066FF ou #0088FF).

- Textos e Ícones: Branco (#FFFFFF) para alto contraste e Cinza Claro (#A0AEC0) para textos secundários.

- Elementos Visuais: Cards com cantos levemente arredondados, bordas sutis e sombras elegantes para dar destaque aos módulos na tela.

- Design moderno, limpo e intuitivo, com animações suaves e boa usabilidade.

ESTRUTURA DE TELAS E NAVEGAÇÃO (MOBILE VIEWPORT):

1. Tela Principal (Home / Dashboard):

   - Design limpo e intuitivo em tela de celular.

   - Atalhos rápidos em cards para "Jogadores" e "Sessões de Racha".

   - Resumo dinâmico das próximas sessões cadastradas ou ativas.

2. Tela de Jogadores:

   - Lista interativa dos jogadores cadastrados.

   - Form/Modal para cadastro rápido de novos jogadores.

3. Tela de Sessões de Racha (Fluxo Completo):

   - Criação de nova sessão de racha.

   - Detalhes da sessão ativa (gerenciamento da fila de espera, adição e remoção de jogadores).

   - Acompanhamento de partidas (organização de times, finalização de jogos e rotação da fila).

TRATAMENTO DE DADOS E ERROS:

- Trate respostas de sucesso e exceções HTTP (400, 404, 500) devolvidas pela API Spring Boot utilizando notificações flutuantes (Toasts) nas cores da marca.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4a4528df-d387-4d41-b6b2-5f095c27830c).

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
