import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";

export default function SettingsPanel({ setIsSettingsOpen }) {
  const { primaryColor, setPrimaryColor } = useContext(AppContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef(null);

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
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 transform transition-transform duration-500 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      ref={panelRef}>
      <div className='p-4 flex items-center justify-between border-b'>
        <h2 className='text-xl font-bold'>Paramètres</h2>
        <button
          className='text-gray-500 text-4xl cursor-pointer hover:text-gray-800'
          onClick={closePanel}>
          &times;
        </button>
      </div>
      <div className='p-4'>
        <p className='text-gray-500'>
          Ici vous pouvez personnaliser votre barre latérale et votre barre de
          navigation.
        </p>
        <div className='mt-6'>
          <h3 className='text-sm font-bold text-gray-800'>
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
          <h3 className='text-sm font-bold text-gray-800'>Mode sombre</h3>
          <div className='flex items-center justify-between mt-2'>
            <span className='text-gray-600'>Activer le mode sombre ?</span>
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
      </div>
    </div>
  );
}
