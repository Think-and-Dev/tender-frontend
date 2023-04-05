import { useCallback, useEffect, useState } from "react";
// import { hooks as Web3Hooks, metaMask } from "~/connectors/meta-mask";
import { useAccount, useSigner, useSwitchNetwork } from "wagmi";
import type { AuthsType } from "~/hooks/use-auth";
import WalletDropdown from "./walletDropdown";

type ConnectWalletProps = {
  inMenu?: boolean;
} & AuthsType
// import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function ConnectWallet({ inMenu, isDisconnected, connect, disconnect }: ConnectWalletProps) {
  const { address: defaultAddress, isConnected: isActive } = useAccount();
  const [onClient, setOnClient] = useState<boolean>(false);

  const { data: signer } = useSigner();

  const handleChainChanged = useCallback((ethereum: any) => {
    ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      handleChainChanged(window.ethereum);
    }
  }, [handleChainChanged, signer]);

  useEffect(() => {
    setOnClient(true);
    if (!isDisconnected()) {
      void connect();
    }
  }, [isDisconnected]);


  return (
    <div>
      {/* {onClient && <ConnectButton /> }; */}
      {
        onClient && (
          <>
            {isActive && defaultAddress && (
              <WalletDropdown
                inMenu={inMenu}
                defaultAddress={defaultAddress}
                walletIco={"/images/wallet-icons/metamask.svg"}
                handlerDisconnect={() => disconnect()}
              />
            )}

            {!isActive && (
              <button
                className="border font-space flex items-center justify-center font-bold uppercase rounded-md text-dark-green w-[110px] xl:text-sm h-[34px] border-[#14f195] xl:w-[160px] xl:h-[44px] text-[10px] hover:opacity-[0.6]"
                onClick={() => connect()}
              >
                Connect Wallet
              </button>
            )}
          </>
        )
      }
    </div>
  );
}
