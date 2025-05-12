import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from "../components/Toast";
import { FaSearch, FaCamera } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfig";

const CLOUDINARY_CLOUD_NAME = "dulclkp2k";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

export default function Profil() {
  const { user, refreshUser } = useAuth();
  const [userData, setUserData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // Ajoute un effet pour synchroniser userData.photoURL dès que user.photoURL change (Navbar à Profil)
  useEffect(() => {
    if (user && user.photoURL && user.photoURL !== userData.photoURL) {
      setUserData((prev) => ({
        ...prev,
        photoURL: user.photoURL,
      }));
    }
    // eslint-disable-next-line
  }, [user?.photoURL]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Utilise toujours auth.currentUser pour la photo la plus à jour
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            ...data,
            // Prend la photo la plus récente (Firebase Auth > Firestore)
            photoURL: auth.currentUser?.photoURL || data.photoURL || "",
          });
          setSearchQuery(data.adresse || "");
        } else {
          const defaultData = {
            prenom: user.displayName?.split(" ")[0] || "",
            nom: user.displayName?.split(" ")[1] || "",
            email: user.email || "",
            telephone: "",
            adresse: "",
            photoURL: auth.currentUser?.photoURL || user.photoURL || "",
          };
          await setDoc(doc(db, "users", user.uid), defaultData);
          setUserData(defaultData);
          setSearchQuery(defaultData.adresse || "");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        if (error.code === "permission-denied") {
          setToastMessage("Erreur d'autorisation. Veuillez vous reconnecter.");
        } else {
          setToastMessage("Erreur lors de la récupération des données");
        }
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, user?.photoURL]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      setToastMessage("Veuillez sélectionner une image valide");
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);

      // Upload sur Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          "L'image dépasse 10 Mo, veuillez choisir une image plus petite."
        );
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        const msg =
          data.error?.message || "Erreur lors de l'upload sur Cloudinary";
        throw new Error(msg);
      }

      const photoURL = data.secure_url;

      // Utilise l'objet natif Firebase Auth pour updateProfile
      const firebaseUser = auth.currentUser;

      if (firebaseUser && typeof updateProfile === "function") {
        await updateProfile(firebaseUser, { photoURL });
        if (typeof refreshUser === "function") {
          await refreshUser(); // Met à jour le contexte et donc la navbar
        }
      }

      // Mise à jour des données utilisateur dans Firestore (la BDD)
      const updatedData = { ...userData, photoURL };
      await setDoc(doc(db, "users", firebaseUser.uid), updatedData);

      // Mets à jour l'état local avec la photo la plus récente (Firebase Auth)
      setUserData((prev) => ({
        ...prev,
        photoURL: firebaseUser.photoURL || photoURL,
      }));

      // Ajout : retire le hover après upload réussi
      setIsHovering(false);

      setToastMessage("Photo de profil mise à jour avec succès");
      setShowToast(true);
    } catch (error) {
      console.error("Erreur lors de l'upload de la photo:", error);
      setToastMessage(
        error.message || "Erreur lors de la mise à jour de la photo"
      );
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchAddress(value);
    setShowSuggestions(true);
    setHasChanges(true);
  };

  const handleAddressSelect = (address) => {
    setUserData((prev) => ({
      ...prev,
      adresse: address.properties.label,
    }));
    setSearchQuery(address.properties.label);
    setShowSuggestions(false);
    setHasChanges(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "adresse") {
      handleAddressChange(e);
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setHasChanges(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "users", user.uid), userData);
      setToastMessage("Profil mis à jour avec succès");
      setShowToast(true);
      setHasChanges(false);
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
          <div
            className='relative w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-4 cursor-pointer group'
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => fileInputRef.current?.click()}>
            {userData.photoURL ? (
              <img
                src={userData.photoURL}
                alt='Photo de profil'
                className='w-full h-full rounded-full object-cover'
              />
            ) : (
              <span className='text-2xl font-bold text-blue-500 flex items-center justify-center h-full'>
                {userData.prenom.charAt(0)}
                {userData.nom.charAt(0)}
              </span>
            )}
            {isHovering && (
              <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center'>
                <FaCamera className='text-white text-2xl' />
              </div>
            )}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept='image/*'
              className='hidden'
            />
          </div>
          <div className='text-xl font-semibold mb-1 dark:text-white'>
            {userData.prenom} {userData.nom}
          </div>
          <div className='text-gray-500 dark:text-gray-400 mb-6'>
            {userData.email}
          </div>
        </div>

        {/* Formulaire infos */}
        <div className='bg-white dark:bg-black rounded-xl shadow border border-gray-200 dark:border-gray-800 p-8 flex-1'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold dark:text-white'>
              Informations personnelles
            </h2>
            {hasChanges && (
              <button
                onClick={handleSubmit}
                className='bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--primary-hover-color)] transition'>
                Sauvegarder
              </button>
            )}
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
                  className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
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
                  className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
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
                className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
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
                className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
              />
            </div>
            <div className='relative'>
              <label className='block text-sm font-medium mb-1 dark:text-white'>
                Adresse
              </label>
              <div className='relative'>
                <input
                  type='text'
                  name='adresse'
                  value={searchQuery}
                  onChange={handleChange}
                  placeholder='Commencez à taper une adresse...'
                  className='w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
                />
                <FaSearch className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              </div>
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto'>
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => handleAddressSelect(suggestion)}
                      className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300'>
                      {suggestion.properties.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
