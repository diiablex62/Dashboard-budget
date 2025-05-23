import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setError("Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      )
    ) {
      try {
        setLoading(true);
        await logout();
        navigate("/auth");
      } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        setError("Erreur lors de la suppression du compte");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Paramètres</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {success && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
          {success}
        </div>
      )}

      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>Compte</h2>
        <p className='mb-4'>Email: {user?.email}</p>

        <div className='space-y-4'>
          <button
            onClick={handleLogout}
            disabled={loading}
            className='w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors duration-200 cursor-pointer'>
            {loading ? "Déconnexion en cours..." : "Se déconnecter"}
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className='w-full bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors duration-200 cursor-pointer'>
            {loading ? "Suppression en cours..." : "Supprimer mon compte"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
