import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

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

  // Gestion de la connexion avec Google
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      console.log("Tentative de connexion avec Google...");
      const result = await loginWithGoogle();
      if (result.success) {
        console.log("Connexion Google réussie!");
        setIsLoggedIn(true);
        navigate("/");
      } else {
        console.error("Échec de la connexion Google:", result.error);
        setError(result.error || "Échec de la connexion avec Google");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google:", error);
      setError("Erreur lors de la connexion avec Google. Veuillez réessayer.");
    }
  };

  // Gestion de la connexion avec GitHub
  const handleGithubLogin = async () => {
    setError(null);
    try {
      console.log("Tentative de connexion avec GitHub...");
      const result = await loginWithGithub();
      if (result.success) {
        console.log("Connexion GitHub réussie!");
        setIsLoggedIn(true);
        navigate("/");
      } else {
        console.error("Échec de la connexion GitHub:", result.error);
        setError(result.error || "Échec de la connexion avec GitHub");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion avec GitHub:", error);
      setError("Erreur lors de la connexion avec GitHub. Veuillez réessayer.");
    }
  };

  // Gestion de la connexion par email sans mot de passe
  const handleEmailLoginWithLink = async (e) => {
    e.preventDefault();
    console.log("Demande d'authentification par email...");
    setError(null);

    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }

    // Validation basique du format d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }

    try {
      console.log(`Envoi d'un email de connexion à ${email}...`);
      const result = await loginWithEmail(email);

      if (result.success) {
        // L'email a été envoyé avec succès, l'interface sera mise à jour via le contexte Auth
        console.log("Email d'authentification envoyé avec succès");
      } else {
        console.error("Échec de l'envoi de l'email:", result.error);
        setError(
          result.error || "Impossible d'envoyer l'email d'authentification"
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la demande d'authentification par email:",
        error
      );
      setError("Erreur lors de l'authentification. Veuillez réessayer.");
    }
  };

  // Affiche le formulaire approprié selon l'état
  const renderAuthForm = () => {
    // Si un email a été envoyé, afficher l'écran de confirmation
    if (emailLinkSent) {
      return (
        <div className='text-center'>
          <div className='bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6'>
            <h3 className='font-semibold mb-2'>Email envoyé !</h3>
            <p>
              Nous avons envoyé un lien sécurisé à{" "}
              <span className='font-medium'>{emailForSignIn}</span>
            </p>
            <p className='mt-2'>
              Vérifiez votre boîte de réception et cliquez sur le lien pour vous
              authentifier. Le lien est valable pendant 15 minutes.
            </p>
            <p className='mt-2 text-sm text-gray-600'>
              Si vous ne trouvez pas l'email, vérifiez votre dossier spam.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className='text-[var(--primary-color)] font-medium hover:underline'>
            Retour à la page d'authentification
          </button>
        </div>
      );
    }

    // Si le formulaire d'email n'est pas affiché, montrer les boutons de connexion
    if (!showEmailForm) {
      return (
        <div className='space-y-6'>
          <div className='flex flex-col space-y-3'>
            {/* Bouton Email - Placé en premier car c'est la méthode recommandée */}
            <button
              onClick={() => setShowEmailForm(true)}
              className='flex items-center justify-center w-full bg-[var(--primary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300'>
              <svg
                className='w-5 h-5 mr-2'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
                <polyline points='22,6 12,13 2,6' />
              </svg>
              Continuer avec un email
            </button>

            <div className='flex items-center justify-center my-2'>
              <hr className='flex-grow border-gray-300' />
              <span className='px-3 text-xs text-gray-500'>OU</span>
              <hr className='flex-grow border-gray-300' />
            </div>

            {/* Bouton Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className='flex items-center justify-center w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition duration-300'>
              {authLoading ? (
                <svg
                  className='animate-spin h-5 w-5 text-gray-500'
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
              ) : (
                <>
                  <svg
                    className='w-5 h-5 mr-2'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'>
                    <path
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      fill='#4285F4'
                    />
                    <path
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      fill='#34A853'
                    />
                    <path
                      d='M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z'
                      fill='#FBBC05'
                    />
                    <path
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      fill='#EA4335'
                    />
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>

            {/* Bouton GitHub */}
            <button
              onClick={handleGithubLogin}
              className={`w-full flex items-center justify-center ${
                authLoading ? "opacity-50 cursor-not-allowed" : ""
              } rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 mb-3`}
              disabled={authLoading}>
              {authLoading ? (
                <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
              ) : (
                <>
                  <svg
                    className='w-5 h-5 mr-2'
                    aria-hidden='true'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Continuer avec GitHub
                </>
              )}
            </button>
          </div>

          <div className='mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg'>
            <h3 className='text-sm font-semibold text-blue-800 mb-1'>
              Pourquoi choisir l'authentification par email?
            </h3>
            <p className='text-xs text-blue-700'>
              • Plus sécurisée - Pas de mot de passe à retenir ou à compromettre
              <br />
              • Plus simple - Connexion en un clic via votre email
              <br />• Protection avancée - Chaque lien est à usage unique et
              expire après 15 minutes
            </p>
          </div>
        </div>
      );
    }

    // Formulaire de connexion par email
    return (
      <form onSubmit={handleEmailLoginWithLink} className='space-y-5'>
        <h3 className='text-lg font-semibold text-center'>
          Connexion ou inscription simplifiée
        </h3>
        <p className='text-sm text-gray-600 text-center'>
          Nous vous enverrons un lien sécurisé pour vous connecter ou créer un
          compte.
          <br />
          Aucun mot de passe requis.
        </p>

        <div className='bg-gray-50 p-4 rounded-lg border border-gray-100'>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Votre adresse email'
            required
            className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
            autoFocus
          />
        </div>

        <button
          type='submit'
          disabled={authLoading}
          className='w-full bg-[var(--primary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 flex items-center justify-center font-medium'>
          {authLoading ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
            "Recevoir un lien sécurisé"
          )}
        </button>

        <div className='mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100'>
          <p className='text-xs text-gray-600'>
            En continuant, vous acceptez nos{" "}
            <Link
              to='/terms'
              className='text-[var(--primary-color)] hover:underline'>
              conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link
              to='/privacy'
              className='text-[var(--primary-color)] hover:underline'>
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </form>
    );
  };

  return (
    <div className='flex min-h-screen relative'>
      {/* Section image */}
      <div className='absolute inset-y-0 w-1/2 left-0 bg-[var(--primary-color)] flex items-center justify-center transition-transform duration-500'>
        <img
          src={orangeImage}
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>
      {/* Section formulaire */}
      <div className='absolute inset-y-0 w-1/2 translate-x-full flex items-center justify-center bg-white transition-transform duration-500'>
        <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full'>
          {/* Lien retour au dashboard ou retour aux options de connexion */}
          {showEmailForm ? (
            <button
              type='button'
              onClick={() => setShowEmailForm(false)}
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
              Retour aux options d'authentification
            </button>
          ) : (
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
          )}

          <h2 className='text-2xl font-bold text-center mb-6'>Bienvenue</h2>

          {/* Affichage des erreurs */}
          {error && (
            <div className='p-3 mb-4 text-sm rounded-lg bg-red-100 text-red-700 border border-red-200'>
              <p>{error}</p>
            </div>
          )}

          {/* Formulaire d'authentification */}
          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
}
