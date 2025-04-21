import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import bleuImage from "../assets/img/auth-bleu.png";
import orangeImage from "../assets/img/auth-orange.jpg";
import Google from "../components/Google";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";
import {
  GithubAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

export default function Auth() {
  const { setIsLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Définir l'état initial de isLogin en fonction de location.state
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [showEmailForm, setShowEmailForm] = useState(false); // État pour afficher le sous-formulaire
  const [email, setEmail] = useState(""); // État pour stocker l'email

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
    } catch (error) {
      console.error(`Erreur lors de la connexion avec ${providerName}:`, error);

      if (error.code === "auth/internal-error") {
        // Vérifiez si les cookies tiers sont désactivés
        if (!navigator.cookieEnabled) {
          toast.error(
            `Les cookies tiers sont désactivés dans votre navigateur. Veuillez les activer pour utiliser ${providerName}.`
          );
        } else {
          toast.error(
            `Échec de la connexion avec ${providerName}. Assurez-vous que les cookies tiers sont activés.`
          );
        }
      } else {
        toast.error(
          `Échec de la connexion avec ${providerName}. Vérifiez votre configuration.`
        );
      }
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Logique pour gérer la soumission de l'email
    toast.success("Un lien magique a été envoyé à votre adresse e-mail !");
    setShowEmailForm(false); // Fermer le sous-formulaire après soumission
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
          {/* Lien conditionnel pour le dashboard ou changer le mode de connexion */}
          {!showEmailForm ? (
            <a
              href='/'
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
            </a>
          ) : (
            <a
              onClick={() => setShowEmailForm(false)} // Revenir à la liste des options
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
              Changer le mode de connexion
            </a>
          )}

          <h2 className='text-2xl font-bold text-center mb-6'>
            {isLogin ? "Content de te revoir." : "Rejoignez-nous."}
          </h2>
          {!showEmailForm ? (
            <div className='space-y-4'>
              <button
                onClick={() => handleAuthProvider(googleProvider, "Google")}
                className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
                <Google className='w-5 h-5 mr-2' />
                Connectez-vous avec Google
              </button>
              <button
                onClick={() =>
                  handleAuthProvider(new GithubAuthProvider(), "GitHub")
                }
                className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
                  alt='GitHub'
                  className='w-5 h-5 mr-2'
                />
                Connectez-vous avec GitHub
              </button>
              <button
                onClick={() => {
                  const facebookProvider = new FacebookAuthProvider();
                  facebookProvider.setCustomParameters({
                    redirect_uri:
                      "https://budget-e4f90.firebaseapp.com/__/auth/handler", // URL de redirection
                  });
                  handleAuthProvider(facebookProvider, "Facebook");
                }}
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
                onClick={() => setShowEmailForm(true)} // Afficher le sous-formulaire
                className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg'
                  alt='Email'
                  className='w-5 h-5 mr-2'
                />
                Connectez-vous avec votre e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className='space-y-4'>
              <h3 className='text-lg font-semibold text-center'>
                Connectez-vous avec votre e-mail
              </h3>
              <p className='text-sm text-center text-gray-600'>
                Saisissez l'adresse e-mail associée à votre compte et nous vous
                enverrons un lien magique dans votre boîte de réception.
              </p>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Votre email'
                required
                className='w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
              />
              <button
                type='submit'
                className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300'>
                Continuer
              </button>
            </form>
          )}
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
