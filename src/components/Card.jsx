import React from "react";

export default function Card({ title = "Titre", description = "Description par défaut", icon }) {
  return (
    <div className='bg-white shadow-lg rounded-lg p-6 h-40 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300'>
      <div className='flex items-center space-x-4'>
        {icon && <div className='text-[var(--primary-color)] text-3xl'>{icon}</div>}
        <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
      </div>
      <p className='text-sm text-gray-500'>{description}</p>
    </div>
  );
}
