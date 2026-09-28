import { NextResponse } from "next/server";

const ORIGIN = "https://agent-market-lab.vercel.app";

const discovery = {
  version: 1,
  resources: [`${ORIGIN}/api/resolve`],
};

const headers = {
  "cache-control": "public, max-age=300",
  "content-type": "application/json",
};

export async function GET() {
  return NextResponse.json(discovery, { headers });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers });
}
