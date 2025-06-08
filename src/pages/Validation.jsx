import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function Validation() {
  const location = useLocation();
  const email = location.state?.email;
  const magicLink = location.state?.magicLink;

  return (
    <div className='min-h-screen flex items-center justify-center bg-white dark:bg-black p-8'>
      <div className='max-w-md w-full text-center'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
            Vérifiez votre email
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Un lien de connexion a été envoyé à{" "}
            <span className='font-semibold'>{email}</span>
          </p>
        </div>

        {/* Section Développement */}
        <div className='bg-gray-50 dark:bg-black rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Mode Développement
          </h2>
          <div className='bg-white dark:bg-black p-4 rounded-lg border border-gray-200 dark:border-gray-800'>
            <a
              href={magicLink}
              className='text-yellow-500 hover:text-yellow-600 font-medium'
              title={magicLink || "Lien non disponible"}>
              Se connecter
            </a>
          </div>
        </div>

        {/* Section Production */}
        <div className='bg-gray-50 dark:bg-black rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Mode Production
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            Pour vous connecter :
          </p>
          <ol className='text-left text-gray-600 dark:text-gray-400 space-y-2'>
            <li className='flex items-start'>
              <span className='mr-2'>1.</span>
              <span>Ouvrez votre boîte mail</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2'>2.</span>
              <span>Cliquez sur le lien de connexion dans l'email</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2'>3.</span>
              <span>Vous serez automatiquement connecté</span>
            </li>
          </ol>
        </div>

        <div className='space-y-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Vous n'avez pas reçu l'email ?
          </p>
          <Link
            to='/auth'
            className='inline-block text-yellow-500 hover:text-yellow-600 font-medium'>
            Réessayer avec une autre adresse
          </Link>
        </div>
      </div>
    </div>
  );
}
