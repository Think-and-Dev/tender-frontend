import { useEffect } from "react";
import { MetaFunction, useParams } from "@remix-run/vercel";
import { useNetwork } from "wagmi";
import { useTenderContext } from "~/hooks/use-tender-context";
import { useOnSupportedNetwork } from "~/hooks/use-on-supported-network";
import { TenderContext } from "~/contexts/tender-context";
import Token from "~/components/token-page/Token";
import TokenEmpty from "~/components/token-page/TokenEmpty";

export default function TokenPage() {
  const tenderContextData = useTenderContext();

  const { chain } = useNetwork();
  const chainId = chain?.id;

  const onSupportedChain = useOnSupportedNetwork(chainId);
  const { tokenId } = useParams();

  useEffect(() => {
    if (
      tenderContextData?.markets?.length &&
      !tenderContextData?.markets?.find(
        (t) => t.id.toUpperCase() === tokenId?.toUpperCase()
      )
    ) {
      window.location.replace(`/markets`);
    }
  }, [tenderContextData, tokenId]);

  return (
    <div className="c mt-[30px] mb-[60px] md:mb-[100px] max-w-[1068px] switch__to__network">
      {tenderContextData && onSupportedChain ? (
        <TenderContext.Provider value={tenderContextData}>
          <Token id={tokenId?.toUpperCase()} />
        </TenderContext.Provider>
      ) : (
        <TokenEmpty id={tokenId?.toUpperCase()} />
      )}
    </div>
  );
}

export const meta: MetaFunction = (data) => ({
  title: `Tender.fi - Token ${data.params.tokenId?.toUpperCase()}`,
  property: [
    { "og:title": `Tender.fi - Token ${data.params.tokenId?.toUpperCase()}` },
  ],
});
