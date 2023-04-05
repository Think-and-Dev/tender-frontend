import { arbitrum } from "@wagmi/chains";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
// import { MetaMaskConnector } from "@wagmi/connectors/metaMask";

// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'


// let m = import("wagmi/connectors/walletConnect")

const DISCONNECTED_LOCAL_STORAGE_KEY = "tenderWalletDisconnected";

// const isDisconnected = () => {
//   return window.localStorage.getItem(DISCONNECTED_LOCAL_STORAGE_KEY) === "1";
// };

export type AuthsType = ReturnType<typeof useAuth>;

const useAuth = () => {
  let [isConnecting, setIsConnecting] = useState(false)

  const connector = useConnect({
    connector: globalThis.WCC

       // connector: new InjectedConnector({chains: [arbitrum]}),
  });
  // console.log("acquired", Walletconnector)

  const { disconnect: _disconnect } = useDisconnect();

  const { connector: activeConnector, address, isConnected } = useAccount()
  const { connect:_connect, connectors, error, isLoading, pendingConnector } = useConnect()

  let isDisconnected = ()=> !isConnected
  const connect = useCallback(async () => {
    if (isConnecting) return
    if (isConnected) {
      return console.log("already connected", address)
    }
    try {
      setIsConnecting(true)
      // await connector.connectAsync();

      _connect({ connector })
    } catch (err) {
      console.error(err)
    } finally {
      setIsConnecting(false)
    }

    window.localStorage.setItem(DISCONNECTED_LOCAL_STORAGE_KEY, "0");
  }, [connector]);

  const disconnect = useCallback(async () => {
    await _disconnect();
    window.localStorage.setItem(DISCONNECTED_LOCAL_STORAGE_KEY, "1");
  }, [_disconnect]);

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
  }, [connect, disconnect]);

  return { connect, disconnect, isDisconnected };
};

export default useAuth;
