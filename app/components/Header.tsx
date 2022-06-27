import { useState } from "react";
import ConnectWallet from "./connect-wallet";

export default function Header() {
  const [activePopupMenu, setActivePopupMenu] = useState(false);

  return (
    <div className="fixed bg-black z-10 inset-x-0 top-0 h-16 flex items-center justify-between">
      <div className="flex w-full c items-center justify-between">
        <div
          className="w-26 mr-4 block md:w-36"
          onClick={() => setActivePopupMenu(true)}
        >
          <a href="/">
            <img
              src="/images/logo1.svg"
              alt="Tender Finance"
              style={{
                height: 30,
              }}
            />
          </a>
        </div>
        <div className="text-[#ADB5B3] hidden lg:flex justify-center font-nova-400">
          <a className="px-2 cursor-pointer hover:text-white  ">About</a>
          <a className="px-2 cursor-pointer hover:text-white  ">Roadmap</a>
          <a className="px-2 cursor-pointer hover:text-white  ">Partners</a>
          <a className="px-2 cursor-pointer hover:text-white  ">Team</a>
          <a className="px-2 cursor-pointer hover:text-white  ">Docs</a>
          <a className="px-2 cursor-pointer hover:text-white  ">Community</a>
        </div>
        <div className="flex items-center">
          <div className="lg:inline-block mr-3">
            <ConnectWallet />
          </div>

          <div
            className={`flex lg:hidden header__burg ${
              activePopupMenu ? "active" : ""
            }`}
            onClick={() => setActivePopupMenu(!activePopupMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className={`aside__menu__wrap ${activePopupMenu ? "act" : ""}`}>
          <div
            className="aside__menu__bac"
            onClick={() => setActivePopupMenu(false)}
          ></div>
          <div className="aside__menu__container">
            <div className="flex justify-center flex-col text-[#ADB5B3] font-nova-400 text-xl">
              <a className="mb-2.5 cursor-pointer hover:text-white  ">About</a>
              <a className="mb-2.5 cursor-pointer hover:text-white  ">
                Roadmap
              </a>
              <a className="mb-2.5 cursor-pointer hover:text-white  ">
                Partners
              </a>
              <a className="mb-2.5 cursor-pointer hover:text-white  ">Team</a>
              <a className="mb-2.5 cursor-pointer hover:text-white  ">Docs</a>
              <a className="mb-2.5 cursor-pointer hover:text-white  ">
                Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
