import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import cochonImage from "../assets/img/cochon.png";
import Google from "../components/Google"; 

function InputField({ id, label, type, placeholder }) {
  return (
    <div className='mb-4'>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className='mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
      />
    </div>
  );
}

function SocialButton({ Icon, alt, text }) {
  return (
    <button className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300'>
      <Icon className='w-5 h-5' />
      {text}
    </button>
  );
}

export default function Auth() {
  const location = useLocation(); 
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin); 
    }
  }, [location.state]);

  return (
    <div className='flex min-h-screen bg-white overflow-hidden relative'>
      {/* Section gauche : Image */}
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "left-0" : "right-0"
        } bg-blue-500 flex items-center justify-center`}>
        <img
          src={cochonImage}
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>
      {/* Section droite : Formulaire */}
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "right-0" : "left-0"
        } flex items-center justify-center bg-white`}>
        <div className='w-full max-w-md p-8 rounded-lg shadow-md'>
          {/* Bouton Revenir à l'accueil */}
          <button
            onClick={() => navigate("/")}
            className='mb-4 flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium transition duration-300 cursor-pointer'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Revenir à l'accueil
          </button>
          {isLogin ? (
            <>
              <h2 className='text-2xl font-bold text-center mb-2'>Connexion</h2>
              <p className='text-center text-sm text-gray-500 mb-6'>
                Connectez-vous pour continuer
              </p>
              <form>
                <InputField
                  id='email'
                  label='Adresse e-mail'
                  type='email'
                  placeholder='Adresse e-mail'
                />
                <InputField
                  id='password'
                  label='Mot de passe'
                  type='password'
                  placeholder='Mot de passe'
                />
                <button
                  type='submit'
                  className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'>
                  Connexion
                </button>
              </form>
              <div className='flex items-center my-6'>
                <div className='flex-1 h-px bg-gray-300'></div>
                <span className='px-4 text-sm text-gray-500'>OU</span>
                <div className='flex-1 h-px bg-gray-300'></div>
              </div>
              <div className='space-y-4'>
                <SocialButton
                  Icon={Google}
                  alt='Google'
                  text='Connexion avec Google'
                />
                <SocialButton
                  Icon={() => (
                    <img
                      src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
                      alt='GitHub'
                      className='w-5 h-5'
                    />
                  )}
                  alt='GitHub'
                  text='Connexion avec GitHub'
                />
              </div>
              <p className='text-center text-sm text-gray-600 mt-6'>
                Vous n'avez pas de compte ?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className='text-blue-500 hover:underline'>
                  Inscrivez-vous ici
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className='text-2xl font-bold text-center mb-2'>
                Inscription
              </h2>
              <p className='text-center text-sm text-gray-500 mb-6'>
                Inscrivez-vous pour continuer
              </p>
              <form>
                <InputField
                  id='username'
                  label="Nom d'utilisateur"
                  type='text'
                  placeholder="Nom d'utilisateur"
                />
                <InputField
                  id='email'
                  label='Adresse e-mail'
                  type='email'
                  placeholder='Adresse e-mail'
                />
                <InputField
                  id='password'
                  label='Mot de passe'
                  type='password'
                  placeholder='Mot de passe'
                />
                <button
                  type='submit'
                  className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'>
                  Inscription
                </button>
              </form>
              <div className='flex items-center my-6'>
                <div className='flex-1 h-px bg-gray-300'></div>
                <span className='px-4 text-sm text-gray-500'>OU</span>
                <div className='flex-1 h-px bg-gray-300'></div>
              </div>
              <div className='space-y-4'>
                <SocialButton
                  Icon={Google}
                  alt='Google'
                  text='Inscription avec Google'
                />
                <SocialButton
                  Icon={() => (
                    <img
                      src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
                      alt='GitHub'
                      className='w-5 h-5'
                    />
                  )}
                  alt='GitHub'
                  text='Inscription avec GitHub'
                />
              </div>
              <p className='text-center text-sm text-gray-600 mt-6'>
                Vous avez déjà un compte ?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className='text-blue-500 hover:underline'>
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
