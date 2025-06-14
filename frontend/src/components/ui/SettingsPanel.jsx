import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaGoogle,
  FaEnvelope,
  FaQuestionCircle,
  FaGithub,
} from "react-icons/fa";

export default function SettingsPanel({ setIsSettingsOpen }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef(null);

  // Récupérer la méthode d'authentification actuelle
  const savedUser = localStorage.getItem("authUser");
  const userData = savedUser ? JSON.parse(savedUser) : null;
  const currentMethod = userData?.lastLoginMethod || "inconnu";

  // Obtenir le nom lisible et l'icône pour la méthode actuelle
  const getProviderInfo = (method) => {
    switch (method) {
      case "google":
        return {
          name: "Google",
          icon: <FaGoogle className='text-red-500' />,
          email: userData?.email,
        };
      case "email-link":
        return {
          name: "Email",
          icon: <FaEnvelope className='text-blue-500' />,
          email: userData?.email,
        };
      case "github":
        return {
          name: "GitHub",
          icon: <FaGithub className='text-purple-500' />,
          email: userData?.email,
        };
      default:
        return {
          name: "Méthode inconnue",
          icon: <FaQuestionCircle className='text-gray-500' />,
          email: userData?.email,
        };
    }
  };

  const {
    name: methodName,
    icon: methodIcon,
    email: userEmail,
  } = getProviderInfo(currentMethod);

  useEffect(() => {
    setIsVisible(true);

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closePanel = () => {
    setIsVisible(false);
    setTimeout(() => setIsSettingsOpen(false), 500);
  };

  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 transform transition-transform duration-500 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      ref={panelRef}>
      <div className='p-4 flex items-center justify-between border-b'>
        <h2 className='text-xl font-bold text-gray-800'>Paramètres</h2>
        <button
          className='text-gray-500 text-4xl cursor-pointer hover:text-gray-800'
          onClick={closePanel}>
          &times;
        </button>
      </div>
      <div className='p-4 overflow-y-auto h-full'>
        <p className='text-gray-500'>Ici vous pouvez gérer vos paramètres.</p>

        <div className='mt-6'>
          <h3 className='text-sm font-bold text-gray-800'>Compte connecté</h3>
          <div className='mt-2 p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center'>
              {methodIcon}
              <div className='ml-2'>
                <p className='text-sm font-medium text-gray-800'>
                  {methodName}
                </p>
                <p className='text-xs text-gray-500'>{userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
