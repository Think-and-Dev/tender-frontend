/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "vercel",
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: [".*"],
  serverDependenciesToBundle: [
    /@wagmi\/connectors.*/,
    /wagmi\/connectors.*/,
    /wagmi\/providers\/alchemy/,
    /wagmi\/providers\/public/,
    /@wagmi\/core\/providers\/public/,
    /wagmi\/connectors\/injected/,
    /@wagmi\/core/,
    /wagmi\/chains/,
    /wagmi\/dist\/connectors/,
    "wagmi",
    '@rainbow-me/rainbowkit',
    '@rainbow-me/rainbowkit/wallets',
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
};
