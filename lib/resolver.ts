import { promises as dns } from "node:dns";
import net from "node:net";

const CANDIDATES = [
  "/llms.txt",
  "/robots.txt",
  "/openapi.json",
  "/swagger.json",
  "/.well-known/agent.json",
  "/.well-known/ai-plugin.json",
  "/.well-known/x402",
  "/.well-known/mcp.json",
];

function isPrivateIp(ip: string) {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
  }
  if (net.isIP(ip) === 6) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:");
  }
  return true;
}

async function assertPublicUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http/https URLs are allowed");
  const records = await dns.lookup(url.hostname, { all: true });
  if (!records.length || records.some(r => isPrivateIp(r.address))) throw new Error("Private or unresolved hosts are not allowed");
  return url;
}

async function safeFetch(url: URL, init: RequestInit = {}, redirects = 0): Promise<Response> {
  await assertPublicUrl(url.toString());
  const res = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(5000) });
  if ([301,302,303,307,308].includes(res.status) && res.headers.get("location") && redirects < 3) {
    return safeFetch(new URL(res.headers.get("location")!, url), init, redirects + 1);
  }
  return res;
}

export async function resolveAgentSurface(input: string) {
  const base = await assertPublicUrl(input);
  const root = `${base.protocol}//${base.host}`;
  const discovered: Record<string, unknown>[] = [];

  for (const path of CANDIDATES) {
    try {
      const res = await safeFetch(new URL(path, root), { method: "GET", headers: { "user-agent": "agent-market-lab/0.1" } });
      if (res.ok || res.status === 402) {
        discovered.push({ path, status: res.status, contentType: res.headers.get("content-type"), paymentRequired: res.status === 402 || res.headers.has("payment-required") });
      }
    } catch {}
  }

  let homeStatus: number | null = null;
  let x402Challenge = false;
  try {
    const home = await safeFetch(base, { method: "GET", headers: { "user-agent": "agent-market-lab/0.1" } });
    homeStatus = home.status;
    x402Challenge = home.status === 402 || home.headers.has("payment-required");
  } catch {}

  const labels = discovered.map(d => String(d.path));
  const score = Math.min(100,
    (labels.includes("/llms.txt") ? 20 : 0) +
    (labels.some(x => x.includes("openapi") || x.includes("swagger")) ? 25 : 0) +
    (labels.includes("/robots.txt") ? 10 : 0) +
    (labels.some(x => x.includes("agent.json")) ? 20 : 0) +
    (labels.some(x => x.includes("mcp")) ? 15 : 0) +
    ((x402Challenge || discovered.some(d => d.paymentRequired)) ? 10 : 0)
  );

  return {
    target: base.toString(),
    checkedAt: new Date().toISOString(),
    homeStatus,
    machineReadinessScore: score,
    x402Detected: x402Challenge || discovered.some(d => d.paymentRequired),
    discovered,
    hints: [
      !labels.includes("/llms.txt") && "Add /llms.txt for agent-readable service guidance",
      !labels.some(x => x.includes("openapi") || x.includes("swagger")) && "Publish OpenAPI metadata",
      !labels.some(x => x.includes("agent.json")) && "Publish an A2A agent card if agent-to-agent invocation is supported",
      !labels.some(x => x.includes("mcp")) && "Publish MCP discovery metadata if tools are exposed",
    ].filter(Boolean),
  };
}
