import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);

  // Nouvel état pour les paiements récurrents Firestore
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);
  const [totalRecurrents, setTotalRecurrents] = useState(0);

  useEffect(() => {
    const fetchRecurrents = async () => {
      try {
        // Récupère tous les paiements récurrents
        const snapshot = await getDocs(collection(db, "recurrent"));
        const paiements = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaiementsRecurrents(paiements);

        // Calcule le total
        const total = paiements.reduce((acc, p) => acc + (p.montant || 0), 0);
        setTotalRecurrents(total);
      } catch (err) {
        console.error("Erreur Firestore fetch recurrent:", err);
      }
    };
    fetchRecurrents();
  }, []);

  // Les 3 derniers paiements récurrents (du plus ancien au plus récent)
  const derniersPaiements = [...paiementsRecurrents]
    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    .slice(-3);

  return (
    <div className='bg-[#f8fafc] min-h-screen p-6'>
      {/* Cartes du haut */}
      <div className=' grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        {/* Total dépensé */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
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
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Paiements récurrents</span>
            <AiOutlineCalendar className='text-purple-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>
            {totalRecurrents.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>
            -1.4% depuis le mois dernier
          </div>
          <button
            className='mt-3 border rounded-lg py-1 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() =>
              isLoggedIn
                ? navigate("/paiements-recurrents")
                : navigate("/auth", { state: { isLogin: true } })
            }>
            Gerer →
          </button>
        </div>
        {/* Paiements en plusieurs fois */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
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
          <button
            className='mt-3 border rounded-lg py-1 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() =>
              isLoggedIn
                ? navigate("/paiements-echelonnes")
                : navigate("/auth", { state: { isLogin: true } })
            }>
            Gerer →
          </button>
        </div>
        {/* Économies */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
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
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2'>Dépenses mensuelles</span>
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            Graphique de dépenses mensuelles
          </div>
        </div>
        {/* Répartition du budget */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2'>Répartition du budget</span>
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            Graphique camembert
          </div>
        </div>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Paiements récurrents récents */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <span className='font-semibold mb-4'>
            Paiements récurrents récents
          </span>
          <div className='space-y-3 mb-4'>
            {derniersPaiements.length > 0 ? (
              derniersPaiements.map((p, i) => (
                <div
                  key={p.id || i}
                  className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3'>
                  <div className='flex items-center'>
                    <div className='bg-blue-100 text-blue-500 rounded-full p-2 mr-3'>
                      <AiOutlineCalendar className='text-xl' />
                    </div>
                    <div>
                      <div className='font-medium'>
                        {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className='font-bold'>
                    {p.montant ? Number(p.montant).toFixed(2) : "0.00"}€
                  </div>
                </div>
              ))
            ) : (
              <div className='text-gray-400 text-center text-sm italic'>
                Aucun paiement récurrent
              </div>
            )}
          </div>
          <button
            className='border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() => navigate("/paiements-recurrents")}>
            Voir tous les paiements récurrents
          </button>
        </div>
        {/* Paiements en plusieurs fois récents */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <span className='font-semibold mb-4'>
            Paiements en plusieurs fois
            <button onClick={() => navigate("/paiements-echelonnes")}></button>
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
          <button
            className='border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() => navigate("/paiements-echelonnes")}>
            Voir tous les paiements échelonnés
          </button>
        </div>
      </div>
    </div>
  );
}
