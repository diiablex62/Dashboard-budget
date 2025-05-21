import React, { useContext, useState, useCallback, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AppContext } from "../context/AppContext";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { recurrentPaymentApi } from "../utils/api";

const PaiementRecurrent = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { primaryColor } = useContext(AppContext);
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);
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
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1
          className={`text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}>
          Paiements récurrents
        </h1>
        <button
          className='flex items-center px-4 py-2 rounded-lg text-white'
          style={{ backgroundColor: primaryColor }}>
          <AiOutlinePlus className='mr-2' />
          Nouveau paiement
        </button>
      </div>

      {/* Filtres */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label
              className={`block mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}>
              Catégorie
            </label>
            <select
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}>
              <option value='all'>Toutes</option>
              {categories.map((categorie) => (
                <option key={categorie} value={categorie}>
                  {categorie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className={`block mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}>
              Fréquence
            </label>
            <select
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}>
              <option value='all'>Toutes</option>
              <option value='mensuel'>Mensuel</option>
              <option value='trimestriel'>Trimestriel</option>
              <option value='semestriel'>Semestriel</option>
              <option value='annuel'>Annuel</option>
            </select>
          </div>
          <div>
            <label
              className={`block mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}>
              Statut
            </label>
            <select
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}>
              <option value='all'>Tous</option>
              <option value='actif'>Actif</option>
              <option value='inactif'>Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des paiements récurrents */}
      <div
        className={`rounded-lg shadow-lg overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
        <table className='w-full'>
          <thead>
            <tr
              className={`border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}>
              <th
                className={`text-left py-3 px-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                Description
              </th>
              <th
                className={`text-left py-3 px-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                Catégorie
              </th>
              <th
                className={`text-left py-3 px-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                Fréquence
              </th>
              <th
                className={`text-left py-3 px-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                Date
              </th>
              <th
                className={`text-right py-3 px-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                Montant
              </th>
              <th
                className={`text-center py-3 px-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paiementsRecurrents.map((paiement) => (
              <tr
                key={paiement.id}
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}>
                <td
                  className={`py-3 px-4 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}>
                  {paiement.description}
                </td>
                <td
                  className={`py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  {paiement.categorie}
                </td>
                <td
                  className={`py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  {paiement.frequence}
                </td>
                <td
                  className={`py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  {paiement.date}
                </td>
                <td
                  className='py-3 px-4 text-right font-medium'
                  style={{ color: primaryColor }}>
                  {paiement.montant.toFixed(2)} €
                </td>
                <td className='py-3 px-4'>
                  <div className='flex justify-center space-x-2'>
                    <button
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}>
                      <AiOutlineEdit className='text-blue-500' />
                    </button>
                    <button
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}>
                      <AiOutlineDelete className='text-red-500' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaiementRecurrent;
