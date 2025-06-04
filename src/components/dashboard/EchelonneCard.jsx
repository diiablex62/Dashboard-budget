/**
 * @file EchelonneCard.jsx
 * @description Composant de carte pour afficher les informations des paiements échelonnés
 */

import React from "react";
import { AiOutlineCreditCard, AiOutlineInfoCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { formatMontant } from "../../utils/calcul";

const EchelonneCard = () => {
  const navigate = useNavigate();

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      <div className='flex items-center justify-between'>
        <span className='text-gray-900 font-bold text-xl'>
          Paiements échelonnés
        </span>
        <AiOutlineCreditCard className='text-2xl text-green-600' />
      </div>
      <div className='flex items-baseline gap-1'>
        <span className='text-2xl font-bold dark:text-white'>
          {formatMontant(0)}€
        </span>
        <span className='text-xs text-gray-400 font-normal'>/mois</span>
      </div>
      <button
        className='mt-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
        onClick={() => navigate("/echelonne")}>
        Gérer →
      </button>
      <button className='absolute bottom-4 right-4 text-gray-400 hover:text-gray-600 cursor-help text-lg'>
        <AiOutlineInfoCircle />
      </button>
    </div>
  );
};

export default EchelonneCard;
