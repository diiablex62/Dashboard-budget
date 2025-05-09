import React from "react";
import { HiArrowDownCircle, HiArrowUpCircle } from "react-icons/hi2";

export default function DepensesRevenus() {
  return (
    <div className='bg-[#f8fafc] min-h-screen p-8'>
      <div className='max-w-3xl mx-auto bg-white rounded-2xl shadow border border-[#ececec] p-8'>
        <div className='flex items-center gap-3 mb-4'>
          <HiArrowDownCircle className='text-red-500' size={24} />
          <HiArrowUpCircle className='text-green-500' size={24} />
          <h1 className='text-2xl font-bold text-[#222]'>Dépenses & Revenus</h1>
        </div>
        <p className='text-gray-600 mb-6'>
          Ajoutez ici vos dépenses et revenus manuels pour compléter votre
          budget prévisionnel.
        </p>
        {/* À compléter : formulaire d'ajout, liste, etc. */}
        <div className='text-gray-400 italic text-center py-12'>
          Fonctionnalité à venir : saisie manuelle des mouvements financiers.
        </div>
      </div>
    </div>
  );
}

// Vérifie que tu as bien ajouté la route dans ton routeur (ex: App.jsx ou Routes.jsx)
// Exemple avec react-router-dom v6+ :

// import DepensesRevenus from "./pages/DepensesRevenus";
// ...dans le composant Routes ou App...
// <Route path="/depenses-revenus" element={<DepensesRevenus />} />

// Si tu vois le Dashboard, c'est probablement parce que la route "/depenses-revenus" n'est pas déclarée
// ou qu'elle pointe vers le mauvais composant dans ton routeur principal.
// Corrige la déclaration de la route pour pointer vers DepensesRevenus.
