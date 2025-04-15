import React, { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTitle, setActiveTitle] = useState("Dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState("white");
  const [isNavbarFixed, setIsNavbarFixed] = useState(false); // Ajoutez cette propriété

  return (
    <AppContext.Provider
      value={{
        activeTitle,
        setActiveTitle,
        isSettingsOpen,
        setIsSettingsOpen,
        sidebarType,
        setSidebarType,
        isNavbarFixed, // Assurez-vous que cette propriété est incluse
        setIsNavbarFixed, // Assurez-vous que cette propriété est incluse
      }}>
      {children}
    </AppContext.Provider>
  );
}
