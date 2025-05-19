import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserAuthMethods } from "../utils/userUtils";
import { FaGoogle, FaGithub, FaEnvelope } from "react-icons/fa";

export default function UserAccountInfo() {
  const { user, mainAccountId } = useAuth();
  const [authMethods, setAuthMethods] = useState([]);
  const [emails, setEmails] = useState([]);
  const [lastProvider, setLastProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthInfo = async () => {
      if (!mainAccountId) {
        setLoading(false);
        return;
      }

      try {
        console.log(
          `Récupération des informations d'authentification pour: ${mainAccountId}`
        );
        const authInfo = await getUserAuthMethods(mainAccountId);
        setAuthMethods(authInfo.authMethods || []);
        setEmails(authInfo.emails || []);
        setLastProvider(authInfo.lastProvider);
        console.log("Méthodes d'authentification:", authInfo.authMethods);
        console.log("Emails associés:", authInfo.emails);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des méthodes d'authentification:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuthInfo();
  }, [mainAccountId]);

  const getProviderIcon = (provider) => {
    switch (provider) {
      case "google":
        return <FaGoogle className='text-red-500' />;
      case "github":
        return <FaGithub className='text-gray-800' />;
      case "email":
        return <FaEnvelope className='text-blue-500' />;
      default:
        return null;
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case "google":
        return "Google";
      case "github":
        return "GitHub";
      case "email":
        return "Email";
      default:
        return provider;
    }
  };

  if (loading) {
    return (
      <div className='p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
        <div className='animate-pulse flex space-x-4'>
          <div className='flex-1 space-y-4 py-1'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded'></div>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mainAccountId) {
    return null;
  }

  return (
    <div className='p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4 dark:text-white'>
        Informations du compte
      </h2>

      <div className='mb-4'>
        <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
          Identifiant du compte
        </div>
        <div className='font-mono text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto'>
          {mainAccountId}
        </div>
      </div>

      {emails.length > 0 && (
        <div className='mb-4'>
          <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
            Emails associés
          </div>
          <ul className='list-disc list-inside text-sm'>
            {emails.map((email, index) => (
              <li key={index} className='dark:text-white'>
                {email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {authMethods.length > 0 && (
        <div className='mb-4'>
          <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
            Méthodes d'authentification
          </div>
          <div className='flex flex-wrap gap-2'>
            {authMethods.map((method, index) => (
              <div
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  method === lastProvider
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}>
                {getProviderIcon(method)}
                {getProviderName(method)}
                {method === lastProvider && (
                  <span className='text-xs ml-1'>(dernière connexion)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='text-xs text-gray-500 dark:text-gray-400 italic'>
        Ces informations vous permettent de savoir comment vous êtes connecté(e)
        à votre compte.
      </div>
    </div>
  );
}
