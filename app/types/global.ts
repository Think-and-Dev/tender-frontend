import { Address } from "@dethcrypto/eth-sdk";
import { BigNumber } from "@ethersproject/bignumber";

// Create a name for number, so it is clear
// what units the function is returning in
export type USD = number;
export type Ratio = number;

export interface cToken {
  name: string;
  address: Address;
  decimals: number;
  symbol: string;
  isVault: boolean;
}

export interface Token extends TokenConfig {
  priceInUsd: number;
  sGLPAddress?: any;
  glpAddress?: Address;
  glpManager?: string;
  rewardTracker?: string;
  vault?: string;
  nativeToken?: string;
  floor?: string; // the min amount to transfer
}

export interface TokenConfig {
  symbol: string;
  icon: string;
  name: string;
  decimals: number;
  address: Address;
  cToken: cToken;
}

export interface NetworkData {
  ChainId: number;
  name: string;
  blockExplorerName: string;
  blockExplorerUrl: string;
  userExplorerUrl?: string;
  rpcUrls?: string[];
  secondsPerBlock: number;
  l2SecondsPerBlock: number;
  graphUrl: string;
  Contracts: {
    Comptroller: Address;
    PriceOracle: Address;
    Maximillion: Address;
  };
  Tokens: {
    [key: string]: TokenConfig;
  };
}

export enum NetworkName {
  rinkeby = "rinkeby",
  metisStartdust = "metisStartdust",
  metisMainnet = "metisMainnet",
  arbitrum = "arbitrum",
  avalanche = "avalanche",
}

export type Networks = {
  [key in NetworkName]: NetworkData;
};

export interface TokenPair {
  token: Token;
  cToken: cToken;
}

export type TenderContext = {
  tokenPairs: TokenPair[];
  networkData: NetworkData;
  markets: Market[];
  currentTransaction: string | null;
  updateTransaction: (arg0: string | null) => void;
  isWaitingToBeMined: boolean;
  setIsWaitingToBeMined: Function;
  blockNumber: number | boolean;
  tndPrice: number | null;
  ethPrice: number;
};

export type Market = {
  id: string;
  tokenPair: TokenPair;
  marketData: {
    depositApy: string;
    borrowApy: string;
    totalBorrowed?: number;
    marketSize?: number;
    totalBorrowedUsd?: string;
    marketSizeUsd?: string;
    reserves: number;
  };
  compSupplySpeeds?: BigNumber;
  compBorrowSpeeds?: BigNumber;
  walletBalance: string;
  supplyBalance: number;
  supplyBalanceInUsd: number;
  borrowBalance: number;
  borrowBalanceInUsd: number;
  borrowLimit: number;
  borrowLimitUsedOfToken: string;
  borrowLimitUsed: string;
  totalBorrowedAmountInUsd: number;
  comptrollerAddress: string;
  maxBorrowLiquidity: number;
  tokenAllowance: BigNumber;
  autocompound: boolean;
  performanceFee: number;
  withdrawFee: number;
  isBorrowable: boolean;
  liquidationThreshold: number;
  liquidationThresholdInUsd: number;
  liquidationPenalty: number;
  borrowCaps: string;
  supplyCaps: string;
  collateralFactor: number;
};

export type IncentiveTracker = "sTND" | "sbTND" | "sbfTND" | "vTND";
export type IncentiveToken = "TND" | "esTND" | "bnTND";

export type IncentiveConfig = {
  name: string;
  address: Address;
  decimals: number;
  symbol: string;
};

export type IncentiveTokenConfig = IncentiveConfig & {
  tracker: IncentiveTracker;
};

export type IncentiveContractsConfig = {
  RewardRouter: Address;
  RewardDistributor: Address;
  EthRewardDistributor: Address;
  TND_USDC_UNISWAP_POOL: Address;
  UNISWAP_QUOTER: Address;
  Tokens: {
    [key in IncentiveToken]: IncentiveTokenConfig;
  };
  Trackers: {
    [key in IncentiveTracker]: IncentiveConfig;
  };
};
