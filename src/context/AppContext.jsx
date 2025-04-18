import React, { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTitle, setActiveTitle] = useState("Dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState("white");
  const [primaryColor, setPrimaryColor] = useState("blue"); // Couleur principale par défaut

  return (
    <AppContext.Provider
      value={{
        activeTitle,
        setActiveTitle,
        isSettingsOpen,
        setIsSettingsOpen,
        sidebarType,
        setSidebarType,
        primaryColor, // Expose la couleur principale
        setPrimaryColor, // Expose la fonction pour changer la couleur principale
      }}>
      {children}
    </AppContext.Provider>
  );
}
