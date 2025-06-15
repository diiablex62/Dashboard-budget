import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaSignOutAlt,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Style personnalisé pour les toasts
const toastStyle = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  style: {
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  progressStyle: {
    background: "linear-gradient(to right, #4f46e5, #7c3aed)",
  },
};

export default function Profil() {
  const {
    user,
    updateUser,
    logout,
    avatar,
    setAvatar,
    linkedProviders,
    addLinkedProvider,
    removeLinkedProvider,
    linkProvider,
    deleteAccount,
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
  });
  const [infoSaved, setInfoSaved] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user?.picture) {
      setAvatar(user.picture);
    }
  }, [user?.picture, setAvatar]);

  // Ajouter un useEffect pour mettre à jour formData quand user change
  useEffect(() => {
    console.log("User dans Profil.jsx:", user);
    if (user) {
      setFormData({
        name: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  console.log("Valeur de l'avatar dans Profil.jsx:", avatar);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleInfoSave = (e) => {
    e.preventDefault();
    updateUser({
      username: formData.name,
      email: formData.email,
    });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 1500);
  };

  const handleLinkGoogle = async () => {
    try {
      const googleData = {
        email: "user@gmail.com",
        name: "Utilisateur Google",
        lastLoginMethod: "google",
      };
      await linkProvider("google", googleData);
      toast.success(
        <div className='flex items-center gap-3'>
          <FaCheckCircle className='text-green-500 text-xl' />
          <div>
            <p className='font-semibold'>Compte lié avec succès</p>
            <p className='text-sm text-gray-400'>
              Votre compte Google a été lié à votre profil
            </p>
          </div>
        </div>,
        toastStyle
      );
    } catch (error) {
      toast.error(
        <div className='flex items-center gap-3'>
          <FaExclamationCircle className='text-red-500 text-xl' />
          <div>
            <p className='font-semibold'>Erreur de liaison</p>
            <p className='text-sm text-gray-400'>{error.message}</p>
          </div>
        </div>,
        {
          ...toastStyle,
          autoClose: 5000,
        }
      );
    }
  };

  const handleUnlinkGoogle = () => {
    removeLinkedProvider("google");
  };

  const handleLinkGithub = async () => {
    try {
      const githubData = {
        email: "user@github.com",
        name: "Utilisateur GitHub",
        lastLoginMethod: "github",
      };
      await linkProvider("github", githubData);
      toast.success(
        <div className='flex items-center gap-3'>
          <FaCheckCircle className='text-green-500 text-xl' />
          <div>
            <p className='font-semibold'>Compte lié avec succès</p>
            <p className='text-sm text-gray-400'>
              Votre compte GitHub a été lié à votre profil
            </p>
          </div>
        </div>,
        toastStyle
      );
    } catch (error) {
      toast.error(
        <div className='flex items-center gap-3'>
          <FaExclamationCircle className='text-red-500 text-xl' />
          <div>
            <p className='font-semibold'>Erreur de liaison</p>
            <p className='text-sm text-gray-400'>{error.message}</p>
          </div>
        </div>,
        {
          ...toastStyle,
          autoClose: 5000,
        }
      );
    }
  };

  const handleUnlinkGithub = () => {
    removeLinkedProvider("github");
  };

  const handleLinkEmail = () => {
    addLinkedProvider("email");
  };

  const handleUnlinkEmail = () => {
    removeLinkedProvider("email");
  };

  const handleDeleteAccount = async () => {
    toast.warn(
      <div className='flex flex-col items-center gap-2 p-5'>
        <FaExclamationCircle className='text-yellow-500 text-3xl' />
        <p className='font-bold text-xl text-white mt-2 mb-2'>
          Confirmation de suppression
        </p>
        <p className='text-base text-gray-300 text-center mb-4'>
          Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est
          irréversible.
        </p>
        <div className='flex gap-4'>
          <button
            onClick={() => {
              toast.dismiss(); // Ferme le toast
              deleteAccount()
                .then(() => {
                  toast.success(
                    <div className='flex items-center gap-3'>
                      <FaCheckCircle className='text-green-500 text-xl' />
                      <div>
                        <p className='font-semibold'>Compte supprimé</p>
                        <p className='text-sm text-gray-400'>
                          Votre compte a été supprimé avec succès
                        </p>
                      </div>
                    </div>,
                    toastStyle
                  );
                  navigate("/dashboard");
                })
                .catch((error) => {
                  toast.error(
                    <div className='flex items-center gap-3'>
                      <FaExclamationCircle className='text-red-500 text-xl' />
                      <div>
                        <p className='font-semibold'>Erreur de suppression</p>
                        <p className='text-sm text-gray-400'>{error.message}</p>
                      </div>
                    </div>,
                    {
                      ...toastStyle,
                      autoClose: 5000,
                    }
                  );
                });
            }}
            className='px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md'>
            Oui, Supprimer
          </button>
          <button
            onClick={() => toast.dismiss()} // Ferme le toast
            className='px-6 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 font-semibold hover:bg-gray-600 transition shadow-md'>
            Annuler
          </button>
        </div>
      </div>,
      {
        ...toastStyle,
        autoClose: false,
        closeButton: false,
        draggable: false,
        closeOnClick: false,
        position: "top-center",
        className: "w-full max-w-sm", // Ajustez la largeur du toast pour qu'il soit moins large
        bodyClassName: "p-0", // Supprime le padding par défaut du corps du toast
        style: {
          ...toastStyle.style,
          border: "1px solid rgba(255, 255, 255, 0.2)", // Bordure légèrement plus visible
        },
      }
    );
  };

  const services = [
    {
      key: "email",
      name: "Email",
      icon: <FaEnvelope className='w-5 h-5 text-yellow-500' />,
      linked: linkedProviders.includes("email"),
      info: linkedProviders.includes("email") ? user?.email : null,
      onLink: handleLinkEmail,
      onUnlink: handleUnlinkEmail,
    },
    {
      key: "google",
      name: "Google",
      icon: (
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png'
          alt='Google'
          className='w-5 h-5'
        />
      ),
      linked: linkedProviders.includes("google"),
      info: linkedProviders.includes("google") ? user?.email : null,
      onLink: handleLinkGoogle,
      onUnlink: handleUnlinkGoogle,
    },
    {
      key: "github",
      name: "GitHub",
      icon: (
        <img
          src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
          alt='GitHub'
          className='w-5 h-5'
        />
      ),
      linked: linkedProviders.includes("github"),
      info: linkedProviders.includes("github")
        ? user?.name || user?.email
        : null,
      onLink: handleLinkGithub,
      onUnlink: handleUnlinkGithub,
    },
  ];

  return (
    <div className='w-full min-h-screen bg-white dark:bg-black dark:text-white py-10 p-8'>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
        style={{ zIndex: 9999 }}
      />
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Profil</h1>

        {/* Section Avatar */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm'>
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <div
                className='w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 group cursor-pointer relative'
                onClick={() => fileInputRef.current.click()}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt='Avatar'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-gray-400'>
                    <FiUpload size={40} />
                  </div>
                )}
                <div className='absolute inset-0 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                  <span className='text-white text-xs text-center px-2'>
                    Uploader une photo
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h2 className='text-xl font-semibold mb-1'>{user?.username}</h2>
              <p className='text-gray-500 dark:text-gray-400'>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Formulaire de profil */}
        <form className='space-y-6'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm'>
            <h2 className='text-xl font-semibold mb-4'>
              Informations personnelles
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Nom
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                  />
                  <FaUser className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Email
                </label>
                <div className='relative'>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                  />
                  <FaEnvelope className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                </div>
              </div>
              <div className='flex justify-end mt-4'>
                <button
                  onClick={handleInfoSave}
                  className='px-6 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors'>
                  {infoSaved ? (
                    <span className='flex items-center gap-2'>
                      <AiOutlineCheckCircle /> Enregistré
                    </span>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Section Connexion */}
        <div className='mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-t border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold mb-4'>Connexion</h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            Liez vos comptes pour une connexion simplifiée.
          </p>
          <ul className='space-y-4'>
            {services.map((service) => (
              <li
                key={service.key}
                className='flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900'>
                <div className='flex items-center gap-3'>
                  {service.icon}
                  <span className='font-medium'>{service.name}</span>
                  {service.linked ? (
                    <span className='ml-2 text-green-600 text-xs font-semibold'>
                      Lié
                    </span>
                  ) : (
                    <span className='ml-2 text-gray-400 text-xs font-semibold'>
                      Non lié
                    </span>
                  )}
                  {service.linked && service.info && (
                    <span className='ml-3 text-xs text-gray-500 italic'>
                      {service.key === "google"
                        ? service.info
                        : `@${service.info}`}
                    </span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={service.onLink}
                    disabled={service.linked}
                    className={`px-4 py-1 rounded-lg text-sm font-semibold border transition-colors
                      ${
                        service.linked
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                          : "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      }
                    `}>
                    Lier
                  </button>
                  <button
                    onClick={service.onUnlink}
                    disabled={!service.linked}
                    className={`px-4 py-1 rounded-lg text-sm font-semibold border transition-colors
                      ${
                        !service.linked
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                          : "bg-red-500 text-white border-red-500 hover:bg-red-600"
                      }
                    `}>
                    Délier
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Section des actions du compte */}
        <div className='mt-8 space-y-4'>
          <h2 className='text-xl font-semibold mb-4'>Actions du compte</h2>

          <button
            onClick={handleDeleteAccount}
            className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors'>
            <FaTrash className='w-5 h-5' />
            Supprimer mon compte
          </button>

          <button
            onClick={handleLogout}
            className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold transition-colors'>
            <FaSignOutAlt className='w-5 h-5' />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
