import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  FaGoogle,
  FaEnvelope,
  FaQuestionCircle,
  FaGithub,
} from "react-icons/fa";

export default function SettingsPanel({ setIsSettingsOpen }) {
  const { primaryColor, setPrimaryColor } = useContext(AppContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
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
    const savedColor = localStorage.getItem("primaryColor");
    const colorToApply = savedColor || primaryColor;
    setPrimaryColor(colorToApply);
    applyColorToDocument(colorToApply);
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

  const colors = [
    "#000000",
    "#007BFF",
    "#FF6347",
    "#008000",
    "#FFA500",
    "#FF0000",
  ];

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    localStorage.setItem("primaryColor", color);
    applyColorToDocument(color);
  };

  const applyColorToDocument = (color) => {
    document.documentElement.style.setProperty("--primary-color", color);
    document.documentElement.style.setProperty(
      "--primary-hover-color",
      generateHoverColor(color)
    );
  };

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

  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white dark:bg-black shadow-lg z-50 transform transition-transform duration-500 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      ref={panelRef}>
      <div className='p-4 flex items-center justify-between border-b'>
        <h2 className='text-xl font-bold text-gray-800 dark:text-white'>
          Paramètres
        </h2>
        <button
          className='text-gray-500 text-4xl cursor-pointer hover:text-gray-800 dark:hover:text-gray-200'
          onClick={closePanel}>
          &times;
        </button>
      </div>
      <div className='p-4 overflow-y-auto h-full'>
        <p className='text-gray-500 dark:text-gray-400'>
          Ici vous pouvez personnaliser votre barre latérale et activer le mode
          sombre.
        </p>

        <div className='mt-6'>
          <h3 className='text-sm font-bold text-gray-800 dark:text-white'>
            Couleurs de la barre latérale
          </h3>
          <div className='flex items-center space-x-2 mt-2'>
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  primaryColor === color ? "border-gray-800" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}></button>
            ))}
          </div>
        </div>

        <div className='mt-6'>
          <h3 className='text-sm font-bold text-gray-800 dark:text-white'>
            Mode sombre
          </h3>
          <div className='flex items-center justify-between mt-2'>
            <span className='text-gray-600 dark:text-gray-400'>
              Activer le mode sombre ?
            </span>
            <button
              onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full flex items-center ${
                isDarkMode ? "bg-blue-600" : "bg-gray-200"
              } transition-colors duration-300`}>
              <span
                className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${
                  isDarkMode ? "translate-x-5" : "translate-x-1"
                }`}></span>
            </button>
          </div>
        </div>

        {/* Section des méthodes d'authentification */}
        <div className='mt-6 border-t pt-4'>
          <h3 className='text-sm font-bold text-gray-800 dark:text-white mb-2'>
            Connexion actuelle
          </h3>

          {userData ? (
            <div className='bg-gray-50 dark:bg-gray-800 rounded-md p-3 mb-2'>
              <div className='flex items-center'>
                <div className='mr-3'>{methodIcon}</div>
                <div>
                  <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {methodName}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {userEmail}
                  </p>
                </div>
                <div className='ml-auto'>
                  <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                    Actif
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Non connecté
            </p>
          )}

          <h3 className='text-sm font-bold text-gray-800 dark:text-white mt-4 mb-2'>
            Méthodes disponibles
          </h3>

          <div className='space-y-2'>
            {(!userData || currentMethod !== "google") && (
              <div className='flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md'>
                <div className='mr-3'>
                  <FaGoogle className='text-red-500' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Google
                  </p>
                </div>
              </div>
            )}

            {(!userData || currentMethod !== "email-link") && (
              <div className='flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md'>
                <div className='mr-3'>
                  <FaEnvelope className='text-blue-500' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Email (lien magique)
                  </p>
                </div>
              </div>
            )}

            {(!userData || currentMethod !== "github") && (
              <div className='flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md'>
                <div className='mr-3'>
                  <FaGithub className='text-purple-500' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    GitHub
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
