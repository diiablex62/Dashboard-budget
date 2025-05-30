import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Simulation d'un utilisateur pour le développement
      const response = {
        data: {
          name: "Alexandre Janacek",
          email: "alexandre.janacek@gmail.com",
        },
      };
      setUser(response.data);
      setError(null);
    } catch (error) {
      setError("Erreur lors de la récupération du profil");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    try {
      localStorage.setItem("token", token);
      await fetchUserProfile();
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/auth";
  };

  const setAvatar = (avatar) => {
    setUser((prev) => (prev ? { ...prev, avatar } : { avatar }));
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    fetchUserProfile,
    setAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
