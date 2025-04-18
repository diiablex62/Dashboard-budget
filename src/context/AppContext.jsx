import React, { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTitle, setActiveTitle] = useState("Dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // État pour l'ouverture des paramètres
  const [sidebarType, setSidebarType] = useState("white");
  const [primaryColor, setPrimaryColor] = useState("#007BFF"); // Couleur principale par défaut

  return (
    <AppContext.Provider
      value={{
        activeTitle,
        setActiveTitle,
        isSettingsOpen, // Expose l'état des paramètres
        setIsSettingsOpen, // Expose la fonction pour changer l'état des paramètres
        sidebarType,
        setSidebarType,
        primaryColor,
        setPrimaryColor,
      }}>
      {children}
    </AppContext.Provider>
  );
}
