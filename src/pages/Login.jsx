import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Google from "../components/Google";
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";
import { GithubAuthProvider, OAuthProvider } from "firebase/auth";
import Microsoft from "../components/Microsoft";

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

export default function Login() {
  const { setIsLoggedIn } = useContext(AppContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      setErrors({});
      toast.success("Connexion réussie !");
      localStorage.setItem("user", JSON.stringify({ email: formData.email }));
      setIsLoggedIn(true);
      navigate("/");
    } catch (validationErrors) {
      const formattedErrors = validationErrors.inner.reduce((acc, error) => {
        acc[error.path] = error.message;
        return acc;
      }, {});
      setErrors(formattedErrors);
      toast.error("Veuillez corriger les erreurs.");
    }
  };

  const handleAuthProvider = async (provider, providerName) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem(
        "user",
        JSON.stringify({ email: user.email, displayName: user.displayName })
      );
      toast.success(`Bienvenue ${user.displayName} !`);
      setIsLoggedIn(true);
      navigate("/");
    } catch {
      toast.error(`Échec de la connexion avec ${providerName}.`);
    }
  };

  return (
    <div className='w-full max-w-md p-8 rounded-lg shadow-md'>
      <h2 className='text-3xl font-extrabold text-center mb-1 text-gray-800'>
        Connexion
      </h2>
      <p className='text-center text-base text-gray-600 mb-6'>
        Connectez-vous pour continuer
      </p>
      <form onSubmit={handleSubmit}>
        {["email", "password"].map((field) => (
          <div key={field} className='mb-6'>
            <label htmlFor={field} className='block text-sm font-medium mb-1'>
              {field === "email" ? "Adresse e-mail" : "Mot de passe"}
            </label>
            <input
              id={field}
              type={field}
              value={formData[field]}
              onChange={handleChange}
              className={`w-full border ${
                errors[field] ? "border-red-500" : "border-gray-300"
              } rounded-lg p-2`}
            />
            {errors[field] && (
              <p className='text-red-500 text-sm'>{errors[field]}</p>
            )}
          </div>
        ))}
        <button
          type='submit'
          className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300'>
          Connexion
        </button>
      </form>
      <div className='flex items-center my-4'>
        <hr className='flex-grow border-gray-300' />
        <span className='mx-2 text-gray-500 text-sm'>OU</span>
        <hr className='flex-grow border-gray-300' />
      </div>
      <div className='grid grid-cols-3 gap-4'>
        <button
          onClick={() => handleAuthProvider(googleProvider, "Google")}
          className='flex flex-col items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100'>
          <Google className='text-xl mb-1' />
          <span className='text-xs'>Google</span>
        </button>
        <button
          onClick={() => handleAuthProvider(new GithubAuthProvider(), "GitHub")}
          className='flex flex-col items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 mb-1'
            fill='currentColor'
            viewBox='0 0 24 24'>
            <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.583 0-.287-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.382 1.235-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 013.003-.403c1.02.005 2.045.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.118 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.625-5.48 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.217.7.825.583C20.565 21.798 24 17.3 24 12c0-6.63-5.37-12-12-12z' />
          </svg>
          <span className='text-xs'>GitHub</span>
        </button>
        <button
          onClick={() =>
            handleAuthProvider(new OAuthProvider("microsoft.com"), "Microsoft")
          }
          className='flex flex-col items-center justify-center bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100'>
          <Microsoft className='text-xl mb-1' />
          <span className='text-xs'>Microsoft</span>
        </button>
      </div>
    </div>
  );
}
