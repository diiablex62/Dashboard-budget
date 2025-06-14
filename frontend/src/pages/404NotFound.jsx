import React from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4'>
      <div className='text-center'>
        <h1 className='text-9xl font-bold text-gray-900 dark:text-white'>
          404
        </h1>
        <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4'>
          Page non trouvée
        </h2>
        <p className='text-gray-600 dark:text-gray-400 mt-2 mb-8'>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className='inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors'>
          <AiOutlineHome className='text-xl' />
          Retour au dashboard
        </button>
      </div>
    </div>
  );
}
