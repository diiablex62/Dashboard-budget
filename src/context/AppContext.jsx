import React, { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTitle, setActiveTitle] = useState("Dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState("white");
  const [primaryColor, setPrimaryColor] = useState("#007BFF");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppContext.Provider
      value={{
        activeTitle,
        setActiveTitle,
        isSettingsOpen,
        setIsSettingsOpen,
        sidebarType,
        setSidebarType,
        primaryColor,
        setPrimaryColor,
        isLoggedIn,
        setIsLoggedIn,
      }}>
      {children}
    </AppContext.Provider>
  );
}
