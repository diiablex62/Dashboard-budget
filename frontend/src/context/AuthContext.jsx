import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
  signInWithCustomToken,
} from "firebase/auth";
import { AppContext } from "./AppContext";
import { createOrUpdateUserAccount } from "../utils/userUtils";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    // Retourner un objet par défaut pour éviter les erreurs de destructuration
    return {
      user: null,
      loading: true,
      authLoading: false,
      emailLinkSent: false,
      emailForSignIn: "",
      authError: null,
      mainAccountId: null,
      loginWithGoogle: () => {},
      loginWithGithub: () => {},
      loginWithEmail: () => {},
      confirmEmailLogin: () => {},
      logout: () => {},
      refreshUser: () => {},
      resetToken: () => {},
    };
  }
  return context;
};

// URL de l'API d'authentification
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mainAccountId, setMainAccountId] = useState(null);
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
              lastLoginMethod: parsedUser.lastLoginMethod || "unknown",
            });

            // Définir l'ID du compte principal
            setMainAccountId(parsedUser.uid);

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

              // Mettre à jour l'ID du compte principal
              setMainAccountId(firebaseUser.uid);

              // Mettre à jour l'état de connexion dans AppContext si disponible
              if (appContext?.setIsLoggedIn) {
                setIsLoggedIn(true);
              }

              // Vérifier l'état d'authentification côté serveur
              checkServerAuthStatus();
            } catch (error) {
              console.error("Erreur token:", error);
              setUser(null);
              setMainAccountId(null);
              if (appContext?.setIsLoggedIn) {
                setIsLoggedIn(false);
              }
            }
          } else {
            console.log("Aucun utilisateur authentifié");
            setUser(null);
            setMainAccountId(null);
            if (appContext?.setIsLoggedIn) {
              setIsLoggedIn(false);
            }
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Erreur initialisation:", error);
        setUser(null);
        setMainAccountId(null);
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
      console.error("Erreur lors de l'envoi de l'email:", error);
      setAuthError("Échec de l'envoi de l'email. Serveur injoignable.");
      setAuthLoading(false);
      return { success: false, error: "Serveur injoignable" };
    }
  };

  // Validation du token et connexion
  const confirmEmailLogin = async (token) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      console.log("Validation du token...");

      // Récupérer l'email stocké
      const storedEmail =
        emailForSignIn || localStorage.getItem("emailForSignIn");

      if (!storedEmail) {
        console.error("Aucun email trouvé pour la connexion");
        setAuthError("Aucun email trouvé pour la connexion");
        setAuthLoading(false);
        return {
          success: false,
          error: "Aucun email trouvé pour la connexion",
        };
      }

      // Vérifier le token auprès de l'API
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: storedEmail }),
        credentials: "include", // Pour gérer les cookies
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          console.log("Token validé avec succès");

          // En mode développement, on peut éventuellement utiliser une approche simplifiée
          const isDevelopment =
            process.env.NODE_ENV === "development" ||
            window.location.hostname === "localhost";

          if (isDevelopment) {
            console.log(
              "Mode développement: simulation de la connexion Firebase"
            );

            // Vérifier si un utilisateur avec le même email existe déjà dans le localStorage
            const savedUser = localStorage.getItem("authUser");
            let userSimulated;

            if (savedUser) {
              const parsedUser = JSON.parse(savedUser);
              if (parsedUser.email === data.email) {
                console.log(
                  "Utilisateur existant trouvé dans le localStorage",
                  parsedUser
                );
                // Utiliser l'utilisateur existant mais mettre à jour la source d'authentification
                userSimulated = {
                  ...parsedUser,
                  providerData: [
                    ...(parsedUser.providerData || []),
                    {
                      providerId: "password",
                      uid: data.email,
                      displayName:
                        parsedUser.displayName || data.email.split("@")[0],
                      email: data.email,
                      photoURL: parsedUser.photoURL,
                      phoneNumber: null,
                    },
                  ],
                  lastLoginMethod: "email-link",
                  lastLoginAt: new Date().toISOString(),
                };
              } else {
                // Créer un nouvel utilisateur
                userSimulated = {
                  uid: `email-${Date.now()}`,
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
                  lastLoginMethod: "email-link",
                  lastLoginAt: new Date().toISOString(),
                };
              }
            } else {
              // Pas d'utilisateur existant, créer un nouvel utilisateur
              userSimulated = {
                uid: `email-${Date.now()}`,
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
                lastLoginMethod: "email-link",
                lastLoginAt: new Date().toISOString(),
              };
            }

            // Stocker l'utilisateur dans le localStorage pour persistance
            localStorage.setItem("authUser", JSON.stringify(userSimulated));
            console.log(
              "Utilisateur mis à jour dans localStorage:",
              userSimulated
            );

            // Mettre à jour l'état utilisateur
            setUser({
              uid: userSimulated.uid,
              email: userSimulated.email,
              displayName: userSimulated.displayName,
              photoURL: userSimulated.photoURL,
              lastLoginMethod: "email-link",
            });

            // Mettre à jour l'ID du compte principal
            const mainUserId = await createOrUpdateUserAccount(
              userSimulated,
              "email"
            );
            setMainAccountId(mainUserId);

            // Réinitialiser l'état
            setEmailLinkSent(false);
            setEmailForSignIn("");
            localStorage.removeItem("emailForSignIn");

            setAuthLoading(false);
            return {
              success: true,
              user: userSimulated,
              mainAccountId: mainUserId,
            };
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

          // Mettre à jour l'ID du compte principal
          const mainUserId = await createOrUpdateUserAccount(
            userCredential.user,
            "email"
          );
          setMainAccountId(mainUserId);

          // Mettre à jour l'état utilisateur avec les informations de Firebase
          setUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName:
              userCredential.user.displayName ||
              userCredential.user.email.split("@")[0],
            photoURL: userCredential.user.photoURL,
            lastLoginMethod: "email-link",
          });

          // Réinitialiser l'état
          setEmailLinkSent(false);
          setEmailForSignIn("");
          localStorage.removeItem("emailForSignIn");

          setAuthLoading(false);
          return {
            success: true,
            user: userCredential.user,
            mainAccountId: mainUserId,
          };
        } else {
          console.error("Échec de validation du token:", data.error);
          setAuthError(data.error || "Token invalide");
          setAuthLoading(false);
          return { success: false, error: data.error || "Token invalide" };
        }
      } else {
        console.error("Erreur lors de la validation du token:", data.error);
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

  // Connexion avec Google
  const loginWithGoogle = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const provider = new GoogleAuthProvider();

      // Ajouter des scopes si nécessaire
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      console.log("Utilisateur connecté avec Google:", googleUser.email);

      // Vérifier si nous sommes en mode développement
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost";

      if (isDevelopment) {
        // En mode développement, nous utilisons un email modifié pour Google
        const devEmail = googleUser.email;
        console.log(`Mode développement: utilisation de l'email: ${devEmail}`);

        // Sauvegarder l'utilisateur dans localStorage pour la persistance en dev
        const userToSave = {
          uid: googleUser.uid,
          email: devEmail,
          displayName: googleUser.displayName || "Google User",
          photoURL: googleUser.photoURL,
          emailVerified: true,
          isAnonymous: false,
          providerData: [
            {
              providerId: "google.com",
              uid: googleUser.uid,
              displayName: googleUser.displayName,
              email: devEmail,
              photoURL: googleUser.photoURL,
              phoneNumber: googleUser.phoneNumber,
            },
          ],
          lastLoginMethod: "google",
          lastLoginAt: new Date().toISOString(),
        };

        localStorage.setItem("authUser", JSON.stringify(userToSave));
        console.log(
          "Utilisateur Google mis à jour dans localStorage:",
          userToSave
        );

        // Mettre à jour l'état utilisateur
        setUser({
          uid: userToSave.uid,
          email: userToSave.email,
          displayName: userToSave.displayName,
          photoURL: userToSave.photoURL,
          lastLoginMethod: "google",
        });

        // Mettre à jour l'ID du compte principal
        const mainUserId = await createOrUpdateUserAccount(
          userToSave,
          "google"
        );
        setMainAccountId(mainUserId);
      } else {
        // Mode production: utiliser les données réelles de Firebase
        setUser({
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL,
          lastLoginMethod: "google",
        });

        // Mettre à jour l'ID du compte principal
        const mainUserId = await createOrUpdateUserAccount(
          googleUser,
          "google"
        );
        setMainAccountId(mainUserId);
      }

      setAuthLoading(false);
      return { success: true, user: googleUser, mainAccountId };
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google:", error);
      setAuthError(
        error.code === "auth/popup-closed-by-user"
          ? "Connexion annulée. La fenêtre a été fermée."
          : "Erreur lors de la connexion avec Google. Veuillez réessayer."
      );
      setAuthLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Connexion avec GitHub
  const loginWithGithub = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const provider = new GithubAuthProvider();

      // Ajouter des scopes si nécessaire
      provider.addScope("user");
      provider.addScope("repo");

      const result = await signInWithPopup(auth, provider);
      const githubUser = result.user;

      console.log("Utilisateur connecté avec GitHub:", githubUser.email);

      // Vérifier si nous sommes en mode développement
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost";

      if (isDevelopment) {
        // En mode développement, nous utilisons l'email réel
        const devEmail = githubUser.email;
        console.log(`Mode développement: utilisation de l'email: ${devEmail}`);

        // Sauvegarder l'utilisateur dans localStorage pour la persistance en dev
        const userToSave = {
          uid: githubUser.uid,
          email: devEmail,
          displayName: githubUser.displayName || "GitHub User",
          photoURL: githubUser.photoURL,
          emailVerified: true,
          isAnonymous: false,
          providerData: [
            {
              providerId: "github.com",
              uid: githubUser.uid,
              displayName: githubUser.displayName,
              email: devEmail,
              photoURL: githubUser.photoURL,
              phoneNumber: githubUser.phoneNumber,
            },
          ],
          lastLoginMethod: "github",
          lastLoginAt: new Date().toISOString(),
        };

        localStorage.setItem("authUser", JSON.stringify(userToSave));
        console.log(
          "Utilisateur GitHub mis à jour dans localStorage:",
          userToSave
        );

        // Mettre à jour l'état utilisateur
        setUser({
          uid: userToSave.uid,
          email: userToSave.email,
          displayName: userToSave.displayName,
          photoURL: userToSave.photoURL,
          lastLoginMethod: "github",
        });

        // Mettre à jour l'ID du compte principal
        const mainUserId = await createOrUpdateUserAccount(
          userToSave,
          "github"
        );
        setMainAccountId(mainUserId);
      } else {
        // Mode production: utiliser les données réelles de Firebase
        setUser({
          uid: githubUser.uid,
          email: githubUser.email,
          displayName: githubUser.displayName,
          photoURL: githubUser.photoURL,
          lastLoginMethod: "github",
        });

        // Mettre à jour l'ID du compte principal
        const mainUserId = await createOrUpdateUserAccount(
          githubUser,
          "github"
        );
        setMainAccountId(mainUserId);
      }

      setAuthLoading(false);
      return { success: true, user: githubUser, mainAccountId };
    } catch (error) {
      console.error("Erreur lors de la connexion avec GitHub:", error);
      setAuthError(
        error.code === "auth/popup-closed-by-user"
          ? "Connexion annulée. La fenêtre a été fermée."
          : "Erreur lors de la connexion avec GitHub. Veuillez réessayer."
      );
      setAuthLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setAuthLoading(true);

      // Vérifier si nous sommes en mode développement
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost";

      if (isDevelopment) {
        console.log("Mode développement: simulation de la déconnexion");
        localStorage.removeItem("authUser");
      } else {
        // Mode production: se déconnecter de Firebase
        await firebaseSignOut(auth);
      }

      // Appel à l'API pour se déconnecter côté serveur
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include", // Pour gérer les cookies
        });
      } catch (apiError) {
        console.error("Erreur lors de la déconnexion côté API:", apiError);
      }

      // Réinitialiser l'état
      setUser(null);
      setMainAccountId(null);
      setAuthLoading(false);
      setAuthError(null);
      setEmailLinkSent(false);
      setEmailForSignIn("");

      // Mettre à jour l'état de connexion dans AppContext si disponible
      if (appContext?.setIsLoggedIn) {
        setIsLoggedIn(false);
      }

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setAuthLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Rafraîchir les informations de l'utilisateur
  const refreshUser = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de l'utilisateur:", error);
      return { success: false, error: error.message };
    }
  };

  // Réinitialiser le token
  const resetToken = async (token) => {
    localStorage.removeItem("emailForSignIn");
    setEmailForSignIn("");
    setEmailLinkSent(false);
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
        mainAccountId,
        loading,
        authLoading,
        emailLinkSent,
        emailForSignIn,
        authError,
        loginWithGoogle,
        loginWithGithub,
        loginWithEmail,
        confirmEmailLogin,
        logout,
        refreshUser,
        resetToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
