/**
 * @file TooltipEconomie.jsx
 * @description Composant de tooltip pour afficher les détails des économies
 */

import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

const TooltipEconomie = ({
  totalRevenusJusquaAujourdhui = 0,
  totalDepenseJusquaAujourdhui = 0,
  totalEconomiesJusquaAujourdhui = 0,
  totalRevenus = 0,
  totalDepense = 0,
  totalEconomies = 0,
  totalRevenusMoisPrecedent = 0,
  totalDepenseMoisPrecedent = 0,
  totalEconomiesMoisPrecedent = 0,
}) => {
  return (
    <div className='absolute bottom-2 right-2 group'>
      <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
      <div className='absolute top-0 left-full ml-2 w-96 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg'>
        <p className='font-semibold mb-0'>Comprendre le calcul : </p>
        <ul className='list-disc list-inside space-y-0.5'>
          <li className='text-green-400'>
            Total revenus :{" "}
            {totalRevenusJusquaAujourdhui.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
          <li className='text-red-400'>
            Total dépenses :{" "}
            {totalDepenseJusquaAujourdhui.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
          <li className='text-white'>
            Total économies :{" "}
            {totalEconomiesJusquaAujourdhui.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
        </ul>
        <div className='h-1' />
        <div className='font-semibold mt-1 mb-0'>
          Prévisionnel pour la fin du mois :
        </div>
        <ul className='list-disc list-inside space-y-0.5'>
          <li className='text-green-400'>
            Total revenus :{" "}
            {totalRevenus.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
          <li className='text-red-400'>
            Total dépenses :{" "}
            {totalDepense.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
          <li className='text-white'>
            Total économies :{" "}
            {totalEconomies.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
        </ul>
        <div className='h-1' />
        <div className='font-semibold mt-1 mb-0'>Mois précédent :</div>
        <ul className='list-disc list-inside space-y-0.5'>
          <li className='text-green-400'>
            Revenu :{" "}
            {totalRevenusMoisPrecedent.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
          <li className='text-red-400'>
            Dépenses :{" "}
            {totalDepenseMoisPrecedent.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
          <li className='text-white'>
            Total économies :{" "}
            {totalEconomiesMoisPrecedent.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </li>
        </ul>
        <div className='mt-1 text-[10px] text-gray-300'>
          Les économies sont calculées en soustrayant le total des dépenses du
          total des revenus.
        </div>
      </div>
    </div>
  );
};

export default TooltipEconomie;
