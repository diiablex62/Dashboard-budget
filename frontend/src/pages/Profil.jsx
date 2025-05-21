import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../utils/api";

export default function Profil() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    photoURL: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      console.log("Mise à jour du profil utilisateur:", formData);
      const updatedUser = await userApi.createOrUpdate({
        ...user,
        ...formData,
      });
      console.log("Profil mis à jour avec succès:", updatedUser);
      setSuccess("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      setError("Erreur lors de la mise à jour du profil");
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
          Mon Profil
        </h1>

        {error && (
          <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}

        {success && (
          <div className='mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded'>
            {success}
          </div>
        )}

        <div className='flex items-center space-x-6 mb-8'>
          <div className='h-24 w-24 rounded-full overflow-hidden bg-gray-200'>
            {formData.photoURL ? (
              <img
                src={formData.photoURL}
                alt='Photo de profil'
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='h-full w-full flex items-center justify-center text-gray-400'>
                <svg
                  className='h-12 w-12'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {formData.displayName || "Utilisateur"}
            </h2>
            <p className='text-gray-600 dark:text-gray-300'>{formData.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='displayName'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Nom d'affichage
            </label>
            <input
              type='text'
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
          </div>

          <div>
            <label
              htmlFor='photoURL'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              URL de la photo de profil
            </label>
            <input
              type='url'
              id='photoURL'
              name='photoURL'
              value={formData.photoURL}
              onChange={handleInputChange}
              disabled={!isEditing}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
          </div>

          <div className='flex justify-end space-x-4'>
            {isEditing ? (
              <>
                <button
                  type='button'
                  onClick={() => setIsEditing(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  Annuler
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  Enregistrer
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setIsEditing(true)}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Modifier
              </button>
            )}
          </div>
        </form>

        <div className='mt-8 pt-6 border-t border-gray-200'>
          <button
            onClick={logout}
            className='w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
