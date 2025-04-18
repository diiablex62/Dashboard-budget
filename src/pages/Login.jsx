import React from "react";

export default function Login() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-center mb-6'>Se connecter</h2>
        <form>
          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'>
              Adresse e-mail
            </label>
            <input
              id='email'
              type='email'
              placeholder='Entrez votre e-mail'
              className='mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'>
              Mot de passe
            </label>
            <input
              id='password'
              type='password'
              placeholder='Entrez votre mot de passe'
              className='mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <button type='submit' className='w-full'>
            Connexion
          </button>
        </form>
        <p className='text-center text-sm text-gray-600 mt-4'>
          Pas encore inscrit ?{" "}
          <a href='/register' className='text-blue-500 hover:underline'>
            Créez un compte
          </a>
        </p>
      </div>
    </div>
  );
}
