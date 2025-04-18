import React from "react";

export default function Register() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-blue-100'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-bold text-center mb-6'>Inscription</h2>
        <form>
          <div className='mb-4'>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700'>
              Nom d'utilisateur
            </label>
            <input
              id='username'
              type='text'
              placeholder="Nom d'utilisateur"
              className='mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'>
              Adresse e-mail
            </label>
            <input
              id='email'
              type='email'
              placeholder='Adresse e-mail'
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
              placeholder='Mot de passe'
              className='mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'>
            Inscription
          </button>
        </form>
        <p className='text-center text-sm text-gray-600 mt-6'>
          Vous avez déjà un compte ?{" "}
          <a href='/login' className='text-blue-500 hover:underline'>
            Connectez-vous ici
          </a>
        </p>
      </div>
    </div>
  );
}
