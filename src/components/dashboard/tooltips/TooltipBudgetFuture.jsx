/**
 * @file TooltipBudgetFuture.jsx
 * @description Tooltip statique pour afficher toutes les sections du budget prévisionnel, avec le même style que le tooltip des dépenses.
 */

import React from "react";

const TooltipBudgetFuture = () => (
  <div className='absolute top-0 right-full mr-2 w-80 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg'>
    <div>
      <div className='mb-2'>
        <span className='font-semibold'>
          Budget actuel (du 1 du mois jusqu'à aujourd'hui) :
        </span>{" "}
        0,00€
      </div>

      <div className='mb-2 mt-4'>
        <span className='font-semibold'>
          Budget prévisionnel à la fin du mois :
        </span>{" "}
        0,00€
      </div>
      <ul className='mb-2'>
        <li className='text-red-400'>
          <span className='font-bold' style={{ color: "#ef4444" }}>
            Dépenses :
          </span>{" "}
          0,00€
        </li>
        <li className='text-blue-400'>Paiements récurrents : 0,00€</li>
        <li className='text-purple-400'>Paiements échelonnés : 0,00€</li>
      </ul>
      <div className='mb-2'>
        <span className='font-semibold'>
          Total des dépenses du mois précédent :
        </span>{" "}
        0,00€
      </div>
      <ul>
        <li className='text-red-400'>
          <span className='font-bold' style={{ color: "#ef4444" }}>
            Dépenses :
          </span>{" "}
          0,00€
        </li>
        <li className='text-blue-400'>
          Paiements récurrents (dépense) : 0,00€
        </li>
        <li className='text-purple-400'>
          Paiements échelonnés (dépense) : 0,00€
        </li>
      </ul>
    </div>
  </div>
);

export default TooltipBudgetFuture;
