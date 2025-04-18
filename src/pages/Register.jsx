import React from "react";

export default function Register() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <a href='/login' className='text-sm text-blue-500 hover:underline'>
            &lt; Se connecter
          </a>
         
        </div>
        <h2 className='text-2xl font-bold text-center mb-2'>S'INSCRIRE</h2>
        <p className='text-center text-sm text-gray-500 mb-6'>
          Inscrivez-vous pour continuer
        </p>
        <form>
          <div className='mb-4'>
            <label
              htmlFor='full-name'
              className='block text-sm font-medium text-gray-700'>
              Nom d'utilisateur
            </label>
            <input
              id='full-name'
              type='text'
              placeholder="Nom d'utilisateur"
              className='mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='Email'
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
          <div className='mb-4 flex items-center'>
            <input
              id='terms'
              type='checkbox'
              className='w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500'
            />
            <label htmlFor='terms' className='ml-2 text-sm text-gray-700'>
              Je suis d'accord avec les{" "}
              <a href='/terms' className='text-blue-500 hover:underline'>
                conditions d'utilisation
              </a>{" "}
              et{" "}
              <a href='/privacy' className='text-blue-500 hover:underline'>
                politique de confidentialité
              </a>
            </label>
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
            Avec Google
          </button>
          <button className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
              alt='GitHub'
              className='w-5 h-5'
            />
            Avec Github
          </button>
        </div>
        <p className='text-center text-sm text-gray-600 mt-6'>
          Vous avez déjà un compte ?{" "}
          <a href='/login' className='text-blue-500 hover:underline'>
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
