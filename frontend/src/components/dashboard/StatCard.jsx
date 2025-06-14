/**
 * @file StatCard.jsx
 * @description Composant réutilisable pour les cartes de statistiques
 */

import React from "react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative ${className}`}>
      <div className='flex items-center justify-between'>
        <span className='text-gray-900 font-bold text-xl'>{title}</span>
        {Icon && (
          <span className={`${iconBgColor} ${iconColor} rounded-full p-2`}>
            <Icon className='text-2xl' />
          </span>
        )}
      </div>
      <div className='text-2xl font-bold dark:text-white'>{value}</div>
    </div>
  );
};

export default StatCard;
