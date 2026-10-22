import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btnSolid, inputCls } from "@/components/app/ui";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Descrypted" },
      { name: "description", content: "Defina uma nova senha para sua conta Descrypted." },
      { property: "og:title", content: "Nova senha — Descrypted" },
      { property: "og:description", content: "Defina uma nova senha para sua conta Descrypted." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada.");
    navigate({ to: "/dashboard" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-bold">Definir nova senha</h1>
        <input name="password" type="password" required minLength={8} placeholder="Nova senha" className={inputCls} />
        <button disabled={loading} className={`${btnSolid} w-full`}>Salvar</button>
      </form>
    </div>
  );
}
