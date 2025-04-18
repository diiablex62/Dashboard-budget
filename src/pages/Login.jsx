import React from "react";

export default function Login() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <a href='/register' className='text-sm text-blue-500 hover:underline'>
            &lt; S'inscrire
          </a>
        </div>
        <h2 className='text-2xl font-bold text-center mb-2'>CONNEXION</h2>
        <p className='text-center text-sm text-gray-500 mb-6'>
          Connectez-vous pour continuer
        </p>
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
            Soumettre
          </button>
        </form>
        <div className='flex items-center my-6'>
          <div className='flex-1 h-px bg-gray-300'></div>
          <span className='px-4 text-sm text-gray-500'>OU</span>
          <div className='flex-1 h-px bg-gray-300'></div>
        </div>
        <div className='space-y-4'>
          <button className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png'
              alt='Google'
              className='w-5 h-5'
            />
            Connexion avec Google
          </button>
          <button className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
              alt='GitHub'
              className='w-5 h-5'
            />
            Connexion avec GitHub
          </button>
        </div>
        <p className='text-center text-sm text-gray-600 mt-6'>
          Vous n'avez pas de compte ?{" "}
          <a href='/register' className='text-blue-500 hover:underline'>
            Inscrivez-vous ici
          </a>
        </p>
      </div>
    </div>
  );
}
