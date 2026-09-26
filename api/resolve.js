const PAY_TO = "0x68cDcD3EdED821c90B54939d2eA99a946E1C4AC5";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

function isPublicHttpUrl(value) {
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.local')) return false;
    if (/^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return false;
    const m = h.match(/^172\.(\d+)\./); if (m && +m[1] >= 16 && +m[1] <= 31) return false;
    return true;
  } catch { return false; }
}

async function probe(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(5000), headers: { 'user-agent': 'AgentMarketLab/0.1' } });
    return { url, status: r.status, contentType: r.headers.get('content-type'), paymentRequired: r.headers.has('payment-required') || r.status === 402 };
  } catch (e) { return { url, status: null, error: e instanceof Error ? e.message : 'probe failed' }; }
}

function challenge(req) {
  const resourceUrl = `https://${req.headers.host}${req.url}`;
  return {
    x402Version: 2,
    error: 'Payment required',
    resource: { url: resourceUrl, description: 'Agent Surface Resolver: discover machine-readable interfaces for a public URL.', mimeType: 'application/json' },
    accepts: [{ scheme: 'exact', network: 'eip155:8453', amount: '2000', asset: USDC_BASE, payTo: PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USD Coin', version: '2' } }]
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'PAYMENT-REQUIRED');
  if (!req.headers['payment-signature']) {
    const c = challenge(req); res.setHeader('PAYMENT-REQUIRED', Buffer.from(JSON.stringify(c)).toString('base64')); return res.status(402).json(c);
  }
  const target = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  if (!target || !isPublicHttpUrl(target)) return res.status(400).json({ error: 'A public http(s) url is required' });
  const origin = new URL(target).origin;
  const candidates = ['/robots.txt','/llms.txt','/openapi.json','/.well-known/agent.json','/.well-known/ai-plugin.json','/.well-known/x402'];
  const surfaces = await Promise.all(candidates.map(p => probe(origin + p)));
  const root = await probe(target);
  const found = surfaces.filter(x => x.status && x.status >= 200 && x.status < 400);
  const x402 = [root, ...surfaces].some(x => x.paymentRequired);
  return res.status(200).json({ target, root, surfaces, x402Detected: x402, machineReadinessScore: Math.min(100, found.length * 15 + (x402 ? 10 : 0)), checkedAt: new Date().toISOString() });
}
