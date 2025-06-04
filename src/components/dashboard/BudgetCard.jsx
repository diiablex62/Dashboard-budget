/**
 * @file BudgetCard.jsx
 * @description Composant de carte pour afficher le budget prévisionnel
 */

import React from "react";
import { AiOutlinePieChart, AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { CURRENT_MONTH, MONTH_NAMES } from "./dashboardConstantes";

const BudgetCard = ({
  budgetPrevisionnel,
  depensesAVenir,
  revenusAVenir,
  depensesRecEchAVenir,
  revenusRecEchAVenir,
  depenses,
  revenus,
  recurrents,
  echelonnes,
}) => {
  const today = new Date();

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      <div className='flex items-center justify-between'>
        <span className='text-gray-900 font-bold text-xl'>
          Budget prévisionnel {CURRENT_MONTH}
        </span>
        <AiOutlinePieChart className='text-2xl text-blue-600' />
      </div>
      <div
        className={`text-2xl font-bold ${
          budgetPrevisionnel >= 0 ? "text-green-600" : "text-red-600"
        }`}>
        {formatMontant(budgetPrevisionnel)}€
      </div>
      <div className='text-xs text-gray-400 mt-1'>
        Solde actuel ajusté des opérations à venir ce mois-ci.
      </div>
      {/* Tooltip du budget prévisionnel */}
      <div className='absolute bottom-4 right-4 group'>
        <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
        <div className='absolute top-0 left-full ml-2 w-96 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg'>
          <div className='font-semibold mb-2'>Montants à venir :</div>
          <div className='mb-2'>
            {depenses && depenses.length > 0 && (
              <div className='mb-2'>
                <span className='font-bold' style={{ color: "#ef4444" }}>
                  Dépenses :
                </span>
                <ul className='ml-2 list-disc'>
                  {depenses.map((item) => (
                    <li key={item.id || item.nom + item.date}>
                      {item.nom} : {formatMontant(item.montant)}€{" "}
                      <span className='text-gray-300'>
                        (le {new Date(item.date).getDate()}{" "}
                        {MONTH_NAMES[new Date(item.date).getMonth()]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className='mb-2'>
            {revenus && revenus.length > 0 && (
              <div className='mb-2'>
                <span className='font-bold' style={{ color: "#2ECC71" }}>
                  Revenus :
                </span>
                <ul className='ml-2 list-disc'>
                  {revenus.map((item) => (
                    <li key={item.id || item.nom + item.date}>
                      {item.nom} : {formatMontant(item.montant)}€{" "}
                      <span className='text-gray-300'>
                        (le {new Date(item.date).getDate()}{" "}
                        {MONTH_NAMES[new Date(item.date).getMonth()]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className='mb-2'>
            {recurrents && recurrents.length > 0 && (
              <div className='mb-2'>
                <span className='font-bold' style={{ color: "#a78bfa" }}>
                  Récurrents à venir :
                </span>
                <ul className='ml-2 list-disc'>
                  {recurrents.map((p) => (
                    <li key={p.id || p.nom + p.jourPrelevement}>
                      {p.nom} : {formatMontant(p.montant)}€{" "}
                      <span className='text-gray-300'>
                        (le {p.jourPrelevement} {MONTH_NAMES[today.getMonth()]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className='mb-2'>
            {echelonnes && echelonnes.length > 0 && (
              <div className='mb-2'>
                <span className='font-bold' style={{ color: "#4ECDC4" }}>
                  Échelonnés à venir :
                </span>
                <ul className='ml-2 list-disc'>
                  {echelonnes.map((ech) => (
                    <li key={ech.id}>
                      {ech.nom} : {formatMontant(ech.montant)}€{" "}
                      <span className='text-gray-300'>
                        (le {ech.date.getDate()}{" "}
                        {MONTH_NAMES[ech.date.getMonth()]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
