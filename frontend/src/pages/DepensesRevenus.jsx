import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlinePlus,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { FaArrowDown, FaArrowUp, FaFilter, FaTimes } from "react-icons/fa";
import { FiEdit, FiTrash } from "react-icons/fi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { MONTHS } from "../utils/categoryUtils";
import TransactionsChart from "../components/TransactionsChart";

// Catégories par défaut pour les dépenses et revenus
const DEPENSES_CATEGORIES = [
  "Alimentation",
  "Transport",
  "Logement",
  "Santé",
  "Loisirs",
  "Shopping",
  "Factures",
  "Éducation",
  "Voyages",
  "Autres",
];

const REVENUS_CATEGORIES = [
  "Salaire",
  "Freelance",
  "Investissements",
  "Ventes",
  "Prestations",
  "Allocations",
  "Autres",
];

// Importation des nouvelles fonctions utilitaires
import {
  formatDate,
  getMonthYear,
  DEFAULT_CATEGORIES, // Ces catégories proviennent maintenant du fichier categoryUtils.js
  getAllDepenses,
  getAllRevenus,
  addOrUpdateDepense,
  addOrUpdateRevenu,
  deleteTransaction,
} from "../utils/transactionUtils";

// Génération dynamique de transactions factices pour le mois de mai 2025
const fakeTransactions = [
  {
    id: 1,
    nom: "Loyer",
    montant: 700,
    categorie: "Logement",
    date: "2025-05-01",
    type: "depense",
  },
  {
    id: 2,
    nom: "Courses",
    montant: 220.5,
    categorie: "Alimentation",
    date: "2025-05-03",
    type: "depense",
  },
  {
    id: 3,
    nom: "Salaire",
    montant: 2100,
    categorie: "Salaire",
    date: "2025-05-01",
    type: "revenu",
  },
  {
    id: 4,
    nom: "Vente Vinted",
    montant: 45,
    categorie: "Ventes",
    date: "2025-05-10",
    type: "revenu",
  },
  {
    id: 5,
    nom: "Essence",
    montant: 80,
    categorie: "Transport",
    date: "2025-05-07",
    type: "depense",
  },
  {
    id: 6,
    nom: "Remboursement mutuelle",
    montant: 60,
    categorie: "Santé",
    date: "2025-05-12",
    type: "revenu",
  },
];

function getMonthName(date) {
  return date.toLocaleString("fr-FR", { month: "long" });
}

