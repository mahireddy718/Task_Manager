import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import { LuPencil } from "react-icons/lu";
import EditProfileModal from "./EditProfileModal";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
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
        <div className="relative group">
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
          {/* Edit button on hover */}
          <button
            onClick={() => setShowEditProfile(true)}
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <LuPencil className="text-white" size={20} />
          </button>
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

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal 
          onClose={() => setShowEditProfile(false)}
          onProfileUpdate={() => {
            // Trigger refresh of parent component if needed
          }}
        />
      )}
    </div>
  );

};

export default SideMenu;
