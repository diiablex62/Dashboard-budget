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
} from "react-icons/ai";
import { FaArrowDown, FaArrowUp, FaFilter, FaTimes } from "react-icons/fa";
import { FiEdit, FiTrash } from "react-icons/fi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { transactionApi } from "../utils/api";
import { MONTHS } from "../utils/categoryUtils";
import TransactionsChart from "../components/TransactionsChart";

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

function RevenuModal({
  onClose,
  onSave,
  revenu = {},
  stepInit = 1,
  categories = [],
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
  categories = [],
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
  const [currentTab, setCurrentTab] = useState("depense"); // 'depense' ou 'revenu'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRevenuModal, setShowRevenuModal] = useState(false);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState({
    type: "all",
    category: "all",
    search: "",
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionApi.getTransactions();
      if (!response) {
        throw new Error("Format de réponse invalide");
      }
      console.log("Transactions reçues:", response);
      setTransactions(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      if (error.response) {
        setError(
          `Erreur serveur: ${error.response.data?.message || "Erreur inconnue"}`
        );
      } else if (error.request) {
        setError(
          "Impossible de contacter le serveur, veuillez réessayer plus tard"
        );
      } else {
        setError("Erreur lors de la récupération des transactions");
      }
    } finally {
      setLoading(false);
    }
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

  const handleDeleteTransaction = useCallback(
    async (id) => {
      if (
        !window.confirm(
          "Êtes-vous sûr de vouloir supprimer cette transaction ?"
        )
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await deleteTransaction(id);
        console.log("Transaction supprimée:", id);
        await fetchTransactions();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de la transaction:",
          error
        );
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la suppression de la transaction");
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  const handleSaveRevenu = useCallback(
    async (revenu) => {
      try {
        setLoading(true);
        setError(null);
        await addOrUpdateRevenu(revenu);
        console.log("Revenu sauvegardé:", revenu);
        await fetchTransactions();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du revenu:", error);
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la sauvegarde du revenu");
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  const handleSaveDepense = useCallback(
    async (depense) => {
      try {
        setLoading(true);
        setError(null);
        await addOrUpdateDepense(depense);
        console.log("Dépense sauvegardée:", depense);
        await fetchTransactions();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la dépense:", error);
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la sauvegarde de la dépense");
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) => transaction.type === currentTab
    );
  }, [transactions, currentTab]);

  const categories = useMemo(() => {
    const allCategories = transactions.map((t) => t.categorie);
    return Array.from(new Set(allCategories));
  }, [transactions]);

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
    <div className='max-w-3xl mx-auto p-6'>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden'>
        <div className='p-4 border-b flex gap-2'>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentTab === "depense"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setCurrentTab("depense")}>
            Dépenses
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentTab === "revenu"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setCurrentTab("revenu")}>
            Revenus
          </button>
        </div>
        <div className='p-4 flex flex-col gap-2'>
          {filteredTransactions.length === 0 && (
            <div className='text-gray-400 text-center py-8'>
              Aucune transaction
            </div>
          )}
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2'>
              <div>
                <div className='font-medium'>{transaction.nom}</div>
                <div className='text-xs text-gray-400'>
                  {transaction.categorie}
                </div>
              </div>
              <div
                className={`font-semibold ${
                  transaction.type === "depense"
                    ? "text-red-600"
                    : "text-green-600"
                }`}>
                {transaction.type === "depense" ? "-" : "+"}
                {transaction.montant.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}
                €
              </div>
            </div>
          ))}
        </div>
      </div>
      {showRevenuModal && (
        <RevenuModal
          onClose={() => setShowRevenuModal(false)}
          onSave={handleSaveRevenu}
          revenu={selectedTransaction}
          categories={categories}
        />
      )}
      {showDepenseModal && (
        <DepenseModal
          onClose={() => setShowDepenseModal(false)}
          onSave={handleSaveDepense}
          depense={selectedTransaction}
          categories={categories}
        />
      )}
    </div>
  );
}
