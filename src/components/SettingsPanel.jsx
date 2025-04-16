import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function SettingsPanel({ setIsSettingsOpen }) {
  const { sidebarType, setSidebarType } = useContext(AppContext);
  const [selectedColor, setSelectedColor] = useState("blue");

  const colors = ["pink", "black", "blue", "green", "orange", "red"];

  return (
    <div className='fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50'>
      <div className='p-4 flex items-center justify-between border-b'>
        <h2 className='text-xl font-bold'>Paramètres</h2>
        <button
          className='text-gray-500 text-4xl cursor-pointer hover:text-gray-800'
          onClick={() => {
            console.log("Fermeture des paramètres"); // Vérifiez si cette ligne s'exécute
            setIsSettingsOpen(false); // Ferme les paramètres
          }}>
          &times;
        </button>
      </div>
      <div className='p-4'>
        <p className='text-gray-500'>
          Ici vous pouvez personnaliser votre barre latérale et votre barre de
          navigation.
        </p>

        {/* Sidenav Colors */}
        <div className='mt-6'>
          <h3 className='text-sm font-bold text-gray-800'>
            Couleurs de la barre latérale
          </h3>
          <div className='flex items-center space-x-2 mt-2'>
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color
                    ? "border-gray-800"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}></button>
            ))}
          </div>
        </div>

        {/* Sidenav Type */}
        <div className='mt-6'>
          <h3 className='text-sm font-bold text-gray-800'>
            Type de barre latérale
          </h3>
          <p className='text-gray-500 text-sm'>
            Choisissez entre différents types de barres latérales.
          </p>
          <div className='flex items-center space-x-2 mt-2'>
            <button
              className={`px-4 py-2 rounded-lg border-2 ${
                sidebarType === "transparent"
                  ? "bg-white text-gray-800 border-gray-800"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
              onClick={() => setSidebarType("transparent")}>
              Transparent
            </button>
            <button
              className={`px-4 py-2 rounded-lg border-2 ${
                sidebarType === "white"
                  ? "bg-white text-gray-800 border-gray-800"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
              onClick={() => setSidebarType("white")}>
              Blanc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
