/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "vercel",
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [
    /^@rainbow-me\/rainbowkit$/,
    /^@rainbow-me\/rainbowkit\/wallets$/,
    /^@?wagmi.*/,
    // /.*/,

    // /@rainbow-me\/rainbowkit/,
    // /@rainbow-me\/rainbowkit\/wallets/,
    // /@wagmi\/connectors/,
    // /@wagmi\/core\/providers\/public/,
    // /@wagmi\/core/,
    // "wagmi",
    // /wagmi\/connectors\/coinbaseWallet/,
    // /wagmi\/connectors\/injected/,
    // /wagmi\/connectors\/metaMask/,
    // /wagmi\/connectors\/safe/,
    // /wagmi\/connectors\/walletConnectLegacy/,
    // /wagmi\/chains/,
    // /wagmi\/providers\/alchemy/,
    // /wagmi\/providers\/public/,
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
};
