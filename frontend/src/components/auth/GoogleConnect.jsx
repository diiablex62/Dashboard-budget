import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Composant pour la connexion Google utilisant @react-oauth/google
export default function GoogleConnect() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Récupérer les informations de l'utilisateur depuis Google
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        ).then((res) => res.json());

        // Sauvegarder les informations de l'utilisateur
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: response.access_token,
        };

        // Sauvegarder dans le localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Connexion réussie !");
        navigate("/");
      } catch (error) {
        console.error("Erreur lors de la connexion Google:", error);
        toast.error("Erreur lors de la connexion avec Google");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la connexion avec Google");
    },
  });

  return (
    <button
      onClick={() => login()}
      className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 shadow transition text-gray-900 dark:text-white font-semibold text-base'>
      <FaGoogle className='w-5 h-5 text-red-500' /> Google
    </button>
  );
}
