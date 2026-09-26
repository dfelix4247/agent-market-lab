import { NETWORK, PAY_TO, PRICE } from "@/lib/x402";

export default function Home() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "64px 24px", lineHeight: 1.6 }}>
      <p style={{ opacity: 0.7 }}>AGENT MARKET LAB / EXPERIMENT 01</p>
      <h1>Agent Surface Resolver</h1>
      <p>
        Machine-native utility that inspects a public URL for agent-readable surfaces including OpenAPI, llms.txt,
        robots.txt, A2A metadata, MCP hints, and x402 payment challenges.
      </p>
      <pre style={{ padding: 16, background: "#151922", overflowX: "auto" }}>
GET /api/resolve?url=https://example.com
      </pre>
      <ul>
        <li>Price: {PRICE} USDC per successful call</li>
        <li>Network: {NETWORK} (Base mainnet)</li>
        <li>Recipient: {PAY_TO}</li>
        <li>Protocol: x402 v2</li>
      </ul>
      <p><a href="/openapi.json" style={{ color: "#8bc6ff" }}>OpenAPI specification</a></p>
      <p><a href="/.well-known/agent.json" style={{ color: "#8bc6ff" }}>Agent discovery metadata</a></p>
    </main>
  );
}
