import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";

const Profil = () => {
  const { primaryColor } = useContext(AppContext);
  const { isDarkMode } = useContext(ThemeContext);

  const userData = {
    nom: "John Doe",
    email: "john.doe@example.com",
    dateInscription: "01/01/2024",
    derniereConnexion: "Aujourd'hui",
  };

  return (
    <div className='p-6'>
      <h1
        className={`text-2xl font-bold mb-6 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}>
        Profil
      </h1>

      <div
        className={`p-6 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
        <div className='space-y-4'>
          <div>
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}>
              Informations personnelles
            </h2>
            <div className='mt-2 space-y-2'>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                <span className='font-medium'>Nom :</span> {userData.nom}
              </p>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                <span className='font-medium'>Email :</span> {userData.email}
              </p>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                <span className='font-medium'>Date d'inscription :</span>{" "}
                {userData.dateInscription}
              </p>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                <span className='font-medium'>Dernière connexion :</span>{" "}
                {userData.derniereConnexion}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
