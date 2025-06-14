import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/Modal";
import Terms from "./Terms";
import PrivacyPolicy from "./PrivacyPolicy";
import UserDataDeletion from "./UserDataDeletion";
import { toast } from "react-toastify";
import { verifyMagicLink } from "../email/login";

// Import des nouveaux composants
import EmailConnect from "../components/auth/EmailConnect";
import GoogleConnect from "../components/auth/GoogleConnect";
import GithubConnect from "../components/auth/GithubConnect";

export default function Auth() {
  const { authError, login, addLinkedProvider } = useAuth();
  const navigate = useNavigate();
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);

  const [modalType, setModalType] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  // Vérifier si un token est présent dans l'URL
  useEffect(() => {
    const checkUrlToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        try {
          setIsVerifying(true);
          const result = await verifyMagicLink(token);

          if (result.success) {
            await login({
              email: result.email,
              name: result.email.split("@")[0],
            });
            addLinkedProvider("email");
            navigate("/dashboard");
          } else {
            toast.error(
              result.error || "Le lien de connexion est invalide ou a expiré"
            );
            navigate("/auth");
          }
        } catch (error) {
          toast.error("Impossible de vous authentifier avec ce lien");
          navigate("/auth");
        } finally {
          setIsVerifying(false);
        }
      }
    };

    checkUrlToken();
  }, [login, navigate, addLinkedProvider]);

  if (isVerifying) {
    return (
      <div className='h-screen flex items-center justify-center bg-white dark:bg-black'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>
            Vérification de votre lien de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex items-stretch bg-white dark:bg-black p-8 overflow-hidden'>
      {/* Flèche retour au dashboard */}
      <div className='absolute left-8 top-8 flex items-center gap-2'>
        <Link
          to='/dashboard'
          className='flex items-center font-medium text-base transition-colors text-gray-500 hover:text-yellow-500 focus:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-500 dark:focus:text-yellow-500'>
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
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              Connexion
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mb-6'>
              Connectez-vous pour accéder à votre espace
            </p>
          </div>
          {/* Composant de connexion par email */}
          <EmailConnect />
          {/* Boutons sociaux */}
          <div className='flex items-center my-6'>
            <div className='flex-grow border-t border-gray-300 dark:border-gray-700'></div>
            <span className='flex-shrink mx-4 text-gray-500 dark:text-gray-400'>
              OU
            </span>
            <div className='flex-grow border-t border-gray-300 dark:border-gray-700'></div>
          </div>
          <div className='flex gap-4'>
            {/* Composant de connexion Google */}
            <GoogleConnect />
            {/* Composant de connexion GitHub */}
            <GithubConnect />
          </div>
          {/* Mentions légales centrées */}
          <div className='flex justify-center items-center text-xs text-gray-400 dark:text-gray-500 mt-6 gap-4'>
            <div className='flex items-center gap-4'>
              <button
                type='button'
                onClick={() => setModalType("terms")}
                className='underline hover:text-yellow-500 transition-colors'>
                Conditions d'utilisation
              </button>
              <Link
                to='/conditions-generales-dutilisation'
                className='text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition-colors'>
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
        <div className='w-full h-full bg-white dark:bg-black rounded-[40px] overflow-hidden shadow-xl flex items-center justify-center'>
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
