import React from "react";

export default function Profil() {
  return (
    <div className='p-8 bg-[#f8fafc] min-h-screen'>
      <h1 className='text-3xl font-bold mb-8'>PROFIL</h1>
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Carte profil */}
        <div className='bg-white rounded-xl shadow border border-gray-200 p-8 flex flex-col items-center w-full md:w-1/3'>
          <div className='flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4'>
            <span className='text-2xl font-bold text-blue-500'>JD</span>
          </div>
          <div className='text-xl font-semibold mb-1'>Jean Dupont</div>
          <div className='text-gray-500 mb-6'>jean.dupont@example.com</div>
          <button className='w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition'>
            Modifier la photo
          </button>
        </div>
        {/* Formulaire infos */}
        <div className='bg-white rounded-xl shadow border border-gray-200 p-8 flex-1'>
          <h2 className='text-lg font-semibold mb-6'>
            Informations personnelles
          </h2>
          <form className='space-y-6'>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <label className='block text-sm font-medium mb-1'>Prénom</label>
                <input
                  type='text'
                  className='w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
                  value='Jean'
                  readOnly
                />
              </div>
              <div className='flex-1'>
                <label className='block text-sm font-medium mb-1'>Nom</label>
                <input
                  type='text'
                  className='w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
                  value='Dupont'
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Email</label>
              <input
                type='email'
                className='w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
                value='jean.dupont@example.com'
                readOnly
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Téléphone
              </label>
              <input
                type='text'
                className='w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
                value='+33 6 12 34 56 78'
                readOnly
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Adresse</label>
              <input
                type='text'
                className='w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100'
                value='123 Rue de la Paix'
                readOnly
              />
            </div>
            <button
              type='button'
              className='bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition'>
              Sauvegarder les modifications
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
