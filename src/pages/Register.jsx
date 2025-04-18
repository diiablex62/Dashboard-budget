import React from "react";

export default function Register() {
  return (
    <div className='flex min-h-screen bg-white'>
      {/* Section gauche : Image */}
      <div className='w-5/12 bg-blue-500 flex items-center justify-center'>
        <img
          src='https://img.freepik.com/photos-gratuite/vue-dessus-budget-note-ecrite-bloc-notes-stylo-surface-sombre-etudiant-cahier-couleur-argent-gris-college-business_179666-19726.jpg?t=st=1744983182~exp=1744986782~hmac=2208828aa12af4091eb04a066325936c241c46c353846779b181889e5b376401&w=826'
          alt='Illustration'
           className='w-full h-screen object-cover'
        />
      </div>
      {/* Section droite : Formulaire */}
      <div className='w-7/12 flex items-center justify-center bg-white'>
        <div className='w-full max-w-md p-8 rounded-lg shadow-md'>
          <div className='flex justify-between items-center mb-6'>
            <a href='/login' className='text-sm text-blue-500 hover:underline'>
              &lt; Se connecter
            </a>
          </div>
          <h2 className='text-2xl font-bold text-center mb-2'>Inscription</h2>
          <p className='text-center text-sm text-gray-500 mb-6'>
            Inscrivez-vous pour continuer
          </p>
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
    </div>
  );
}
