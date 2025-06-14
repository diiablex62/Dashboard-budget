import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Composant pour la connexion GitHub
export default function GithubConnect() {
  const { loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleGithubSignIn = async () => {
    try {
      await loginWithGithub();
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la connexion avec GitHub");
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleGithubSignIn}
      className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 shadow transition text-gray-900 dark:text-white font-semibold text-base'>
      <FaGithub className='w-5 h-5' /> GitHub
    </button>
  );
}
