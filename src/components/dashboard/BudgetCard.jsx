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
  depenses = [],
  revenus = [],
  recurrents = [],
  echelonnes = [],
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
      {/* Icône info dans le coin supérieur droit de la carte */}
      <div
        className='absolute top-2 right-2 z-10'
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>
        <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
        {showTooltip && (
          <TooltipBudgetFuture
            depenseRevenu={[...(depenses || []), ...(revenus || [])]}
            paiementsRecurrents={recurrents || []}
            paiementsEchelonnes={echelonnes || []}
            isCurrentMonth={(date) =>
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            }
            isFuture={(date) => date > today}
            today={today}
          />
        )}
      </div>
      <div className='flex items-center justify-between'>
        <div className='relative flex-1'>
          <span className='text-gray-500 font-medium'>
            Budget prévisionnel {CURRENT_MONTH}
          </span>
        </div>
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
