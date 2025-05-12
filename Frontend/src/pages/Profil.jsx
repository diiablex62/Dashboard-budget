import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Toast from "../components/Toast";

export default function Profil() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Créer un document utilisateur par défaut
            const defaultData = {
              prenom: user.displayName?.split(" ")[0] || "",
              nom: user.displayName?.split(" ")[1] || "",
              email: user.email || "",
              telephone: "",
              adresse: "",
            };
            await setDoc(doc(db, "users", user.uid), defaultData);
            setUserData(defaultData);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données:", error);
          setToastMessage("Erreur lors de la récupération des données");
          setShowToast(true);
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "users", user.uid), userData);
      setToastMessage("Profil mis à jour avec succès");
      setShowToast(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setToastMessage("Erreur lors de la mise à jour du profil");
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className='p-8 bg-[#f8fafc] dark:bg-black min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]'></div>
      </div>
    );
  }

  return (
    <div className='p-8 bg-[#f8fafc] dark:bg-black min-h-screen'>
      <h1 className='text-3xl font-bold mb-8 dark:text-white'>PROFIL</h1>
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Carte profil */}
        <div className='bg-white dark:bg-black rounded-xl shadow border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center w-full md:w-1/3'>
          <div className='flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-4'>
            <span className='text-2xl font-bold text-blue-500'>
              {userData.prenom.charAt(0)}
              {userData.nom.charAt(0)}
            </span>
          </div>
          <div className='text-xl font-semibold mb-1 dark:text-white'>
            {userData.prenom} {userData.nom}
          </div>
          <div className='text-gray-500 dark:text-gray-400 mb-6'>
            {userData.email}
          </div>
          <button className='w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition'>
            Modifier la photo
          </button>
        </div>
        {/* Formulaire infos */}
        <div className='bg-white dark:bg-black rounded-xl shadow border border-gray-200 dark:border-gray-800 p-8 flex-1'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold dark:text-white'>
              Informations personnelles
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='text-[var(--primary-color)] hover:text-[var(--primary-hover-color)]'>
              {isEditing ? "Annuler" : "Modifier"}
            </button>
          </div>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <label className='block text-sm font-medium mb-1 dark:text-white'>
                  Prénom
                </label>
                <input
                  type='text'
                  name='prenom'
                  value={userData.prenom}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:disabled:bg-gray-800'
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-medium mb-1 dark:text-white'>
                  Nom
                </label>
                <input
                  type='text'
                  name='nom'
                  value={userData.nom}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:disabled:bg-gray-800'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1 dark:text-white'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={userData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:disabled:bg-gray-800'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1 dark:text-white'>
                Téléphone
              </label>
              <input
                type='tel'
                name='telephone'
                value={userData.telephone}
                onChange={handleChange}
                disabled={!isEditing}
                className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:disabled:bg-gray-800'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1 dark:text-white'>
                Adresse
              </label>
              <input
                type='text'
                name='adresse'
                value={userData.adresse}
                onChange={handleChange}
                disabled={!isEditing}
                className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:disabled:bg-gray-800'
              />
            </div>
            {isEditing && (
              <button
                type='submit'
                className='bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition'>
                Sauvegarder les modifications
              </button>
            )}
          </form>
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastMessage.includes("Erreur") ? "error" : "success"}
        />
      )}
    </div>
  );
}
