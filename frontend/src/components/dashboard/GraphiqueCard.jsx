/**
 * @file GraphiqueCard.jsx
 * @description Composant réutilisable pour les cartes contenant des graphiques
 */

import React from "react";

const GraphiqueCard = ({ title, children }) => {
  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 dark:text-white'>
      <h2 className='text-lg font-semibold mb-4 text-center'>{title}</h2>
      <div className='h-[300px]'>{children}</div>
    </div>
  );
};

export default GraphiqueCard;
