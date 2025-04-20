import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as yup from "yup";
import bleuImage from "../assets/img/auth-bleu.png";
import orangeImage from "../assets/img/auth-orange.jpg";
import Google from "../components/Google";
import EyeOpenIcon from "../assets/Icons/EyeOpenIcon.svg";
import EyeClosedIcon from "../assets/Icons/EyeClosedIcon.svg";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";
import { GithubAuthProvider } from "firebase/auth";

// Correction des schémas
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Veuillez entrer une adresse e-mail valide.")
    .required("L'adresse e-mail est requise."),
  password: yup
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .matches(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
    .matches(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Le mot de passe doit contenir au moins un caractère spécial."
    )
    .required("Le mot de passe est requis."),
});

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email("Veuillez entrer une adresse e-mail valide.")
    .required("L'adresse e-mail est requise."),
  password: yup
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .matches(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
    .matches(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Le mot de passe doit contenir au moins un caractère spécial."
    )
    .required("Le mot de passe est requis."),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("password"), undefined],
      "Les mots de passe doivent correspondre."
    )
    .required("La confirmation du mot de passe est requise."),
});

function InputField({ id, label, type, placeholder, value, onChange, error }) {
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
          value={value}
          onChange={onChange}
          className={`w-full border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-[var(--primary-color)]"
          } text-gray-800 placeholder-gray-400`}
        />
        {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
      </div>
    </div>
  );
}

