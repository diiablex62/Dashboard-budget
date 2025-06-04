/**
 * @file BudgetCard.jsx
 * @description Composant de carte pour afficher le budget prévisionnel
 */

import React, { useState } from "react";
import { AiOutlinePieChart, AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { CURRENT_MONTH, MONTH_NAMES } from "./dashboardConstantes";
import TooltipBudgetFuture from "./tooltips/TooltipBudgetFuture";

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
  const [showTooltip, setShowTooltip] = useState(false);
  const today = new Date();

  const tooltipData = {
    depensesPrevisionnelles: depensesAVenir + depensesRecEchAVenir,
    revenusPrevisionnels: revenusAVenir + revenusRecEchAVenir,
    economiePrevisionnelle: budgetPrevisionnel,
    datePrevision: today,
  };

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
      {/* Nouveau Tooltip du budget prévisionnel */}
      <div className='absolute bottom-4 right-4 group'>
        <AiOutlineInfoCircle
          className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <div className='absolute bottom-0 right-full mr-2 z-50'>
            <TooltipBudgetFuture data={tooltipData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
