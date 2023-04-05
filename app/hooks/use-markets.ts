import { useState, useEffect } from "react";
import type { Market, TokenPair } from "~/types/global";
import type { JsonRpcSigner } from "@ethersproject/providers";
import { calculateApy, formatApy } from "~/lib/apy-calculations";
import {
  getBorrowLimitUsed,
  formatBigNumber,
  MINIMUM_REQUIRED_APPROVAL_BALANCE,
} from "~/lib/tender";
import { useInterval } from "./use-interval";
import { ethers, utils } from "ethers";
import SampleCTokenAbi from "~/config/sample-ctoken-abi";
import SampleCEtherAbi from "~/config/sample-CEther-abi";
import SampleErc20Abi from "~/config/sample-erc20-abi";
import SampleComptrollerAbi from "~/config/sample-comptroller-abi";
import { providers as mcProviders } from "@0xsequence/multicall";
import { formatUnits } from "ethers/lib/utils";
import { useGlpApy } from "./use-glp-apy";
import { useGmxApy } from "./use-gmx-apy";
import { getArbitrumOneSdk } from ".dethcrypto/eth-sdk-client";

// @todo maybe refactor (remove duplicate code from tender.ts, merge changes, etc.)
export function useMarkets(
  signer: JsonRpcSigner | null | undefined,
  supportedTokenPairs: TokenPair[],
  comptrollerAddress: string | undefined,
  priceOracleAddress: string | undefined,
  secondsPerBlock: number | undefined
) {
  let [markets, setMarkets] = useState<Market[]>([]);

  let pollingKey = useInterval(7_000);

  const getGlpApy = useGlpApy();
  const getGmxApy = useGmxApy();

  useEffect(() => {
    if (
      !signer ||
      !comptrollerAddress ||
      !priceOracleAddress ||
      !secondsPerBlock
    ) {
      return;
    }

    const mcProvider = new mcProviders.MulticallProvider(signer.provider);

    const getMarkets = async () => {
      const comptrollerContract = new ethers.Contract(
        comptrollerAddress,
        SampleComptrollerAbi,
        mcProvider
      );

      const address: string = await signer.getAddress();

      const tokenPromises = supportedTokenPairs.map((tp) => {
        const abi =
          tp.token.symbol === "ETH" ? SampleCEtherAbi : SampleCTokenAbi;
        const cTokenContract = new ethers.Contract(
          tp.cToken.address,
          abi,
          mcProvider
        );

        // getTotalBorrowedInUsd -> getCurrentlyBorrowing
        const borrowBalancePromise =
          cTokenContract.callStatic.borrowBalanceCurrent(address);

        // getAccountBorrowLimitInUsd -> borrowLimitForTokenInUsd ->
        // -> getCurrentlySupplying
        const balancePromise = cTokenContract.callStatic.balanceOf(address);
        const exchangeRateCurrentPromise = cTokenContract.exchangeRateStored();

        // -> collateralFactorForToken
        const comptrollerMarketsPromise = comptrollerContract.markets(
          tp.cToken.address
        );

        // -> borrowCaps
        const borrowCapsPromise = comptrollerContract.borrowCaps(
          tp.cToken.address
        );

        // -> supplyCaps
        const supplyCapsPromise = comptrollerContract.supplyCaps(
          tp.cToken.address
        );

        // getCurrentlySupplying -> ...
        // getCurrentlyBorrowing -> ...

        // getMaxBorrowLiquidity
        let cashPromise = cTokenContract.getCash();

        // getMarketData ->
        // -> formattedDepositApy -> calculateDepositApy
        const supplyRatePerBlockPromise = cTokenContract.supplyRatePerBlock();

        // -> formattedBorrowApy -> calculateBorrowApy
        const borrowRatePerBlockPromise = cTokenContract.borrowRatePerBlock();

        // -> getTotalBorrowed
        const totalBorrowsPromise = cTokenContract.totalBorrows();

        // -> getTotalSupply
        const totalReservesPromise = cTokenContract.totalReserves();

        // -> isGLP flag
        const isGLPPromise = cTokenContract.isGLP();

        // getWalletBalance
        let walletBalancePromise;

        if (tp.token.symbol === "ETH") {
          walletBalancePromise = signer.getBalance();
        } else {
          const tokenContract = new ethers.Contract(
            tp.token.address,
            SampleErc20Abi,
            mcProvider
          );
          walletBalancePromise = tokenContract.balanceOf(address);
        }

        // hasSufficientAllowance
        let allowancePromise;
        const allowanceAddress = tp.token.sGLPAddress || tp.token.address;

        if (allowanceAddress) {
          // workaround for native token
          let allowanceContract = new ethers.Contract(
            allowanceAddress,
            SampleErc20Abi,
            mcProvider
          );
          allowancePromise = allowanceContract.allowance(
            address,
            tp.cToken.address
          );
        }

        const autocompoundPromise = cTokenContract.autocompound();

        let performanceFeePromise;
        let withdrawFeePromise;

        if (tp.token.cToken.isVault) {
          performanceFeePromise = cTokenContract.performanceFee();
          withdrawFeePromise = cTokenContract.withdrawFee();
        } else {
          performanceFeePromise = new Promise((resolve) => {
            resolve(0);
          });
          withdrawFeePromise = new Promise((resolve) => {
            resolve(0);
          });
        }

        let sdk = getArbitrumOneSdk(signer);
        let compSupplySpeedsPromise = sdk.Comptroller.compSupplySpeeds(
          tp.cToken.address
        );
        let compBorrowSpeedsPromise = sdk.Comptroller.compBorrowSpeeds(
          tp.cToken.address
        );

        return {
          borrowBalance: borrowBalancePromise,
          balance: balancePromise,
          exchangeRateCurrent: exchangeRateCurrentPromise,
          comptrollerMarkets: comptrollerMarketsPromise,
          cash: cashPromise,
          supplyRatePerBlock: supplyRatePerBlockPromise,
          borrowRatePerBlock: borrowRatePerBlockPromise,
          totalBorrows: totalBorrowsPromise,
          totalReserves: totalReservesPromise,
          tokenPair: tp,
          walletBalance: walletBalancePromise,
          allowance: allowancePromise,
          autocompound: autocompoundPromise,
          performanceFee: performanceFeePromise,
          withdrawFee: withdrawFeePromise,
          isGLP: isGLPPromise,
          borrowCaps: borrowCapsPromise,
          supplyCaps: supplyCapsPromise,
          compSupplySpeeds: compSupplySpeedsPromise,
          compBorrowSpeeds: compBorrowSpeedsPromise,
        };
      });

      const tokens = [];

      const liquidationIncentiveMantissaPromise =
        comptrollerContract.liquidationIncentiveMantissa();

      for (const tokenPromise of tokenPromises) {
        tokens.push({
          borrowBalance: await tokenPromise.borrowBalance,
          balance: await tokenPromise.balance,
          exchangeRateCurrent: await tokenPromise.exchangeRateCurrent,
          comptrollerMarkets: await tokenPromise.comptrollerMarkets,
          cash: await tokenPromise.cash,
          supplyRatePerBlock: await tokenPromise.supplyRatePerBlock,
          borrowRatePerBlock: await tokenPromise.borrowRatePerBlock,
          totalBorrows: await tokenPromise.totalBorrows,
          totalReserves: await tokenPromise.totalReserves,
          tokenPair: tokenPromise.tokenPair,
          walletBalance: await tokenPromise.walletBalance,
          allowance: tokenPromise.allowance
            ? await tokenPromise.allowance
            : MINIMUM_REQUIRED_APPROVAL_BALANCE,
          autocompound: await tokenPromise.autocompound,
          performanceFee: await tokenPromise.performanceFee,
          withdrawFee: await tokenPromise.withdrawFee,
          isGLP: await tokenPromise.isGLP,
          borrowCaps: await tokenPromise.borrowCaps,
          supplyCaps: await tokenPromise.supplyCaps,
          compSupplySpeeds: await tokenPromise.compSupplySpeeds,
          compBorrowSpeeds: await tokenPromise.compBorrowSpeeds,
        });
      }

      const liquidationIncentiveMantissa =
        await liquidationIncentiveMantissaPromise;
      const liquidationPenalty = liquidationIncentiveMantissa
        ? (liquidationIncentiveMantissa / 1e18) * 100 - 100
        : 0;

      // getTotalBorrowedInUsd
      const totalBorrowedAmountInUsd = tokens
        .map((token) => {
          return (
            formatBigNumber(
              token.borrowBalance,
              token.tokenPair.token.decimals
            ) * token.tokenPair.token.priceInUsd
          );
        })
        .reduce((acc, curr) => acc + curr, 0);

      // getAccountBorrowLimitInUsd
      const accountBorrowLimitInUsd = tokens
        .map((token) => {
          // the exchange rate is scaled by 18 decimals
          const suppliedAmount = formatBigNumber(
            token.balance.mul(token.exchangeRateCurrent),
            token.tokenPair.token.decimals + 18
          );

          const collateralFactor = parseFloat(
            formatUnits(token.comptrollerMarkets.collateralFactorMantissa, 18)
          );

          return (
            suppliedAmount * token.tokenPair.token.priceInUsd * collateralFactor
          );
        })
        .reduce((acc, curr) => acc + curr, 0);

      const accountLiquidationThresholdInUsd = tokens
        .map((token) => {
          // the exchange rate is scaled by 18 decimals
          const suppliedAmount = formatBigNumber(
            token.balance.mul(token.exchangeRateCurrent),
            token.tokenPair.token.decimals + 18
          );

          const liquidationThresholdMantissa = parseFloat(
            formatUnits(
              token.comptrollerMarkets.liquidationThresholdMantissa,
              18
            )
          );

          return (
            suppliedAmount *
            token.tokenPair.token.priceInUsd *
            liquidationThresholdMantissa
          );
        })
        .reduce((acc, curr) => acc + curr, 0);

      const newMarkets = tokens.map(async (token): Promise<Market> => {
        const tp = token.tokenPair;
        const supplyBalance = formatBigNumber(
          token.balance.mul(token.exchangeRateCurrent),
          tp.token.decimals + 18
        );
        const borrowBalance = formatBigNumber(
          token.borrowBalance,
          tp.token.decimals
        );

        const supplyBalanceInUsd = supplyBalance * tp.token.priceInUsd;
        const borrowBalanceInUsd = borrowBalance * tp.token.priceInUsd;

        const maxBorrowLiquidity = parseFloat(
          utils.formatUnits(token.cash, tp.token.decimals)
        );

        // walletBalance
        const walletBalance = token.walletBalance.toString();
        let depositApy;
        if (tp.token.symbol === "GLP") {
          const glpApy = await getGlpApy(signer, tp);
          depositApy = formatApy(glpApy);
        } else if (tp.token.symbol === "GMX") {
          const gmxApy = await getGmxApy(signer, tp, priceOracleAddress);

          const tokenSupplyApy = calculateApy(
            token.supplyRatePerBlock,
            secondsPerBlock
          );
          depositApy = formatApy(gmxApy + tokenSupplyApy);
        } else {
          // marketData
          depositApy = formatApy(
            calculateApy(token.supplyRatePerBlock, secondsPerBlock)
          );
        }

        const borrowApy = formatApy(
          calculateApy(token.borrowRatePerBlock, secondsPerBlock)
        );

        const totalBorrowed = formatBigNumber(
          token.totalBorrows,
          token.tokenPair.token.decimals
        );

        const reserves = formatBigNumber(
          token.totalReserves,
          token.tokenPair.token.decimals
        );

        let marketSize = formatBigNumber(
          token.cash.add(token.totalBorrows).sub(token.totalReserves),
          token.tokenPair.token.decimals
        );

        const liquidationThreshold =
          (token.comptrollerMarkets.liquidationThresholdMantissa / 1e18) * 100;

        const collateralFactor = parseFloat(
          formatUnits(token.comptrollerMarkets.collateralFactorMantissa, 18)
        );

        return {
          id: tp.token.symbol,
          tokenPair: tp,
          marketData: {
            depositApy,
            borrowApy,
            totalBorrowed,
            marketSize,
            reserves,
          },
          walletBalance,
          supplyBalance,
          supplyBalanceInUsd,
          borrowBalance,
          borrowBalanceInUsd,
          comptrollerAddress,
          borrowLimit: accountBorrowLimitInUsd,
          liquidationThresholdInUsd: accountLiquidationThresholdInUsd,
          totalBorrowedAmountInUsd,
          borrowLimitUsedOfToken: await getBorrowLimitUsed(
            borrowBalanceInUsd,
            accountBorrowLimitInUsd
          ),
          borrowLimitUsed: await getBorrowLimitUsed(
            totalBorrowedAmountInUsd,
            accountBorrowLimitInUsd
          ),
          maxBorrowLiquidity,
          tokenAllowance: token.allowance,
          autocompound: token.autocompound,
          performanceFee: token.performanceFee,
          withdrawFee: token.withdrawFee,
          // -> for now, isBorrowable is derived from isGLP this can change in future, update when it changes
          isBorrowable: !token.isGLP,
          liquidationThreshold,
          liquidationPenalty,
          borrowCaps: token.borrowCaps.toString(),
          supplyCaps: token.supplyCaps.toString(),
          collateralFactor,
          compSupplySpeeds: token.compSupplySpeeds,
          compBorrowSpeeds: token.compBorrowSpeeds,
        };
      });

      Promise.all(newMarkets).then((nm) => setMarkets(nm));
    };

    getMarkets();
  }, [
    signer,
    supportedTokenPairs,
    comptrollerAddress,
    pollingKey,
    secondsPerBlock,
    getGlpApy,
    priceOracleAddress,
    getGmxApy,
  ]);

  return markets;
}