function InputFieldWithEye({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  showPassword,
  togglePasswordVisibility,
  onBlur,
}) {
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
          type={showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-[var(--primary-color)]"
          } text-gray-800 placeholder-gray-400`}
        />
        <img
          src={showPassword ? EyeOpenIcon : EyeClosedIcon}
          alt={
            showPassword
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
          className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer h-5 w-5'
          onClick={togglePasswordVisibility}
        />
        {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
      </div>
    </div>
  );
}

function PasswordStrengthIndicator({ password }) {
  const getStrength = () => {
    if (!password) return { strength: "Faible", color: "red" };
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const score = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
    ].filter(Boolean).length;
    if (score <= 2) return { strength: "Faible", color: "red" };
    if (score === 3) return { strength: "Moyen", color: "orange" };
    return { strength: "Fort", color: "green" };
  };
  const { strength, color } = getStrength();
  return (
    <p className={`text-sm mt-1`} style={{ color }}>
      Force du mot de passe : {strength}
    </p>
  );
}

function PasswordCriteria({ password }) {
  const criteria = [
    { label: "Au moins 8 caractères", test: (pw) => pw.length >= 8 },
    { label: "Au moins une majuscule", test: (pw) => /[A-Z]/.test(pw) },
    { label: "Au moins un chiffre", test: (pw) => /[0-9]/.test(pw) },
    {
      label: "Au moins un caractère spécial",
      test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
  ];
  return (
    <ul className='mt-1 space-y-0.5'>
      {criteria.map((criterion, index) => (
        <li
          key={index}
          className={`text-xs ${
            criterion.test(password) ? "text-green-500" : "text-red-500"
          }`}>
          {criterion.label}
        </li>
      ))}
    </ul>
  );
}

export default function Auth() {
  const location = useLocation();
  const { setIsLoggedIn } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authImage, setAuthImage] = useState(bleuImage);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  useEffect(() => {
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-color")
      .trim();
    if (primaryColor === "#FFA500") {
      setAuthImage(orangeImage);
    } else {
      setAuthImage(bleuImage);
    }
  }, []);

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const validateField = async (field, value) => {
    try {
      const schema = isLogin ? loginSchema : registerSchema;
      await yup.reach(schema, field).validate(value, { context: formData });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (validationError) {
      setErrors((prev) => ({ ...prev, [field]: validationError.message }));
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id !== "confirmPassword") validateField(id, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const schema = isLogin ? loginSchema : registerSchema;
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      toast.success("Connexion réussie !", {
        position: "top-right",
        autoClose: 3000,
      });
      // Enregistrez l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify({ email: formData.email }));
      setIsLoggedIn(true); // Mettez à jour l'état de connexion
      navigate("/"); // Redirigez vers le tableau de bord
    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
        toast.error(error.message, { position: "top-right", autoClose: 3000 });
      });
      setErrors((prevErrors) => ({ ...prevErrors, ...formattedErrors }));
    }
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordVisibilityToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Enregistrez les informations de l'utilisateur dans le localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ email: user.email, displayName: user.displayName })
      );
      toast.success(`Bienvenue ${user.displayName} !`, {
        position: "top-right",
        autoClose: 3000,
      });
      setIsLoggedIn(true); // Mettez à jour l'état de connexion
      navigate("/"); // Redirigez vers le tableau de bord
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google :", error);
      toast.error("Échec de la connexion avec Google.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleGithubAuth = async () => {
    toast.info("Connexion avec GitHub en cours...", {
      position: "top-right",
      autoClose: 3000,
    });
    const githubProvider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, githubProvider);
    // Ajoutez ici la logique pour la connexion via GitHub
    // Enregistrez les informations de l'utilisateur dans le localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: result.user.email,
        displayName: result.user.displayName,
      })
    );
    toast.success(`Bienvenue ${result.user.displayName} !`, {
      position: "top-right",
      autoClose: 3000,
    });
    setIsLoggedIn(true); // Mettez à jour l'état de connexion
    navigate("/"); // Redirigez vers le tableau de bord
  };

  return (
    <div className='flex min-h-screen bg-white overflow-hidden relative'>
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "left-0" : "translate-x-full"
        } bg-[var(--primary-color)] flex items-center justify-center transition-transform duration-500`}>
        <img
          src={authImage}
          alt='Illustration'
          className='w-full h-screen object-cover'
        />
      </div>
      <div
        className={`absolute inset-y-0 w-1/2 ${
          isLogin ? "translate-x-full" : "left-0"
        } flex items-center justify-center bg-white transition-transform duration-500`}>
        <div className='w-full max-w-md p-8 rounded-lg shadow-md'>
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
              <form onSubmit={handleSubmit}>
                <InputField
                  id='email'
                  label='Adresse e-mail'
                  type='email'
                  placeholder='Adresse e-mail'
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <InputFieldWithEye
                  id='password'
                  label='Mot de passe'
                  type='password'
                  placeholder='Mot de passe'
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  showPassword={showPassword}
                  togglePasswordVisibility={handlePasswordVisibilityToggle}
                />
                <button
                  type='submit'
                  className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'>
                  Connexion
                </button>
              </form>
              <div className='flex items-center my-4'>
                <hr className='flex-grow border-gray-300' />
                <span className='mx-2 text-gray-500 text-sm'>OU</span>
                <hr className='flex-grow border-gray-300' />
              </div>
              <button
                onClick={handleGoogleAuth}
                className='w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer'>
                <Google className='mr-2 text-xl' />
                Connexion avec Google
              </button>
              <button
                onClick={handleGithubAuth}
                className='w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='mr-2 h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.583 0-.287-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.382 1.235-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 013.003-.403c1.02.005 2.045.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.118 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.625-5.48 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.217.7.825.583C20.565 21.798 24 17.3 24 12c0-6.63-5.37-12-12-12z' />
                </svg>
                Connexion avec GitHub
              </button>
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
              <form onSubmit={handleSubmit}>
                <InputField
                  id='email'
                  label='Adresse e-mail'
                  type='email'
                  placeholder='Adresse e-mail'
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <InputFieldWithEye
                  id='password'
                  label='Mot de passe'
                  type='password'
                  placeholder='Mot de passe'
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  showPassword={showPassword}
                  togglePasswordVisibility={handlePasswordVisibilityToggle}
                />
                <InputFieldWithEye
                  id='confirmPassword'
                  label='Confirmez le mot de passe'
                  type='password'
                  placeholder='Confirmez le mot de passe'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  showPassword={showConfirmPassword}
                  togglePasswordVisibility={
                    handleConfirmPasswordVisibilityToggle
                  }
                />
                <button
                  type='submit'
                  className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'>
                  Inscription
                </button>
              </form>
              <div className='flex items-center my-4'>
                <hr className='flex-grow border-gray-300' />
                <span className='mx-2 text-gray-500 text-sm'>OU</span>
                <hr className='flex-grow border-gray-300' />
              </div>
              <button
                onClick={handleGoogleAuth}
                className='w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer mb-4'>
                <Google className='mr-2 text-xl' />
                Inscription avec Google
              </button>
              <button
                onClick={handleGithubAuth}
                className='w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='mr-2 h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.583 0-.287-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.382 1.235-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 013.003-.403c1.02.005 2.045.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.118 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.625-5.48 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.217.7.825.583C20.565 21.798 24 17.3 24 12c0-6.63-5.37-12-12-12z' />
                </svg>
                Inscription avec GitHub
              </button>
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
