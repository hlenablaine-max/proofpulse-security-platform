import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btnSolid, inputCls } from "@/components/app/ui";
import logo from "@/assets/descrypted-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Descrypted" },
      { name: "description", content: "Acesse sua conta Descrypted ou crie uma nova." },
      { property: "og:title", content: "Entrar — Descrypted" },
      { property: "og:description", content: "Acesse sua conta Descrypted ou crie uma nova." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password") ?? "");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: String(f.get("name")), phone: String(f.get("phone")) },
          },
        });
        if (error) throw error;
        setSent("Enviamos um link de confirmação para " + email + ".");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("Se a conta existir, um link de redefinição foi enviado para " + email + ".");
      }
    } catch (err) {
      toast.error(err instanceof Error ? translate(err.message) : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  const title = { login: "Entrar", signup: "Criar conta", forgot: "Redefinir senha" }[mode];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <Link to="/" className="mb-10 inline-flex h-7 items-center"><img src={logo.url} alt="Descrypted" className="h-7 w-auto" /></Link>
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-bold">{title}</h1>
        {sent ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{sent}</p>
            <button className="text-sm text-foreground underline" onClick={() => { setSent(null); setMode("login"); }}>Voltar para entrar</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <>
                <input name="name" required placeholder="Nome" className={inputCls} />
                <input name="phone" type="tel" required placeholder="Telefone" className={inputCls} />
              </>
            )}
            <input name="email" type="email" required placeholder="E-mail" className={inputCls} />
            {mode !== "forgot" && <input name="password" type="password" required minLength={8} placeholder="Senha" className={inputCls} />}
            <button disabled={loading} className={`${btnSolid} w-full`}>{loading ? "Aguarde…" : title}</button>
          </form>
        )}
        {!sent && (
          <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            {mode === "login" && <>
              <button className="text-left hover:text-foreground" onClick={() => setMode("forgot")}>Esqueci minha senha</button>
              <button className="text-left hover:text-foreground" onClick={() => setMode("signup")}>Não tem conta? Criar conta</button>
            </>}
            {mode !== "login" && <button className="text-left hover:text-foreground" onClick={() => setMode("login")}>Já tem conta? Entrar</button>}
          </div>
        )}
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-subtle">Ao criar uma conta você concorda em testar apenas sistemas que possui ou tem autorização para testar.</p>
    </div>
  );
}

function translate(m: string) {
  if (m.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("already registered")) return "Este e-mail já está cadastrado.";
  return m;
}
