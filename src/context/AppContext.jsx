import React, { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTitle, setActiveTitle] = useState("Dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState("white");

  return (
    <AppContext.Provider
      value={{
        activeTitle,
        setActiveTitle,
        isSettingsOpen,
        setIsSettingsOpen,
        sidebarType,
        setSidebarType,
      }}>
      {children}
    </AppContext.Provider>
  );
}
