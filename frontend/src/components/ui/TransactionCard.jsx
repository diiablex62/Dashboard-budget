import React from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import { formatMontant } from "../../utils/calcul";

const TransactionCard = ({
  transaction,
  type,
  categories,
  onEdit,
  onDelete,
}) => {
  if (!transaction) {
    console.error("TransactionCard: transaction prop is undefined or null", {
      transaction,
      type,
      categories,
    });
    return null; // ou un fallback UI
  }

  return (
    <div className='group bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 px-6 py-3 flex-1 min-h-[70px] flex flex-col justify-center transition-all duration-200 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-600'>
      <div className='grid grid-cols-2 items-center h-full w-full'>
        {/* Colonne gauche : nom (gros), puis catégorie (petit) */}
        <div className='flex flex-col justify-center min-w-0'>
          <div className='min-w-0'>
            <div className='font-bold dark:text-white truncate max-w-[220px] text-lg'>
              {transaction.nom?.charAt(0).toUpperCase() +
                transaction.nom?.slice(1)}
            </div>
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-300 truncate max-w-[180px] mt-0.5 ml-0 font-normal'>
            {transaction.categorie}
          </div>
        </div>
        {/* Colonne droite : montant et date */}
        <div className='flex flex-col items-end justify-center min-w-0'>
          <div
            className={`font-bold ${
              transaction.type === "depense" ? "text-red-600" : "text-green-600"
            } text-base truncate`}>
            {transaction.type === "depense" ? "-" : "+"}
            {formatMontant(parseFloat(transaction.montant))}€
          </div>
          <div className='text-xs text-gray-400 dark:text-gray-300 truncate mt-0.5'>
            {new Date(transaction.date).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
      {/* Boutons Modifier/Supprimer en bas à droite sur une 3e ligne, visibles au hover */}
      <div className='flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <button
          className='text-blue-600 hover:bg-blue-100 p-1 rounded-full transition dark:text-blue-400 dark:hover:bg-blue-900'
          title='Modifier'
          onClick={onEdit}>
          <FiEdit className='text-base' />
        </button>
        <button
          className='text-red-500 hover:bg-red-100 p-1 rounded-full transition dark:text-red-400 dark:hover:bg-red-900'
          title='Supprimer'
          onClick={onDelete}>
          <FiTrash className='text-base' />
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;
