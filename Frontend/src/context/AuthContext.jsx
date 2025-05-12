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
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);

        return onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              await firebaseUser.getIdToken(true);
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              });
            } catch (error) {
              console.error("Erreur token:", error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Erreur initialisation:", error);
        setUser(null);
        setLoading(false);
      }
    };

    const unsubscribe = initializeAuth();
    return () => unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await result.user.getIdToken(true);
      return { success: true };
    } catch (error) {
      console.error("Erreur connexion Google:", error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
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
      value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
