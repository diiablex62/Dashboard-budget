/**
 * @file BudgetCard.jsx
 * @description Composant de carte pour afficher le budget prévisionnel
 */

import React from "react";
import { AiOutlinePieChart, AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { CURRENT_MONTH, MONTH_NAMES } from "./dashboardConstantes";
import TooltipBudgetFuture from "./tooltips/TooltipBudgetFuture";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const BudgetCard = ({ budgetPrevisionnel }) => {
  const navigate = useNavigate();

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      {/* Titre et montant */}
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
      <Button
        onClick={() => navigate("/previsionnel")}
        className='mt-4 self-end'>
        Voir le détail prévisionnel
      </Button>
    </div>
  );
};

export default BudgetCard;
