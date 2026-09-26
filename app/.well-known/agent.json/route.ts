import { NextResponse } from "next/server";

export const GET = async () => NextResponse.json({
  name: "Agent Market Lab",
  description: "Paid machine-native utilities for autonomous agents.",
  version: "0.1.0",
  capabilities: [
    {
      name: "agent_surface_resolver",
      description: "Inspect a public URL for agent-readable interfaces and payment/discovery metadata.",
      endpoint: "/api/resolve",
      method: "GET",
      payment: { protocol: "x402", network: "eip155:8453", price: "$0.002", asset: "USDC" },
    },
  ],
  openapi: "/openapi.json",
});
