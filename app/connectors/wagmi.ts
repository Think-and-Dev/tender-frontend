import { createClient, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { arbitrum } from "wagmi/chains";

import { getDefaultWallets } from "@rainbow-me/rainbowkit";

import getEnv from "~/utils/getEnv";

const env = getEnv();

export const { chains, provider, webSocketProvider } = configureChains(
  [arbitrum],
  [
    alchemyProvider({ apiKey: env.ALCHEMY_API_KEY, priority: 0 }),
    publicProvider({ priority: 1 }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "TenderFi",
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});
