import React from "react";
import {
  AiOutlineDashboard,
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className='p-6 bg-[#f8fafc] min-h-screen'>
      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        {/* Total dépensé */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Total dépensé</span>
            <span className='bg-blue-100 text-blue-600 rounded px-2 py-1 text-xs font-bold'>
              1
            </span>
          </div>
          <div className='text-2xl font-bold mb-1'>2,456.78€</div>
          <div className='text-xs text-gray-400'>
            +3.2% depuis le mois dernier
          </div>
        </div>
        {/* Paiements récurrents */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Paiements récurrents</span>
            <AiOutlineCalendar className='text-purple-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>451.32€</div>
          <div className='text-xs text-gray-400'>
            -1.4% depuis le mois dernier
          </div>
          <button className='mt-3 border rounded-lg py-1 text-sm font-medium hover:bg-gray-50 transition'>
            Gerer →
          </button>
        </div>
        {/* Paiements en plusieurs fois */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>
              Paiements en plusieurs fois
            </span>
            <AiOutlineCreditCard className='text-green-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>985.65€</div>
          <div className='text-xs text-gray-400'>
            +5.7% depuis le mois dernier
          </div>
          <button className='mt-3 border rounded-lg py-1 text-sm font-medium hover:bg-gray-50 transition'>
            Gerer →
          </button>
        </div>
        {/* Économies */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Économies</span>
            <AiOutlineRise className='text-orange-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>1,258.44€</div>
          <div className='text-xs text-gray-400'>
            +2.5% depuis le mois dernier
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Dépenses mensuelles */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2'>Dépenses mensuelles</span>
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            Graphique de dépenses mensuelles
          </div>
        </div>
        {/* Répartition du budget */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2'>Répartition du budget</span>
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            Graphique camembert
          </div>
        </div>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Paiements récurrents récents */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <span className='font-semibold mb-4'>
            Paiements récurrents récents
          </span>
          <div className='space-y-3 mb-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3'>
                <div className='flex items-center'>
                  <div className='bg-blue-100 text-blue-500 rounded-full p-2 mr-3'>
                    <AiOutlineCalendar className='text-xl' />
                  </div>
                  <div>
                    <div className='font-medium'>Netflix</div>
                    <div className='text-xs text-gray-400'>
                      Abonnement mensuel
                    </div>
                  </div>
                </div>
                <div className='font-bold'>14,99€</div>
              </div>
            ))}
          </div>
          <button className='border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition'>
            Voir tous les paiements récurrents
          </button>
        </div>
        {/* Paiements en plusieurs fois récents */}
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <span className='font-semibold mb-4'>
            Paiements en plusieurs fois
          </span>
          <div className='space-y-3 mb-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3'>
                <div className='flex items-center'>
                  <div className='bg-green-100 text-green-500 rounded-full p-2 mr-3'>
                    <FaCalendarAlt className='text-xl' />
                  </div>
                  <div>
                    <div className='font-medium'>iPhone 13</div>
                    <div className='text-xs text-gray-400'>3/12 paiements</div>
                  </div>
                </div>
                <div className='font-bold'>83,25€</div>
              </div>
            ))}
          </div>
          <button className='border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition'>
            Voir tous les paiements en plusieurs fois
          </button>
        </div>
      </div>
    </div>
  );
}
