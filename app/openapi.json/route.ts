import { NextResponse } from "next/server";

export const GET = async () => NextResponse.json({
  openapi: "3.1.0",
  info: {
    title: "Agent Market Lab API",
    version: "0.1.0",
    description: "Machine-native utilities purchased over x402.",
  },
  paths: {
    "/api/resolve": {
      get: {
        summary: "Resolve agent-readable surfaces for a public URL",
        parameters: [{
          name: "url",
          in: "query",
          required: true,
          schema: { type: "string", format: "uri" },
        }],
        responses: {
          "200": { description: "Structured agent-surface report" },
          "400": { description: "Invalid target" },
          "402": { description: "x402 payment required" },
        },
      },
    },
  },
});
