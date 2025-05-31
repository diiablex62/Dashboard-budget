import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Google from "../components/icones/Google";
import GitHub from "../components/icones/GitHub";
import { sendMagicLink } from "../email/login";
import { FaApple } from "react-icons/fa";

export default function Auth() {
  const { primaryColor } = useContext(AppContext);
  const {
    loginWithGoogle,
    loginWithGithub,
    confirmEmailLogin,
    emailLinkSent,
    emailForSignIn,
    authLoading,
    authError,
  } = useAuth();
  const navigate = useNavigate();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Utiliser l'erreur du contexte d'authentification si disponible
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Vérifier si un token est présent dans l'URL (pour la connexion par lien magique)
  useEffect(() => {
    const checkUrlToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        try {
          setError(null);
          console.log("Token détecté dans l'URL, tentative de validation...");
          const result = await confirmEmailLogin(token);

          if (result.success) {
            console.log("Authentification par email réussie !");
            navigate("/");
          } else {
            console.error("Échec de la validation du token:", result.error);
            setError(
              result.error ||
                "Le lien de connexion est invalide ou a expiré. Veuillez réessayer."
            );
          }
        } catch (error) {
          console.error("Erreur lors de la validation du token:", error);
          setError(
            "Impossible de vous authentifier avec ce lien. Veuillez réessayer."
          );
        }
      }
    };

    checkUrlToken();
  }, [confirmEmailLogin, navigate]);

  // Appliquez immédiatement la couleur primaire au DOM avant le rendu
  useEffect(() => {
    if (!primaryColor) return;
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    const hoverColor = generateHoverColor(primaryColor);
    document.documentElement.style.setProperty(
      "--primary-hover-color",
      hoverColor
    );
  }, [primaryColor]);

  const generateHoverColor = (color) => {
    const hexToHSL = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const s =
        max === min
          ? 0
          : l > 0.5
          ? (max - min) / (2 - max - min)
          : (max - min) / (max + min);
      const h =
        max === min
          ? 0
          : max === r
          ? (g - b) / (max - min) + (g < b ? 6 : 0)
          : max === g
          ? (b - r) / (max - min) + 2
          : (r - g) / (max - min) + 4;
      return { h: h * 60, s: s * 100, l: l * 100 };
    };

    const hslToHex = ({ h, s, l }) => {
      const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l / 100 - c / 2;
      const [r, g, b] =
        h < 60
          ? [c, x, 0]
          : h < 120
          ? [x, c, 0]
          : h < 180
          ? [0, c, x]
          : h < 240
          ? [0, x, c]
          : h < 300
          ? [x, 0, c]
          : [c, 0, x];
      return `#${[r, g, b]
        .map((v) =>
          Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, "0")
        )
        .join("")}`;
    };

    const hsl = hexToHSL(color);
    hsl.l = Math.max(10, Math.min(90, hsl.l - 15));
    return hslToHex(hsl);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await sendMagicLink(email);
      navigate("/validation", { state: { email } });
    } catch (error) {
      setError(error.message || "Erreur lors de l'envoi du lien magique");
    }
  };

  return (
    <div className='h-screen flex items-stretch bg-white p-8'>
      {/* Formulaire à gauche */}
      <div className='flex-1 flex flex-col justify-center px-6 py-0 sm:px-12 md:px-24 lg:px-32 h-full'>
        <div className='w-full max-w-md mx-auto'>
          {/* Logo Futuro en haut à gauche */}
          <div className='flex justify-start mb-8'>
            <Link
              to='/dashboard'
              className='inline-flex items-center px-5 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold text-base bg-transparent hover:bg-gray-100 transition shadow-none'>
              Futuro
            </Link>
          </div>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              Create an account
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mb-8'>
              Sign up and get 30 day free trial
            </p>
          </div>
          {/* Formulaire principal */}
          <form className='space-y-5'>
            {/* Champ nom (optionnel, pour inscription) */}
            {/* <div>
              <input type="text" placeholder="Full name" className="w-full px-5 py-3 rounded-full bg-gray-100 focus:bg-white border border-gray-200 focus:border-blue-400 outline-none text-gray-900 text-base placeholder-gray-400 transition" />
            </div> */}
            <div>
              <input
                type='email'
                placeholder='Email'
                className='w-full px-5 py-3 rounded-full bg-gray-100 focus:bg-white border border-gray-200 focus:border-blue-400 outline-none text-gray-900 text-base placeholder-gray-400 transition'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type='password'
                placeholder='Password'
                className='w-full px-5 py-3 rounded-full bg-gray-100 focus:bg-white border border-gray-200 focus:border-blue-400 outline-none text-gray-900 text-base placeholder-gray-400 transition'
                // value={password}
                // onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type='submit'
              className='w-full py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg shadow transition mb-2'>
              Submit
            </button>
          </form>
          {/* Boutons sociaux */}
          <div className='flex items-center my-6'>
            <div className='flex-1 h-px bg-gray-200' />
            <span className='mx-4 text-gray-400 text-sm'>or</span>
            <div className='flex-1 h-px bg-gray-200' />
          </div>
          <div className='flex gap-4 mb-8'>
            <button className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow transition text-gray-900 font-semibold text-base'>
              <FaApple className='w-5 h-5' /> Apple
            </button>
            <button
              onClick={loginWithGoogle}
              className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow transition text-gray-900 font-semibold text-base'>
              <Google className='w-5 h-5' /> Google
            </button>
          </div>
          {/* Liens bas de page */}
          <div className='flex justify-between items-center text-xs text-gray-400 mt-8'>
            <span>
              Have any account?{" "}
              <a
                href='#'
                className='text-gray-700 dark:text-white underline font-medium'>
                Sign in
              </a>
            </span>
            <a href='#' className='underline'>
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
      {/* Image à droite */}
      <div className='hidden md:flex md:w-1/2 items-stretch pl-8 h-full relative'>
        {/* Bouton croix en haut à droite */}
        <button
          onClick={() => navigate("/")}
          className='absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-100 transition text-2xl text-gray-500'
          title='Fermer'>
          &times;
        </button>
        <div className='w-full h-full bg-white rounded-[40px] overflow-hidden shadow-xl flex items-center justify-center'>
          <img
            src={orangeImage}
            alt='Connexion'
            className='w-full h-full object-cover object-center'
          />
        </div>
      </div>
    </div>
  );
}
