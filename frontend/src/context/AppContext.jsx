import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isSettingsOpen,
        setIsSettingsOpen,
      }}>
      {children}
    </AppContext.Provider>
  );
};
