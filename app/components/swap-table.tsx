import SwapRow from "~/components/swap-row";
import {
  SwapRow as SwapRowType,
  TokenName,
  NetworkName,
  Token,
  cToken,
  SwapRowMarketData,
  SwapRowMarketDatum,
  NetworkData,
  TokenPair,
} from "~/types/global";
import { useEffect, useState } from "react";
import { hooks as Web3Hooks } from "~/connectors/meta-mask";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import networks from "~/config/networks";
import { tokenMetaData } from "~/config/tokenMetaData";
import { chainIdToNetwork } from "~/connectors";

import {
  formattedBorrowApy,
  formattedDepositApy,
} from "~/lib/apy-calculations";

import { getMarketSizeUsd, getTotalBorrowedUsd } from "~/lib/tender";

import ConnectWallet from "./connect-wallet";
import { useWeb3Signer } from "~/hooks/use-web3-signer";
import { useOnSupportedNetwork } from "~/hooks/use-on-supported-network";

// const SUPPORTED_TOKENS = [TokenName.BTC, TokenName.ETH, TokenName.USDT];
const SUPPORTED_TOKENS = [
  TokenName.DAI,
  TokenName.USDC,
  TokenName.USDT,
  TokenName.WBTC,
];

function generateSwapRows(
  supportedRowTypes: TokenName[],
  networkName: string,
  onSupportedNetwork: boolean
): SwapRowType[] {
  if (!onSupportedNetwork) {
    return [];
  }

  return supportedRowTypes.map((tokenName: TokenName): SwapRowType => {
    // Map current conntected network to config data
    // @ts-ignore
    const networkData: NetworkData = networks[networkName];
    const tokenMetaDatum = tokenMetaData[tokenName];

    let token: Token = networkData.Tokens[tokenMetaDatum.symbol];
    let cToken: cToken = networkData.cTokens[tokenMetaDatum.cTokenSymbol];
    let comptrollerAddress: string = networkData.Contracts.Comptroller;

    return {
      ...tokenMetaDatum,
      comptrollerAddress: comptrollerAddress,
      token: token,
      cToken: cToken,
    };
  });
}

async function loadMarketData(
  signer: JsonRpcSigner,
  swapRows: SwapRowType[]
): Promise<SwapRowMarketData> {
  try {
    let marketData: SwapRowMarketDatum[] = await Promise.all(
      swapRows.map(async (s: SwapRowType): Promise<SwapRowMarketDatum> => {
        // TODO: This could get slow, need a cached API
        const marketSizeUsd: string = await getMarketSizeUsd(signer, s.cToken);
        const totalBorrowedUsd: string = await getTotalBorrowedUsd(
          signer,
          s.cToken
        );
        const depositApy: string = await formattedDepositApy(
          s.token,
          s.cToken,
          signer
        );
        const borrowApy: string = await formattedBorrowApy(
          s.token,
          s.cToken,
          signer
        );
        return {
          id: s.name,
          marketSizeUsd,
          totalBorrowedUsd,
          depositApy,
          borrowApy,
        };
      })
    );
    let swapRowMarketData: SwapRowMarketData = {};
    marketData.forEach((md) => (swapRowMarketData[md.id] = { ...md }));
    return swapRowMarketData;
  } catch (error) {
    console.error(error);
    return {};
  }
}

/**
 * Calculating things like total deposits or borrow limits requires checking balances
 * across all tokens, so this function provides a list of all tokens paired with their cTokens.
 */
function generateTokenPairs(
  supportedRowTypes: TokenName[],
  networkName: string,
  onSupportedNetwork: boolean
): TokenPair[] {
  if (!onSupportedNetwork) {
    return [];
  }
  // @ts-ignore
  const networkData: NetworkData = networks[networkName];

  return supportedRowTypes.map((tokenName: TokenName): TokenPair => {
    const tokenMetaDatum = tokenMetaData[tokenName];

    let token: Token = networkData.Tokens[tokenMetaDatum.symbol];
    let cToken: cToken = networkData.cTokens[tokenMetaDatum.cTokenSymbol];

    return {
      token: token,
      cToken: cToken,
    };
  });
}

export default function SwapTable() {
  let [swapRows, setSwapRows] = useState<SwapRowType[]>([]);
  let [swapRowsMarketData, setSwapRowsMarketData] = useState<SwapRowMarketData>(
    {}
  );
  let [tokenPairs, setTokenPairs] = useState<TokenPair[]>([]);
  let provider = Web3Hooks.useProvider();
  const signer = useWeb3Signer(provider);

  const chainId = Web3Hooks.useChainId();
  const onSupportedNetwork = useOnSupportedNetwork(chainId);

  useEffect(() => {
    if (!chainId) {
      return;
    }

    const rows: SwapRowType[] = generateSwapRows(
      SUPPORTED_TOKENS,
      NetworkName[chainId],
      onSupportedNetwork
    );

    setSwapRows(rows);

    let pairs: TokenPair[] = generateTokenPairs(
      SUPPORTED_TOKENS,
      NetworkName[chainId],
      onSupportedNetwork
    );
    setTokenPairs(pairs);
  }, [chainId, onSupportedNetwork]);

  useEffect(() => {
    if (!signer) {
      return;
    }
    loadMarketData(signer, swapRows).then((f) => setSwapRowsMarketData(f));
  }, [swapRows, signer]);

  return (
    <div className="mb-60">
      {chainId && onSupportedNetwork && (
        <>
          <div className=" flex align-middle items-center  font-light text-gray-300 px-10">
            <div className="flex items-center align-middle">
              <div style={{ width: "55px" }} className="mr-4"></div>
              <div style={{ width: "130px" }}></div>
            </div>
            <div className="grid grid-cols-4 flex-grow text-xs text-gray-500 text-center">
              <div>Market size </div>
              <div>Total borrowed </div>
              <div>Deposit APY</div>
              <div>Borrow APY</div>
            </div>
            <div style={{ width: "280px" }}></div>
          </div>

          <div className="bg-gray-800 rounded-xl px-10 mt-8">
            {swapRows.map((row) => (
              <SwapRow
                key={row.icon}
                row={row}
                tokenPairs={tokenPairs}
                marketData={swapRowsMarketData[row.name] || {}}
              />
            ))}
          </div>
        </>
      )}
      {chainId && !onSupportedNetwork && (
        <div>
          <span className="text-yellow-100 font-bold">
            {chainIdToNetwork[chainId] || ""}
          </span>{" "}
          network not supported. Please check back soon.
        </div>
      )}
      {!chainId && <ConnectWallet />}
    </div>
  );
}
