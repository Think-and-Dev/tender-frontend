import { TenderContext } from "~/contexts/tender-context";
import { useTenderContext } from "~/hooks/use-tender-context";

import EmptyEarnContent from "~/components/earn-page/emptyEarnContent";
import EarnContent from "~/components/earn-page/earnContent";
import { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/node";

export default function Earn() {
  const [loading, setLoading] = useState<boolean>(true);
  let tenderContextData = useTenderContext();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (loading || !tenderContextData) ? <EmptyEarnContent /> : 
  <TenderContext.Provider value={tenderContextData}>
    <EarnContent />
  </TenderContext.Provider>
}

export const meta: MetaFunction = () => ({
  title: "Tender.fi - Earn",
  property: [{ "og:title": "Tender.fi - Earn" }],
});
