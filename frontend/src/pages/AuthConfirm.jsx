import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";

/**
 * Page de confirmation d'authentification par email
 * Cette page est affichée lorsque l'utilisateur clique sur le lien dans l'email
 */
const AuthConfirm = () => {
  const { confirmEmailLogin, resetToken } = useAuth();
  const appContext = useContext(AppContext);
  const setIsLoggedIn = appContext?.setIsLoggedIn;
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [resetting, setResetting] = useState(false);

  // Détecter si nous sommes en mode développement
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost";

  useEffect(() => {
    // Extraire le token de l'URL
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    setCurrentToken(token);

    if (!token) {
      console.error("Aucun token trouvé dans l'URL");
      setStatus("error");
      setError(
        "Lien invalide. Veuillez demander un nouveau lien de connexion."
      );
      return;
    }

    // Vérifier le token et authentifier l'utilisateur
    const verifyToken = async () => {
      try {
        console.log("Vérification du token:", token);
        const result = await confirmEmailLogin(token);

        if (result.success) {
          console.log("Authentification réussie:", result.user);
          // Important: mettre à jour l'état de connexion dans le contexte global s'il est disponible
          if (setIsLoggedIn) {
            setIsLoggedIn(true);
          }
          setStatus("success");

          // Rediriger vers la page d'accueil après un court délai
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 2000);
        } else {
          console.error("Échec de la validation du token:", result.error);
          setStatus("error");
          setError(
            result.error ||
              "Impossible de vérifier votre identité. Le lien est peut-être expiré."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setStatus("error");
        setError(
          "Une erreur est survenue lors de la vérification du lien. Veuillez réessayer."
        );
      }
    };

    verifyToken();
  }, [confirmEmailLogin, location.search, navigate, setIsLoggedIn]);

  // Fonction pour réinitialiser le token en mode développement
  const handleResetToken = async () => {
    if (!currentToken) return;

    try {
      setResetting(true);
      const result = await resetToken(currentToken);

      if (result.success) {
        setStatus("loading");
        setError(null);
        // Recharger la page pour tester à nouveau le token
        window.location.reload();
      } else {
        setError("Échec de la réinitialisation: " + result.error);
      }
    } catch (error) {
      setError("Erreur lors de la réinitialisation du token");
    } finally {
      setResetting(false);
    }
  };

  // Afficher différents messages selon l'état de la vérification
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className='flex flex-col items-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
            <p className='text-lg'>Vérification du lien de connexion...</p>
          </div>
        );

      case "success":
        return (
          <div className='flex flex-col items-center'>
            <div className='bg-green-100 text-green-800 p-4 rounded-lg mb-4 text-center'>
              <svg
                className='h-12 w-12 text-green-500 mx-auto mb-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <h2 className='text-xl font-bold mb-2'>Connexion réussie!</h2>
              <p>Vous êtes maintenant connecté. Redirection en cours...</p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className='flex flex-col items-center'>
            <div className='bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-center'>
              <svg
                className='h-12 w-12 text-red-500 mx-auto mb-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              <h2 className='text-xl font-bold mb-2'>
                Échec de l'authentification
              </h2>
              <p>{error}</p>

              {/* Bouton de réinitialisation en mode développement */}
              {isDevelopment && currentToken && (
                <button
                  className='mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
                  onClick={handleResetToken}
                  disabled={resetting}>
                  {resetting
                    ? "Réinitialisation..."
                    : "Réinitialiser le token (mode dev)"}
                </button>
              )}

              <div className='mt-4'>
                <a
                  href='/auth'
                  className='text-blue-500 hover:text-blue-700 underline'>
                  Retour à la page de connexion
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          Confirmation d'authentification
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default AuthConfirm;
