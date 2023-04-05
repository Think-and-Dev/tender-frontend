import { useState, useEffect, useContext } from "react";
import { getAPY } from "~/components/shared/APY";
import { TenderContext } from "~/contexts/tender-context";

export function useAccountSummary() {
  let [accountSummary, setAccountSummary] = useState<any>({
    supplyBalanceInUsd: 0,
    borrowBalanceInUsd: 0,
    borrowLimit: 0,
    netApy: null,
    liquidationThresholdInUsd: 0,
  });
  let { markets } = useContext(TenderContext);

  useEffect(() => {
    if (markets.length === 0) {
      return;
    }

    let supplyBalanceInUsd = 0;
    let borrowBalanceInUsd = 0;
    let borrowLimit = 0;
    let netGainOrLoss = 0;
    let liquidationThresholdInUsd = 0;

    markets.forEach((m) => {
      supplyBalanceInUsd += m.supplyBalanceInUsd;
      borrowBalanceInUsd += m.borrowBalanceInUsd;
      borrowLimit = m.borrowLimit;
      liquidationThresholdInUsd = m.liquidationThresholdInUsd;
      netGainOrLoss +=
        m.supplyBalanceInUsd * parseFloat(m.marketData.depositApy) * 0.01 -
        m.borrowBalanceInUsd * parseFloat(m.marketData.borrowApy) * 0.01 +
        m.supplyBalanceInUsd * getAPY("supply", m).ESTNDAPY +
        m.borrowBalanceInUsd * getAPY("boorrow", m).ESTNDAPY;
    });

    const netApy =
      supplyBalanceInUsd === 0
        ? 0
        : (netGainOrLoss / (supplyBalanceInUsd - borrowBalanceInUsd)) * 100;

    const ltv = supplyBalanceInUsd
      ? (borrowBalanceInUsd * 100) / supplyBalanceInUsd
      : 0;

    setAccountSummary({
      supplyBalanceInUsd,
      borrowBalanceInUsd,
      borrowLimit,
      netApy,
      ltv,
      liquidationThresholdInUsd,
    });
  }, [markets]); // we don't use interval because markets already use it

  return accountSummary;
}
