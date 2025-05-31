import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // Simulation de la connexion
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const getData = (data) => {
    // Si l'utilisateur n'est pas connecté, retourne un tableau vide ou 0
    if (!isAuthenticated) {
      return Array.isArray(data) ? [] : 0;
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, getData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};

export default AuthContext;
