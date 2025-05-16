import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInWithCustomToken,
} from "firebase/auth";
import { AppContext } from "./AppContext";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// URL de l'API d'authentification
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailForSignIn, setEmailForSignIn] = useState("");
  const [authError, setAuthError] = useState(null);

  // Utiliser useContext en toute sécurité en gérant le cas où le contexte n'existe pas
  const appContext = useContext(AppContext);
  const setIsLoggedIn =
    appContext?.setIsLoggedIn ||
    (() => console.log("AppContext non disponible"));

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier si on est en mode développement
        const isDevelopment =
          process.env.NODE_ENV === "development" ||
          window.location.hostname === "localhost";

        if (isDevelopment) {
          // Vérifier si un utilisateur simulé existe dans le localStorage
          const savedUser = localStorage.getItem("authUser");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log(
              "Mode développement: chargement de l'utilisateur simulé:",
              parsedUser.email
            );

            // Mettre à jour l'état utilisateur
            setUser({
              uid: parsedUser.uid,
              email: parsedUser.email,
              displayName: parsedUser.displayName,
              photoURL: parsedUser.photoURL,
            });

            // Mettre à jour l'état de connexion dans AppContext si disponible
            if (appContext?.setIsLoggedIn) {
              setIsLoggedIn(true);
            }

            setLoading(false);
            return () => {}; // Retourner une fonction de nettoyage vide
          }
        }

        await setPersistence(auth, browserLocalPersistence);

        return onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              await firebaseUser.getIdToken(true);
              console.log("Utilisateur authentifié:", firebaseUser.email);
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              });

              // Mettre à jour l'état de connexion dans AppContext si disponible
              if (appContext?.setIsLoggedIn) {
                setIsLoggedIn(true);
              }

              // Vérifier l'état d'authentification côté serveur
              checkServerAuthStatus();
            } catch (error) {
              console.error("Erreur token:", error);
              setUser(null);
              if (appContext?.setIsLoggedIn) {
                setIsLoggedIn(false);
              }
            }
          } else {
            console.log("Aucun utilisateur authentifié");
            setUser(null);
            if (appContext?.setIsLoggedIn) {
              setIsLoggedIn(false);
            }
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Erreur initialisation:", error);
        setUser(null);
        if (appContext?.setIsLoggedIn) {
          setIsLoggedIn(false);
        }
        setLoading(false);
      }
    };

    const unsubscribe = initializeAuth();
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [appContext]);

  // Vérifier l'état d'authentification côté serveur (utilisation des cookies)
  const checkServerAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/status`, {
        method: "GET",
        credentials: "include", // Inclure les cookies
      });

      if (response.ok) {
        console.log("Session côté serveur valide");
      } else {
        console.log("Session côté serveur expirée");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du statut d'authentification:",
        error
      );
    }
  };

  // Authentification par lien email (sans mot de passe)
  const loginWithEmail = async (email) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      console.log("Tentative de connexion avec email:", email);

      // Appel à l'API pour envoyer un email avec le lien magique
      const response = await fetch(`${API_URL}/api/auth/email-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include", // Pour gérer les cookies
      });

      const data = await response.json();

      if (data.success) {
        // Stocker l'email pour la vérification ultérieure
        localStorage.setItem("emailForSignIn", email);
        setEmailForSignIn(email);
        setEmailLinkSent(true);
        setAuthLoading(false);
        return { success: true, message: "Email de connexion envoyé" };
      } else {
        setAuthError(data.error || "Échec de l'envoi de l'email");
        setAuthLoading(false);
        return {
          success: false,
          error: data.error || "Échec de l'envoi de l'email",
        };
      }
    } catch (error) {
      console.error("Erreur lors de la connexion par email:", error);
      setAuthError(
        "Impossible de se connecter avec cet email. Vérifiez votre connexion réseau."
      );
      setAuthLoading(false);
      return {
        success: false,
        error:
          "Impossible de se connecter avec cet email. Vérifiez votre connexion réseau.",
      };
    }
  };

  // Vérification du token dans l'URL
  const confirmEmailLogin = async (token) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      console.log("Vérification du token email:", token);

      // Appel à l'API pour vérifier le token
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include", // Pour gérer les cookies
      });

      const data = await response.json();

      if (data.success && data.email) {
        console.log("Token validé, connexion avec Firebase...");

        try {
          // En mode développement, on peut éventuellement utiliser une approche simplifiée
          const isDevelopment =
            process.env.NODE_ENV === "development" ||
            window.location.hostname === "localhost";

          if (isDevelopment) {
            console.log(
              "Mode développement: simulation de la connexion Firebase"
            );

            // Créer un utilisateur simulé avec les données du serveur
            const userSimulated = {
              uid: `dev-uid-${Date.now()}`,
              email: data.email,
              displayName: data.email.split("@")[0],
              photoURL: null,
              emailVerified: true,
              isAnonymous: false,
              providerData: [
                {
                  providerId: "password",
                  uid: data.email,
                  displayName: data.email.split("@")[0],
                  email: data.email,
                  photoURL: null,
                  phoneNumber: null,
                },
              ],
            };

            // Stocker l'utilisateur dans le localStorage pour persistance
            localStorage.setItem("authUser", JSON.stringify(userSimulated));

            // Mettre à jour l'état utilisateur
            setUser({
              uid: userSimulated.uid,
              email: userSimulated.email,
              displayName: userSimulated.displayName,
              photoURL: userSimulated.photoURL,
            });

            // Réinitialiser l'état
            setEmailLinkSent(false);
            setEmailForSignIn("");
            localStorage.removeItem("emailForSignIn");

            setAuthLoading(false);
            return { success: true, user: userSimulated };
          }

          // Mode production: se connecter avec le token Firebase
          const userCredential = await signInWithCustomToken(
            auth,
            data.firebaseToken
          );

          console.log(
            "Utilisateur connecté avec Firebase:",
            userCredential.user.email
          );

          // Mettre à jour l'état utilisateur avec les informations de Firebase
          setUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName:
              userCredential.user.displayName ||
              userCredential.user.email.split("@")[0],
            photoURL: userCredential.user.photoURL,
          });

          // Réinitialiser l'état
          setEmailLinkSent(false);
          setEmailForSignIn("");
          localStorage.removeItem("emailForSignIn");

          setAuthLoading(false);
          return { success: true, user: userCredential.user };
        } catch (firebaseError) {
          console.error("Erreur lors de la connexion Firebase:", firebaseError);

          // En mode développement, même avec une erreur Firebase, on peut simuler un succès
          const isDevelopment =
            process.env.NODE_ENV === "development" ||
            window.location.hostname === "localhost";

          if (isDevelopment) {
            console.log(
              "Mode développement: simulation de la connexion malgré l'erreur Firebase"
            );

            // Créer un utilisateur simulé avec les données du serveur
            const userSimulated = {
              uid: `dev-uid-${Date.now()}`,
              email: data.email,
              displayName: data.email.split("@")[0],
              photoURL: null,
            };

            // Stocker l'utilisateur dans le localStorage pour persistance
            localStorage.setItem("authUser", JSON.stringify(userSimulated));

            // Mettre à jour l'état utilisateur
            setUser(userSimulated);

            // Réinitialiser l'état
            setEmailLinkSent(false);
            setEmailForSignIn("");
            localStorage.removeItem("emailForSignIn");

            setAuthLoading(false);
            return { success: true, user: userSimulated };
          }

          setAuthError(
            "Erreur lors de la connexion à votre compte. Veuillez réessayer."
          );
          setAuthLoading(false);
          return {
            success: false,
            error:
              "Erreur lors de la connexion à votre compte. Veuillez réessayer.",
          };
        }
      } else {
        console.error("Échec de validation du token:", data.error);
        setAuthError(data.error || "Token invalide");
        setAuthLoading(false);
        return { success: false, error: data.error || "Token invalide" };
      }
    } catch (error) {
      console.error("Erreur lors de la validation du token:", error);
      setAuthError(
        "Impossible de vérifier votre identité. Le lien est peut-être expiré."
      );
      setAuthLoading(false);
      return {
        success: false,
        error:
          "Impossible de vérifier votre identité. Le lien est peut-être expiré.",
      };
    }
  };

  // Authentification avec Google
  const loginWithGoogle = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setAuthLoading(false);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Erreur connexion Google:", error);
      setAuthError("Échec de la connexion avec Google");
      setAuthLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setAuthLoading(true);

      // Vérifier si on est en mode développement
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost";

      if (isDevelopment && localStorage.getItem("authUser")) {
        console.log("Mode développement: suppression de l'utilisateur simulé");
        localStorage.removeItem("authUser");
        setUser(null);

        // Mettre à jour l'état de connexion dans AppContext
        if (appContext?.setIsLoggedIn) {
          setIsLoggedIn(false);
        }

        setAuthLoading(false);
        return { success: true };
      }

      // Déconnexion côté serveur (suppression du cookie)
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Déconnexion de Firebase
      await firebaseSignOut(auth);

      setAuthLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setAuthLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Rafraîchir les données utilisateur
  const refreshUser = async () => {
    if (auth.currentUser && typeof auth.currentUser.reload === "function") {
      await auth.currentUser.reload();
      setUser({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
      });
    }
  };

  // Fonction pour réinitialiser un token en mode développement
  const resetToken = async (token) => {
    if (!token) return { success: false, error: "Token requis" };

    try {
      console.log(
        "Tentative de réinitialisation du token:",
        token.substring(0, 8) + "..."
      );
      const response = await fetch(`${API_URL}/api/auth/reset-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        console.log("Token réinitialisé avec succès:", data.email);
        return { success: true, email: data.email };
      } else {
        console.error("Échec de la réinitialisation du token:", data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du token:", error);
      return {
        success: false,
        error:
          "Erreur lors de la réinitialisation du token. Cette fonctionnalité n'est disponible qu'en mode développement.",
      };
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        loading,
        authLoading,
        loginWithGoogle,
        loginWithEmail,
        confirmEmailLogin,
        emailLinkSent,
        emailForSignIn,
        authError,
        logout,
        resetToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
