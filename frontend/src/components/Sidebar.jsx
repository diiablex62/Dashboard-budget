import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuItem from "./MenuItem";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path;
    const props = {
      icon: item.icon,
      label: item.label,
      onClick: () => navigate(item.path),
      isCollapsed: isCollapsed,
      isActive: isActive,
    };

    return <MenuItem key={item.path} {...props} />;
  };

  return <div>{/* Render your menu items here */}</div>;
};

export default Sidebar;
