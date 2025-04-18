import React, { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className='flex min-h-screen bg-white overflow-hidden relative'>
      {/* Section gauche ou droite : Image */}
      <div
        className={`absolute inset-y-0 ${
          isLogin ? "left-0 w-3/10" : "right-0 w-3/10"
        } bg-blue-500 flex items-center justify-center`}
      >
        <img
          src='https://img.freepik.com/photos-gratuite/vue-dessus-budget-note-ecrite-bloc-notes-stylo-surface-sombre-etudiant-cahier-couleur-argent-gris-college-business_179666-19726.jpg?t=st=1744983182~exp=1744986782~hmac=2208828aa12af4091eb04a066325936c241c46c353846779b181889e5b376401&w=826'
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>
      {/* Section droite ou gauche : Formulaire */}
      <div
        className={`absolute inset-y-0 ${
          isLogin ? "right-0 w-7/10" : "left-0 w-7/10"
        } flex items-center justify-center bg-white`}
      >
        <div className='w-full max-w-md p-8 rounded-lg shadow-md'>
          {isLogin ? (
            <>
              <h2 className='text-2xl font-bold text-center mb-2'>Connexion</h2>
              <p className='text-center text-sm text-gray-500 mb-6'>
                Connectez-vous pour continuer
              </p>
              <form>
                <div className='mb-4'>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
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
                    className='block text-sm font-medium text-gray-700'
                  >
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
                  className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'
                >
                  Connexion
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
                <button
                  onClick={() => setIsLogin(false)}
                  className='text-blue-500 hover:underline'
                >
                  Inscrivez-vous ici
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className='text-2xl font-bold text-center mb-2'>Inscription</h2>
              <p className='text-center text-sm text-gray-500 mb-6'>
                Inscrivez-vous pour continuer
              </p>
              <form>
                <div className='mb-4'>
                  <label
                    htmlFor='username'
                    className='block text-sm font-medium text-gray-700'
                  >
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
                    className='block text-sm font-medium text-gray-700'
                  >
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
                    className='block text-sm font-medium text-gray-700'
                  >
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
                  className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'
                >
                  Inscription
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
                  Inscription avec Google
                </button>
                <button className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300'>
                  <img
                    src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
                    alt='GitHub'
                    className='w-5 h-5'
                  />
                  Inscription avec GitHub
                </button>
              </div>
              <p className='text-center text-sm text-gray-600 mt-6'>
                Vous avez déjà un compte ?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className='text-blue-500 hover:underline'
                >
                  Connectez-vous ici
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
