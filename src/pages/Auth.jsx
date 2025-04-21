import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bleuImage from "../assets/img/auth-bleu.png";
import orangeImage from "../assets/img/auth-orange.jpg";
import Google from "../components/Google";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";
import { GithubAuthProvider, OAuthProvider } from "firebase/auth";

export default function Auth() {
  const { setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Définir l'état initial de isLogin en fonction de location.state
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);

  const handleAuthProvider = async (provider, providerName) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem(
        "user",
        JSON.stringify({ email: user.email, displayName: user.displayName })
      );
      toast.success(`Bienvenue ${user.displayName} !`);
      setIsLoggedIn(true);
      navigate("/");
    } catch {
      toast.error(`Échec de la connexion avec ${providerName}.`);
    }
  };

  useEffect(() => {
    // Mettre à jour isLogin si location.state change
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  return (
    <div className='flex min-h-screen relative'>
      {/* Section image */}
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "left-0" : "translate-x-full"
        } bg-[var(--primary-color)] flex items-center justify-center transition-transform duration-500`}>
        <img
          src={isLogin ? bleuImage : orangeImage}
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>

      {/* Section formulaire */}
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "translate-x-full" : "left-0"
        } flex items-center justify-center bg-white transition-transform duration-500`}>
        <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full'>
          {/* Bouton retour au dashboard */}
          <button
            onClick={() => navigate("/")}
            className='mb-4 flex items-center text-[var(--primary-color)] hover:text-[var(--primary-hover-color)] text-sm font-medium transition duration-300 cursor-pointer'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Retour au dashboard
          </button>

          <h2 className='text-2xl font-bold text-center mb-6'>
            {isLogin ? "Content de te revoir." : "Rejoignez-nous."}
          </h2>
          <div className='space-y-4'>
            <button
              onClick={() => handleAuthProvider(googleProvider, "Google")}
              className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
              <Google className='w-5 h-5 mr-2' />
              Connectez-vous avec Google
            </button>
            <button
              onClick={() =>
                handleAuthProvider(new GithubAuthProvider(), "Facebook")
              }
              className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
                alt='Facebook'
                className='w-5 h-5 mr-2'
              />
              Connectez-vous avec Facebook
            </button>
            <button
              onClick={() =>
                handleAuthProvider(new OAuthProvider("apple.com"), "Apple")
              }
              className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
                alt='Apple'
                className='w-5 h-5 mr-2'
              />
              Connectez-vous avec Apple
            </button>
            <button
              onClick={() =>
                handleAuthProvider(new OAuthProvider("twitter.com"), "X")
              }
              className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
              <span className='text-xl font-bold mr-2'>X</span>
              Connectez-vous avec X
            </button>
            <button className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg'
                alt='Email'
                className='w-5 h-5 mr-2'
              />
              Connectez-vous avec votre e-mail
            </button>
          </div>
          <p className='text-center text-sm text-gray-600 mt-6'>
            {isLogin ? (
              <>
                Pas de compte ?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className='text-green-600 font-semibold hover:underline'>
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className='text-green-600 font-semibold hover:underline'>
                  Connectez-vous
                </button>
              </>
            )}
          </p>
          <p className='text-center text-xs text-gray-500 mt-4'>
            Cliquez sur « Se connecter » pour accepter les{" "}
            <a href='/terms' className='text-blue-500 hover:underline'>
              conditions d'utilisation
            </a>{" "}
            et la{" "}
            <a href='/privacy' className='text-blue-500 hover:underline'>
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
