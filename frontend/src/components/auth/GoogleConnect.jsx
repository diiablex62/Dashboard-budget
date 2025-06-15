import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

// Composant pour la connexion Google utilisant @react-oauth/google
export default function GoogleConnect() {
  const navigate = useNavigate();
  const { login, addLinkedProvider, linkedProviders } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("Réponse Google OAuth:", response);

        // Récupérer les informations de l'utilisateur depuis Google
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        ).then((res) => res.json());

        console.log("Informations utilisateur Google:", userInfo);

        // Vérifier si c'est la première connexion
        const isFirstConnection = linkedProviders.length === 0;

        // Créer l'objet utilisateur avec les informations Google
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: response.access_token,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          preferences: {
            theme: "light",
            language: "fr",
            notifications: true,
          },
        };

        console.log("Données utilisateur à envoyer:", userData);

        // Sauvegarder l'utilisateur dans la base de données
        const saveUserResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/google`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        );

        if (!saveUserResponse.ok) {
          const errorData = await saveUserResponse.json();
          console.error("Erreur de sauvegarde:", errorData);
          throw new Error(
            errorData.message || "Erreur lors de la sauvegarde de l'utilisateur"
          );
        }

        const savedUser = await saveUserResponse.json();
        console.log("Réponse du serveur:", savedUser);

        // Utiliser la fonction login du contexte d'authentification avec les données sauvegardées
        await login(savedUser.user);
        addLinkedProvider("google");

        // Message de succès personnalisé selon si c'est la première connexion
        if (isFirstConnection) {
          toast.success(
            <div className='flex flex-col'>
              <span className='font-semibold'>Bienvenue {userInfo.name} !</span>
              <span className='text-sm'>
                Votre profil a été créé avec succès.
              </span>
            </div>
          );
        } else {
          toast.success("Connexion réussie !");
        }

        navigate("/");
      } catch (error) {
        console.error("Erreur lors de la connexion Google:", error);
        toast.error(error.message || "Erreur lors de la connexion avec Google");
      }
    },
    onError: (error) => {
      console.error("Erreur OAuth Google:", error);
      toast.error("Erreur lors de la connexion avec Google");
    },
  });

  return (
    <button
      onClick={() => googleLogin()}
      className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 shadow transition text-gray-900 dark:text-white font-semibold text-base'>
      <FaGoogle className='w-5 h-5 text-red-500' /> Google
    </button>
  );
}
