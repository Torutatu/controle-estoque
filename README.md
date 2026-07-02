# Controle de Estoque

App de controle de estoque multi-filial (Toledo, Assis, Palotina, Cafelândia, Corbélia),
com painel, cadastro de produtos, movimentações de entrada/saída, pedidos de compra
(com impressão), **importação de planilhas** para dar entrada em lote de materiais, e
login com estoque compartilhado via Supabase.

Os dados ficam salvos no Supabase (banco compartilhado, com login) quando configurado —
veja "Configurando o Supabase" abaixo. Sem essa configuração, o app cai automaticamente
para o `localStorage` do navegador (sem login, dados só nesse aparelho) — útil pra rodar
localmente sem depender de nada externo.

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

## Configurando o Supabase (estoque compartilhado + login)

Isso é o que permite que mais de uma pessoa (em computadores diferentes) veja e edite
o mesmo estoque, com login.

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, abra **SQL Editor → New query**, cole o conteúdo do arquivo
   [`supabase/schema.sql`](./supabase/schema.sql) deste repositório e clique em **Run**.
   Isso cria a tabela `app_state` (onde o estoque fica salvo) já protegida — só quem
   estiver logado consegue ler ou escrever.
3. Vá em **Authentication → Users → Add user** e crie os dois usuários do app:
   - `Dhierry` → e-mail configurado em `src/supabaseClient.js` (hoje `dhierrye@gmail.com`)
   - `Francielle` → e-mail configurado em `src/supabaseClient.js` (hoje um placeholder,
     `francielle@controle-estoque.app` — troque pelo e-mail real dela se preferir)

   Em ambos, marque **Auto Confirm User** (senão o Supabase espera confirmação por
   e-mail antes de liberar o login) e defina uma senha para cada um.

   Se trocar os e-mails, atualize também a lista `LOGIN_USERS` em
   `src/supabaseClient.js` para ficar igual ao que você cadastrou.
4. Em **Settings → API**, copie a **Project URL** e a chave **anon public**.
5. Na pasta do projeto, copie `.env.example` para `.env` e preencha com esses dois
   valores:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-public
   ```
6. Rode `npm run dev` de novo. A tela de login deve aparecer, com os botões
   "Dhierry" e "Francielle".

Se você já tinha usado o app antes (com dados salvos no `localStorage`, sem Supabase),
na primeira vez que abrir com o Supabase configurado o app sobe automaticamente esses
dados pro banco novo — não precisa copiar nada manualmente.

O arquivo `.env` não vai pro git (está no `.gitignore`) — cada pessoa/ambiente configura
o seu.

## Publicando no GitHub Pages

1. Crie um repositório novo no GitHub, por exemplo `controle-estoque`.
2. Suba este projeto:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do controle de estoque"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/controle-estoque.git
   git push -u origin main
   ```
3. No arquivo `vite.config.js`, confira se a linha `base` está com o **nome exato do
   repositório**, entre barras. Ex.: se o repositório se chama `controle-estoque`,
   deixe `base: "/controle-estoque/"`.
4. Se você configurou o Supabase (passo anterior), vá em **Settings → Secrets and
   variables → Actions** no GitHub e crie dois "Repository secrets":
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   com os mesmos valores do seu `.env`. O workflow de deploy usa esses secrets pra
   compilar o site já configurado — sem isso, o site publicado roda sem login/Supabase.
5. No GitHub, vá em **Settings → Pages** e em "Build and deployment" escolha
   **Source: GitHub Actions**.
6. Pronto — o workflow em `.github/workflows/deploy.yml` já publica automaticamente
   toda vez que você der `git push` na branch `main`. Depois do primeiro deploy, o
   endereço do site aparece em Settings → Pages.

### Alternativa: Vercel ou Netlify

Se preferir não usar GitHub Pages:
- **Vercel**: importe o repositório em vercel.com, framework "Vite", sem configuração
  extra (nesse caso troque `base: "/controle-estoque/"` por `base: "/"` no
  `vite.config.js`, e cadastre `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` nas
  variáveis de ambiente do projeto).
- **Netlify**: mesma ideia — "New site from Git", build command `npm run build`,
  publish directory `dist`, `base: "/"`, e as mesmas variáveis de ambiente.

## Importando planilha de entrada de materiais

Na aba **Movimentações**, clique em **Importar planilha**. Aceita `.xlsx`, `.xls` ou
`.csv` com colunas parecidas com:

| Produto           | SKU     | Quantidade | Observação        |
|--------------------|---------|------------|-------------------|
| Álcool             | LIM-006 | 20         | Nota fiscal 1234  |
| Papel toalha       |         | 10         |                   |

O app tenta reconhecer sozinho colunas chamadas "Produto"/"Nome"/"Item", "SKU"/"Código",
"Quantidade"/"Qtd" e "Observação". Produtos que já existem no estoque (por SKU ou nome)
recebem entrada automática; produtos não encontrados aparecem marcados como "Produto novo"
e são cadastrados na hora da importação, na filial selecionada no momento.

Antes de confirmar, você pode revisar cada linha, desmarcar itens que não quer importar
e ajustar a quantidade.

## Estrutura do projeto

```
src/
  App.jsx            -> todo o app (componente principal + telas)
  Auth.jsx           -> tela de login e controle de sessão (Supabase Auth)
  theme.js           -> paleta de cores compartilhada
  storage.js         -> camada de persistência (Supabase, com fallback localStorage)
  supabaseClient.js  -> configuração do cliente Supabase + lista de usuários de login
  main.jsx           -> ponto de entrada React
supabase/
  schema.sql         -> script SQL pra rodar no seu projeto Supabase
```

## Próximos passos possíveis

- Trocar os dois usuários fixos (Dhierry/Francielle) por um cadastro de usuários mais
  flexível, se a equipe crescer.
- Adicionar exportação do estoque atual para planilha (hoje só importa).
- Sincronização em tempo real (Supabase Realtime) pra ver mudanças de outra pessoa
  sem precisar recarregar a página.
