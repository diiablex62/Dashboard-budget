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

function getDebutMoisEtAnnee(moisLabel) {
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();
  const selectedMonthIdx = MONTHS.indexOf(moisLabel);
  if (selectedMonthIdx === -1) return { mois: moisLabel, year: currentYear };
  let year = currentYear;
  if (selectedMonthIdx < currentMonthIdx) {
    year += 1;
  }
  return { mois: moisLabel, year };
}

function getFinPaiement(debut, nbMensualites) {
  // debut: {mois, year}
  const idx = MONTHS.indexOf(debut.mois);
  if (idx === -1) return "";
  const totalMonths = idx + (parseInt(nbMensualites, 10) - 1);
  const finMonthIdx = totalMonths % 12;
  const finYear = debut.year + Math.floor(totalMonths / 12);
  return `${MONTHS[finMonthIdx]} ${finYear}`;
}

export default function Onglet4() {
  const { paiements, addPaiement } = useContext(BudgetContext);

  const [step, setStep] = useState(0);
  const [libelle, setLibelle] = useState("");
  const [mensualite, setMensualite] = useState("");
  const [nbMensualites, setNbMensualites] = useState("");
  const [debutMois, setDebutMois] = useState("");
  const [showModal, setShowModal] = useState(false);

  const libelleRef = useRef(null);
  const mensualiteRef = useRef(null);
  const nbMensualitesRef = useRef(null);
  const debutMoisRef = useRef(null);

  const resetForm = () => {
    setStep(0);
    setLibelle("");
    setMensualite("");
    setNbMensualites("");
    setDebutMois("");
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  useEffect(() => {
    if (!showModal) return;
    if (step === 0 && libelleRef.current) libelleRef.current.focus();
    if (step === 1 && mensualiteRef.current) mensualiteRef.current.focus();
    if (step === 2 && nbMensualitesRef.current)
      nbMensualitesRef.current.focus();
    if (step === 3 && debutMoisRef.current) debutMoisRef.current.focus();
  }, [step, showModal]);

  const handleNext = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleAddPaiement = (e, moisValue) => {
    e.preventDefault();
    const moisLabel = moisValue !== undefined ? moisValue : debutMois;
    const debut = getDebutMoisEtAnnee(moisLabel);
    addPaiement({
      libelle,
      mensualite: parseFloat(mensualite),
      nbMensualites: parseInt(nbMensualites, 10),
      debutMois: debut.mois,
      debutAnnee: debut.year,
    });
    handleCloseModal();
  };

  const handleMoisKeyDown = (e) => {
    if (e.key === "Enter" && debutMois) {
      handleAddPaiement(e, debutMois);
    }
  };

  const handleMoisChange = (e) => {
    setDebutMois(e.target.value);
    if (e.target.value) {
      setTimeout(() => {
        debutMoisRef.current && debutMoisRef.current.blur();
        handleAddPaiement({ preventDefault: () => {} }, e.target.value);
      }, 0);
    }
  };

  return (
    <div className='p-6'>
      <div className='w-full p-0'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-3xl font-bold'>Paiements en X fois</h1>
          <button
            className='bg-[var(--primary-color)] text-white rounded py-2 px-4 font-semibold hover:bg-[var(--primary-hover-color)] transition'
            onClick={handleOpenModal}>
            Ajouter un paiement en X fois
          </button>
        </div>

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
                onSubmit={
                  step === 0
                    ? handleNext
                    : step === 1
                    ? handleNext
                    : step === 2
                    ? handleNext
                    : (e) => handleAddPaiement(e, debutMois)
                }
                className='flex flex-col gap-4'>
                <div className='mb-2 text-sm text-gray-700 dark:text-gray-200 space-y-1'>
                  {libelle && (
                    <div>
                      <span className='font-semibold'>Libellé :</span> {libelle}
                    </div>
                  )}
                  {mensualite && (
                    <div>
                      <span className='font-semibold'>Mensualité (€) :</span>{" "}
                      {mensualite}
                    </div>
                  )}
                  {nbMensualites && (
                    <div>
                      <span className='font-semibold'>
                        Nombre de mensualités :
                      </span>{" "}
                      {nbMensualites}
                    </div>
                  )}
                  {debutMois && (
                    <div>
                      <span className='font-semibold'>Début du paiement :</span>{" "}
                      {(() => {
                        const d = getDebutMoisEtAnnee(debutMois);
                        return `${d.mois} ${d.year}`;
                      })()}
                    </div>
                  )}
                  {debutMois && nbMensualites && (
                    <div>
                      <span className='font-semibold'>Fin de paiement :</span>{" "}
                      {(() => {
                        const d = getDebutMoisEtAnnee(debutMois);
                        return getFinPaiement(d, nbMensualites);
                      })()}
                    </div>
                  )}
                </div>
                {step === 0 && (
                  <div className='flex flex-col'>
                    <label className='mb-1 font-medium'>Libellé</label>
                    <input
                      ref={libelleRef}
                      type='text'
                      value={libelle}
                      onChange={(e) => setLibelle(e.target.value)}
                      className='border rounded px-3 py-2'
                      placeholder='Ex : Crédit maison, paiement en 4 fois...'
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
                    <label className='mb-1 font-medium'>Mensualité (€)</label>
                    <input
                      ref={mensualiteRef}
                      type='number'
                      min='0'
                      step='0.01'
                      value={mensualite}
                      onChange={(e) => setMensualite(e.target.value)}
                      className='border rounded px-3 py-2'
                      placeholder='Ex : 350.00'
                      required
                    />
                    <button
                      type='submit'
                      className='mt-4 bg-[var(--primary-color)] text-white rounded py-2 font-semibold hover:bg-[var(--primary-hover-color)] transition'
                      disabled={!mensualite}>
                      Valider
                    </button>
                  </div>
                )}
                {step === 2 && (
                  <div className='flex flex-col'>
                    <label className='mb-1 font-medium'>
                      Nombre de mensualités
                    </label>
                    <input
                      ref={nbMensualitesRef}
                      type='number'
                      min='1'
                      step='1'
                      value={nbMensualites}
                      onChange={(e) => setNbMensualites(e.target.value)}
                      className='border rounded px-3 py-2'
                      placeholder='Ex : 4'
                      required
                    />
                    <button
                      type='submit'
                      className='mt-4 bg-[var(--primary-color)] text-white rounded py-2 font-semibold hover:bg-[var(--primary-hover-color)] transition'
                      disabled={!nbMensualites}>
                      Valider
                    </button>
                  </div>
                )}
                {step === 3 && (
                  <div className='flex flex-col'>
                    <label className='mb-1 font-medium'>
                      Début du paiement
                    </label>
                    <select
                      ref={debutMoisRef}
                      value={debutMois}
                      onChange={handleMoisChange}
                      onKeyDown={handleMoisKeyDown}
                      className='border rounded px-3 py-2'
                      required>
                      <option value=''>Sélectionnez un mois</option>
                      {MONTHS.map((mois, idx) => (
                        <option key={mois} value={mois}>
                          {mois}
                        </option>
                      ))}
                    </select>
                    <button
                      type='submit'
                      className='mt-4 bg-[var(--primary-color)] text-white rounded py-2 font-semibold hover:bg-[var(--primary-hover-color)] transition'
                      disabled={!debutMois}>
                      Ajouter
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        <div className='w-full'>
          <table className='w-full bg-white dark:bg-black rounded shadow table-fixed'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap'>
                  Libellé
                </th>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap'>
                  Mensualité (€)
                </th>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap'>
                  Nombre de mensualités
                </th>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap'>
                  Début
                </th>
                <th className='py-2 px-4 border-b text-left whitespace-nowrap'>
                  Fin
                </th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p, idx) => {
                const debut = { mois: p.debutMois, year: p.debutAnnee };
                return (
                  <tr key={idx} className='whitespace-nowrap'>
                    <td className='py-2 px-4 border-b whitespace-nowrap'>
                      {p.libelle}
                    </td>
                    <td className='py-2 px-4 border-b whitespace-nowrap'>
                      {p.mensualite.toFixed(2)}
                    </td>
                    <td className='py-2 px-4 border-b whitespace-nowrap'>
                      {p.nbMensualites}
                    </td>
                    <td className='py-2 px-4 border-b whitespace-nowrap'>
                      {p.debutMois} {p.debutAnnee}
                    </td>
                    <td className='py-2 px-4 border-b whitespace-nowrap'>
                      {getFinPaiement(debut, p.nbMensualites)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paiements.length === 0 && (
            <div className='text-gray-500 text-center py-8'>
              Aucun paiement récurrent ajouté pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
