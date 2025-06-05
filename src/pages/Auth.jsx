import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { sendMagicLink, verifyMagicLink } from "../email/login";
import Modal from "../components/ui/Modal";
import Terms from "./Terms";
import PrivacyPolicy from "./PrivacyPolicy";
import UserDataDeletion from "./UserDataDeletion";
import { toast } from "react-toastify";

export default function Auth() {
  const { login, loginWithGoogle, loginWithGithub, authError } = useAuth();
  const navigate = useNavigate();
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState(null); // 'terms' | 'privacy' | 'deletion' | null
  const [isLoading, setIsLoading] = useState(false);

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
          setIsLoading(true);
          setError(null);
          console.log("Token détecté dans l'URL, tentative de validation...");
          const result = await verifyMagicLink(token);

          if (result.success) {
            console.log("Authentification par email réussie !");
            // Connecter l'utilisateur avec l'email vérifié
            await login({
              email: result.email,
              name: result.email.split("@")[0], // Utiliser la partie avant @ comme nom
            });
            navigate("/dashboard");
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
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkUrlToken();
  }, [login, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await sendMagicLink(email);
      if (result.success) {
        // En développement, on peut directement utiliser le token
        const url = `${window.location.origin}/auth?token=${result.token}`;
        console.log("URL de connexion (pour le développement):", url);
        navigate("/validation", { state: { email } });
      }
    } catch (error) {
      setError(error.message || "Erreur lors de l'envoi du lien magique");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la connexion avec Google");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    try {
      setIsLoading(true);
      console.log("=== DÉBUT LOGS AUTH ===");
      console.log("Email saisi:", email);

      const result = await sendMagicLink(email);
      console.log("Résultat sendMagicLink:", result);

      if (result.success) {
        // Créer l'URL de connexion
        const url = `${window.location.origin}/auth?token=${result.token}`;
        console.log("URL créée:", url);

        // Préparer le state
        const state = {
          email: email,
          magicLink: url,
        };
        console.log("State préparé:", state);

        // Rediriger vers la page de validation avec l'URL dans le state
        console.log("Navigation vers /validation avec state:", state);
        navigate("/validation", { state });
      }
      console.log("=== FIN LOGS AUTH ===");
    } catch (error) {
      console.error("Erreur dans handleEmailSignIn:", error);
      toast.error("Erreur lors de l'envoi du lien de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen flex items-stretch bg-white p-8 overflow-hidden'>
      {/* Flèche retour au dashboard */}
      <div className='absolute left-8 top-8 flex items-center gap-2'>
        <Link
          to='/dashboard'
          className='flex items-center font-medium text-base transition-colors text-gray-500 hover:text-yellow-500 focus:text-yellow-500'>
          <svg
            width='24'
            height='24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-1 transition-colors'
            style={{ color: "inherit" }}>
            <path d='M15 18l-6-6 6-6' />
          </svg>
          Retour au dashboard
        </Link>
      </div>
      {/* Formulaire centré */}
      <div className='flex-1 flex flex-col justify-center px-6 py-0 sm:px-12 md:px-24 lg:px-32 overflow-y-auto'>
        <div className='w-full max-w-md mx-auto'>
          <div className='mb-6'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Connexion</h2>
            <p className='text-gray-500 mb-6'>
              Connectez-vous pour accéder à votre espace
            </p>
          </div>
          {/* Formulaire principal */}
          <form className='space-y-4' onSubmit={handleEmailSignIn}>
            <div>
              <input
                type='email'
                placeholder='Email'
                className='w-full px-5 py-3 rounded-full bg-gray-100 focus:bg-white border border-gray-200 focus:border-blue-400 outline-none text-gray-900 text-base placeholder-gray-400 transition'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
            </div>
            <button
              type='submit'
              className='w-full py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg shadow transition mb-2 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Recevoir un lien par email"}
            </button>
          </form>
          {/* Boutons sociaux */}
          <div className='flex items-center my-4'>
            <div className='flex-1 h-px bg-gray-200' />
            <span className='mx-4 text-gray-400 text-sm'>ou</span>
            <div className='flex-1 h-px bg-gray-200' />
          </div>
          <div className='flex gap-4 mb-6'>
            <button
              onClick={handleGoogleSignIn}
              className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow transition text-gray-900 font-semibold text-base'>
              <FaGoogle className='w-5 h-5' /> Google
            </button>
            <button
              onClick={loginWithGithub}
              className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow transition text-gray-900 font-semibold text-base'>
              <FaGithub className='w-5 h-5' /> GitHub
            </button>
          </div>
          {/* Mentions légales centrées */}
          <div className='flex justify-center items-center text-xs text-gray-400 mt-6 gap-4'>
            <div className='flex items-center gap-4'>
              <button
                type='button'
                onClick={() => setModalType("terms")}
                className='underline hover:text-yellow-500 transition-colors'>
                Conditions d'utilisation
              </button>
              <Link
                to='/conditions-generales-dutilisation'
                className='text-gray-400 hover:text-yellow-500 transition-colors'>
                |
              </Link>
            </div>
            <div className='flex items-center'>
              <button
                type='button'
                onClick={() => setModalType("privacy")}
                className='underline hover:text-yellow-500 transition-colors'>
                Politique de confidentialité
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Image à droite arrondie */}
      <div className='hidden md:flex md:w-1/2 items-stretch pl-8'>
        <div className='w-full h-full bg-white rounded-[40px] overflow-hidden shadow-xl flex items-center justify-center'>
          <img
            src={orangeImage}
            alt='Connexion'
            className='w-full h-full object-cover object-center'
          />
        </div>
      </div>
      {/* Modals */}
      {modalType === "terms" && (
        <Modal onClose={() => setModalType(null)}>
          <div className='rounded-[40px]'>
            <Terms />
          </div>
        </Modal>
      )}
      {modalType === "privacy" && (
        <Modal onClose={() => setModalType(null)}>
          <div className='rounded-[40px]'>
            <PrivacyPolicy />
          </div>
        </Modal>
      )}
    </div>
  );
}
