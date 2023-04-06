import { useState, useRef, useEffect } from "react";
import { useAccount, useNetwork, useProvider, useSwitchNetwork } from "wagmi";

import networks from "~/config/networks";
import type { NetworkData } from "~/types/global";
import { AuthType } from "~/hooks/use-auth";
export const addNetwork = async (
  provider: any,
  networkData: NetworkData
) => {
  if (!provider) {
    return;
  }

  const targetNetworkId = networkData.ChainId;
  // const targetNetworkIdHex = utils.hexValue(targetNetworkId);
  provider?.request && provider!.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainName: networkData.name,
        nativeCurrency: {
          name: networkData.Tokens[Object.keys(networkData.Tokens)[0]]
            .name,
          symbol:
            networkData.Tokens[Object.keys(networkData.Tokens)[0]]
              .symbol,
          decimals:
            networkData.Tokens[Object.keys(networkData.Tokens)[0]]
              .decimals,
        },
        rpcUrls: networkData.rpcUrls,
        blockExplorerUrls: [networkData.blockExplorerUrl],
        chainId:  `0x${Number(targetNetworkId).toString(16)}`,
      },
    ],
  })
};

const actualNetworks = [
  {
    chainId: networks.arbitrum.ChainId,
    networkName: networks.arbitrum.blockExplorerName,
    iconsSrc: "/images/ico/arbitrum-network.svg",
    links: [
      { linkName: "Arbitrum Bridge", url: "https://bridge.arbitrum.io" },
      { linkName: "Arbiscan", url: "https://arbiscan.io" },
      // { linkName: "Helpcenter", url: "https://support.uniswap.org/hc/en-us" },
    ],
    networkData: networks.arbitrum,
  },
  // {
  //   chainId: networks.avalanche.ChainId,
  //   networkName: networks.avalanche.blockExplorerName,
  //   iconsSrc: "/images/ico/avalanche-network.svg",
  //   links: [
  //     { linkName: "Avalanche Bridge", url: "https://bridge.avax.network" },
  //     { linkName: "Avalanche Explorer", url: "https://snowtrace.io" },
  //     { linkName: "Helpcenter", url: "https://support.avax.network" },
  //   ],
  //   networkData: networks.avalanche,
  // },
];

