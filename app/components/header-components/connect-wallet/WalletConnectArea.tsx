import { ClientOnly } from "remix-utils";

import ConnectWallet from "./connect-wallet";
import NetworksDropdown from "./networksDropdown";

export const WalletConnectArea = () => {
  return (
    <ClientOnly>
      {() => (
        <>
          <NetworksDropdown />
          <ConnectWallet />
        </>
      )}
    </ClientOnly>
  );
};
