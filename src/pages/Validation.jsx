import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { sendMagicLink } from "../email/login";

export default function Validation({ onResend }) {
  const location = useLocation();
  const email = location.state?.email || "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(true);

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await sendMagicLink(email);
      setResent(true);
      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de l'envoi du lien. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto mt-16 bg-white p-8 rounded shadow'>
      <h2 className='text-2xl font-bold mb-4 text-center'>
        Vérifiez votre boîte mail
      </h2>
      {success && (
        <p className='text-green-600 text-center mb-4'>
          Un email de connexion vient de vous être envoyé à <b>{email}</b>.
          <br />
          Cliquez sur le lien dans votre boîte mail pour continuer.
        </p>
      )}
      <p className='mb-4 text-center'>
        Si vous n'avez rien reçu, vérifiez vos spams ou renvoyez le lien&nbsp;:
      </p>
      <button
        className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer'
        onClick={handleResend}
        disabled={resent || loading}>
        {loading
          ? "Envoi en cours..."
          : resent
          ? "Lien renvoyé !"
          : "Renvoyer le lien"}
      </button>
      {resent && (
        <p className='text-green-600 text-center mt-2'>
          Un nouveau lien a été envoyé.
        </p>
      )}
      {error && <p className='text-red-600 text-center mt-2'>{error}</p>}
    </div>
  );
}
