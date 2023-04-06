import { useCallback, useEffect, useRef, useState } from "react";
import { WalletConnectArea } from "./connect-wallet";
import { useLocation } from "react-router-dom";
import ConnectWallet from "./connect-wallet/connect-wallet";
import useAuth from "~/hooks/use-auth";

const menuLinks = [
  {
    name: "Dashboard",
    link: "/",
    target: "_self",
  },
  // {
  //   name: "Markets",
  //   link: "/markets",
  //   target: "_self",
  // },
  // hiding temporarily, will need it later
  {
    name: "Earn",
    link: "/earn",
    target: "_self",
  },
  {
    name: "Docs",
    link: "https://docs.tender.fi",
    target: "_blank",
  },
  {
    name: "Community",
    link: "https://discord.com/invite/TenderFi",
    target: "_blank",
  },
];

export default function Header() {
  // @TODO: This does not work in the last version of remix
  // location is used to select the menu tiem
  // let location = useLocation();
  const burgerRef = useRef<any>(null);
  const menuRef = useRef<any>(null);
  const { connect, disconnect, isDisconnected } = useAuth();
  const [activePopupMenu, setActivePopupMenu] = useState<boolean>(false);

  const handleClickBurger = useCallback((value: boolean) => {
    setActivePopupMenu(value);
    if (value) {
      document.querySelector("body")?.classList.add("body__fixed");
    } else {
      document.querySelector("body")?.classList.remove("body__fixed");
    }
  }, []);

  useEffect(() => {
    const closeDropdown = (e: any) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(e.target)
      ) {
        handleClickBurger(false);
      }
    };
    window.addEventListener("click", closeDropdown);
  }, [handleClickBurger]);

  return (
    <header className="relative">
      <div className="header__block bg-black z-20 relative h-[71px] lg:h-[110px] flex items-center justify-between">
        <div className="flex w-full c items-center justify-between max-w-[1400px]">
          <div className="w-[104px] block lg:w-[196px] z-20 relative">
            <a href="https://tender.fi">
              <img src="/images/logo1.svg" alt="Tender Finance" />
            </a>
          </div>
          <div className="text-[#ADB5B3] hidden lg:flex justify-center font-normal text-base font-nova gap-x-[30px] z-20 absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            {menuLinks.map(
              (item: { name: string; link: string; target: string }) => (
                <a
                  key={item.name}
                  className={`cursor-pointer hover:text-white ${
                  '' // location.pathname === item.link ? "text-white" : ""
                  }`}
                  href={item.link}
                  target={item.target}
                  rel="noreferrer"
                >
                  {item.name}
                </a>
              )
            )}
          </div>
          <div className="flex items-center z-20 relative">
            <WalletConnectArea
              connect={connect} disconnect={disconnect}
              isDisconnected={isDisconnected}  />
            <button
              aria-label="menu"
              className={`flex lg:hidden header__burg ${
                activePopupMenu ? "active" : ""
              }`}
              onClick={() => handleClickBurger(!activePopupMenu)}
              ref={burgerRef}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div
            className={`aside__menu__wrap top-[71px] flex lg:hidden ${
              activePopupMenu ? `act` : ""
            }`}
            ref={menuRef}
          >
            <div className="aside__menu__container w-full h-full bg-black py-[60px] px-[30px]">
              <div className="relative flex justify-center items-center flex-col text-[#ADB5B3] font-nova-400 text-xl gap-y-[30px]">
                {menuLinks.map(
                  (item: { name: string; link: string; target: string }) => (
                    <a
                      key={item.name}
                      className="font-nova text-white text-lg gap-y-[20px]"
                      href={item.link}
                      target={item.target}
                      rel="noreferrer"
                    >
                      {item.name}
                    </a>
                  )
                )}
              </div>
              <div className="mt-[40px] flex justify-center">
                <ConnectWallet inMenu
                  connect={connect}
                  disconnect={disconnect}
                  isDisconnected={isDisconnected}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
