import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  AiOutlinePlus,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import {
  ECHELONNE_CATEGORIES,
  getMonthYear,
  MONTHS,
  CATEGORY_COLORS,
} from "../utils/categoryUtils";
import { fakePaiementsEchelonnes } from "../utils/fakeData";

const PaiementEchelonne = () => {
  const defaultDebutDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const [selectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    montant: "",
    mensualites: "",
    debutDate: defaultDebutDate,
    categorie: "",
    type: "depense",
  });
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState(
    fakePaiementsEchelonnes
  );
  const [error, setError] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isRevenus, setIsRevenus] = useState(false);

  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const mensualitesInputRef = useRef(null);
  const debutDateInputRef = useRef(null);
  const categorieInputRef = useRef(null);

  useEffect(() => {
    if (showModal && step === 1 && nomInputRef.current)
      nomInputRef.current.focus();
    if (showModal && step === 2 && montantInputRef.current)
      montantInputRef.current.focus();
    if (showModal && step === 3 && mensualitesInputRef.current)
      mensualitesInputRef.current.focus();
    if (showModal && step === 4 && debutDateInputRef.current)
      debutDateInputRef.current.focus();
  }, [showModal, step]);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  const handleChange = useCallback((e) => {
    setNewPaiement((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleAddOrEditPaiement = useCallback(() => {
    if (
      !newPaiement.nom ||
      !newPaiement.montant ||
      !newPaiement.mensualites ||
      !newPaiement.debutDate
    ) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const paymentData = {
      ...newPaiement,
      montant: parseFloat(newPaiement.montant),
      mensualites: parseInt(newPaiement.mensualites),
    };

    if (editIndex !== null) {
      // Edition locale
      setPaiementsEchelonnes((prev) =>
        prev.map((p) =>
          p.id === editIndex ? { ...paymentData, id: editIndex } : p
        )
      );
    } else {
      // Ajout local
      const newId = Math.max(...paiementsEchelonnes.map((p) => p.id), 0) + 1;
      setPaiementsEchelonnes((prev) => [
        ...prev,
        { ...paymentData, id: newId },
      ]);
    }

    setNewPaiement({
      nom: "",
      montant: "",
      mensualites: "",
      debutDate: defaultDebutDate,
      categorie: "",
      type: "depense",
    });
    setEditIndex(null);
    setShowModal(false);
    setError(null);
  }, [newPaiement, editIndex, defaultDebutDate, paiementsEchelonnes]);

  const handleEdit = useCallback((payment) => {
    setNewPaiement({
      nom: payment.nom,
      montant: payment.montant.toString(),
      mensualites: payment.mensualites.toString(),
      debutDate: payment.debutDate,
      categorie: payment.categorie || "",
      type: payment.type || "depense",
    });
    setEditIndex(payment.id);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce paiement échelonné ?"
      )
    )
      return;
    setPaiementsEchelonnes((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const totalDepenses = useMemo(() => {
    if (!paiementsEchelonnes.length) return 0;
    return paiementsEchelonnes.reduce((acc, p) => {
      if (!p.montant || !p.mensualites) return acc;
      const montantMensuel = parseFloat(p.montant) / parseFloat(p.mensualites);
      return acc + montantMensuel;
    }, 0);
  }, [paiementsEchelonnes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "paiementsEchelonnesTotal",
        totalDepenses.toString()
      );
      window.paiementsEchelonnesTotal = totalDepenses;
      window.dispatchEvent(
        new CustomEvent("paiements-echelonnes-updated", {
          detail: { total: totalDepenses },
        })
      );
    }
  }, [totalDepenses]);

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Titre */}
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Paiements Échelonnés
          </h1>
        </div>

        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Carte 1: Total Mensuel */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-blue-600 dark:text-blue-400 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Mensuel</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalDepenses.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>

          {/* Carte 2: Paiements Actifs */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
              <AiOutlineCalendar className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Paiements Actifs</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {paiementsEchelonnes.length} paiements
            </div>
          </div>
        </div>

        {/* Switch Dépenses/Revenus */}
        <div className='flex justify-center mb-6'>
          <div className='flex w-full max-w-xl bg-[#f3f6fa] dark:bg-black rounded-xl p-1'>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
                !isRevenus
                  ? "bg-white dark:bg-black text-[#111827] dark:text-white shadow font-semibold border border-[#e5eaf1] dark:border-gray-800"
                  : "bg-transparent text-[#7b849b] dark:text-gray-400 font-normal"
              }`}
              onClick={() => setIsRevenus(false)}
              type='button'>
              Dépenses
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
                isRevenus
                  ? "bg-white dark:bg-black text-[#111827] dark:text-white shadow font-semibold border border-[#e5eaf1] dark:border-gray-800"
                  : "bg-transparent text-[#7b849b] dark:text-gray-400 font-normal"
              }`}
              onClick={() => setIsRevenus(true)}
              type='button'>
              Revenus
            </button>
          </div>
        </div>

        {/* Affichage des paiements échelonnés */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-2'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222] dark:text-white'>
                Paiements Échelonnés
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Paiements du mois de {getMonthYear(selectedDate)}
              </div>
            </div>
            {/* Bouton Ajouter */}
            <div className='flex justify-end mt-8'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={() => {
                  setNewPaiement({
                    nom: "",
                    montant: "",
                    mensualites: "",
                    debutDate: new Date(selectedDate)
                      .toISOString()
                      .split("T")[0],
                    categorie: "",
                    type: isRevenus ? "revenu" : "depense",
                  });
                  setEditIndex(null);
                  setShowModal(true);
                  setStep(1);
                }}>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter un paiement échelonné</span>
              </button>
            </div>
          </div>

          {paiementsEchelonnes.filter(
            (p) => p.type === (isRevenus ? "revenu" : "depense")
          ).length === 0 ? (
            <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
              <p>
                Aucun paiement échelonné {isRevenus ? "revenu" : "dépense"} pour{" "}
                {getMonthYear(selectedDate)}.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {paiementsEchelonnes
                .filter((p) => p.type === (isRevenus ? "revenu" : "depense"))
                .map((paiement) => (
                  <div
                    key={paiement.id}
                    className='bg-white dark:bg-black rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 flex flex-col transition-all duration-200'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3'>
                          <AiOutlineDollarCircle className='text-gray-600 dark:text-gray-300 text-xl' />
                        </div>
                        <div>
                          <div className='font-semibold dark:text-white'>
                            {paiement.nom.charAt(0).toUpperCase() +
                              paiement.nom.slice(1)}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {paiement.categorie}
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                        <div className='font-bold text-green-600 dark:text-green-400'>
                          {(
                            parseFloat(paiement.montant) /
                            parseFloat(paiement.mensualites)
                          ).toFixed(2)}{" "}
                          €/mois
                        </div>
                        <div className='text-xs text-gray-400'>
                          {paiement.mensualites} mensualités
                        </div>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5'>
                        <div
                          className='bg-green-600 dark:bg-green-400 h-2.5 rounded-full'
                          style={{
                            width: `${
                              (paiement.mensualitesPayees /
                                paiement.mensualites) *
                              100
                            }%`,
                          }}></div>
                      </div>
                      <div className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                        Mensualité {paiement.mensualitesPayees || 1}/
                        {paiement.mensualites}
                      </div>
                    </div>

                    <div className='flex justify-end mt-4'>
                      <button
                        className='text-blue-600 dark:text-blue-400 font-medium hover:underline mr-4'
                        onClick={() => handleEdit(paiement)}>
                        Modifier
                      </button>
                      <button
                        className='text-red-500 dark:text-red-400 font-medium hover:underline'
                        onClick={() => handleDelete(paiement.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modale */}
      {showModal && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center'
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
            <button
              className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              onClick={() => {
                setShowModal(false);
                setStep(1);
                setNewPaiement({
                  nom: "",
                  montant: "",
                  mensualites: "",
                  debutDate: new Date(selectedDate).toISOString().split("T")[0],
                  categorie: "",
                  type: isRevenus ? "revenu" : "depense",
                });
                setEditIndex(null);
                setError(null);
              }}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              {editIndex !== null ? "Modifier" : "Ajouter"} un paiement
              échelonné
            </div>

            {/* Récapitulatif dynamique */}
            <div className='mb-4 dark:text-gray-300'>
              {newPaiement.nom && (
                <div>
                  <span className='font-medium'>Libellé :</span>{" "}
                  {newPaiement.nom.charAt(0).toUpperCase() +
                    newPaiement.nom.slice(1)}
                </div>
              )}
              {step > 1 && newPaiement.montant && (
                <div>
                  <span className='font-medium'>Montant total :</span>{" "}
                  {parseFloat(newPaiement.montant).toFixed(2)} €
                </div>
              )}
              {step > 2 && newPaiement.mensualites && (
                <div>
                  <span className='font-medium'>Nombre de mensualités :</span>{" "}
                  {newPaiement.mensualites}
                </div>
              )}
              {step > 3 && newPaiement.debutDate && (
                <div>
                  <span className='font-medium'>Début :</span>{" "}
                  {new Date(newPaiement.debutDate).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>

            {error && (
              <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
                {error}
              </div>
            )}

            {/* Étapes */}
            {step === 1 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Nom du paiement
                </label>
                <input
                  type='text'
                  name='nom'
                  value={newPaiement.nom}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  placeholder='Ex: Crédit auto'
                  ref={nomInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.nom) handleNext();
                  }}
                />
                <div className='flex justify-end'>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.nom}
                    onClick={() => {
                      if (!newPaiement.nom) {
                        setError("Le nom est requis");
                        return;
                      }
                      setError(null);
                      handleNext();
                    }}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Montant total (€)
                </label>
                <input
                  type='number'
                  name='montant'
                  value={newPaiement.montant}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  min='0.01'
                  step='0.01'
                  placeholder='Ex: 9999'
                  ref={montantInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.montant) handleNext();
                  }}
                />
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.montant}
                    onClick={() => {
                      if (!newPaiement.montant) {
                        setError("Le montant est requis");
                        return;
                      }
                      setError(null);
                      handleNext();
                    }}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Nombre de mensualités
                </label>
                <input
                  type='number'
                  name='mensualites'
                  value={newPaiement.mensualites}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  min='1'
                  step='1'
                  placeholder='Ex: 12'
                  ref={mensualitesInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.mensualites)
                      handleNext();
                  }}
                />
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.mensualites}
                    onClick={() => {
                      if (!newPaiement.mensualites) {
                        setError("Le nombre de mensualités est requis");
                        return;
                      }
                      setError(null);
                      handleNext();
                    }}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Date de début
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    name='debutDate'
                    value={newPaiement.debutDate}
                    readOnly
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 pr-10 mb-4 cursor-pointer'
                    ref={debutDateInputRef}
                    autoFocus
                  />
                  <AiOutlineCalendar className='absolute right-3 top-3 text-xl text-gray-400 cursor-pointer' />
                </div>
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.debutDate}
                    onClick={() => {
                      if (!newPaiement.debutDate) {
                        setError("La date de début est requise");
                        return;
                      }
                      setError(null);
                      handleNext();
                    }}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Catégorie
                </label>
                <select
                  name='categorie'
                  value={newPaiement.categorie}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value && e.target.value !== "") {
                      setTimeout(() => handleAddOrEditPaiement(), 100);
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={categorieInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.categorie) {
                      e.preventDefault();
                      handleAddOrEditPaiement();
                    }
                  }}>
                  <option value=''>Sélectionner une catégorie</option>
                  {ECHELONNE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.categorie}
                    onClick={handleAddOrEditPaiement}>
                    {editIndex !== null
                      ? "Valider la modification"
                      : "Valider l'ajout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementEchelonne;
