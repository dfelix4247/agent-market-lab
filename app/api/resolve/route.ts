import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { resolveAgentSurface } from "@/lib/resolver";
import { NETWORK, PAY_TO, PRICE, x402Server } from "@/lib/x402";

export const runtime = "nodejs";

const handler = async (request: NextRequest): Promise<NextResponse> => {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing required query parameter: url" },
      { status: 400 },
    );
  }

  try {
    const result = await resolveAgentSurface(url);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resolve target" },
      { status: 400 },
    );
  }
};

const protectedGET = withX402(
  handler,
  {
    "/api/resolve": {
      accepts: {
        scheme: "exact",
        price: PRICE,
        network: NETWORK,
        payTo: PAY_TO,
        maxTimeoutSeconds: 300,
      },
      description:
        "Inspect a public URL for agent-readable interfaces including OpenAPI, llms.txt, A2A/MCP hints, robots metadata, and x402 payment surfaces.",
      mimeType: "application/json",
      serviceName: "Agent Surface Resolver",
      tags: ["agent-discovery", "url-inspection", "x402", "openapi", "mcp"],
      extensions: {
        ...declareDiscoveryExtension({
          input: { url: "https://example.com" },
          inputSchema: {
            properties: {
              url: {
                type: "string",
                format: "uri",
                description: "Public HTTP or HTTPS URL to inspect",
              },
            },
            required: ["url"],
          },
          output: {
            example: {
              target: "https://example.com/",
              machineReadinessScore: 30,
              x402Detected: false,
              discovered: [
                {
                  path: "/robots.txt",
                  status: 200,
                  contentType: "text/plain",
                  paymentRequired: false,
                },
              ],
            },
          },
        }),
      },
    },
  },
  x402Server,
);

export const GET = async (request: NextRequest): Promise<Response> => {
  const response = await protectedGET(request);
  if (response.status !== 402) {
    return response;
  }

  const encodedRequirements = response.headers.get("payment-required");
  if (!encodedRequirements) {
    return response;
  }

  try {
    const requirements = JSON.parse(
      Buffer.from(encodedRequirements, "base64").toString("utf8"),
    );
    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store");
    headers.set("content-type", "application/json");

    return new Response(JSON.stringify(requirements), {
      status: 402,
      headers,
    });
  } catch {
    return response;
  }
};
