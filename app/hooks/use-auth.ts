import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
// import { metaMask } from "~/connectors/meta-mask";

const DISCONNECTED_LOCAL_STORAGE_KEY = "tenderWalletDisconnected";

const isDisconnected = () => {
  return window.localStorage.getItem(DISCONNECTED_LOCAL_STORAGE_KEY) === "1";
};

const useAuth = () => {
  const { address: defaultAddress, isConnected: isActive } = useAccount();
  const { connect: _connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect: _disconnect } = useDisconnect();

  const connect = async () => {
    await _connect();
    window.localStorage.setItem(DISCONNECTED_LOCAL_STORAGE_KEY, "0");
  };

  const disconnect = async () => {
    await _disconnect();
    window.localStorage.setItem(DISCONNECTED_LOCAL_STORAGE_KEY, "1");
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === DISCONNECTED_LOCAL_STORAGE_KEY) {
        if (event.newValue === "0") {
          connect();
        } else {
          disconnect();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { connect, disconnect, isDisconnected };
};

export type AuthType = ReturnType<typeof useAuth>
export default useAuth;
