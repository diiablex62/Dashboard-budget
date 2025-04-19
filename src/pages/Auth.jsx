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
      toast.success("Connexion réussie ! Redirection en cours...", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        setIsLoggedIn(true);
        navigate("/");
      }, 3000);
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
                {errors.email === "" && (
                  <>
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
                    <PasswordCriteria password={formData.password} />
                  </>
                )}
                <button
                  type='submit'
                  className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'>
                  Connexion
                </button>
              </form>
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
                {errors.email === "" && (
                  <>
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
                    <PasswordCriteria password={formData.password} />
                  </>
                )}
                <button
                  type='submit'
                  className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'>
                  Inscription
                </button>
              </form>
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
