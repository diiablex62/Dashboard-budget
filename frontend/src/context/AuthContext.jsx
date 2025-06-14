import React, { createContext, useContext, useState, useEffect } from "react";
import { getFakeData } from "../utils/fakeData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [linkedProviders, setLinkedProviders] = useState([]);

  // Vérifier l'état de connexion et les fournisseurs liés au chargement
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    // const userData = localStorage.getItem("user"); // user est déjà initialisé via useState
    const savedAvatar = localStorage.getItem("avatar");
    const savedLinkedProviders = JSON.parse(localStorage.getItem("linkedProviders") || "[]");

    if (auth === "true" && user) { // Utiliser l'état user directement
      setIsAuthenticated(true);
      // setUser(JSON.parse(userData)); // user est déjà initialisé
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
    setLinkedProviders(savedLinkedProviders);
  }, []);

  const addLinkedProvider = (provider) => {
    setLinkedProviders((prev) => {
      if (!prev.includes(provider)) {
        const newProviders = [...prev, provider];
        localStorage.setItem("linkedProviders", JSON.stringify(newProviders));
        return newProviders;
      }
      return prev;
    });
  };

  const removeLinkedProvider = (provider) => {
    setLinkedProviders((prev) => {
      const newProviders = prev.filter(p => p !== provider);
      localStorage.setItem("linkedProviders", JSON.stringify(newProviders));
      return newProviders;
    });
  };

  const login = async (userData) => {
    try {
      setIsAuthenticated(true);
      const finalUserData = { ...userData };
      if (!finalUserData.id) {
        finalUserData.id = Date.now();
      }
      setUser(finalUserData);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(finalUserData));
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
    setLinkedProviders([]);
    localStorage.clear();
    setError(null);
  };

  const updateAvatar = (newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem("avatar", newAvatar);
  };

  const loginWithGoogle = async () => {
    try {
      const googleUserData = {
        email: "user@gmail.com",
        name: "Utilisateur Google",
        lastLoginMethod: "google"
      };

      if (isAuthenticated && user?.email === googleUserData.email) {
        addLinkedProvider("google");
      } else {
        await login(googleUserData);
        addLinkedProvider("google");
      }
    } catch (err) {
      setError("Erreur lors de la connexion avec Google");
      throw err;
    }
  };

  const loginWithGithub = async () => {
    try {
      const githubUserData = {
        email: "user@github.com",
        name: "Utilisateur GitHub",
        lastLoginMethod: "github"
      };

      if (isAuthenticated && user?.email === githubUserData.email) {
        addLinkedProvider("github");
      } else {
        await login(githubUserData);
        addLinkedProvider("github");
      }
    } catch (err) {
      setError("Erreur lors de la connexion avec GitHub");
      throw err;
    }
  };

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
    const synchroSolde = JSON.parse(
      localStorage.getItem("synchrosolde") || "[]"
    );
    const depenseRevenu = [...fakeDepenseRevenu, ...synchroSolde].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const savedPaiementsRecurrents = JSON.parse(
      localStorage.getItem("paiementsRecurrents") || "[]"
    );

    return {
      depenseRevenu,
      paiementsRecurrents: [
        ...fakePaiementsRecurrents,
        ...savedPaiementsRecurrents,
      ],
      paiementsEchelonnes: fakePaiementsEchelonnes,
    };
  };

  const updateData = async (type, id, data) => {
    if (!isAuthenticated) return;

    try {
      let currentData = JSON.parse(localStorage.getItem(type) || "[]");
      if (id) {
        currentData = currentData.map((item) =>
          item.id === id ? { ...item, ...data } : item
        );
      } else {
        const newId = Date.now();
        currentData.push({ ...data, id: newId });
      }
      localStorage.setItem(type, JSON.stringify(currentData));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des ${type}:`, error);
      throw error;
    }
  };

  const updateUser = (newUserData) => {
    setUser((prev) => ({
      ...prev,
      ...newUserData,
    }));
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
        updateData,
        linkedProviders,
        addLinkedProvider,
        removeLinkedProvider,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

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
