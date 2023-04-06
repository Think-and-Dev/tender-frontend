import React, { useEffect, useState } from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import TagManager from "react-gtm-module";

import { Toaster } from "react-hot-toast";
import tailwindStyles from "./tailwind.css";
import globalStyles from "./styles/global.css";

import Header from "~/components/header-components/Header";
import Footer from "~/components/Footer";
import { QueryClient, QueryClientProvider } from 'react-query'

import { useOnSupportedNetwork } from "~/hooks/use-on-supported-network";
import { WagmiConfig } from "wagmi";
import { createClient, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { arbitrum } from "wagmi/chains";

import {
  connectorsForWallets,
  darkTheme,
  RainbowKitProvider    
} from '@rainbow-me/rainbowkit';
  
import getEnv from "~/utils/getEnv";

import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  ledgerWallet,
  coinbaseWallet,
  safeWallet,
  trustWallet, 
  zerionWallet
} from '@rainbow-me/rainbowkit/wallets';
import { LinksFunction, MetaFunction } from "@remix-run/node";

/// WALLET CONFIG
const env = getEnv();


export const { chains, provider, webSocketProvider } = configureChains(
  [arbitrum],
  [
    alchemyProvider({ apiKey: env.ALCHEMY_API_KEY, priority: 0 }),
    publicProvider({ priority: 1 }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      ledgerWallet({ chains }),
      coinbaseWallet({ appName: "Tender.fi", chains}),
      safeWallet({ chains }),
      trustWallet({ chains }),
      rainbowWallet({ chains }),
      zerionWallet({ chains })
    ],
  },
]);


///// END

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors
});

const queryClient = new QueryClient()

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: globalStyles },
];

export const meta: MetaFunction = () => {
  return { title: "Tender.fi" };
};


export function loader() {
  const env = process.env;
  return {
    ENV: {
      ALCHEMY_API_KEY: env.ALCHEMY_API_KEY,
    },
  };
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  // @TODO: Make this work
  let onSupportedChain = useOnSupportedNetwork(undefined);

  useEffect(() => {
    TagManager.initialize({ gtmId: "G-9CFSCBJ73N" });
  }, []);

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={`${!onSupportedChain ? "switch__to__network" : ""}`}>

      <QueryClientProvider client={queryClient}>
    <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact"  chains={chains}>
          <Toaster />
          <Header />
          <Outlet />
          <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />

        </RainbowKitProvider>

    </WagmiConfig>
    </QueryClientProvider>
      </body>
    </html>
  );
}

export function CatchBoundary() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>404 - Page not found</title>
        <Links />
      </head>
      <body className="h-[100vh] relative flex flex-col justify-between">
        <header className="mt-0 mb-0 w-full c justify-between max-w-[1400px] relative h-[71px] lg:h-[110px] flex items-center">
          <a
            href="https://tender.fi"
            className="w-[104px] block lg:w-[196px] z-20 relative"
          >
            <img src="/images/logo1.svg" alt="Tender Finance" />
          </a>
        </header>
        <img
          src="/images/error-page.png"
          alt="Error page"
          className="w-full h-full absolute top-0 left-0 z-[-1]"
        />
        <div className="absolute w-full max-w-[511px] top-[50%] left-[50%] content translate-y-[-50%] translate-x-[-50%]">
          <img
            src="/images/error-page-number.png"
            alt="Error page Number"
            className="ml-[auto] mr-[auto] mb-[15px] md:mb-[20px] max-w-[90%] md:max-w-[100%]"
          />
          <p className="mb-[28px] md:mb-[42px] font-nova text-[18px] md:text-[28px] text-center">
            Ooops! This page is not found
          </p>
          <div className="ml-[auto] mr-[auto] btn-custom-border rounded-[6px] w-[160px] h-[50px] md:w-[180px] md:h-[60px]">
            <a
              href="/"
              className="font-space flex font-bold items-center justify-center w-full h-full rounded-[6px] text-[#14F195] text-[15px] leading-5 bg-[#0e3625] relative z-[2] hover:bg-[#1e573fb5]"
            >
              BACK TO HOME
            </a>
          </div>
        </div>
        <Footer />
        <style>
          
        </style>
      </body>
    </html>
  );
}