const NetworksDropdown = ({
  connect, isDisconnected
}: AuthType ) => {
  const { switchNetwork } = useSwitchNetwork()

  const { isConnected: isActive } = useAccount();
  const provider = useProvider();
  const { chain } = useNetwork();
  const chainId = chain?.id;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isDisconnected()) {
      void connect();
    }
  }, [isDisconnected]);

  useEffect(() => {
    const closeDropdown = (e: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", closeDropdown);
    document.addEventListener("keydown", ({ key }) => {
      if (key === "Escape") {
        setIsOpen(false);
      }
    });
  }, []);

  useEffect(() => {
    if (chainId && actualNetworks.length) {
      setSelectedNetwork(
        actualNetworks.find((network) => network.chainId == chainId) || {}
      );
      setIsOpen(false);
    }
  }, [chainId]);

  const handlerCLickNetwork = async (p: any, networkData: NetworkData) => {
    await connect();

    if(switchNetwork) {       
      try {
        switchNetwork(networkData.ChainId);
      } catch (e) {
        console.error(e)
        addNetwork(provider, networkData);
        switchNetwork(networkData.ChainId);
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      {loading ? (
        isActive ? (
          <div className="show animate w-[34px] h-[34px] xl:w-[115px] xl:h-[44px] mr-[6px] xl:mr-[12px]"></div>
        ) : (
          <div className="show animate w-[34px] h-[34px] xl:w-[115px] xl:h-[44px] mr-[6px] xl:mr-[12px]"></div>
        )
      ) : (
        <div
          className="relative z-10 w-[34px] h-[34px] xl:h-[44px] xl:w-[auto] m-auto mr-[6px] xl:mr-[12px]"
          ref={dropdownRef}
        >
          <button
            aria-label="Select Network"
            tabIndex={0}
            className={`group ${
              selectedNetwork.networkName && isActive
                ? "bg-[#181D1B] hover:bg-[#262C2A]"
                : "bg-[#3A1313] hover:bg-[#4f2222]"
            } flex justify-between h-full items-center px-[9px] xl:px-[10px] rounded-[6px] cursor-pointer`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex justify-between gap-[9px] mr-[0] xl:mr-[8px] items-center">
              <img
                className="w-[16px] h-[16px] block"
                src={
                  selectedNetwork.networkName && isActive
                    ? selectedNetwork.iconsSrc
                    : "/images/ico/error-network.svg"
                }
                alt="..."
              />
              <div className="hidden font-nova font-semibold text-sm xl:block">
                {selectedNetwork.networkName && isActive
                  ? selectedNetwork.networkName
                  : "Wrong Network"}
              </div>
            </div>
            <svg
              className={`hidden xl:block fill-white justify-self-end arrow__custom ${
                isOpen ? "rotate-0" : "rotate-180"
              } ${
                selectedNetwork.networkName && isActive
                  ? "group-hover:fill-[#01C275]"
                  : "group-hover:fill-[#FF3939]"
              }`}
              width="10"
              height="6"
              viewBox="0 0 10 6"
            >
              <path d="M5.00003 0.149816C5.17925 0.149816 5.35845 0.218246 5.49508 0.354819L9.79486 4.65464C10.0684 4.92816 10.0684 5.37163 9.79486 5.64504C9.52145 5.91845 9.07807 5.91845 8.80452 5.64504L5.00003 1.84032L1.19551 5.64491C0.921987 5.91832 0.478651 5.91832 0.205262 5.64491C-0.0683924 5.37149 -0.0683923 4.92803 0.205262 4.6545L4.50497 0.354686C4.64168 0.218091 4.82087 0.149816 5.00003 0.149816Z" />
            </svg>
          </button>
          <div
            className={`${
              isOpen ? "block" : "hidden"
            } bg-[#181D1B] w-[200px] absolute top-[calc(100%+5px)] right-[0] xl:top-[calc(100%+8px)] rounded-[6px] overflow-hidden border-b-[1px] border-[#181D1B]`}
          >
            <div className="font-nova text-sm font-[500] text-[#818987] pt-[14px] pl-[14px] pb-[14px] border-b-[1px] border-[#282C2B]">
              Select Network
            </div>
            <div className="bg-[#181D1B]">
              {actualNetworks.map((network, index) => {
                return (
                  <div key={network.networkName}>
                    <button
                      onClick={() => {
                        handlerCLickNetwork(provider, network.networkData);
                      }}
                      className={`${
                        network.networkName === selectedNetwork.networkName &&
                        "bg-[#2B302F]"
                      } relative flex items-center justify-between w-full p-[14px] cursor-pointer hover:bg-[#2B302F]`}
                    >
                      <div className="flex items-center">
                        <img
                          className="max-w-[16px] mr-[10px]"
                          src={network.iconsSrc}
                          alt="..."
                        />
                        <p className="text-sm font-[400] font-nova">
                          {network.networkName}
                        </p>
                      </div>
                      {network.networkName === selectedNetwork.networkName && (
                        <span
                          className={`${
                            isActive ? "bg-[#01C275]" : "bg-[#FF3939]"
                          } block rounded-full w-[6px] h-[6px] xl:w-[8px] xl:h-[8px]`}
                        ></span>
                      )}
                    </button>
                    {network.networkName === selectedNetwork.networkName && (
                      <div
                        className={`w-full ${
                          index === actualNetworks.length - 1
                            ? "rounded-b-[6px]"
                            : ""
                        } bg-[#2B302F]`}
                      >
                        {network.links.map((link) => (
                          <a
                            key={link.linkName}
                            className="flex group items-center justify-between pl-[14px] pr-[14px] pt-[6px] pb-[6px] text-[#818987] hover:text-[#14F195] font-nova text-sm font-medium"
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {link.linkName}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                className="fill-[#818987] group-hover:fill-[#14F195]"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.41602 0.166992H2.49935C1.21077 0.166992 0.166016 1.21174 0.166016 2.50033V9.50033C0.166016 10.7889 1.21077 11.8337 2.49935 11.8337H9.49935C10.7879 11.8337 11.8327 10.7889 11.8327 9.50033C11.8327 8.17558 11.8327 6.58366 11.8327 6.58366C11.8327 6.26166 11.5713 6.00033 11.2493 6.00033C10.9273 6.00033 10.666 6.26166 10.666 6.58366V9.50033C10.666 10.1443 10.1433 10.667 9.49935 10.667C7.55685 10.667 4.44127 10.667 2.49935 10.667C1.85477 10.667 1.33268 10.1443 1.33268 9.50033C1.33268 7.55783 1.33268 4.44224 1.33268 2.50033C1.33268 1.85574 1.85477 1.33366 2.49935 1.33366H5.41602C5.73802 1.33366 5.99935 1.07233 5.99935 0.750326C5.99935 0.428326 5.73802 0.166992 5.41602 0.166992ZM9.84118 1.33366H7.74935C7.42735 1.33366 7.16602 1.07233 7.16602 0.750326C7.16602 0.428326 7.42735 0.166992 7.74935 0.166992H11.2493C11.5713 0.166992 11.8327 0.428326 11.8327 0.750326V4.25033C11.8327 4.57233 11.5713 4.83366 11.2493 4.83366C10.9273 4.83366 10.666 4.57233 10.666 4.25033V2.15849L6.41177 6.41274C6.18427 6.64024 5.81443 6.64024 5.58693 6.41274C5.35885 6.18524 5.35885 5.81541 5.58693 5.58791L9.84118 1.33366Z"
                              />
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworksDropdown;
