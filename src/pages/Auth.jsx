import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import orangeImage from "../assets/img/auth-orange.jpg";
import Google from "../components/Google";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { GithubAuthProvider } from "firebase/auth";
import Toast from "../components/Toast";

export default function Auth() {
  const { setIsLoggedIn, primaryColor } = useContext(AppContext);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
    loading: false,
    timeoutId: null,
  });

  // Appliquez immédiatement la couleur primaire au DOM avant le rendu
  useEffect(() => {
    if (!primaryColor) return;

    // Retirer les logs
    // console.log("Applying primary color:", primaryColor);
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    const hoverColor = generateHoverColor(primaryColor);
    document.documentElement.style.setProperty(
      "--primary-hover-color",
      hoverColor
    );
  }, [primaryColor]);

  const generateHoverColor = (color) => {
    // console.log("Generating hover color for:", color);
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

  const handleAuthProvider = async (provider, providerName) => {
    setToast({
      open: true,
      message: `Connexion en cours avec ${providerName}...`,
      type: "loading",
      loading: true,
      timeoutId: null,
    });

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        setToast({
          open: true,
          message: `Bienvenue ${result.user?.displayName || "utilisateur"} !`,
          type: "success",
          loading: false,
          timeoutId: null,
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 3000);
        setIsLoggedIn(true);
        navigate("/");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setToast({
        open: true,
        message: `Échec de la connexion avec ${providerName}.`,
        type: "error",
        loading: false,
        timeoutId: null,
      });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 4000);
      console.error(`Error during ${providerName} sign-in:`, error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setToast({
      open: true,
      message: "Connexion en cours...",
      type: "loading",
      loading: true,
      timeoutId: null,
    });

    try {
      const result = await login(email, password);
      if (result.success) {
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        setToast({
          open: true,
          message: "Connexion réussie !",
          type: "success",
          loading: false,
          timeoutId: null,
        });
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 3000);
        setIsLoggedIn(true);
        navigate("/");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setToast({
        open: true,
        message: "Échec de la connexion. Vérifiez vos identifiants.",
        type: "error",
        loading: false,
        timeoutId: null,
      });
      setTimeout(() => setToast((t) => ({ ...t, open: false })), 4000);
    }
  };

  return (
    <div className='flex min-h-screen relative'>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        loading={toast.loading}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      {/* Section image */}
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "left-0" : "translate-x-full"
        } bg-[var(--primary-color)] flex items-center justify-center transition-transform duration-500`}>
        <img
          src={orangeImage}
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>
      {/* Section formulaire */}
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "translate-x-full" : "left-0"
        } flex items-center justify-center bg-white transition-transform duration-500`}>
        <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full'>
          {/* Lien conditionnel pour le dashboard ou changer le mode de connexion */}
          {!showEmailForm ? (
            <a
              href='/'
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
              Retour au dashboard
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault(); // Empêche l'actualisation de la page
                setShowEmailForm(false); // Revenir à l'étape de choix de connexion
              }}
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
              Changer le mode de connexion
            </button>
          )}
          <h2 className='text-2xl font-bold text-center mb-6'>
            {isLogin ? "Content de te revoir." : "Rejoignez-nous."}
          </h2>
          {!showEmailForm ? (
            <div className='space-y-4'>
              <button
                onClick={() => handleAuthProvider(googleProvider, "Google")}
                className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
                <Google className='w-5 h-5 mr-2' />
                Connectez-vous avec Google
              </button>
              <button
                onClick={() =>
                  handleAuthProvider(new GithubAuthProvider(), "GitHub")
                }
                className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg'
                  alt='GitHub'
                  className='w-5 h-5 mr-2'
                />
                Connectez-vous avec GitHub
              </button>
              <button
                onClick={() => setShowEmailForm(true)}
                className='flex items-center justify-center w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100'>
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg'
                  alt='Email'
                  className='w-5 h-5 mr-2'
                />
                Connectez-vous avec votre e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className='space-y-4'>
              <h3 className='text-lg font-semibold text-center'>
                Connectez-vous avec votre e-mail
              </h3>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Votre email'
                required
                className='w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
              />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Votre mot de passe'
                required
                className='w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]'
              />
              <button
                type='submit'
                className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300'>
                Se connecter
              </button>
            </form>
          )}
          <p className='text-center text-sm text-gray-600 mt-6'>
            {isLogin ? (
              <>
                Pas de compte ?{" "}
                <button
                  onClick={() => {
                    setShowEmailForm(false);
                    setIsLogin(false);
                  }}
                  className='text-[var(--primary-color)] font-semibold hover:underline'>
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <button
                  onClick={() => {
                    setShowEmailForm(false);
                    setIsLogin(true);
                  }}
                  className='text-[var(--primary-color)] font-semibold hover:underline'>
                  Connectez-vous
                </button>
              </>
            )}
          </p>
          <p className='text-center text-xs text-gray-500 mt-4'>
            Cliquez sur « Se connecter » pour accepter les{" "}
            <Link to='/terms' className='text-blue-500 hover:underline'>
              conditions d'utilisation
            </Link>{" "}
            et la{" "}
            <Link to='/privacy' className='text-blue-500 hover:underline'>
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