function RevenuModal({
  onClose,
  onSave,
  revenu = {},
  stepInit = 1,
  categories = REVENUS_CATEGORIES,
}) {
  const [step, setStep] = useState(stepInit);
  const [form, setForm] = useState({
    id: revenu.id || null,
    nom: revenu.nom || "",
    montant: revenu.montant ? revenu.montant.toString() : "",
    categorie: revenu.categorie || "",
    date: revenu.date || new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState(null);
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }, []);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  useEffect(() => {
    if (step === 3 && montantInputRef.current) {
      setTimeout(() => {
        montantInputRef.current.focus();
      }, 100);
    } else if (step === 4 && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current.focus();
      }, 100);
    }
  }, [step]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!form.nom) {
        setError("Le nom est requis");
        return;
      }

      if (!form.categorie) {
        setError("La catégorie est requise");
        return;
      }

      const montant = parseFloat(form.montant);
      if (isNaN(montant) || montant <= 0) {
        setError("Le montant doit être un nombre positif");
        return;
      }

      onSave({
        ...form,
        montant: montant,
        id: form.id,
      });
      onClose();
    },
    [form, onSave, onClose]
  );

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center'
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          onClick={onClose}
          aria-label='Fermer'>
          ✕
        </button>
        <div className='mb-6 text-lg font-semibold dark:text-white'>
          Ajouter un revenu
        </div>
        {error && (
          <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        <div className='mb-4 dark:text-gray-300'>
          {form.nom && (
            <div>
              <span className='font-medium'>Libellé :</span>{" "}
              {form.nom.charAt(0).toUpperCase() + form.nom.slice(1)}
            </div>
          )}
          {step > 1 && form.categorie && (
            <div>
              <span className='font-medium'>Catégorie :</span> {form.categorie}
            </div>
          )}
          {step > 2 && form.montant && (
            <div>
              <span className='font-medium'>Montant :</span>{" "}
              {parseFloat(form.montant).toFixed(2)} €
            </div>
          )}
          {step > 3 && form.date && (
            <div>
              <span className='font-medium'>Date :</span>{" "}
              {new Date(form.date).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Nom du revenu
              </label>
              <input
                type='text'
                name='nom'
                value={form.nom}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                placeholder='Ex: Salaire'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.nom) handleNext();
                }}
              />
              <div className='flex justify-end'>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  disabled={!form.nom}
                  type='button'
                  onClick={handleNext}>
                  Suivant
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Catégorie
              </label>
              <select
                name='categorie'
                value={form.categorie}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    setTimeout(() => handleNext(), 100);
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.categorie) {
                    e.preventDefault();
                    handleNext();
                  }
                }}>
                <option value=''>Sélectionner une catégorie</option>
                {Array.from(new Set(categories)).map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  disabled={!form.categorie}
                  type='button'
                  onClick={handleNext}>
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
                value={form.montant}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    handleChange(e);
                  } else if (e.target.value === "") {
                    handleChange(e);
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                min='0.01'
                step='0.01'
                placeholder='Ex: 2000'
                ref={montantInputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && parseFloat(form.montant) > 0)
                    handleNext();
                }}
              />
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  disabled={!form.montant}
                  type='button'
                  onClick={handleNext}>
                  Suivant
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Date
              </label>
              <input
                type='date'
                name='date'
                value={form.date}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                ref={dateInputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.date) handleSubmit(e);
                }}
              />
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  type='submit'>
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function DepenseModal({
  onClose,
  onSave,
  depense = {},
  stepInit = 1,
  categories = DEPENSES_CATEGORIES,
}) {
  const [step, setStep] = useState(stepInit);
  const [form, setForm] = useState({
    id: depense.id || null,
    nom: depense.nom || "",
    montant: depense.montant ? depense.montant.toString() : "",
    categorie: depense.categorie || "",
    date: depense.date || new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState(null);
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }, []);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  useEffect(() => {
    if (step === 3 && montantInputRef.current) {
      setTimeout(() => {
        montantInputRef.current.focus();
      }, 100);
    } else if (step === 4 && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current.focus();
      }, 100);
    }
  }, [step]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!form.nom) {
        setError("Le nom est requis");
        return;
      }

      if (!form.categorie) {
        setError("La catégorie est requise");
        return;
      }

      const montant = parseFloat(form.montant);
      if (isNaN(montant) || montant <= 0) {
        setError("Le montant doit être un nombre positif");
        return;
      }

      onSave({
        ...form,
        montant: montant,
        id: form.id,
      });
      onClose();
    },
    [form, onSave, onClose]
  );

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center'
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          onClick={onClose}
          aria-label='Fermer'>
          ✕
        </button>
        <div className='mb-6 text-lg font-semibold dark:text-white'>
          Ajouter une dépense
        </div>
        {error && (
          <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        <div className='mb-4 dark:text-gray-300'>
          {form.nom && (
            <div>
              <span className='font-medium'>Libellé :</span>{" "}
              {form.nom.charAt(0).toUpperCase() + form.nom.slice(1)}
            </div>
          )}
          {step > 1 && form.categorie && (
            <div>
              <span className='font-medium'>Catégorie :</span> {form.categorie}
            </div>
          )}
          {step > 2 && form.montant && (
            <div>
              <span className='font-medium'>Montant :</span>{" "}
              {parseFloat(form.montant).toFixed(2)} €
            </div>
          )}
          {step > 3 && form.date && (
            <div>
              <span className='font-medium'>Date :</span>{" "}
              {new Date(form.date).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Nom de la dépense
              </label>
              <input
                type='text'
                name='nom'
                value={form.nom}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                placeholder='Ex: Loyer'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.nom) handleNext();
                }}
              />
              <div className='flex justify-end'>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  disabled={!form.nom}
                  type='button'
                  onClick={handleNext}>
                  Suivant
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Catégorie
              </label>
              <select
                name='categorie'
                value={form.categorie}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    setTimeout(() => handleNext(), 100);
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.categorie) {
                    e.preventDefault();
                    handleNext();
                  }
                }}>
                <option value=''>Sélectionner une catégorie</option>
                {Array.from(new Set(categories)).map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  disabled={!form.categorie}
                  type='button'
                  onClick={handleNext}>
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
                value={form.montant}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    handleChange(e);
                  } else if (e.target.value === "") {
                    handleChange(e);
                  }
                }}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                min='0.01'
                step='0.01'
                placeholder='Ex: 500'
                ref={montantInputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && parseFloat(form.montant) > 0)
                    handleNext();
                }}
              />
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  disabled={!form.montant}
                  type='button'
                  onClick={handleNext}>
                  Suivant
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                Date
              </label>
              <input
                type='date'
                name='date'
                value={form.date}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                ref={dateInputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.date) handleSubmit(e);
                }}
              />
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  type='submit'>
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function DepensesRevenus() {
  const [currentTab, setCurrentTab] = useState("depense");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState(fakeTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRevenuModal, setShowRevenuModal] = useState(false);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState({
    type: "all",
    category: "all",
    search: "",
  });

  const fetchTransactions = useCallback(() => {
    setTransactions(fakeTransactions);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const handleDataUpdate = () => fetchTransactions();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchTransactions]);

  const handleAddRevenu = useCallback(() => {
    setSelectedTransaction(null);
    setShowRevenuModal(true);
  }, []);

  const handleAddDepense = useCallback(() => {
    setSelectedTransaction(null);
    setShowDepenseModal(true);
  }, []);

  const handleEditTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    if (transaction.type === "revenu") {
      setShowRevenuModal(true);
    } else {
      setShowDepenseModal(true);
    }
  }, []);

  const handleDeleteTransaction = useCallback(async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")
    )
      return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSaveRevenu = useCallback(async (revenu) => {
    setTransactions((prev) => {
      if (revenu.id) {
        // Edition locale
        return prev.map((t) => (t.id === revenu.id ? { ...revenu } : t));
      } else {
        // Ajout local
        return [...prev, { ...revenu, id: Date.now(), type: "revenu" }];
      }
    });
  }, []);

  const handleSaveDepense = useCallback(async (depense) => {
    setTransactions((prev) => {
      if (depense.id) {
        // Edition locale
        return prev.map((t) => (t.id === depense.id ? { ...depense } : t));
      } else {
        // Ajout local
        return [...prev, { ...depense, id: Date.now(), type: "depense" }];
      }
    });
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === currentTab &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentTab, currentDate]);

  const totalRevenus = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.type === "revenu" &&
          new Date(t.date).getMonth() === currentDate.getMonth() &&
          new Date(t.date).getFullYear() === currentDate.getFullYear()
      )
      .reduce((acc, t) => acc + (parseFloat(t.montant) || 0), 0);
  }, [transactions, currentDate]);

  const totalDepenses = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.type === "depense" &&
          new Date(t.date).getMonth() === currentDate.getMonth() &&
          new Date(t.date).getFullYear() === currentDate.getFullYear()
      )
      .reduce((acc, t) => acc + (parseFloat(t.montant) || 0), 0);
  }, [transactions, currentDate]);

  const solde = totalRevenus - totalDepenses;

  // Navigation mois
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };
  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
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
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* En-tête et sélecteur de mois */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800 mb-1'>
              Dépenses & Revenus
            </h1>
            <div className='text-gray-500 text-base'>
              Gérez vos dépenses et revenus mensuels.
            </div>
          </div>
          {/* Sélecteur mois/année */}
          <div className='flex items-center mt-4 md:mt-0'>
            <div className='flex items-center bg-[#f6f9fb] rounded-xl px-4 py-2 shadow-none border border-transparent'>
              <button
                className='text-[#222] text-xl px-2 py-1 rounded hover:bg-[#e9eef2] transition'
                onClick={handlePrevMonth}
                aria-label='Mois précédent'
                type='button'>
                <AiOutlineArrowLeft />
              </button>
              <div className='mx-4 text-[#222] text-lg font-medium w-40 text-center cursor-pointer hover:bg-[#e9eef2] px-3 py-1 rounded transition'>
                {getMonthYear(currentDate)}
              </div>
              <button
                className='text-[#222] text-xl px-2 py-1 rounded hover:bg-[#e9eef2] transition'
                onClick={handleNextMonth}
                aria-label='Mois suivant'
                type='button'>
                <AiOutlineArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Carte 1: Total Dépenses */}
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col items-start justify-center relative'>
            <div className='flex items-center text-red-600 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Dépenses</span>
              <div className='relative group ml-2'>
                <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
                <div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                  Ce total correspond uniquement aux transactions de type
                  dépense, hors paiements récurrents et échelonnés.
                </div>
              </div>
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

        {/* Affichage des transactions */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222]'>
                {currentTab === "depense"
                  ? "Dépenses du mois"
                  : "Revenus du mois"}
              </div>
              <div className='text-sm text-gray-500 mt-1'>
                {currentTab === "depense" ? "Dépenses" : "Revenus"} du mois de{" "}
                {getMonthYear(currentDate)}
              </div>
            </div>
            {/* Bouton Ajouter - toujours visible ici */}
            <div className='flex space-x-3'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={
                  currentTab === "depense" ? handleAddDepense : handleAddRevenu
                }>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className='text-center py-10 text-gray-500'>
              <p>
                Aucune {currentTab === "depense" ? "dépense" : "revenu"} pour{" "}
                {getMonthYear(currentDate)}.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {filteredTransactions.map((transaction, idx) => (
                <div
                  key={transaction.id || idx}
                  className='bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col transition-all duration-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3'>
                        <AiOutlineDollarCircle className='text-gray-600 text-xl' />
                      </div>
                      <div>
                        <div className='font-semibold'>
                          {transaction.nom.charAt(0).toUpperCase() +
                            transaction.nom.slice(1)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {transaction.categorie}
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
                        {parseFloat(transaction.montant).toLocaleString(
                          "fr-FR",
                          { minimumFractionDigits: 2 }
                        )}{" "}
                        €
                      </div>
                      <div className='text-xs text-gray-400'>
                        {new Date(transaction.date).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showRevenuModal && (
        <RevenuModal
          onClose={() => setShowRevenuModal(false)}
          onSave={handleSaveRevenu}
          revenu={selectedTransaction}
          categories={REVENUS_CATEGORIES}
        />
      )}
      {showDepenseModal && (
        <DepenseModal
          onClose={() => setShowDepenseModal(false)}
          onSave={handleSaveDepense}
          depense={selectedTransaction || {}}
          categories={DEPENSES_CATEGORIES}
        />
      )}
    </div>
  );
}
