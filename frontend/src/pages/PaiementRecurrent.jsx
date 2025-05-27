import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  AiOutlinePlus,
  AiOutlineCalendar,
  AiOutlineDollarCircle,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import { fakePaiementsRecurrents } from "../utils/fakeData";
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  getMonthYear,
  MONTHS,
  CATEGORY_COLORS,
} from "../utils/categoryUtils";
import {
  calculTotalRecurrentsMois,
  totalRevenusGlobalMois,
} from "../utils/calcul";

// Fonction pour formater la date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const PaiementRecurrent = () => {
  const [paiementsRecurrents, setPaiementsRecurrents] = useState(
    fakePaiementsRecurrents
  );
  const [currentTab, setCurrentTab] = useState("depense");
  const [error] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [step, setStep] = useState(1);

  // Calcul des totaux
  const totalDepenses = useMemo(
    () =>
      calculTotalRecurrentsMois(
        paiementsRecurrents.filter((p) => p.type === "depense")
      ),
    [paiementsRecurrents]
  );
  const totalRevenus = useMemo(
    () =>
      totalRevenusGlobalMois(
        [],
        paiementsRecurrents.filter((p) => p.type === "revenu")
      ),
    [paiementsRecurrents]
  );

  // Filtrage des paiements selon le type
  const paiementsFiltres = useMemo(() => {
    return paiementsRecurrents.filter((p) => p.type === currentTab);
  }, [paiementsRecurrents, currentTab]);

  const handleDelete = (id) => {
    setPaiementsRecurrents(paiementsRecurrents.filter((p) => p.id !== id));
  };

  const handleAddPaiement = useCallback(() => {
    setSelectedPaiement(null);
    setShowModal(true);
  }, []);

  const handleSavePaiement = useCallback(
    async (paiement) => {
      const selectedDate = paiement.dateDebut;

      setPaiementsRecurrents((prev) => {
        const newPaiement = {
          ...paiement,
          type: currentTab,
          date: selectedDate,
          dateDebut: selectedDate,
        };
        if (paiement.id) {
          return prev.map((t) => (t.id === paiement.id ? newPaiement : t));
        } else {
          const newId = Math.max(...prev.map((p) => p.id), 0) + 1;
          return [...prev, { ...newPaiement, id: newId }];
        }
      });
      setShowModal(false);
    },
    [currentTab]
  );

  const handleEditPaiement = useCallback((paiement) => {
    setSelectedPaiement(paiement);
    setShowModal(true);
  }, []);

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
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        {/* Titre */}
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Paiements Récurrents
          </h1>
        </div>
        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Carte 1: Total Dépenses */}
          <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
            <div className='flex items-center text-red-600 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Dépenses</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalDepenses.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>
          {/* Carte 2: Total Revenus */}
          <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
            <div className='flex items-center text-green-600 mb-2'>
              <AiOutlineCalendar className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Revenus</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalRevenus.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>
        </div>
        {/* Switch Dépenses/Revenus */}
        <div className='flex w-full max-w-xl bg-[#f3f6fa] rounded-xl p-1 dark:bg-gray-900 mb-6 mx-auto'>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              currentTab === "depense"
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setCurrentTab("depense")}
            type='button'>
            Dépenses
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              currentTab === "revenu"
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setCurrentTab("revenu")}
            type='button'>
            Revenus
          </button>
        </div>
        {/* Affichage des paiements récurrents filtrés */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2 dark:bg-black dark:text-white dark:border-gray-700'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222] dark:text-white'>
                {currentTab === "depense"
                  ? "Dépenses récurrentes"
                  : "Revenus récurrents"}
              </div>
              <div className='text-sm text-gray-500 mt-1 dark:text-white'>
                {currentTab === "depense" ? "Dépenses" : "Revenus"} récurrents
              </div>
            </div>
            {/* Bouton Ajouter */}
            <div className='flex space-x-3'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={handleAddPaiement}>
                <AiOutlinePlus className='text-lg' />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
          {paiementsFiltres.length === 0 ? (
            <div className='text-center py-10 text-gray-500'>
              <p>
                Aucun paiement {currentTab === "depense" ? "dépense" : "revenu"}{" "}
                récurrent.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {paiementsFiltres.map((p) => (
                <div
                  key={p.id}
                  className='bg-gray-50 rounded-lg shadow border border-gray-100 p-4 flex flex-col transition-all duration-200 dark:bg-black dark:text-white dark:border-gray-700'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3'>
                        <AiOutlineDollarCircle className='text-gray-600 text-xl' />
                      </div>
                      <div>
                        <div className='font-semibold'>
                          {p.nom?.charAt(0).toUpperCase() + p.nom?.slice(1)}
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-300'>
                          {p.categorie}
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <div
                        className={`font-bold ${
                          currentTab === "depense"
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}>
                        {currentTab === "depense" ? "-" : "+"}
                        {parseFloat(p.montant).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </div>
                      <div className='text-xs text-gray-400 dark:text-gray-300'>
                        {formatDate(p.date)}
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end mt-2'>
                    <button
                      className='text-blue-600 font-medium hover:underline mr-4 cursor-pointer dark:text-blue-400'
                      onClick={() => handleEditPaiement(p)}>
                      Modifier
                    </button>
                    <button
                      className='text-red-500 font-medium hover:underline cursor-pointer dark:text-red-400'
                      onClick={() => handleDelete(p.id)}>
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
        <PaiementRecurrentModal
          onClose={() => {
            setShowModal(false);
            setStep(1);
            setSelectedPaiement(null);
          }}
          onSave={handleSavePaiement}
          paiement={selectedPaiement}
          stepInit={step}
          type={currentTab}
        />
      )}
    </div>
  );
};

function PaiementRecurrentModal({
  onClose,
  onSave,
  paiement = null,
  stepInit = 1,
  type = "depense",
}) {
  const [currentStep, setCurrentStep] = useState(stepInit);
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const [formData, setFormData] = useState({
    id: paiement?.id || null,
    nom: paiement?.nom || "",
    montant: paiement?.montant ? paiement.montant.toString() : "",
    categorie: paiement?.categorie || "",
    frequence: "mensuel",
    dateDebut: paiement?.dateDebut || new Date().toISOString().split("T")[0],
    type: type,
  });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (currentStep === 3 && montantInputRef.current) {
      setTimeout(() => {
        montantInputRef.current.focus();
      }, 100);
    } else if (currentStep === 4 && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current.focus();
      }, 100);
    }
  }, [currentStep]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage(null);
  }, []);

  const isFormValid = useMemo(() => {
    if (!formData.nom) return false;
    if (!formData.categorie) return false;
    const montant = parseFloat(formData.montant);
    if (isNaN(montant) || montant <= 0) return false;
    if (!formData.dateDebut) return false;

    const selectedDate = new Date(formData.dateDebut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return false;

    return true;
  }, [formData]);

  const handleDateChange = useCallback(
    (e) => {
      const selectedDate = new Date(e.target.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setErrorMessage("La date ne peut pas être antérieure à aujourd'hui");
        return;
      }

      handleChange(e);

      // Si tous les champs sont valides, sauvegarder automatiquement
      if (isFormValid) {
        const paiementToSave = {
          ...formData,
          dateDebut: e.target.value,
          montant: parseFloat(formData.montant),
          date: e.target.value,
        };
        onSave(paiementToSave);
        onClose();
      }
    },
    [handleChange, isFormValid, formData, onSave, onClose]
  );

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const validateAndSave = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      if (!formData.nom) {
        setErrorMessage("Le nom est requis");
      } else if (!formData.categorie) {
        setErrorMessage("La catégorie est requise");
      } else if (!formData.montant || parseFloat(formData.montant) <= 0) {
        setErrorMessage("Le montant doit être un nombre positif");
      } else if (!formData.dateDebut) {
        setErrorMessage("La date de début est requise");
      }
      return;
    }

    const paiementToSave = {
      ...formData,
      montant: parseFloat(formData.montant),
      date: formData.dateDebut,
      dateDebut: formData.dateDebut,
    };

    onSave(paiementToSave);
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center'
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          className='absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          onClick={onClose}>
          ✕
        </button>

        <h2 className='text-xl font-semibold mb-6 dark:text-white'>
          {paiement ? "Modifier" : "Ajouter"} un paiement récurrent{" "}
          {type === "depense" ? "dépense" : "revenu"}
        </h2>

        {errorMessage && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {errorMessage}
          </div>
        )}

        <form onSubmit={validateAndSave}>
          {currentStep === 1 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Nom du paiement
              </label>
              <input
                type='text'
                name='nom'
                value={formData.nom}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.nom) {
                    e.preventDefault();
                    nextStep();
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                placeholder='Ex: Loyer'
                autoFocus
              />
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={nextStep}
                  disabled={!formData.nom}
                  className='bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50'>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Catégorie
              </label>
              <select
                name='categorie'
                value={formData.categorie}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    nextStep();
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                size={
                  type === "depense"
                    ? DEPENSES_CATEGORIES.length + 1
                    : REVENUS_CATEGORIES.length + 1
                }>
                <option value=''>Sélectionner une catégorie</option>
                {(type === "depense"
                  ? DEPENSES_CATEGORIES
                  : REVENUS_CATEGORIES
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className='flex justify-between'>
                <button
                  type='button'
                  onClick={prevStep}
                  className='text-gray-600 dark:text-gray-400'>
                  Précédent
                </button>
                <button
                  type='button'
                  onClick={nextStep}
                  disabled={!formData.categorie}
                  className='bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50'>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Montant (€)
              </label>
              <input
                ref={montantInputRef}
                type='number'
                name='montant'
                value={formData.montant}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || parseFloat(value) > 0) {
                    handleChange(e);
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                min='0.01'
                step='0.01'
                placeholder='Ex: 500'
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.montant) {
                    e.preventDefault();
                    nextStep();
                  }
                }}
              />
              <div className='flex justify-between'>
                <button
                  type='button'
                  onClick={prevStep}
                  className='text-gray-600 dark:text-gray-400'>
                  Précédent
                </button>
                <button
                  type='button'
                  onClick={nextStep}
                  disabled={!formData.montant}
                  className='bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50'>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Date de début
              </label>
              <div className='relative'>
                <input
                  type='date'
                  name='dateDebut'
                  value={formData.dateDebut}
                  onChange={handleDateChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden'
                  ref={dateInputRef}
                  style={{
                    paddingRight: "2.5rem",
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
                <AiOutlineCalendar
                  className='absolute right-3 top-3 text-xl text-gray-400 dark:text-white cursor-pointer'
                  onClick={() => dateInputRef.current?.showPicker()}
                />
              </div>
              <div className='flex justify-between'>
                <button
                  type='button'
                  onClick={prevStep}
                  className='text-gray-600 dark:text-gray-400'>
                  Précédent
                </button>
                <button
                  type='submit'
                  disabled={!isFormValid}
                  className='bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed'>
                  {paiement ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default PaiementRecurrent;
