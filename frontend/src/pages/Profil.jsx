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
  name: "Satyajit Mane",
  email: "satyajitmane123@gmail.com",
  emailVerified: true,
  phone: "1234567890",
  phoneVerified: false,
  password: "password123",
  confirmPassword: "password123",
  twoFA: true,
};

export default function Profil() {
  const [user, setUser] = useState(initialUser);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailStatus] = useState(user.emailVerified);
  const [phoneStatus] = useState(user.phoneVerified);
  const [password, setPassword] = useState(user.password);
  const [confirmPassword, setConfirmPassword] = useState(user.confirmPassword);
  const [twoFA, setTwoFA] = useState(user.twoFA);
  const [infoSaved, setInfoSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);
  const fileInputRef = useRef();
  const { setAvatar } = useAuth();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); // pour l'affichage local
        setAvatar(reader.result); // pour le contexte global (sidebar)
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
    <div className='max-w-2xl mx-auto py-10 px-4'>
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
        <span className='mt-2 text-sm text-gray-500'>
          Edit your profile picture
        </span>
      </div>

      {/* Personal Information */}
      <form
        onSubmit={handleInfoSave}
        className='bg-white rounded-xl shadow p-6 mb-8 border border-gray-100'>
        <h2 className='text-lg font-semibold mb-4'>Personal Information</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>Name</label>
            <input
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={user.name}
              onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>Email</label>
            <div className='relative'>
              <input
                className={`w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                  emailStatus
                    ? "border-green-400 focus:ring-green-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                value={user.email}
                onChange={(e) =>
                  setUser((u) => ({ ...u, email: e.target.value }))
                }
                required
                type='email'
              />
              {emailStatus ? (
                <AiOutlineCheckCircle
                  className='absolute right-2 top-2 text-green-500 text-xl'
                  title='Email Verified'
                />
              ) : (
                <AiOutlineCloseCircle
                  className='absolute right-2 top-2 text-yellow-500 text-xl'
                  title='Not Verified'
                />
              )}
            </div>
            <div className='text-xs mt-1 ml-1'>
              {emailStatus ? (
                <span className='text-green-600 flex items-center gap-1'>
                  <AiOutlineCheckCircle /> Email Verified
                </span>
              ) : (
                <span className='text-yellow-600 flex items-center gap-1'>
                  <AiOutlineCloseCircle /> Not Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Phone <span className='text-xs text-gray-400'>(Optional)</span>
            </label>
            <div className='relative'>
              <input
                className={`w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                  phoneStatus
                    ? "border-green-400 focus:ring-green-200"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                value={user.phone}
                onChange={(e) =>
                  setUser((u) => ({ ...u, phone: e.target.value }))
                }
                type='tel'
                placeholder='1234567890'
              />
              {phoneStatus ? (
                <AiOutlineCheckCircle
                  className='absolute right-2 top-2 text-green-500 text-xl'
                  title='Phone Verified'
                />
              ) : (
                <AiOutlineCloseCircle
                  className='absolute right-2 top-2 text-yellow-500 text-xl'
                  title='Not Verified'
                />
              )}
            </div>
            <div className='text-xs mt-1 ml-1'>
              {phoneStatus ? (
                <span className='text-green-600 flex items-center gap-1'>
                  <AiOutlineCheckCircle /> Verified
                </span>
              ) : (
                <span className='text-yellow-600 flex items-center gap-1'>
                  <AiOutlineCloseCircle /> Not Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          type='submit'
          className='bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-semibold mt-2'>
          {infoSaved ? "Saved!" : "Save"}
        </button>
      </form>

      {/* Security */}
      <form
        onSubmit={handleSecuritySave}
        className='bg-white rounded-xl shadow p-6 border border-gray-100'>
        <h2 className='text-lg font-semibold mb-4'>Security</h2>
        <div className='mb-4'>
          <label className='block text-sm text-gray-600 mb-1'>Password</label>
          <div className='relative'>
            <input
              className='w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-2 top-2 text-gray-500'
              onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
          <div className='flex items-center gap-2 mt-1 text-xs'>
            <span
              className={
                password.length >= 8 ? "text-green-600" : "text-gray-400"
              }>
              ✔ 8 Character
            </span>
            <span
              className={
                /[0-9]/.test(password) ? "text-green-600" : "text-gray-400"
              }>
              Numbers
            </span>
            <span
              className={
                /[^A-Za-z0-9]/.test(password)
                  ? "text-green-600"
                  : "text-gray-400"
              }>
              Symbols
            </span>
          </div>
        </div>
        <div className='mb-4'>
          <label className='block text-sm text-gray-600 mb-1'>
            Confirm Password
          </label>
          <div className='relative'>
            <input
              className='w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-2 top-2 text-gray-500'
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
          <label htmlFor='2fa' className='text-sm text-gray-700'>
            <span className='font-semibold'>Two-step authentication</span>
            <span className='block text-xs text-gray-500'>
              Activate this check to get a secure OTP on your email and phone
              number to log into your account.
            </span>
          </label>
        </div>
        <button
          type='submit'
          className='bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-semibold mt-2'>
          {securitySaved ? "Saved!" : "Save"}
        </button>
      </form>
    </div>
  );
}
