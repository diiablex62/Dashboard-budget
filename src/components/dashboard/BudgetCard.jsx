/**
 * @file BudgetCard.jsx
 * @description Composant de carte pour afficher le budget prévisionnel
 */

import React from "react";
import { AiOutlinePieChart } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { CURRENT_MONTH } from "../../pages/Dashboard";

const BudgetCard = ({ budgetPrevisionnel }) => {
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
    </div>
  );
};

export default BudgetCard;
