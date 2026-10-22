#!/usr/bin/env python3
"""
Worker Descrypted -> Strix.

Roda em um servidor SEU com Docker. Busca pentests na fila do app, executa o
Strix (https://github.com/usestrix/strix, Apache-2.0) e devolve os achados.

Variáveis de ambiente:
  APP_URL          URL pública do app (ex.: https://seuapp.lovable.app)
  WORKER_API_KEY   mesma chave cadastrada no app
  STRIX_LLM        modelo (ex.: openrouter/z-ai/glm-5.3)
  LLM_API_KEY      chave do provedor de LLM
  SCAN_MODE        quick | standard | deep   (padrão: quick)
  MAX_BUDGET       orçamento máximo em USD por scan (padrão: 5)
"""
import glob, json, os, subprocess, sys, time, urllib.request

APP = os.environ["APP_URL"].rstrip("/")
KEY = os.environ["WORKER_API_KEY"]
MODE = os.environ.get("SCAN_MODE", "quick")
BUDGET = os.environ.get("MAX_BUDGET", "5")


def call(path, payload=None):
    req = urllib.request.Request(
        APP + path, data=json.dumps(payload or {}).encode(), method="POST",
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def latest_run(since):
    runs = [d for d in glob.glob("strix_runs/*") if os.path.getmtime(d) >= since]
    return max(runs, key=os.path.getmtime) if runs else None


def read(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except OSError:
        return None


def pick(d, *keys):
    for k in keys:
        if d.get(k):
            return d[k]
    return None


def parse_findings(run):
    raw = read(os.path.join(run, "vulnerabilities.json"))
    if not raw:
        return []
    data = json.loads(raw)
    items = data if isinstance(data, list) else data.get("vulnerabilities", [])
    out = []
    for v in items:
        cvss = pick(v, "cvss", "cvss_score")
        if isinstance(cvss, dict):
            cvss = cvss.get("score")
        out.append({
            "title": pick(v, "title", "name"),
            "severity": str(pick(v, "severity") or "medium").lower(),
            "cvss": cvss,
            "cwe": pick(v, "cwe", "cwe_id"),
            "location": pick(v, "endpoint", "location", "target", "file"),
            "impact": pick(v, "impact", "description"),
            "proof": pick(v, "poc", "proof_of_concept", "poc_description", "evidence"),
            "fix_diff": pick(v, "remediation", "fix", "recommendation"),
        })
    return out


def run_job(job):
    started = time.time()
    cmd = ["strix", "-n", "-t", job["target"], "--scan-mode", MODE, "--max-budget", BUDGET]
    print("executando:", " ".join(cmd), flush=True)
    proc = subprocess.run(cmd, capture_output=True, text=True)
    # Códigos de saída do Strix: 0 limpo, 2 vulnerabilidades, 1 erro fatal
    run = latest_run(started - 5)
    if proc.returncode == 1 or not run:
        call("/api/public/worker/result", {"id": job["id"], "status": "failed",
                                           "error": (proc.stderr or "Falha ao executar o Strix")[-400:]})
        return
    call("/api/public/worker/result", {
        "id": job["id"], "status": "completed",
        "findings": parse_findings(run),
        "report": read(os.path.join(run, "penetration_test_report.md")),
    })


def main():
    print("worker iniciado, aguardando jobs…", flush=True)
    while True:
        try:
            job = call("/api/public/worker/claim").get("job")
            if job:
                run_job(job)
                continue
        except Exception as e:  # noqa: BLE001
            print("erro:", e, file=sys.stderr, flush=True)
        time.sleep(15)


if __name__ == "__main__":
    main()
