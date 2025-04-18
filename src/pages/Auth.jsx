import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cochonImage from "../assets/img/cochon.png";
import Google from "../components/Google";

function InputField({ id, label, type, placeholder, showToggle, onToggle }) {
  return (
    <div className='mb-6 relative'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className='w-full border border-gray-300 rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        {showToggle && (
          <button
            type='button'
            onClick={onToggle}
            className='absolute inset-y-0 right-3 flex items-center justify-center text-gray-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d={
                  type === "password"
                    ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.683 1.662-1.208 2.385M17.657 17.657A9.969 9.969 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.969 9.969 0 011.636-2.627"
                    : "M3 3l18 18M9.879 9.879A3 3 0 0115 12m-3 3a3 3 0 01-3-3m12.121 2.121A9.969 9.969 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.969 9.969 0 011.636-2.627M17.657 17.657L6.343 6.343"
                }
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function SocialButton({ Icon, alt, text }) {
  return (
    <button className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer'>
      <Icon className='w-5 h-5' />
      {text}
    </button>
  );
}

export default function Auth() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  return (
    <div className='flex min-h-screen bg-white'>
      {/* Section gauche : Image */}
      <div
        className={`w-1/2 ${
          isLogin ? "left-0" : "right-0"
        } bg-[var(--primary-color)] flex items-center justify-center`}>
        <img
          src={cochonImage}
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>
      {/* Section droite : Formulaire */}
      <div className={`w-1/2 flex items-center justify-center bg-white`}>
        <div className='w-full max-w-md p-8 rounded-lg shadow-md'>
          {/* Bouton Revenir à l'accueil */}
          <button
            onClick={() => navigate("/")}
            className='mb-4 flex items-center text-[var(--primary-color)] hover:text-[var(--primary-hover-color)] text-sm font-medium transition duration-300 cursor-pointer'>
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
              <h2 className='text-3xl font-extrabold text-center mb-1 text-gray-800'>
                Connexion
              </h2>
              <p className='text-center text-base text-gray-600 mb-6'>
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
                  type={showPassword ? "text" : "password"}
                  placeholder='Mot de passe'
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <button
                  type='submit'
                  className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'>
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
                  className='text-[var(--primary-color)] hover:text-[var(--primary-hover-color)] cursor-pointer'>
                  Inscrivez-vous ici
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className='text-3xl font-extrabold text-center mb-1 text-gray-800'>
                Inscription
              </h2>
              <p className='text-center text-base text-gray-600 mb-6'>
                Inscrivez-vous pour continuer
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
                  type={showPassword ? "text" : "password"}
                  placeholder='Mot de passe'
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <InputField
                  id='confirm-password'
                  label='Confirmez le mot de passe'
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='Confirmez le mot de passe'
                  showToggle
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                <button
                  type='submit'
                  className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'>
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
                  className='text-[var(--primary-color)] hover:text-[var(--primary-hover-color)] cursor-pointer'>
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
