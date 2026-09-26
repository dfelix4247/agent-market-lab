import { NextResponse } from "next/server";

const ORIGIN = "https://agent-market-lab.vercel.app";

export const GET = async () => {
  const text = `# Agent Market Lab

Machine-native utilities designed for autonomous agents and paid per request over x402.

## Agent Surface Resolver

Endpoint: ${ORIGIN}/api/resolve?url=https%3A%2F%2Fexample.com
Method: GET
Price: $0.002 USDC
Network: Base mainnet (eip155:8453)
Payment protocol: x402 v2

Purpose: Inspect a public HTTP/HTTPS URL for machine-consumable surfaces including llms.txt, robots.txt, OpenAPI/Swagger metadata, agent discovery metadata, MCP hints, and x402 payment surfaces. Returns structured JSON with a machine-readiness score, discovered interfaces, and remediation hints.

Unpaid requests return HTTP 402 with a PAYMENT-REQUIRED header. A compatible x402 client can pay the advertised terms and retry the request. Payment is verified and settled before the paid response is returned.

OpenAPI: ${ORIGIN}/openapi.json
API catalog: ${ORIGIN}/.well-known/api-catalog
Repository: https://github.com/dfelix4247/agent-market-lab
`;

  return new NextResponse(text, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
