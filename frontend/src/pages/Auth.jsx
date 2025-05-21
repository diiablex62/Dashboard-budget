import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Google from "../components/Google";
import GitHub from "../components/GitHub";
import { sendMagicLink } from "../email/login";

export default function Auth() {
  const { setIsLoggedIn, primaryColor } = useContext(AppContext);
  const {
    loginWithGoogle,
    loginWithGithub,
    confirmEmailLogin,
    emailLinkSent,
    emailForSignIn,
    authLoading,
    authError,
  } = useAuth();
  const navigate = useNavigate();

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
    setError(null);
    try {
      await sendMagicLink(email);
      navigate("/validation", { state: { email } });
    } catch (error) {
      setError(error.message || "Erreur lors de l'envoi du lien magique");
    }
  };

  return (
    <div className='h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative'>
      {/* Image de gauche avec overlay */}
      <div className='hidden lg:block lg:w-1/2 relative h-full'>
        <img
          src={orangeImage}
          alt='Connexion'
          className='h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-600/30 flex items-center justify-center'>
          <div className='text-white text-center p-8'>
            <h1 className='text-4xl font-bold mb-4'>Bienvenue sur Budget</h1>
            <p className='text-lg'>Gérez vos finances en toute simplicité</p>
          </div>
        </div>
      </div>

      {/* Formulaire de droite */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 h-full'>
        <div className='w-full max-w-md mx-auto'>
          {/* Bouton retour */}
          <Link
            to='/'
            className='mb-6 inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200'>
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            Retour au dashboard
          </Link>

          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
            {/* En-tête */}
            <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
              <h2 className='text-2xl font-bold text-center text-gray-900 dark:text-white'>
                Connexion
              </h2>
              <p className='mt-1 text-center text-gray-600 dark:text-gray-400'>
                Accédez à votre espace personnel
              </p>
            </div>

            {/* Corps du formulaire */}
            <div className='p-6'>
              {error && (
                <div className='mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {emailLinkSent ? (
                <div className='bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg'>
                  <div className='flex items-center mb-1'>
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span className='font-semibold'>Email envoyé !</span>
                  </div>
                  <p className='text-sm'>
                    Un lien de connexion a été envoyé à {emailForSignIn}.
                    Veuillez vérifier votre boîte de réception.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Boutons de connexion sociale */}
                  <div className='grid grid-cols-2 gap-4'>
                    <button
                      onClick={loginWithGoogle}
                      disabled={authLoading}
                      className='flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'>
                      <Google className='h-5 w-5 mr-2' />
                      <span>Google</span>
                    </button>

                    <button
                      onClick={loginWithGithub}
                      disabled={authLoading}
                      className='flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'>
                      <GitHub className='h-5 w-5 mr-2' />
                      <span>GitHub</span>
                    </button>
                  </div>

                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className='px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'>
                        Ou continuez avec
                      </span>
                    </div>
                  </div>

                  {/* Formulaire email */}
                  {showEmailForm ? (
                    <form onSubmit={handleEmailSubmit} className='space-y-4'>
                      <div>
                        <label
                          htmlFor='email'
                          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                          Adresse email
                        </label>
                        <input
                          id='email'
                          name='email'
                          type='email'
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'
                          placeholder='exemple@email.com'
                        />
                      </div>
                      <button
                        type='submit'
                        disabled={authLoading}
                        className='w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                        {authLoading ? (
                          <>
                            <svg
                              className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'>
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'></circle>
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                            Envoi en cours...
                          </>
                        ) : (
                          "Envoyer le lien de connexion"
                        )}
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'>
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                      Continuer avec Email
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div className='px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700'>
              <p className='text-center text-xs text-gray-600 dark:text-gray-400'>
                En vous connectant, vous acceptez nos{" "}
                <Link
                  to='/terms'
                  className='text-blue-600 dark:text-blue-400 hover:underline'>
                  conditions d'utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  to='/privacy-policy'
                  className='text-blue-600 dark:text-blue-400 hover:underline'>
                  politique de confidentialité
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
