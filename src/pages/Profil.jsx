import React, { useRef, useState } from "react";
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

  // État fictif pour la démo (à remplacer par ta logique réelle)
  const [linkedAccounts, setLinkedAccounts] = useState({
    google: { linked: false, email: null },
    github: { linked: false, username: null },
    email: { linked: !!user?.email, email: user?.email || null },
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
    setLinkedAccounts((prev) => ({
      ...prev,
      google: { linked: true, email: "user@gmail.com" },
    }));
  };
  const handleUnlinkGoogle = () => {
    setLinkedAccounts((prev) => ({
      ...prev,
      google: { linked: false, email: null },
    }));
  };
  const handleLinkGithub = () => {
    loginWithGithub();
    setLinkedAccounts((prev) => ({
      ...prev,
      github: { linked: true, username: "octocat" },
    }));
  };
  const handleUnlinkGithub = () => {
    setLinkedAccounts((prev) => ({
      ...prev,
      github: { linked: false, username: null },
    }));
  };
  const handleLinkEmail = () => {
    // Ici, tu pourrais ouvrir un modal ou rediriger vers une page d'inscription
    setLinkedAccounts((prev) => ({
      ...prev,
      email: { linked: true, email: formData.email },
    }));
  };
  const handleUnlinkEmail = () => {
    setLinkedAccounts((prev) => ({
      ...prev,
      email: { linked: false, email: null },
    }));
  };

  const services = [
    {
      key: "email",
      name: "Email",
      icon: <FaEnvelope className='w-5 h-5 text-yellow-500' />,
      linked: linkedAccounts.email.linked,
      info: linkedAccounts.email.email,
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
      linked: linkedAccounts.google.linked,
      info: linkedAccounts.google.email,
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
      linked: linkedAccounts.github.linked,
      info: linkedAccounts.github.username,
      onLink: handleLinkGithub,
      onUnlink: handleUnlinkGithub,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Profil utilisateur
            </h3>
            <div className='mt-5'>
              <dl className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                <div className='px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6'>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Email
                  </dt>
                  <dd className='mt-1 text-3xl font-semibold text-gray-900'>
                    {user?.email}
                  </dd>
                </div>
                <div className='px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6'>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Dernière connexion
                  </dt>
                  <dd className='mt-1 text-3xl font-semibold text-gray-900'>
                    {user?.metadata?.lastSignInTime
                      ? new Date(
                          user.metadata.lastSignInTime
                        ).toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
