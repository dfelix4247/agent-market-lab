import { NextResponse } from "next/server";

const ORIGIN = "https://agent-market-lab.vercel.app";

export const GET = async () => NextResponse.json({
  openapi: "3.1.0",
  info: {
    title: "Agent Market Lab API",
    version: "0.1.0",
    description: "Machine-native utilities purchased per request over x402.",
  },
  servers: [{ url: ORIGIN, description: "Production" }],
  paths: {
    "/api/resolve": {
      get: {
        operationId: "resolveAgentSurfaces",
        summary: "Resolve agent-readable surfaces for a public URL",
        description: "Returns structured discovery metadata for a public URL. Unpaid requests return HTTP 402 with x402 v2 payment terms; successful payment is verified and settled before the resource is returned.",
        parameters: [{
          name: "url",
          in: "query",
          required: true,
          description: "Public HTTP or HTTPS URL to inspect",
          schema: { type: "string", format: "uri" },
        }],
        responses: {
          "200": {
            description: "Structured agent-surface report",
            content: { "application/json": {} },
          },
          "400": { description: "Invalid or non-public target" },
          "402": {
            description: "x402 payment required. Read PAYMENT-REQUIRED response header for machine-readable terms.",
          },
        },
        "x-x402": {
          version: 2,
          scheme: "exact",
          network: "eip155:8453",
          asset: "USDC",
          price: "$0.002",
        },
      },
    },
  },
  externalDocs: { url: `${ORIGIN}/llms.txt` },
});
