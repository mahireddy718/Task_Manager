import React, { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";
import ThemeToggle from "../Theme/ThemeToggle";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className="flex gap-5 bg-white dark:bg-gray-900 border border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 justify-between items-center">
      <div className="flex gap-5 items-center">
        <button
          className="block lg:hidden text-black dark:text-white"
          onClick={() => {
            setOpenSideMenu(!openSideMenu);
          }}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>

        <h2 className="text-lg font-medium text-black dark:text-white">
          Task Manager
        </h2>
      </div>

      <ThemeToggle />

      {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
