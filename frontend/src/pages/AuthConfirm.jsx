import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Page de confirmation d'authentification par email
 * Cette page est affichée lorsque l'utilisateur clique sur le lien dans l'email
 */
export default function AuthConfirm() {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (!token) {
        setStatus("error");
        setError("Lien invalide.");
        return;
      }
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/auth/confirm-magic-link?token=${token}`
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.message || "Erreur lors de la validation du lien."
          );
        localStorage.setItem("token", data.token);
        await fetchUserProfile(); // recharge le profil utilisateur
        setStatus("success");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } catch (err) {
        setStatus("error");
        setError(err.message || "Erreur lors de la validation du lien.");
      }
    };
    verifyToken();
  }, [navigate, fetchUserProfile]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <h2 className='text-2xl font-bold mb-6'>
        Confirmation d'authentification
      </h2>
      {status === "pending" && (
        <div className='text-lg'>Validation du lien en cours...</div>
      )}
      {status === "success" && (
        <div className='text-green-600 text-lg'>
          Connexion réussie ! Redirection...
        </div>
      )}
      {status === "error" && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center'>
          <div className='text-4xl mb-2'>&#10060;</div>
          <div className='font-bold text-xl mb-2'>
            Échec de l'authentification
          </div>
          <div className='mb-4'>{error}</div>
          <button
            className='mt-2 px-4 py-2 bg-blue-600 text-white rounded'
            onClick={() => navigate("/auth")}>
            Retour à la page de connexion
          </button>
        </div>
      )}
    </div>
  );
}
