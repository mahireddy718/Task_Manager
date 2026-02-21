import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout" || route === "/logout") {
      handleLogout();
      return;
    }

    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(
        user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
      );
    }

    return () => { };
  }, [user]);

  return (
    <div
      className="w-64 h-[calc(100vh-61px)] sticky top-[61px] z-20"
      style={{ backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative">
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className="w-20 h-20 bg-slate-400 rounded-full"
          />
        </div>

        {user?.role === "admin" && (
          <div className="text-[10px] font-medium px-3 py-0.5 rounded mt-1" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
            Admin
          </div>
        )}

        {user?.role === "member" && (
          <div className="text-[10px] font-medium px-3 py-0.5 rounded mt-1" style={{ backgroundColor: 'var(--muted-surface)', color: 'var(--text)' }}>
            Member
          </div>
        )}

        <h5 style={{ color: 'var(--text)' }} className="font-medium leading-6 mt-3">
          {user?.name || ""}
        </h5>

        <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
          {user?.email || ""}
        </p>
      </div>
      {sideMenuData.map((item, index) => (
        <button
          key={`menu_${index}`}
          onClick={() => handleClick(item.path)}
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 mb-3 text-left cursor-pointer`}
          style={{
            color: activeMenu === item.label ? 'var(--primary)' : 'var(--text)',
            background: activeMenu === item.label ? 'linear-gradient(to right, rgba(59,130,246,0.06), rgba(96,165,250,0.08))' : 'transparent',
            borderRight: activeMenu === item.label ? '3px solid var(--primary)' : 'none'
          }}
        >
          <item.icon className="text-xl" style={{ color: 'inherit' }} />
          {item.label}
        </button>
      ))}
    </div>
  );

};

export default SideMenu;
