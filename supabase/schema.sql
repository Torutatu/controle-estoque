-- Controle de Estoque — schema do Supabase
--
-- Como usar:
-- 1. Crie um projeto em https://supabase.com (gratuito).
-- 2. No painel do projeto, vá em "SQL Editor" → "New query".
-- 3. Cole todo o conteúdo deste arquivo e clique em "Run".
-- 4. Depois, vá em "Authentication" → "Users" → "Add user" e crie os dois
--    usuários (mesmo e-mail configurado em src/supabaseClient.js, em
--    LOGIN_USERS). Marque "Auto Confirm User" para não precisar confirmar
--    e-mail.
-- 5. Em "Settings" → "API", copie a "Project URL" e a chave "anon public" —
--    elas vão no arquivo .env do projeto (veja .env.example).

-- Tabela única de chave/valor, do mesmo jeito que o app já usava no
-- localStorage — assim o resto do código (App.jsx) não precisa mudar nada
-- além da camada de storage.
create table if not exists app_state (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Ativa Row Level Security: por padrão, ninguém consegue ler/escrever.
alter table app_state enable row level security;

-- Só usuários autenticados (logados pelo app) podem ler os dados.
drop policy if exists "app_state select for authenticated" on app_state;
create policy "app_state select for authenticated"
  on app_state for select
  to authenticated
  using (true);

-- Só usuários autenticados podem inserir.
drop policy if exists "app_state insert for authenticated" on app_state;
create policy "app_state insert for authenticated"
  on app_state for insert
  to authenticated
  with check (true);

-- Só usuários autenticados podem atualizar.
drop policy if exists "app_state update for authenticated" on app_state;
create policy "app_state update for authenticated"
  on app_state for update
  to authenticated
  using (true)
  with check (true);

-- Ativa a replicação em tempo real da tabela — é o que permite que, se
-- Dhierry e Francielle estiverem com o app aberto ao mesmo tempo, a tela de
-- uma se atualize sozinha quando a outra salvar algo (em vez de precisar
-- recarregar a página pra ver a mudança). Sem isso, o app continua
-- funcionando normalmente, só sem essa atualização automática.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table app_state;
  end if;
end $$;
