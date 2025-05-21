import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Google from "../components/Google";
import GitHub from "../components/GitHub";

export default function Auth() {
  const { setIsLoggedIn, primaryColor } = useContext(AppContext);
  const {
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    confirmEmailLogin,
    emailLinkSent,
    emailForSignIn,
    authLoading,
    authError,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Utiliser l'erreur du contexte d'authentification si disponible
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Vérifier si un token est présent dans l'URL (pour la connexion par lien magique)
  useEffect(() => {
    const checkUrlToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        try {
          setError(null);
          console.log("Token détecté dans l'URL, tentative de validation...");
          const result = await confirmEmailLogin(token);

          if (result.success) {
            console.log("Authentification par email réussie !");
            setIsLoggedIn(true);
            navigate("/");
          } else {
            console.error("Échec de la validation du token:", result.error);
            setError(
              result.error ||
                "Le lien de connexion est invalide ou a expiré. Veuillez réessayer."
            );
          }
        } catch (error) {
          console.error("Erreur lors de la validation du token:", error);
          setError(
            "Impossible de vous authentifier avec ce lien. Veuillez réessayer."
          );
        }
      }
    };

    checkUrlToken();
  }, [confirmEmailLogin, navigate, setIsLoggedIn]);

  // Appliquez immédiatement la couleur primaire au DOM avant le rendu
  useEffect(() => {
    if (!primaryColor) return;
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    const hoverColor = generateHoverColor(primaryColor);
    document.documentElement.style.setProperty(
      "--primary-hover-color",
      hoverColor
    );
  }, [primaryColor]);

  const generateHoverColor = (color) => {
    const hexToHSL = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const s =
        max === min
          ? 0
          : l > 0.5
          ? (max - min) / (2 - max - min)
          : (max - min) / (max + min);
      const h =
        max === min
          ? 0
          : max === r
          ? (g - b) / (max - min) + (g < b ? 6 : 0)
          : max === g
          ? (b - r) / (max - min) + 2
          : (r - g) / (max - min) + 4;
      return { h: h * 60, s: s * 100, l: l * 100 };
    };

    const hslToHex = ({ h, s, l }) => {
      const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l / 100 - c / 2;
      const [r, g, b] =
        h < 60
          ? [c, x, 0]
          : h < 120
          ? [x, c, 0]
          : h < 180
          ? [0, c, x]
          : h < 240
          ? [0, x, c]
          : h < 300
          ? [x, 0, c]
          : [c, 0, x];
      return `#${[r, g, b]
        .map((v) =>
          Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, "0")
        )
        .join("")}`;
    };

    const hsl = hexToHSL(color);
    hsl.l = Math.max(10, Math.min(90, hsl.l - 15));
    return hslToHex(hsl);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email);
    } catch (error) {
      console.error("Erreur lors de l'envoi du lien de connexion:", error);
      setError("Erreur lors de l'envoi du lien de connexion");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
            Connexion à votre compte
          </h2>
        </div>

        {error && (
          <div
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
            role='alert'>
            <span className='block sm:inline'>{error}</span>
          </div>
        )}

        {emailLinkSent ? (
          <div
            className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative'
            role='alert'>
            <p className='font-bold'>Email envoyé !</p>
            <p className='text-sm'>
              Un lien de connexion a été envoyé à {emailForSignIn}. Veuillez
              vérifier votre boîte de réception.
            </p>
          </div>
        ) : (
          <div className='mt-8 space-y-6'>
            <div className='space-y-4'>
              <button
                onClick={loginWithGoogle}
                disabled={authLoading}
                className='w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                <Google className='h-5 w-5 mr-2' />
                Continuer avec Google
              </button>

              <button
                onClick={loginWithGithub}
                disabled={authLoading}
                className='w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                <GitHub className='h-5 w-5 mr-2' />
                Continuer avec GitHub
              </button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-gray-50 dark:bg-gray-900 text-gray-500'>
                    Ou
                  </span>
                </div>
              </div>

              {showEmailForm ? (
                <form onSubmit={handleEmailSubmit} className='space-y-4'>
                  <div>
                    <label htmlFor='email' className='sr-only'>
                      Adresse email
                    </label>
                    <input
                      id='email'
                      name='email'
                      type='email'
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                      placeholder='Adresse email'
                    />
                  </div>
                  <div>
                    <button
                      type='submit'
                      disabled={authLoading}
                      className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                      {authLoading
                        ? "Envoi en cours..."
                        : "Envoyer le lien de connexion"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  Continuer avec Email
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
