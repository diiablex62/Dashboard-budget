import React, { useContext, useState, useCallback, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AppContext } from "../context/AppContext";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import { recurrentPaymentApi } from "../utils/api";

// Données factices pour la démo
const fakePaiements = [
  {
    id: 1,
    description: "Netflix",
    categorie: "Divertissement",
    montant: 14.99,
    frequence: "Mensuel",
    date: "15/06/2025",
  },
  {
    id: 2,
    description: "Spotify",
    categorie: "Divertissement",
    montant: 9.99,
    frequence: "Mensuel",
    date: "20/06/2025",
  },
  {
    id: 3,
    description: "Salle de sport",
    categorie: "Sport",
    montant: 39.99,
    frequence: "Mensuel",
    date: "01/07/2025",
  },
  {
    id: 4,
    description: "Assurance habitation",
    categorie: "Assurance",
    montant: 20.5,
    frequence: "Mensuel",
    date: "05/07/2025",
  },
];

const PaiementRecurrent = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { primaryColor } = useContext(AppContext);
  const [paiementsRecurrents, setPaiementsRecurrents] = useState(fakePaiements);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaiements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recurrentPaymentApi.getRecurrentPayments();
      setPaiementsRecurrents(response);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements récurrents:",
        error
      );
      setError("Erreur lors de la récupération des paiements récurrents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  useEffect(() => {
    const handleDataUpdate = () => fetchPaiements();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchPaiements]);

  const categories = [
    "Divertissement",
    "Assurance",
    "Sport",
    "Logement",
    "Transport",
    "Santé",
    "Éducation",
    "Autres",
  ];

  // Calculs totaux
  const totalMensuel = paiementsRecurrents.reduce(
    (acc, p) => acc + p.montant,
    0
  );
  const totalAnnuel = totalMensuel * 12;
  const totalDepenses = totalMensuel;

  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Titre */}
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>
            PAIEMENTS RECURRENTS
          </h1>
        </div>

        {/* Cartes récapitulatives */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex items-center gap-4'>
            <div className='bg-blue-100 rounded-full p-3'>
              <AiOutlineCalendar className='text-blue-500 text-2xl' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>
                Total mensuel
              </div>
              <div className='text-xl font-bold text-gray-900'>
                {totalMensuel.toFixed(2)}€
              </div>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex items-center gap-4'>
            <div className='bg-green-100 rounded-full p-3'>
              <AiOutlineCalendar className='text-green-500 text-2xl' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>
                Total annuel
              </div>
              <div className='text-xl font-bold text-gray-900'>
                {totalAnnuel.toFixed(2)}€
              </div>
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex items-center gap-4'>
            <div className='bg-orange-100 rounded-full p-3'>
              <AiOutlineCalendar className='text-orange-500 text-2xl' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>Dépenses</div>
              <div className='text-xl font-bold text-gray-900'>
                {totalDepenses.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2'>
          <div className='text-xl font-bold mb-6'>
            Abonnements et prélèvements
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b text-gray-500'>
                <th className='text-left py-2 px-2'>Nom</th>
                <th className='text-left py-2 px-2'>Catégorie</th>
                <th className='text-right py-2 px-2'>Montant</th>
                <th className='text-center py-2 px-2'>Fréquence</th>
                <th className='text-center py-2 px-2'>Prochaine date</th>
                <th className='text-center py-2 px-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paiementsRecurrents.map((p) => (
                <tr key={p.id} className='border-b hover:bg-gray-50'>
                  <td className='py-2 px-2 font-medium'>{p.description}</td>
                  <td className='py-2 px-2'>{p.categorie}</td>
                  <td className='py-2 px-2 text-right'>
                    {p.montant.toFixed(2)}€
                  </td>
                  <td className='py-2 px-2 text-center'>{p.frequence}</td>
                  <td className='py-2 px-2 text-center'>{p.date}</td>
                  <td className='py-2 px-2 text-center'>
                    <button className='text-blue-600 font-medium hover:underline mr-4'>
                      Modifier
                    </button>
                    <button className='text-red-500 font-medium hover:underline'>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Bouton Ajouter en bas à droite */}
          <div className='flex justify-end mt-8'>
            <button className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'>
              <span className='text-lg font-bold'>+</span>
              <span>Ajouter un paiement récurrent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaiementRecurrent;
