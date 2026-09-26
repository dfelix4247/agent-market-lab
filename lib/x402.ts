import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

export const PAY_TO = "0x68cDcD3EdED821c90B54939d2eA99a946E1C4AC5";
export const NETWORK = "eip155:8453";
export const PRICE = "$0.002";
export const FACILITATOR_URL = "https://facilitator.payai.network";

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

export const x402Server = new x402ResourceServer(facilitatorClient).register(
  NETWORK,
  new ExactEvmScheme(),
);
