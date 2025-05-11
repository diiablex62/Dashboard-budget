import React, { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

// Couleurs et icônes pour correspondre à l'image
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Fake data pour l'exemple visuel
const fakeDepenses = [
  {
    nom: "Courses Supermarché",
    montant: -120,
    date: "2025-05-02",
    categorie: "Alimentation",
    icon: "€",
  },
  {
    nom: "Loyer Appartement",
    montant: -850,
    date: "2025-05-01",
    categorie: "Logement",
    icon: "€",
  },
  {
    nom: "Restaurant avec Amis",
    montant: -45,
    date: "2025-05-14",
    categorie: "Loisirs",
    icon: "€",
  },
  {
    nom: "Vêtements",
    montant: -90,
    date: "2025-05-17",
    categorie: "Shopping",
    icon: "€",
  },
  {
    nom: "Facture Électricité",
    montant: -75,
    date: "2025-05-10",
    categorie: "Factures",
    icon: "€",
  },
  {
    nom: "Abonnement Transport",
    montant: -65,
    date: "2025-05-05",
    categorie: "Transport",
    icon: "€",
  },
  {
    nom: "Pharmacie",
    montant: -32,
    date: "2025-05-08",
    categorie: "Santé",
    icon: "€",
  },
];

const fakeRevenus = [
  {
    nom: "Salaire",
    montant: 3500,
    date: "2025-05-01",
    categorie: "Travail",
    icon: "€",
  },
  {
    nom: "Vente occasion",
    montant: 300,
    date: "2025-05-10",
    categorie: "Autre",
    icon: "€",
  },
];

function getMonthYear(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DepensesRevenus() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 1)); // Mai 2025
  const [tab, setTab] = useState("depenses"); // "revenus" ou "depenses"

  // Filtres sur le mois sélectionné
  const revenus = fakeRevenus.filter(
    (r) =>
      new Date(r.date).getMonth() === selectedDate.getMonth() &&
      new Date(r.date).getFullYear() === selectedDate.getFullYear()
  );
  const depenses = fakeDepenses.filter(
    (d) =>
      new Date(d.date).getMonth() === selectedDate.getMonth() &&
      new Date(d.date).getFullYear() === selectedDate.getFullYear()
  );

  const totalRevenus = revenus.reduce((acc, r) => acc + (r.montant || 0), 0);
  const totalDepenses = depenses.reduce(
    (acc, d) => acc + Math.abs(d.montant || 0),
    0
  );
  const solde = totalRevenus - totalDepenses;

  const handlePrevMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };
  const handleNextMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const showEmpty =
    tab === "revenus" ? revenus.length === 0 : depenses.length === 0;

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-[#222] dark:text-white mb-1'>
              Dépenses & Revenus
            </h1>
            <div className='text-gray-500 dark:text-gray-400 text-base'>
              Gérez vos revenus et dépenses mensuels.
            </div>
          </div>
          {/* Sélecteur mois/année style image */}
          <div className='flex items-center mt-4 md:mt-0'>
            <div className='flex items-center bg-[#f6f9fb] dark:bg-black rounded-xl px-4 py-2 shadow-none border border-transparent'>
              <button
                className='text-[#222] dark:text-white text-xl px-2 py-1 rounded hover:bg-[#e9eef2] dark:hover:bg-gray-900 transition'
                onClick={handlePrevMonth}
                aria-label='Mois précédent'
                type='button'
                style={{ lineHeight: 1 }}>
                <AiOutlineArrowLeft />
              </button>
              <span className='font-semibold text-lg px-4 select-none text-[#222] dark:text-white'>
                {getMonthYear(selectedDate)}
              </span>
              <button
                className='text-[#222] dark:text-white text-xl px-2 py-1 rounded hover:bg-[#e9eef2] dark:hover:bg-gray-900 transition'
                onClick={handleNextMonth}
                aria-label='Mois suivant'
                type='button'
                style={{ lineHeight: 1 }}>
                <AiOutlineArrowRight />
              </button>
            </div>
          </div>
        </div>
        {/* Indicateurs */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-4'>
          {/* Total Revenus */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
              <FaArrowDown className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Revenus</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalRevenus.toFixed(2)} €
            </div>
          </div>
          {/* Total Dépenses */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-red-600 dark:text-red-400 mb-2'>
              <FaArrowUp className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Dépenses</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalDepenses.toFixed(2)} €
            </div>
          </div>
          {/* Solde */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl text-gray-700 dark:text-gray-300 font-bold mr-2'>
                €
              </span>
              <span className='text-sm font-semibold text-gray-600 dark:text-gray-400'>
                Solde
              </span>
            </div>
            <div
              className={`text-2xl ${
                solde >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
              {solde.toFixed(2)} €
            </div>
          </div>
        </div>
        {/* Switch revenus/dépenses style image */}
        <div className='flex justify-center mt-6 mb-2'>
          <div className='flex w-full max-w-xl bg-[#f3f6fa] dark:bg-black rounded-xl p-1'>
            <button
              className={`flex-1 py-3 rounded-lg font-semibold text-lg transition text-center
                ${
                  tab === "revenus"
                    ? "bg-white dark:bg-black text-[#111827] dark:text-white shadow font-semibold border border-[#e5eaf1] dark:border-gray-800"
                    : "bg-transparent text-[#7b849b] dark:text-gray-400 font-normal"
                }
              `}
              onClick={() => setTab("revenus")}
              type='button'>
              Revenus
            </button>
            <button
              className={`flex-1 py-3 rounded-lg font-semibold text-lg transition text-center
                ${
                  tab === "depenses"
                    ? "bg-white dark:bg-black text-[#111827] dark:text-white shadow font-semibold border border-[#e5eaf1] dark:border-gray-800"
                    : "bg-transparent text-[#7b849b] dark:text-gray-400 font-normal"
                }
              `}
              onClick={() => setTab("depenses")}
              type='button'>
              Dépenses
            </button>
          </div>
        </div>
        {/* Liste revenus/dépenses */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-2'>
          {tab === "revenus" ? (
            <>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-2xl font-bold dark:text-white'>
                  Revenus du mois
                </div>
                <button className='bg-gray-900 dark:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 transition cursor-pointer'>
                  Ajouter un revenu
                </button>
              </div>
              <div className='text-gray-500 dark:text-gray-400 mb-6'>
                Liste de tous vos revenus pour {getMonthYear(selectedDate)}
              </div>
              {showEmpty ? (
                <div className='flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-black rounded-lg px-6 py-12'>
                  <span className='text-gray-400 dark:text-gray-500 text-lg mb-4'>
                    Aucun revenu pour ce mois
                  </span>
                  <button className='bg-gray-900 dark:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 transition cursor-pointer'>
                    Ajouter un revenu
                  </button>
                </div>
              ) : (
                <div className='grid md:grid-cols-2 gap-4'>
                  {revenus.map((r, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between bg-[#f8fafc] dark:bg-black rounded-lg px-6 py-5 border border-[#ececec] dark:border-gray-800'>
                      <div>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-2xl text-green-600 dark:text-green-400'>
                            {r.icon}
                          </span>
                          <span className='font-semibold text-[#222] dark:text-white'>
                            {r.nom}
                          </span>
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          {formatDate(r.date)} • {r.categorie}
                        </div>
                      </div>
                      <div className='font-bold text-green-600 dark:text-green-400 text-lg'>
                        {r.montant.toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-2xl font-bold dark:text-white'>
                  Dépenses du mois
                </div>
                <button className='bg-gray-900 dark:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 transition cursor-pointer'>
                  Ajouter une dépense
                </button>
              </div>
              <div className='text-gray-500 dark:text-gray-400 mb-6'>
                Liste de toutes vos dépenses pour {getMonthYear(selectedDate)}
              </div>
              {showEmpty ? (
                <div className='flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-black rounded-lg px-6 py-12'>
                  <span className='text-gray-400 dark:text-gray-500 text-lg mb-4'>
                    Aucune dépense pour ce mois
                  </span>
                  <button className='bg-gray-900 dark:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 transition cursor-pointer'>
                    Ajouter une dépense
                  </button>
                </div>
              ) : (
                <div className='grid md:grid-cols-2 gap-4'>
                  {depenses.map((d, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between bg-[#f8fafc] dark:bg-black rounded-lg px-6 py-5 border border-[#ececec] dark:border-gray-800'>
                      <div>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-2xl text-[#222] dark:text-white'>
                            {d.icon}
                          </span>
                          <span className='font-semibold text-[#222] dark:text-white'>
                            {d.nom}
                          </span>
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          {formatDate(d.date)} • {d.categorie}
                        </div>
                      </div>
                      <div className='font-bold text-red-500 dark:text-red-400 text-lg'>
                        {d.montant.toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
