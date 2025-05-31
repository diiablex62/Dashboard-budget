import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCheckCircle,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { FaUser, FaEnvelope, FaSignOutAlt } from "react-icons/fa";

const initialUser = {
  avatar: null,
  name: "Alexandre",
  email: "alexandre.janacek@gmail.com",
  phone: "07 69 69 69 69",
  password: "password123",
  confirmPassword: "password123",
  twoFA: true,
};

export default function Profil() {
  const {
    user,
    updateUser,
    logout,
    avatar,
    setAvatar,
    loginWithGoogle,
    loginWithGithub,
  } = useAuth();
  const navigate = useNavigate();
  const { primaryColor } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [infoSaved, setInfoSaved] = useState(false);
  const fileInputRef = useRef();

  // État fictif pour la démo (à remplacer par ta logique réelle)
  const [linkedAccounts, setLinkedAccounts] = useState({
    google: false,
    github: false,
  });

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
    navigate("/dashboard");
  };

  const handleInfoSave = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      email: formData.email,
    });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 1500);
  };

  const handleLinkGoogle = () => {
    loginWithGoogle();
    setLinkedAccounts((prev) => ({ ...prev, google: true }));
  };
  const handleLinkGithub = () => {
    loginWithGithub();
    setLinkedAccounts((prev) => ({ ...prev, github: true }));
  };

  return (
    <div className='w-full min-h-screen bg-white dark:bg-black dark:text-white py-10 p-8'>
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
              <h2 className='text-xl font-semibold mb-1'>{user?.name}</h2>
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
            <li className='flex items-center justify-between'>
              <button
                onClick={handleLinkGoogle}
                type='button'
                className='flex items-center gap-2 px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors'>
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png'
                  alt='Google'
                  className='w-5 h-5'
                />
                Google
              </button>
              <span
                className={`ml-4 text-sm font-semibold ${
                  linkedAccounts.google ? "text-green-600" : "text-gray-400"
                }`}>
                {linkedAccounts.google ? "Lié" : "Non lié"}
              </span>
            </li>
            <li className='flex items-center justify-between'>
              <button
                onClick={handleLinkGithub}
                type='button'
                className='flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors'>
                <img
                  src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                  alt='GitHub'
                  className='w-5 h-5'
                />
                GitHub
              </button>
              <span
                className={`ml-4 text-sm font-semibold ${
                  linkedAccounts.github ? "text-green-600" : "text-gray-400"
                }`}>
                {linkedAccounts.github ? "Lié" : "Non lié"}
              </span>
            </li>
          </ul>
        </div>

        {/* Section Déconnexion */}
        <div className='mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-t border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold mb-4'>Déconnexion</h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            Vous pouvez vous déconnecter de votre compte à tout moment.
          </p>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-red-600 transition-colors'>
            <FaSignOutAlt />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
