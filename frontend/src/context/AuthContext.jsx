import React, { createContext, useContext, useState, useEffect } from "react";
import { getFakeData } from "../utils/fakeData";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialisation de l'état au chargement de l'application
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const savedAvatar = localStorage.getItem("avatar");
    const savedLinkedProviders = JSON.parse(
      localStorage.getItem("linkedProviders") || "[]"
    );

    if (authStatus && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
      if (savedUser.picture) {
        setAvatar(savedUser.picture);
      } else if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    } else {
      // S'assurer que l'état est propre si pas authentifié
      setUser(null);
      setIsAuthenticated(false);
      setAvatar(null);
      // localStorage.clear(); // Ne pas effacer tout le localStorage ici, peut contenir d'autres données utiles
    }
    setLinkedProviders(savedLinkedProviders);
    setLoading(false);
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
        const newProviders = prev.filter((p) => p !== provider);
        localStorage.setItem("linkedProviders", JSON.stringify(newProviders));
        return newProviders;
      });
    } else {
      setError("Vous devez avoir au moins une méthode de connexion active");
    }
  };

  // Fonction utilitaire pour mettre à jour l'état de l'utilisateur et localStorage
  const updateAndSaveUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
    setIsAuthenticated(true); // S'assurer que l'authentification est marquée comme vraie
  };

  const login = async (userData) => {
    try {
      console.log("Données reçues pour login:", userData);
      const finalUserData = {
        id: userData.id,
        name: userData.username || userData.name,
        email: userData.email,
        picture: userData.picture
          ? `${
              import.meta.env.VITE_API_URL
            }/auth/proxy-google-image?url=${encodeURIComponent(
              userData.picture
            )}`
          : undefined,
        token: userData.token,
        firstName: userData.firstName,
        lastName: userData.lastName,
        preferences: userData.preferences,
      };

      console.log("Données utilisateur finales:", finalUserData);
      updateAndSaveUser(finalUserData);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", userData.token);
      setAvatar(userData.picture);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
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
    toast.success("Déconnexion réussie !");
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
      name: newData.name || existingData.name,
      email: newData.email || existingData.email,
      providers: [
        ...new Set([
          ...(existingData.providers || []),
          ...(newData.providers || []),
        ]),
      ],
      preferences: {
        ...existingData.preferences,
        ...newData.preferences,
      },
    };
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Récupérer les informations de l'utilisateur depuis Google
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        ).then((res) => res.json());

        // Créer l'objet utilisateur
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: response.access_token,
        };

        // Sauvegarder l'utilisateur
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
        toast.success("Connexion réussie !");
      } catch (error) {
        console.error("Erreur lors de la connexion Google:", error);
        toast.error("Erreur lors de la connexion avec Google");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la connexion avec Google");
    },
  });

  const loginWithGithub = async () => {
    try {
      const githubUserData = {
        email: "user@github.com", // TODO: Remplacer par l'email réel de GitHub via API
        name: "Utilisateur GitHub",
        lastLoginMethod: "github",
      };

      if (isAuthenticated) {
        // Si déjà authentifié, tenter de lier le provider au compte actuel
        await linkProvider("github", githubUserData);
      } else {
        // Si non authentifié, tenter de se connecter ou de s'inscrire
        await login(githubUserData);
        addLinkedProvider("github"); // Ajouter le provider après une connexion/inscription réussie
      }
    } catch (err) {
      setError("Erreur lors de la connexion avec GitHub: " + err.message);
      throw err;
    }
  };

  // Fonction pour lier un provider à un compte existant
  const linkProvider = async (provider, providerData) => {
    try {
      if (!user) {
        throw new Error("Aucun utilisateur connecté");
      }

      if (isProviderLinked(provider)) {
        throw new Error(`Le provider ${provider} est déjà lié à ce compte`);
      }

      // IMPORTANT: Dans un cas réel, ici vous feriez un appel API au backend
      // pour vérifier si providerData.email est déjà lié à un *autre* compte.
      // Si oui, le backend devrait retourner une erreur appropriée.

      // Si l'email n'est pas lié à un autre compte (selon le backend), on ajoute le provider au compte actuel
      const mergedData = mergeUserData(user, {
        ...providerData,
        // Assurer que le nouveau provider est ajouté à la liste des providers existants
        providers: [...(user.providers || []), providerData.lastLoginMethod],
      });
      updateAndSaveUser(mergedData);
      addLinkedProvider(providerData.lastLoginMethod);

      return mergedData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Réponse suppression de compte:", response);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur réponse suppression de compte:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de la suppression du compte"
        );
      }

      // Nettoyage local après la suppression réussie
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
      setAvatar(null);
      setLinkedProviders([]);
      setError(null);
      return true;
    } catch (err) {
      setError("Erreur lors de la suppression du compte: " + err.message);
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
    // Utilise la fonction utilitaire pour mettre à jour l'utilisateur et sauvegarder
    const mergedData = { ...user, ...newUserData };
    updateAndSaveUser(mergedData);
  };

  const value = {
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
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
