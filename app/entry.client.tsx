import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

import { WagmiConfig } from "wagmi";


import { createClient, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { arbitrum } from "wagmi/chains";

// import { InjectedConnector } from "wagmi/connectors/injected";
// import { Web3Modal } from '@web3modal/html'

import getEnv from "~/utils/getEnv";
// import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
// import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets, RainbowKitProvider    
  } from '@rainbow-me/rainbowkit';
  
const env = getEnv();

// globalThis.WCC = new WalletConnectConnector({
//     chains: [arbitrum],
//     options: {
//       projectId: '5e70de9da5beaf35d912f5e7628afc48'
//     },
//   })

export const { chains, provider, webSocketProvider } = configureChains(
  [arbitrum],
  [
    alchemyProvider({ apiKey: env.ALCHEMY_API_KEY, priority: 0 }),
    publicProvider({ priority: 1 }),
  ]
);
const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains
  });
  

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors
});



// const ethereumClient = new EthereumClient(wagmiClient, chains)
// const web3modal = new Web3Modal({ projectId:'5e70de9da5beaf35d912f5e7628afc48' }, ethereumClient)
// window.w3m = web3modal



hydrate(
    <div>

    <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
        <RemixBrowser />
        </RainbowKitProvider>

    </WagmiConfig>

    </div>
, document);
