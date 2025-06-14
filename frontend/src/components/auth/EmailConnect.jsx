import React, { useState } from "react";
import { toast } from "react-toastify";
import { sendMagicLink } from "../../email/login";
import { useNavigate } from "react-router-dom";

// Composant pour la connexion par email
export default function EmailConnect() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Pour la démonstration, nous n'affichons pas les logs console en production
      // console.log("=== DÉBUT LOGS AUTH ===");
      // console.log("Email saisi:", email);

      const result = await sendMagicLink(email);
      // console.log("Résultat sendMagicLink:", result);

      if (result.success) {
        const url = `${window.location.origin}/auth?token=${result.token}`;
        // console.log("URL créée:", url);

        const state = {
          email: email,
          magicLink: url,
        };
        // console.log("State préparé:", state);

        navigate("/validation", { state });
      } else {
        setError(result.error || "Erreur lors de l'envoi du lien magique");
      }
      // console.log("=== FIN LOGS AUTH ===");
    } catch (error) {
      setError(error.message || "Erreur lors de l'envoi du lien de connexion");
      toast.error("Erreur lors de l'envoi du lien de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className='space-y-4' onSubmit={handleEmailSignIn}>
      <div>
        <input
          type='email'
          placeholder='Email'
          className='w-full px-5 py-3 rounded-full bg-gray-100 dark:bg-black focus:bg-white dark:focus:bg-black border border-gray-200 dark:border-gray-800 focus:border-blue-400 dark:focus:border-blue-500 outline-none text-gray-900 dark:text-white text-base placeholder-gray-400 dark:placeholder-gray-500 transition'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        {error && (
          <p className='mt-2 text-sm text-red-600 dark:text-red-400'>{error}</p>
        )}
      </div>
      <button
        type='submit'
        className='w-full py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg shadow transition mb-2 disabled:opacity-50 disabled:cursor-not-allowed'
        disabled={isLoading}>
        {isLoading ? "Envoi en cours..." : "Recevoir un lien par email"}
      </button>
    </form>
  );
}
