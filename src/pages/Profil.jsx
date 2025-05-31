import React, { useRef, useState } from "react";
import {
  AiOutlineEdit,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

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
  const [user, setUser] = useState(initialUser);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState(user.password);
  const [confirmPassword, setConfirmPassword] = useState(user.confirmPassword);
  const [twoFA, setTwoFA] = useState(user.twoFA);
  const [infoSaved, setInfoSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);
  const fileInputRef = useRef();
  const { setAvatar, avatar } = useAuth();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setAvatarPreview(imageData); // pour l'affichage local
        setAvatar(imageData); // pour le contexte global (sidebar)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInfoSave = (e) => {
    e.preventDefault();
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 1500);
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    setSecuritySaved(true);
    setTimeout(() => setSecuritySaved(false), 1500);
  };

  return (
    <div className='w-full min-h-screen bg-white dark:bg-black dark:text-white py-10 p-8'>
      {/* Avatar */}
      <div className='flex flex-col items-center mb-8'>
        <div className='relative'>
          <img
            src={avatarPreview || "/avatar-placeholder.png"}
            alt='Avatar'
            className='w-24 h-24 rounded-full object-cover border-4 border-white shadow'
          />
          <button
            type='button'
            onClick={() => fileInputRef.current.click()}
            className='absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-gray-100'>
            <FiUpload className='text-xl text-gray-700' />
          </button>
          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            className='hidden'
            onChange={handleAvatarChange}
          />
        </div>
        <span className='mt-2 text-sm text-gray-500 dark:text-gray-300'>
          Modifier votre photo de profil
        </span>
      </div>

      {/* Personal Information */}
      <form
        onSubmit={handleInfoSave}
        className='w-full bg-white dark:bg-black rounded-xl shadow p-6 mb-8 border border-gray-100 dark:border-gray-800'>
        <h2 className='text-lg font-semibold mb-4'>
          Informations Personnelles
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>
              Nom
            </label>
            <input
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700'
              value={user.name}
              onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>
              Email
            </label>
            <div className='relative'>
              <input
                className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700'
                value={user.email}
                onChange={(e) =>
                  setUser((u) => ({ ...u, email: e.target.value }))
                }
                required
                type='email'
              />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>
              Téléphone{" "}
              <span className='text-xs text-gray-400'>(Optionnel)</span>
            </label>
            <div className='relative'>
              <input
                className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700'
                value={user.phone}
                onChange={(e) =>
                  setUser((u) => ({ ...u, phone: e.target.value }))
                }
                type='tel'
                placeholder='1234567890'
              />
            </div>
          </div>
        </div>
        <button
          type='submit'
          className='bg-gray-900 text-white px-6 py-2 rounded shadow hover:bg-gray-800 transition font-semibold mt-2'>
          {infoSaved ? "Enregistré !" : "Enregistrer"}
        </button>
      </form>

      {/* Security */}
      <form
        onSubmit={handleSecuritySave}
        className='w-full bg-white dark:bg-black rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800'>
        <h2 className='text-lg font-semibold mb-4'>Sécurité</h2>
        <div className='mb-4'>
          <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>
            Mot de passe
          </label>
          <div className='relative'>
            <input
              className='w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700'
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500'
              onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
          <div className='flex items-center gap-2 mt-1 text-xs'>
            <span
              className={
                password.length >= 8 ? "text-green-600" : "text-gray-400"
              }>
              ✔ 8 Caractères
            </span>
            <span
              className={
                /[0-9]/.test(password) ? "text-green-600" : "text-gray-400"
              }>
              Chiffres
            </span>
            <span
              className={
                /[^A-Za-z0-9]/.test(password)
                  ? "text-green-600"
                  : "text-gray-400"
              }>
              Symboles
            </span>
          </div>
        </div>
        <div className='mb-4'>
          <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>
            Confirmer le mot de passe
          </label>
          <div className='relative'>
            <input
              className='w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white dark:border-gray-700'
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500'
              onClick={() => setShowConfirm((v) => !v)}>
              {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
        </div>
        <div className='mb-4 flex items-center'>
          <input
            id='2fa'
            type='checkbox'
            checked={twoFA}
            onChange={(e) => setTwoFA(e.target.checked)}
            className='mr-2 accent-blue-600'
          />
          <label
            htmlFor='2fa'
            className='text-sm text-gray-700 dark:text-gray-300'>
            <span className='font-semibold'>
              Authentification à deux facteurs
            </span>
            <span className='block text-xs text-gray-500 dark:text-gray-400'>
              Activez cette option pour recevoir un code OTP sécurisé sur votre
              email et votre numéro de téléphone lors de la connexion à votre
              compte.
            </span>
          </label>
        </div>
        <button
          type='submit'
          className='bg-gray-900 text-white px-6 py-2 rounded shadow hover:bg-gray-800 transition font-semibold mt-2'>
          {securitySaved ? "Enregistré !" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
