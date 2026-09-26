import { NextResponse } from "next/server";

const ORIGIN = "https://agent-market-lab.vercel.app";

const catalog = {
  linkset: [
    {
      anchor: `${ORIGIN}/api/resolve`,
      "service-desc": [
        {
          href: `${ORIGIN}/openapi.json`,
          type: "application/vnd.oai.openapi+json;version=3.1",
        },
      ],
      "service-doc": [
        {
          href: `${ORIGIN}/llms.txt`,
          type: "text/plain",
        },
      ],
      item: [
        {
          href: `${ORIGIN}/api/resolve`,
          type: "application/json",
        },
      ],
    },
  ],
};

const headers = {
  "content-type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  "cache-control": "public, max-age=300",
  link: `<${ORIGIN}/.well-known/api-catalog>; rel="api-catalog"`,
};

export async function GET() {
  return NextResponse.json(catalog, { headers });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers });
}
