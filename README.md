# agent-market-lab

Zero-budget experiment in machine-to-machine commerce.

The project builds services designed to be discovered, purchased, and consumed by autonomous agents over x402.

## Current experiment: Agent Surface Resolver

Paid endpoint: `GET /api/resolve?url=https://example.com`

The resolver inspects a public URL for machine-consumable surfaces such as:

- `llms.txt`
- OpenAPI
- robots.txt
- A2A agent cards
- MCP hints
- x402 payment challenges
- transport/content metadata

It returns structured JSON with discovered interfaces, a machine-readiness score, and remediation hints.

### Payment

- Protocol: x402 v2
- Network: Base mainnet (`eip155:8453`)
- Asset: USDC
- Price: `$0.002` per successful call
- Receiving address: `0x68cDcD3EdED821c90B54939d2eA99a946E1C4AC5`

### Constraint

This experiment has a hard $0 operating-spend ceiling. It may use free infrastructure and free protocol tiers only.
