import React, { createContext, useContext, useState, useEffect } from "react";
import { getFakeData } from "../utils/fakeData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState(null);

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("user");
    const savedAvatar = localStorage.getItem("avatar");
    if (auth === "true" && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, []);

  const login = async (userData) => {
    try {
      // Simuler une connexion réussie
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(userData));
      setError(null);
    } catch (err) {
      setError("Erreur lors de la connexion");
      throw err;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAvatar(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    // Nettoyer toutes les données
    localStorage.removeItem("depenseRevenu");
    localStorage.removeItem("paiementsRecurrents");
    localStorage.removeItem("paiementsEchelonnes");
    localStorage.removeItem("notifications");
    setError(null);
  };

  const updateAvatar = (newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem("avatar", newAvatar);
  };

  const loginWithGoogle = async () => {
    try {
      // Simuler une connexion Google
      const userData = {
        email: "user@gmail.com",
        name: "Utilisateur Google",
      };
      await login(userData);
    } catch (err) {
      setError("Erreur lors de la connexion avec Google");
      throw err;
    }
  };

  const loginWithGithub = async () => {
    try {
      // Simuler une connexion GitHub
      const userData = {
        email: "user@github.com",
        name: "Utilisateur GitHub",
      };
      await login(userData);
    } catch (err) {
      setError("Erreur lors de la connexion avec GitHub");
      throw err;
    }
  };

  // Fonction pour obtenir les données en fonction de l'état de connexion
  const getData = () => {
    if (!isAuthenticated) {
      return {
        depenseRevenu: [],
        paiementsRecurrents: [],
        paiementsEchelonnes: [],
      };
    }
    const {
      fakeDepenseRevenu,
      fakePaiementsRecurrents,
      fakePaiementsEchelonnes,
    } = getFakeData();
    // Fusionne les opérations de synchrosolde
    const synchroSolde = JSON.parse(
      localStorage.getItem("synchrosolde") || "[]"
    );
    // On fusionne et trie par date décroissante
    const depenseRevenu = [...fakeDepenseRevenu, ...synchroSolde].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return {
      depenseRevenu,
      paiementsRecurrents: fakePaiementsRecurrents,
      paiementsEchelonnes: fakePaiementsEchelonnes,
    };
  };

  // Nouvelle fonction pour mettre à jour l'utilisateur
  const updateUser = (newUserData) => {
    setUser((prev) => ({
      ...prev,
      ...newUserData,
    }));
    // Met à jour aussi le localStorage
    localStorage.setItem("user", JSON.stringify({ ...user, ...newUserData }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        error,
        avatar,
        setAvatar: updateAvatar,
        login,
        logout,
        loginWithGoogle,
        loginWithGithub,
        getData,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
}

export default AuthContext;
