import React from "react";

export default function Previsionnel() {
  return (
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        {/* Titre */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap'>
            Prévisionnel
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Gérez vos prévisions financières
          </p>
        </div>
      </div>
    </div>
  );
}
 