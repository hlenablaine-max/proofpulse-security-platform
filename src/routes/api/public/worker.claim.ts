import { createFileRoute } from "@tanstack/react-router";
import { authenticateWorker } from "@/lib/worker-auth.server";

export const Route = createFileRoute("/api/public/worker/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const fail = authenticateWorker(request);
        if (fail) return fail;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: next } = await supabaseAdmin
          .from("pentests").select("id,target,kind")
          .eq("engine", "strix").eq("status", "queued")
          .order("created_at", { ascending: true }).limit(1).maybeSingle();
        if (!next) return Response.json({ job: null });
        const { data: claimed } = await supabaseAdmin
          .from("pentests").update({ status: "running", started_at: new Date().toISOString() })
          .eq("id", next.id).eq("status", "queued").select("id,target,kind").maybeSingle();
        return Response.json({ job: claimed ?? null });
      },
    },
  },
});
