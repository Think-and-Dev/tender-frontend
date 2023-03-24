import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

import { WagmiConfig } from "wagmi";
import { chains, client as wagmiClient } from "~/connectors/wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

hydrate(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <RemixBrowser />
    </RainbowKitProvider>
  </WagmiConfig>,
  document
);
