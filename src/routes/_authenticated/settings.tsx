import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel, PageHeader, btnSolid, inputCls } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — Descrypted" }] }),
  component: Settings,
});

function Settings() {
  const { user } = Route.useRouteContext();
  const [saving, setSaving] = useState(false);
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: String(f.get("name")), phone: String(f.get("phone")) });
    setSaving(false);
    error ? toast.error(error.message) : toast.success("Perfil atualizado.");
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const { error } = await supabase.auth.updateUser({ password: String(f.get("password")), current_password: String(f.get("current")) } as never);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada.");
    form.reset();
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Configurações" desc="Perfil e conta." />
      <Panel className="p-5">
        <p className="text-sm font-medium">Perfil</p>
        {profile !== undefined && (
          <form onSubmit={save} className="mt-4 space-y-3">
            <label className="block text-xs text-subtle">Nome<input name="name" defaultValue={profile?.full_name ?? ""} className={`${inputCls} mt-1`} /></label>
            <label className="block text-xs text-subtle">Telefone<input name="phone" type="tel" defaultValue={profile?.phone ?? ""} className={`${inputCls} mt-1`} /></label>
            <label className="block text-xs text-subtle">E-mail<input disabled value={user.email ?? ""} className={`${inputCls} mt-1 opacity-60`} /></label>
            <button disabled={saving} className={btnSolid}>Salvar</button>
          </form>
        )}
      </Panel>
      <Panel className="mt-6 p-5">
        <p className="text-sm font-medium">Alterar senha</p>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <input name="current" type="password" required placeholder="Senha atual" className={inputCls} />
          <input name="password" type="password" required minLength={8} placeholder="Nova senha" className={inputCls} />
          <button className={btnSolid}>Alterar senha</button>
        </form>
      </Panel>
    </div>
  );
}
