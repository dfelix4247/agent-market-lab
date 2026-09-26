import { NextRequest, NextResponse } from "next/server";
import { resolveAgentSurface } from "@/lib/resolver";

export const runtime = "nodejs";

const PAY_TO = "0x68cDcD3EdED821c90B54939d2eA99a946E1C4AC5";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

function paymentRequired(request: NextRequest) {
  const challenge = {
    x402Version: 2,
    error: "Payment required",
    resource: {
      url: request.url,
      description: "Agent Surface Resolver: inspect a public URL for agent-readable interfaces, OpenAPI, llms.txt, A2A/MCP hints and x402 surfaces.",
      mimeType: "application/json"
    },
    accepts: [{
      scheme: "exact",
      network: "eip155:8453",
      amount: "2000",
      asset: USDC_BASE,
      payTo: PAY_TO,
      maxTimeoutSeconds: 300,
      extra: { name: "USD Coin", version: "2" }
    }]
  };
  const encoded = Buffer.from(JSON.stringify(challenge)).toString("base64");
  return NextResponse.json(challenge, {
    status: 402,
    headers: {
      "PAYMENT-REQUIRED": encoded,
      "Access-Control-Expose-Headers": "PAYMENT-REQUIRED",
      "Cache-Control": "no-store"
    }
  });
}

export async function GET(request: NextRequest) {
  // Stage-1 protocol endpoint. Settlement verification is added after public deployment is healthy.
  if (!request.headers.get("payment-signature")) return paymentRequired(request);

  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing required query parameter: url" }, { status: 400 });
  try {
    const result = await resolveAgentSurface(url);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to resolve target" }, { status: 400 });
  }
}
