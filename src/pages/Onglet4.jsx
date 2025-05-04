import React, { useState } from "react";

export default function Onglet4() {
  const [step, setStep] = useState(0);
  const [libelle, setLibelle] = useState("");
  const [mensualite, setMensualite] = useState("");
  const [nbMensualites, setNbMensualites] = useState("");
  const [debutMois, setDebutMois] = useState("");
  const [paiements, setPaiements] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  const handleNext = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleAddPaiement = (e) => {
    e.preventDefault();
    setPaiements([
      ...paiements,
      {
        libelle,
        mensualite: parseFloat(mensualite),
        nbMensualites: parseInt(nbMensualites, 10),
        debutMois,
      },
    ]);
    handleCloseModal();
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Paiements en X fois</h1>
        <button
          className='bg-[var(--primary-color)] text-white rounded py-2 px-4 font-semibold hover:bg-[var(--primary-hover-color)] transition'
          onClick={handleOpenModal}>
          Ajouter une dépense récurrente
        </button>
      </div>

      {/* Modal étape par étape */}
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
                  : handleAddPaiement
              }
              className='flex flex-col gap-4'>
              {/* Récapitulatif en haut */}
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
                    <span className='font-semibold'>Début du mois :</span>{" "}
                    {debutMois}
                  </div>
                )}
              </div>
              {/* Étape 1 : Libellé */}
              {step === 0 && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-medium'>Libellé</label>
                  <input
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
              {/* Étape 2 : Mensualité */}
              {step === 1 && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-medium'>Mensualité (€)</label>
                  <input
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
              {/* Étape 3 : Nombre de mensualités */}
              {step === 2 && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-medium'>
                    Nombre de mensualités
                  </label>
                  <input
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
              {/* Étape 4 : Début du mois */}
              {step === 3 && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-medium'>Début du mois</label>
                  <input
                    type='text'
                    value={debutMois}
                    onChange={(e) => setDebutMois(e.target.value)}
                    className='border rounded px-3 py-2'
                    placeholder='Ex : Janvier'
                    required
                  />
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

      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white dark:bg-black rounded shadow'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b text-left'>Libellé</th>
              <th className='py-2 px-4 border-b text-left'>Mensualité (€)</th>
              <th className='py-2 px-4 border-b text-left'>
                Nombre de mensualités
              </th>
              <th className='py-2 px-4 border-b text-left'>Début du mois</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map((p, idx) => (
              <tr key={idx}>
                <td className='py-2 px-4 border-b'>{p.libelle}</td>
                <td className='py-2 px-4 border-b'>
                  {p.mensualite.toFixed(2)}
                </td>
                <td className='py-2 px-4 border-b'>{p.nbMensualites}</td>
                <td className='py-2 px-4 border-b'>{p.debutMois}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paiements.length === 0 && (
          <div className='text-gray-500 text-center py-8'>
            Aucun paiement récurrent ajouté pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
