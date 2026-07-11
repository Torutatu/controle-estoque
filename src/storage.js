// Adaptador de armazenamento.
//
// Se o Supabase estiver configurado (veja supabaseClient.js), os dados são
// lidos/gravados na tabela `app_state` do seu projeto Supabase — assim todo
// mundo que acessa o app (com login) vê o mesmo estoque, em qualquer
// computador.
//
// Se o Supabase NÃO estiver configurado, cai automaticamente para o
// localStorage do navegador (comportamento antigo, dados só nesse aparelho).
//
// Em ambos os casos a "forma" da API é a mesma (get/set retornando
// { key, value }), então o resto do app (App.jsx) não precisa saber qual dos
// dois está sendo usado.

import { supabase, isSupabaseConfigured } from "./supabaseClient";

const localBackend = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw };
    } catch (e) {
      console.error("Falha ao ler do localStorage", e);
      return null;
    }
  },

  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return { key, value };
    } catch (e) {
      console.error("Falha ao salvar no localStorage", e);
      return null;
    }
  },

  // Sem Supabase não há como sincronizar entre dispositivos/abas em tempo
  // real — devolve uma função de "desinscrever" vazia só pra manter a mesma
  // API dos dois backends.
  subscribe(key, onChange) {
    return () => {};
  },
};

const supabaseBackend = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from("app_state")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { key, value: data.value };
    } catch (e) {
      console.error("Falha ao ler do Supabase", e);
      return null;
    }
  },

  async set(key, value) {
    try {
      const { error } = await supabase
        .from("app_state")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      return { key, value };
    } catch (e) {
      console.error("Falha ao salvar no Supabase", e);
      return null;
    }
  },

  // Escuta mudanças na linha (feitas por qualquer dispositivo/usuário) via
  // Supabase Realtime, e chama onChange(value, updatedAt) quando alguém
  // salva. Isso mantém as telas de quem estiver com o app aberto atualizadas
  // quase na hora, em vez de só na próxima vez que a pessoa recarregar a
  // página — reduz (mas não elimina 100%) o risco de duas pessoas
  // sobrescreverem uma a outra ao editar ao mesmo tempo.
  //
  // Requer que a replicação em tempo real esteja ativada pra tabela
  // `app_state` no projeto Supabase (veja supabase/schema.sql).
  subscribe(key, onChange) {
    const channel = supabase
      .channel(`app_state_${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_state", filter: `key=eq.${key}` },
        (payload) => {
          const row = payload.new;
          if (row && typeof row.value === "string") {
            onChange(row.value, row.updated_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export const storage = isSupabaseConfigured ? supabaseBackend : localBackend;

// Usado só pela migração automática de dados antigos (veja App.jsx): lê
// direto do localStorage independentemente do backend ativo, pra saber se
// existe estoque salvo localmente antes de trocar para o Supabase.
export function readLegacyLocalStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : raw;
  } catch (e) {
    return null;
  }
}
