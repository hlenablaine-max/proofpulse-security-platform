import { describe, expect, it } from "vitest";
import { dedupKey, redact, validateFinding, validateProbePath, type Evidence } from "@/lib/agent.server";

const ledger = new Map<string, Evidence>([
  ["E1", { id: "E1", kind: "http", request: "GET https://a.example/openapi.json", summary: "HTTP 200\ncontent-type: application/json\n\n{\"openapi\":\"3.0.1\"}" }],
]);

describe("agente Descrypted", () => {
  it("rejeita achado sem evidência registrada", () => {
    expect(validateFinding({ evidence_ids: ["E9"], quote: "openapi" }, ledger)).not.toBeNull();
    expect(validateFinding({ evidence_ids: [], quote: "openapi" }, ledger)).not.toBeNull();
  });
  it("rejeita citação que não aparece na evidência", () => {
    expect(validateFinding({ evidence_ids: ["E1"], quote: "senha do admin" }, ledger)).not.toBeNull();
  });
  it("aceita citação literal da evidência", () => {
    expect(validateFinding({ evidence_ids: ["E1"], quote: "\"openapi\":\"3.0.1\"" }, ledger)).toBeNull();
  });
  it("bloqueia payloads e caminhos fora do padrão", () => {
    expect(validateProbePath("/search?q=<script>")).not.toBeNull();
    expect(validateProbePath("/item?id=1' or 1=1")).not.toBeNull();
    expect(validateProbePath("/../etc/passwd")).not.toBeNull();
    expect(validateProbePath("//evil.example/")).not.toBeNull();
    expect(validateProbePath("/robots.txt")).toBeNull();
  });
  it("omite segredos em respostas", () => {
    expect(redact("DB_PASSWORD=hunter2")).toBe("DB_PASSWORD=«omitido»");
    expect(redact("key AKIAABCDEFGHIJKLMNOP")).not.toContain("ABCDEFGHIJKLMNOP");
  });
  it("deduplica pelo título e local, ignorando o host", () => {
    expect(dedupKey("Swagger exposto", "https://a.example/openapi.json")).toBe(dedupKey("swagger  exposto", "https://b.example/openapi.json"));
  });
});
