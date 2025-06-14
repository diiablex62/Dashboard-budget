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

  const isProviderLinked = (provider) => {
    return linkedProviders.includes(provider);
  };

  const addLinkedProvider = (provider) => {
    if (!isProviderLinked(provider)) {
      setLinkedProviders((prev) => {
        const newProviders = [...prev, provider];
        localStorage.setItem("linkedProviders", JSON.stringify(newProviders));
        return newProviders;
      });
    }
  };

  const removeLinkedProvider = (provider) => {
    // Ne pas permettre de supprimer le dernier provider
    if (linkedProviders.length > 1) {
      setLinkedProviders((prev) => {
        const newProviders = prev.filter(p => p !== provider);
        localStorage.setItem("linkedProviders", JSON.stringify(newProviders));
        return newProviders;
      });
    } else {
      setError("Vous devez avoir au moins une méthode de connexion active");
    }
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

  // Fonction pour fusionner les données de deux comptes
  const mergeUserData = (existingData, newData) => {
    return {
      ...existingData,
      ...newData,
      // Conserver les données non nulles
      name: newData.name || existingData.name,
      email: newData.email || existingData.email,
      // Fusionner les providers
      providers: [...new Set([...(existingData.providers || []), ...(newData.providers || [])])],
      // Fusionner les données personnalisées
      preferences: {
        ...existingData.preferences,
        ...newData.preferences
      }
    };
  };

  const loginWithGoogle = async () => {
    try {
      const googleUserData = {
        email: "user@gmail.com", // À remplacer par l'email réel de Google
        name: "Utilisateur Google",
        lastLoginMethod: "google",
        providers: ["google"]
      };

      // Vérifier si un utilisateur avec cet email existe déjà
      const existingUser = user?.email === googleUserData.email;
      
      if (existingUser) {
        // Si l'utilisateur existe, on fusionne les données et on ajoute le provider
        const mergedData = mergeUserData(user, googleUserData);
        setUser(mergedData);
        localStorage.setItem("user", JSON.stringify(mergedData));
        addLinkedProvider("google");
      } else {
        // Si c'est un nouvel utilisateur, on crée un nouveau compte
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
        email: "user@github.com", // À remplacer par l'email réel de GitHub
        name: "Utilisateur GitHub",
        lastLoginMethod: "github",
        providers: ["github"]
      };

      // Vérifier si un utilisateur avec cet email existe déjà
      const existingUser = user?.email === githubUserData.email;
      
      if (existingUser) {
        // Si l'utilisateur existe, on fusionne les données et on ajoute le provider
        const mergedData = mergeUserData(user, githubUserData);
        setUser(mergedData);
        localStorage.setItem("user", JSON.stringify(mergedData));
        addLinkedProvider("github");
      } else {
        // Si c'est un nouvel utilisateur, on crée un nouveau compte
        await login(githubUserData);
        addLinkedProvider("github");
      }
    } catch (err) {
      setError("Erreur lors de la connexion avec GitHub");
      throw err;
    }
  };

  // Fonction pour vérifier si un compte existe déjà avec cet email
  const checkExistingAccount = (email) => {
    // Dans un cas réel, cette vérification se ferait côté serveur
    // Ici, on simule la vérification avec les données locales
    return user?.email === email;
  };

  // Fonction pour lier un provider à un compte existant
  const linkProvider = async (provider, providerData) => {
    try {
      if (!user) {
        throw new Error("Aucun utilisateur connecté");
      }

      // Vérifier si le provider est déjà lié
      if (isProviderLinked(provider)) {
        throw new Error(`Le provider ${provider} est déjà lié à ce compte`);
      }

      // Vérifier si un compte existe déjà avec cet email
      if (checkExistingAccount(providerData.email)) {
        throw new Error("Un compte avec cette adresse email dispose déjà d'un accès avec des données. Veuillez d'abord supprimer votre compte avant de revenir pour lier à nouveau votre compte.");
      }

      // Ajouter le provider
      addLinkedProvider(provider);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonction pour supprimer le compte
  const deleteAccount = async () => {
    try {
      // Ici, vous devriez appeler votre API pour supprimer le compte
      // Pour l'instant, on simule la suppression
      logout();
      localStorage.clear();
      return true;
    } catch (err) {
      setError("Erreur lors de la suppression du compte");
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
        isProviderLinked,
        linkProvider,
        deleteAccount,
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
