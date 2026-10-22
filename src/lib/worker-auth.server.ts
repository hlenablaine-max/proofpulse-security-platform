// Autenticação do worker Strix (servidor externo com Docker).
export function authenticateWorker(request: Request): Response | null {
  const key = process.env["WORKER_API_KEY"];
  if (!key) return Response.json({ error: "Worker não configurado" }, { status: 503 });
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (given.length !== key.length) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0 ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}
