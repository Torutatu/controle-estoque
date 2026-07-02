import { createContext, useContext, useEffect, useState } from "react";
import { LogOut, Lock, ArrowLeft, Boxes } from "lucide-react";
import { supabase, isSupabaseConfigured, LOGIN_USERS } from "./supabaseClient";
import { TOKENS } from "./theme";

const AuthContext = createContext({ userName: null, logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

// Envolve o app inteiro. Se o Supabase não estiver configurado, deixa passar
// direto (sem login) — assim o app continua funcionando localmente durante o
// desenvolvimento. Com o Supabase configurado, exige login com um dos dois
// usuários definidos em LOGIN_USERS antes de mostrar qualquer tela.
export function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = carregando

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <AuthContext.Provider value={{ userName: null, logout: () => {} }}>
        {children}
      </AuthContext.Provider>
    );
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: TOKENS.paper, color: TOKENS.inkLight, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
        Carregando…
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  const userName = LOGIN_USERS.find((u) => u.email === session.user.email)?.name || session.user.email;

  return (
    <AuthContext.Provider value={{ userName, logout: () => supabase.auth.signOut() }}>
      {children}
    </AuthContext.Provider>
  );
}

function LoginScreen() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: selectedUser.email,
      password,
    });
    setLoading(false);
    if (error) setError("Senha incorreta, ou esse usuário ainda não foi criado no Supabase.");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: TOKENS.paper, fontFamily: "'Inter', sans-serif", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360, background: "#fff", border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: TOKENS.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Boxes size={24} color={TOKENS.paper} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: TOKENS.charcoal }}>Controle de Estoque</div>
            <div className="est-mono" style={{ fontSize: 11, color: TOKENS.inkLight }}>faça login para continuar</div>
          </div>
        </div>

        {!selectedUser ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LOGIN_USERS.map((u) => (
              <button
                key={u.name}
                type="button"
                onClick={() => setSelectedUser(u)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1px solid ${TOKENS.line}`,
                  background: TOKENS.paper,
                  color: TOKENS.charcoal,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {u.name}
                <Lock size={14} color={TOKENS.inkLight} />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              type="button"
              onClick={() => { setSelectedUser(null); setPassword(""); setError(""); }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: TOKENS.inkLight, fontSize: 12, padding: 0, alignSelf: "flex-start" }}
            >
              <ArrowLeft size={13} /> trocar usuário
            </button>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: TOKENS.charcoal }}>
              Olá, {selectedUser.name}
            </div>
            <input
              className="est-input"
              type="password"
              placeholder="Senha"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
              required
            />
            {error && (
              <div style={{ fontSize: 12, color: TOKENS.rustDark }}>{error}</div>
            )}
            <button
              type="submit"
              className="est-btn"
              disabled={loading}
              style={{ background: TOKENS.ink, color: "#fff", justifyContent: "center", padding: "10px 16px" }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function LogoutButton() {
  const { userName, logout } = useAuth();
  if (!userName) return null;
  return (
    <button
      type="button"
      onClick={logout}
      title="Sair"
      className="est-mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "#B9C4CE",
        background: "#ffffff14",
        border: "none",
        borderRadius: 6,
        padding: "6px 10px",
        cursor: "pointer",
      }}
    >
      {userName} <LogOut size={12} />
    </button>
  );
}
