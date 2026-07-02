// Cliente Supabase, configurado por variáveis de ambiente (Vite).
//
// Crie um arquivo `.env` na raiz do projeto (não sobe pro git, veja .gitignore)
// com base no `.env.example`, preenchendo com a URL e a chave "anon" do seu
// projeto Supabase (Settings → API, no painel do Supabase).
//
// Enquanto essas variáveis não existirem, `isSupabaseConfigured` fica falso e
// o app continua funcionando com o localStorage do navegador (veja storage.js).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[controle-estoque] Supabase não configurado (faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). " +
      "Rodando com localStorage local — dados não são compartilhados entre dispositivos."
  );
}

// Mapeia os nomes exibidos na tela de login para o e-mail usado de fato na
// autenticação do Supabase. Ajuste os e-mails abaixo para os mesmos que você
// cadastrar em Authentication → Users no painel do Supabase.
export const LOGIN_USERS = [
  { name: "Dhierry", email: "dhierry.umuprev@gmail.com" },
  { name: "Francielle", email: "gerente.toledo.umuprev@gmail.com" },
];
