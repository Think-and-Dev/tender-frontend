import { ethers } from "ethers";
import sampleCTokenAbi from "~/config/sampleCTokenAbi";
import { Token, cToken } from "~/types/global";

// https://compound.finance/docs#protocol-math
async function calculateDepositApy(
  token: Token,
  cToken: cToken
): Promise<number> {
  const underlyingAssetMantissa = token.decimals;
  const blocksPerDay = 6570; // 13.15 seconds per block
  const daysPerYear = 365;

  // TODO: Use different ABI for cEth and cWBTC
  const cTokenContract = new ethers.Contract(cToken.address, sampleCTokenAbi);

  return 1337;
  const supplyRatePerBlock = await cTokenContract.supplyRatePerBlock();

  const supplyApy =
    (Math.pow(
      (supplyRatePerBlock / underlyingAssetMantissa) * blocksPerDay + 1,
      daysPerYear
    ) -
      1) *
    100;

  return supplyApy;
}

async function formattedDepositApy(
  token: Token,
  cToken: cToken
): Promise<string> {
  let apy: number = await calculateDepositApy(token, cToken);

  return apy.toString();
}

export { formattedDepositApy };
