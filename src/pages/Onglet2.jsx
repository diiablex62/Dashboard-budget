import React, { useState, useRef, useEffect, useContext } from "react";
import { BudgetContext } from "../context/BudgetContext";

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

function getCurrentMonthYear() {
  const now = new Date();
  return { mois: MONTHS[now.getMonth()], year: now.getFullYear() };
}

export default function Onglet2() {
  const {
    calendarDepenses = [],
    calendarRevenus = [],
    addCalendarDepense,
    addCalendarRevenu,
  } = useContext(BudgetContext);

  const [modalType, setModalType] = useState(null); // "depense" | "revenu" | null
  const [step, setStep] = useState(0);
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [showModal, setShowModal] = useState(false);

  const libelleRef = useRef(null);
  const montantRef = useRef(null);

  const current = getCurrentMonthYear();

  const resetForm = () => {
    setStep(0);
    setLibelle("");
    setMontant("");
  };

  const handleOpenModal = (type) => {
    resetForm();
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
    resetForm();
  };

  useEffect(() => {
    if (!showModal) return;
    if (step === 0 && libelleRef.current) libelleRef.current.focus();
    if (step === 1 && montantRef.current) montantRef.current.focus();
  }, [step, showModal]);

  const handleNext = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleAddCalendar = (e) => {
    e.preventDefault();
    const data = {
      libelle,
      montant: parseFloat(montant),
      mois: current.mois,
      annee: current.year,
    };
    if (modalType === "depense") {
      addCalendarDepense(data);
    } else if (modalType === "revenu") {
      addCalendarRevenu(data);
    }
    handleCloseModal();
  };

  return (
    <div className='p-6 bg-white dark:bg-black dark:text-white'>
      <div className='w-full p-0'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-3xl font-bold flex-1 dark:text-white'>
            Calendrier - {current.mois} {current.year}
          </h1>
          <button
            className='bg-green-600 text-white rounded py-2 px-4 font-semibold hover:bg-green-700 transition'
            onClick={() => handleOpenModal("revenu")}>
            Ajouter revenu
          </button>
          <button
            className='bg-red-600 text-white rounded py-2 px-4 font-semibold hover:bg-red-700 transition'
            onClick={() => handleOpenModal("depense")}>
            Ajouter dépense
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white dark:bg-black p-6 rounded-lg shadow-lg w-full max-w-md relative'>
              <button
                className='absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                onClick={handleCloseModal}
                aria-label='Fermer'>
                &times;
              </button>
              <form
                onSubmit={step === 0 ? handleNext : handleAddCalendar}
                className='flex flex-col gap-4'>
                <div className='mb-2 text-sm text-gray-700 dark:text-gray-200 space-y-1'>
                  {libelle && (
                    <div>
                      <span className='font-semibold dark:text-white'>
                        Libellé :
                      </span>{" "}
                      {libelle}
                    </div>
                  )}
                  {montant && (
                    <div>
                      <span className='font-semibold dark:text-white'>
                        Montant (€) :
                      </span>{" "}
                      {montant}
                    </div>
                  )}
                  <div>
                    <span className='font-semibold dark:text-white'>
                      Mois :
                    </span>{" "}
                    {current.mois} {current.year}
                  </div>
                </div>
                {step === 0 && (
                  <div className='flex flex-col'>
                    <label className='mb-1 font-medium dark:text-white'>
                      Libellé
                    </label>
                    <input
                      ref={libelleRef}
                      type='text'
                      value={libelle}
                      onChange={(e) => setLibelle(e.target.value)}
                      className='border rounded px-3 py-2 dark:bg-gray-800 dark:text-white'
                      placeholder='Ex : Loyer, Salaire...'
                      required
                    />
                    <button
                      type='submit'
                      className='mt-4 bg-[var(--primary-color)] text-white rounded py-2 font-semibold hover:bg-[var(--primary-hover-color)] transition'
                      disabled={!libelle}>
                      Valider
                    </button>
                  </div>
                )}
                {step === 1 && (
                  <div className='flex flex-col'>
                    <label className='mb-1 font-medium dark:text-white'>
                      Montant (€)
                    </label>
                    <input
                      ref={montantRef}
                      type='number'
                      min='0'
                      step='0.01'
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      className='border rounded px-3 py-2 dark:bg-gray-800 dark:text-white'
                      placeholder='Ex : 1200.00'
                      required
                    />
                    <button
                      type='submit'
                      className='mt-4 bg-[var(--primary-color)] text-white rounded py-2 font-semibold hover:bg-[var(--primary-hover-color)] transition'
                      disabled={!montant}>
                      Ajouter
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tableau Revenus */}
        <div className='w-full mt-8'>
          <h2 className='text-xl font-bold mb-2 dark:text-white'>
            Revenus ({current.mois} {current.year})
          </h2>
          <table className='w-full bg-white dark:bg-black rounded shadow table-fixed'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap dark:text-white'>
                  Libellé
                </th>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap dark:text-white'>
                  Montant (€)
                </th>
              </tr>
            </thead>
            <tbody>
              {calendarRevenus && calendarRevenus.length > 0 ? (
                calendarRevenus
                  .filter(
                    (r) => r.mois === current.mois && r.annee === current.year
                  )
                  .map((r, idx) => (
                    <tr key={idx} className='whitespace-nowrap'>
                      <td className='py-2 px-4 border-b whitespace-nowrap dark:text-white'>
                        {r.libelle}
                      </td>
                      <td className='py-2 px-4 border-b whitespace-nowrap dark:text-white'>
                        {r.montant.toFixed(2)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className='text-gray-500 dark:text-gray-300 text-center py-8'>
                    Aucun revenu pour ce mois.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tableau Dépenses */}
        <div className='w-full mt-8'>
          <h2 className='text-xl font-bold mb-2 dark:text-white'>
            Dépenses ({current.mois} {current.year})
          </h2>
          <table className='w-full bg-white dark:bg-black rounded shadow table-fixed'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap dark:text-white'>
                  Libellé
                </th>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap dark:text-white'>
                  Montant (€)
                </th>
              </tr>
            </thead>
            <tbody>
              {calendarDepenses && calendarDepenses.length > 0 ? (
                calendarDepenses
                  .filter(
                    (d) => d.mois === current.mois && d.annee === current.year
                  )
                  .map((d, idx) => (
                    <tr key={idx} className='whitespace-nowrap'>
                      <td className='py-2 px-4 border-b whitespace-nowrap dark:text-white'>
                        {d.libelle}
                      </td>
                      <td className='py-2 px-4 border-b whitespace-nowrap dark:text-white'>
                        {d.montant.toFixed(2)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className='text-gray-500 dark:text-gray-300 text-center py-8'>
                    Aucune dépense pour ce mois.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
