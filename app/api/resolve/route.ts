import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { NETWORK, PAY_TO, PRICE, x402Server } from "@/lib/x402";
import { resolveAgentSurface } from "@/lib/resolver";

export const runtime = "nodejs";

const handler = async (request: NextRequest) => {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing required query parameter: url" }, { status: 400 });
  try {
    const result = await resolveAgentSurface(url);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to resolve target" }, { status: 400 });
  }
};

export const GET = withX402(
  handler,
  {
    "/api/resolve": {
      accepts: {
        scheme: "exact",
        price: PRICE,
        network: NETWORK,
        payTo: PAY_TO,
      },
      description: "Inspect a public URL for agent-readable interfaces, x402 payment surfaces, OpenAPI, llms.txt, A2A and MCP discovery metadata.",
      mimeType: "application/json",
      extensions: {
        ...declareDiscoveryExtension({
          input: { url: "https://example.com" },
          inputSchema: {
            properties: { url: { type: "string", format: "uri", description: "Public HTTP(S) URL to inspect" } },
            required: ["url"],
          },
          output: {
            example: {
              target: "https://example.com/",
              machineReadinessScore: 35,
              x402Detected: false,
              discovered: [{ path: "/robots.txt", status: 200 }],
              hints: ["Publish OpenAPI metadata"],
            },
          },
        }),
      },
    },
  },
  x402Server,
);
