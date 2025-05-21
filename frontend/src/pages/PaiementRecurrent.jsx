import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AppContext } from "../context/AppContext";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import DatePickerModal from "../components/DatePickerModal";

// Données factices pour la démo
const fakePaiements = [
  {
    id: 1,
    nom: "Netflix",
    categorie: "Divertissement",
    montant: 14.99,
    frequence: "Mensuel",
    date: "2024-06-15",
    type: "depense",
  },
  {
    id: 2,
    nom: "Spotify",
    categorie: "Divertissement",
    montant: 9.99,
    frequence: "Mensuel",
    date: "2024-06-20",
    type: "depense",
  },
  {
    id: 3,
    nom: "Salaire principal",
    categorie: "Salaire",
    montant: 2200,
    frequence: "Mensuel",
    date: "2024-06-01",
    type: "revenu",
  },
  {
    id: 4,
    nom: "APL",
    categorie: "Allocations",
    montant: 180,
    frequence: "Mensuel",
    date: "2024-06-05",
    type: "revenu",
  },
];

const PaiementRecurrent = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { primaryColor } = useContext(AppContext);
  const [paiementsRecurrents, setPaiementsRecurrents] = useState(fakePaiements);
  const [error, setError] = useState(null);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    montant: "",
    frequence: "",
    date: new Date().toISOString().split("T")[0],
    categorie: "",
    type: "depense",
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);
  const [currentTab, setCurrentTab] = useState("depense");

  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const frequenceInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const categorieInputRef = useRef(null);

  // Calculs totaux filtrés
  const paiementsFiltres = paiementsRecurrents.filter(
    (p) => p.type === currentTab
  );
  const totalRevenus = paiementsRecurrents
    .filter((p) => p.type === "revenu")
    .reduce((acc, p) => acc + (parseFloat(p.montant) || 0), 0);
  const totalDepenses = paiementsRecurrents
    .filter((p) => p.type === "depense")
    .reduce((acc, p) => acc + (parseFloat(p.montant) || 0), 0);
  const solde = totalRevenus - totalDepenses;

  useEffect(() => {
    console.log("Paiements récurrents:", paiementsRecurrents);
    console.log("Paiements filtrés:", paiementsFiltres);
    console.log("Total revenus:", totalRevenus);
    console.log("Total dépenses:", totalDepenses);
  }, [paiementsRecurrents, paiementsFiltres, totalRevenus, totalDepenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPaiement((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewPaiement((prev) => ({
      ...prev,
      date: date.toISOString().split("T")[0],
    }));
    setShowDatePicker(false);
  };

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  const handleAddOrEditPaiement = () => {
    if (editIndex !== null) {
      // Modifier le paiement existant
      const updatedPaiements = [...paiementsRecurrents];
      updatedPaiements[editIndex] = {
        ...newPaiement,
        id: updatedPaiements[editIndex].id,
        montant: parseFloat(newPaiement.montant),
      };
      setPaiementsRecurrents(updatedPaiements);
    } else {
      // Ajouter un nouveau paiement
      const newId = Math.max(...paiementsRecurrents.map((p) => p.id), 0) + 1;
      const newPaiementWithId = {
        ...newPaiement,
        id: newId,
        montant: parseFloat(newPaiement.montant),
      };
      setPaiementsRecurrents([...paiementsRecurrents, newPaiementWithId]);
    }
    setShowModal(false);
    setNewPaiement({
      nom: "",
      montant: "",
      frequence: "",
      date: new Date().toISOString().split("T")[0],
      categorie: "",
      type: "depense",
    });
    setStep(1);
    setEditIndex(null);
    setError(null);
  };

  const handleDelete = (id) => {
    setPaiementsRecurrents(paiementsRecurrents.filter((p) => p.id !== id));
  };

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
            Paiements Récurrents
          </h1>
        </div>
        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Carte 1: Total Dépenses */}
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-red-600 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Dépenses</span>
            </div>
            <div className='text-2xl text-[#222]'>
              {totalDepenses.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>
          {/* Carte 2: Total Revenus */}
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 mb-2'>
              <AiOutlineCalendar className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Revenus</span>
            </div>
            <div className='text-2xl text-[#222]'>
              {totalRevenus.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>
          {/* Carte 3: Solde */}
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-blue-600 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Solde</span>
            </div>
            <div className='text-2xl text-[#222]'>
              {solde.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </div>
          </div>
        </div>
        {/* Switch Dépenses/Revenus */}
        <div className='flex justify-center mb-6'>
          <div className='flex w-full max-w-xl bg-[#f3f6fa] rounded-xl p-1'>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
                currentTab === "depense"
                  ? "bg-white text-[#111827] shadow font-semibold border border-[#e5eaf1]"
                  : "bg-transparent text-[#7b849b] font-normal"
              }`}
              onClick={() => setCurrentTab("depense")}
              type='button'>
              Dépenses
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
                currentTab === "revenu"
                  ? "bg-white text-[#111827] shadow font-semibold border border-[#e5eaf1]"
                  : "bg-transparent text-[#7b849b] font-normal"
              }`}
              onClick={() => setCurrentTab("revenu")}
              type='button'>
              Revenus
            </button>
          </div>
        </div>
        {/* Affichage des paiements récurrents filtrés */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222]'>
                {currentTab === "depense"
                  ? "Dépenses récurrentes"
                  : "Revenus récurrents"}
              </div>
              <div className='text-sm text-gray-500 mt-1'>
                {currentTab === "depense" ? "Dépenses" : "Revenus"} récurrents
              </div>
            </div>
            {/* Bouton Ajouter */}
            <div className='flex space-x-3'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={() => {
                  setNewPaiement({
                    nom: "",
                    montant: "",
                    frequence: "",
                    date: new Date().toISOString().split("T")[0],
                    categorie: "",
                    type: currentTab,
                  });
                  setEditIndex(null);
                  setShowModal(true);
                  setStep(1);
                }}>
                <span className='text-lg font-bold'>+</span>
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
                  className='bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col transition-all duration-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3'>
                        <AiOutlineDollarCircle className='text-gray-600 text-xl' />
                      </div>
                      <div>
                        <div className='font-semibold'>
                          {p.nom?.charAt(0).toUpperCase() + p.nom?.slice(1)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {p.categorie} - {p.frequence}
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <div
                        className={`font-bold ${
                          currentTab === "depense"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}>
                        {currentTab === "depense" ? "-" : "+"}
                        {parseFloat(p.montant).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </div>
                      <div className='text-xs text-gray-400'>{p.date}</div>
                    </div>
                  </div>
                  <div className='flex justify-end mt-2'>
                    <button
                      className='text-blue-600 font-medium hover:underline mr-4'
                      onClick={() => {
                        setNewPaiement(p);
                        setEditIndex(
                          paiementsRecurrents.findIndex(
                            (item) => item.id === p.id
                          )
                        );
                        setShowModal(true);
                        setStep(1);
                      }}>
                      Modifier
                    </button>
                    <button
                      className='text-red-500 font-medium hover:underline'
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
                  frequence: "",
                  date: new Date().toISOString().split("T")[0],
                  categorie: "",
                  type: "depense",
                });
                setEditIndex(null);
                setError(null);
              }}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              {editIndex !== null ? "Modifier" : "Ajouter"} un paiement
              récurrent
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
                  <span className='font-medium'>Montant :</span>{" "}
                  {parseFloat(newPaiement.montant).toFixed(2)} €
                </div>
              )}
              {step > 2 && newPaiement.frequence && (
                <div>
                  <span className='font-medium'>Fréquence :</span>{" "}
                  {newPaiement.frequence}
                </div>
              )}
              {step > 3 && newPaiement.date && (
                <div>
                  <span className='font-medium'>Date :</span>{" "}
                  {new Date(newPaiement.date).toLocaleDateString("fr-FR")}
                </div>
              )}
              {step > 4 && newPaiement.categorie && (
                <div>
                  <span className='font-medium'>Catégorie :</span>{" "}
                  {newPaiement.categorie}
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
                  Type
                </label>
                <select
                  name='type'
                  value={newPaiement.type}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'>
                  <option value='depense'>Dépense</option>
                  <option value='revenu'>Revenu</option>
                </select>
                <div className='flex justify-end'>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.type}
                    onClick={() => {
                      if (!newPaiement.type) {
                        setError("Le type est requis");
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
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
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
            {step === 3 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Montant (€)
                </label>
                <input
                  type='number'
                  name='montant'
                  value={newPaiement.montant}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  placeholder='Ex: 9999'
                  min='0.01'
                  step='0.01'
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
            {step === 4 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Fréquence
                </label>
                <select
                  name='frequence'
                  value={newPaiement.frequence}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value && e.target.value !== "") {
                      setTimeout(() => handleNext(), 100);
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={frequenceInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.frequence) {
                      e.preventDefault();
                      handleNext();
                    }
                  }}>
                  <option value=''>Sélectionner une fréquence</option>
                  <option value='Mensuel'>Mensuel</option>
                  <option value='Trimestriel'>Trimestriel</option>
                  <option value='Annuel'>Annuel</option>
                </select>
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.frequence}
                    onClick={() => {
                      if (!newPaiement.frequence) {
                        setError("La fréquence est requise");
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
                  Date
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    name='date'
                    value={newPaiement.date}
                    readOnly
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 pr-10 mb-4 cursor-pointer'
                    onClick={() => setShowDatePicker(true)}
                    ref={dateInputRef}
                    autoFocus
                  />
                  <AiOutlineCalendar
                    className='absolute right-3 top-3 text-xl text-gray-400 cursor-pointer'
                    onClick={() => setShowDatePicker(true)}
                  />
                </div>
                <div className='flex justify-between mt-4'>
                  <button
                    className='text-gray-600 dark:text-gray-400 px-4 py-2'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.date}
                    onClick={() => {
                      if (!newPaiement.date) {
                        setError("La date est requise");
                        return;
                      }
                      setError(null);
                      handleNext();
                    }}>
                    Suivant
                  </button>
                </div>
                <DatePickerModal
                  show={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  onConfirm={handleDateChange}
                  selectedDate={
                    newPaiement.date ? new Date(newPaiement.date) : new Date()
                  }
                />
              </div>
            )}
            {step === 6 && (
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
                  {Array.from(new Set(categories)).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className='flex justify-between mt-4'>
                  <button
                    className='text-gray-600 dark:text-gray-400 px-4 py-2'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-6 py-2 rounded-lg font-medium'
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

export default PaiementRecurrent;
