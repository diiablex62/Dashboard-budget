import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlinePlus,
} from "react-icons/ai";
import { FaArrowDown, FaArrowUp, FaFilter, FaTimes } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
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
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  // Focus sur les champs après changement d'étape
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier si tous les champs requis sont remplis
    if (!form.nom) {
      console.error("Nom manquant", form);
      return;
    }

    if (!form.categorie) {
      console.error("Catégorie manquante", form);
      return;
    }

    // S'assurer que le montant est un nombre valide et non nul
    const montant = parseFloat(form.montant);
    if (isNaN(montant) || montant === 0) {
      console.error("Montant invalide ou nul", form.montant);
      return;
    }

    onSave({
      ...form,
      montant: montant,
      id: form.id,
    });
    onClose();
  };

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
        {/* Récapitulatif dynamique */}
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
                  // Passage automatique après sélection d'une catégorie (mais pas sur la valeur vide)
                  if (e.target.value && e.target.value !== "") {
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
                {/* Première option vide avec message */}
                <option value=''>Sélectionner une catégorie</option>
                {/* Utiliser Array.from(new Set(categories)) pour éliminer les doublons */}
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
                  // Vérifier que la valeur est positive
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
                  if (e.key === "Enter" && form.date) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
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
                  disabled={!form.date}
                  type='submit'>
                  Ajouter
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
    montant: depense.montant ? Math.abs(depense.montant).toString() : "",
    date: depense.date || new Date().toISOString().split("T")[0],
    categorie: depense.categorie || "",
  });
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  // Focus sur les champs après changement d'étape
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier si tous les champs requis sont remplis
    if (!form.nom) {
      console.error("Nom manquant", form);
      return;
    }

    if (!form.categorie) {
      console.error("Catégorie manquante", form);
      return;
    }

    // S'assurer que le montant est un nombre valide et non nul
    const montant = parseFloat(form.montant);
    if (isNaN(montant) || montant === 0) {
      console.error("Montant invalide ou nul", form.montant);
      return;
    }

    onSave({
      ...form,
      montant: -Math.abs(montant),
      id: form.id, // Conserver l'ID si on est en mode édition
    });
    onClose();
  };

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
        {/* Récapitulatif dynamique */}
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
                placeholder='Ex: Courses'
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
                  // Passage automatique après sélection d'une catégorie (mais pas sur la valeur vide)
                  if (e.target.value && e.target.value !== "") {
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
                {/* Première option vide avec message */}
                <option value=''>Sélectionner une catégorie</option>
                {/* Utiliser Array.from(new Set(categories)) pour éliminer les doublons */}
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
                  // Vérifier que la valeur est positive
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
                placeholder='Ex: 99.99'
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
                  if (e.key === "Enter" && form.date) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
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
                  disabled={!form.date}
                  type='submit'>
                  Ajouter
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
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "depense",
    nom: "",
    montant: "",
    date: new Date().toISOString().split("T")[0],
    categorie: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({
    type: "all",
    dateDebut: "",
    dateFin: "",
    categorie: "",
  });

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      console.log("Récupération des transactions pour l'utilisateur:", user.id);
      const response = await transactionApi.getByUserId(user.id);
      console.log("Transactions reçues:", response);
      setTransactions(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      setError("Erreur lors de la récupération des transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        userId: user.id,
        montant: parseFloat(formData.montant),
      };

      if (editingId) {
        await transactionApi.update(editingId, transactionData);
        console.log("Transaction mise à jour:", editingId);
      } else {
        await transactionApi.create(transactionData);
        console.log("Nouvelle transaction créée");
      }

      setFormData({
        type: "depense",
        nom: "",
        montant: "",
        date: new Date().toISOString().split("T")[0],
        categorie: "",
        description: "",
      });
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la transaction:", error);
      setError("Erreur lors de la sauvegarde de la transaction");
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      nom: transaction.nom,
      montant: transaction.montant.toString(),
      date: transaction.date,
      categorie: transaction.categorie || "",
      description: transaction.description || "",
    });
    setEditingId(transaction.id);
  };

  const handleDelete = async (id) => {
    try {
      await transactionApi.delete(id);
      console.log("Transaction supprimée:", id);
      fetchTransactions();
    } catch (error) {
      console.error("Erreur lors de la suppression de la transaction:", error);
      setError("Erreur lors de la suppression de la transaction");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter.type !== "all" && transaction.type !== filter.type) return false;
    if (
      filter.dateDebut &&
      new Date(transaction.date) < new Date(filter.dateDebut)
    )
      return false;
    if (filter.dateFin && new Date(transaction.date) > new Date(filter.dateFin))
      return false;
    if (filter.categorie && transaction.categorie !== filter.categorie)
      return false;
    return true;
  });

  const calculateTotals = () => {
    const totals = filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "depense") {
          acc.depenses += transaction.montant;
        } else {
          acc.revenus += transaction.montant;
        }
        return acc;
      },
      { depenses: 0, revenus: 0 }
    );
    totals.balance = totals.revenus - totals.depenses;
    return totals;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>
            {editingId ? "Modifier la transaction" : "Nouvelle transaction"}
          </h1>

          {error && (
            <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='type'
                  className='block text-sm font-medium text-gray-700'>
                  Type
                </label>
                <select
                  id='type'
                  name='type'
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
                  <option value='depense'>Dépense</option>
                  <option value='revenu'>Revenu</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='nom'
                  className='block text-sm font-medium text-gray-700'>
                  Nom
                </label>
                <input
                  type='text'
                  id='nom'
                  name='nom'
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>

              <div>
                <label
                  htmlFor='montant'
                  className='block text-sm font-medium text-gray-700'>
                  Montant (€)
                </label>
                <input
                  type='number'
                  id='montant'
                  name='montant'
                  value={formData.montant}
                  onChange={handleInputChange}
                  required
                  min='0'
                  step='0.01'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>

              <div>
                <label
                  htmlFor='date'
                  className='block text-sm font-medium text-gray-700'>
                  Date
                </label>
                <input
                  type='date'
                  id='date'
                  name='date'
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>

              <div>
                <label
                  htmlFor='categorie'
                  className='block text-sm font-medium text-gray-700'>
                  Catégorie
                </label>
                <input
                  type='text'
                  id='categorie'
                  name='categorie'
                  value={formData.categorie}
                  onChange={handleInputChange}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700'>
                  Description
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  rows='3'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                />
              </div>
            </div>

            <div className='flex justify-end space-x-3'>
              {editingId && (
                <button
                  type='button'
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      type: "depense",
                      nom: "",
                      montant: "",
                      date: new Date().toISOString().split("T")[0],
                      categorie: "",
                      description: "",
                    });
                  }}
                  className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  Annuler
                </button>
              )}
              <button
                type='submit'
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                {editingId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </div>

        <div className='border-t border-gray-200'>
          <div className='p-6'>
            <div className='mb-6'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Filtres
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div>
                  <label
                    htmlFor='filterType'
                    className='block text-sm font-medium text-gray-700'>
                    Type
                  </label>
                  <select
                    id='filterType'
                    name='type'
                    value={filter.type}
                    onChange={handleFilterChange}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
                    <option value='all'>Tous</option>
                    <option value='depense'>Dépenses</option>
                    <option value='revenu'>Revenus</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='dateDebut'
                    className='block text-sm font-medium text-gray-700'>
                    Date de début
                  </label>
                  <input
                    type='date'
                    id='dateDebut'
                    name='dateDebut'
                    value={filter.dateDebut}
                    onChange={handleFilterChange}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='dateFin'
                    className='block text-sm font-medium text-gray-700'>
                    Date de fin
                  </label>
                  <input
                    type='date'
                    id='dateFin'
                    name='dateFin'
                    value={filter.dateFin}
                    onChange={handleFilterChange}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='filterCategorie'
                    className='block text-sm font-medium text-gray-700'>
                    Catégorie
                  </label>
                  <input
                    type='text'
                    id='filterCategorie'
                    name='categorie'
                    value={filter.categorie}
                    onChange={handleFilterChange}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </div>
              </div>
            </div>

            <div className='mb-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 bg-red-50 rounded-lg'>
                <h3 className='text-sm font-medium text-red-800'>
                  Dépenses totales
                </h3>
                <p className='text-2xl font-bold text-red-600'>
                  {totals.depenses.toFixed(2)} €
                </p>
              </div>
              <div className='p-4 bg-green-50 rounded-lg'>
                <h3 className='text-sm font-medium text-green-800'>
                  Revenus totaux
                </h3>
                <p className='text-2xl font-bold text-green-600'>
                  {totals.revenus.toFixed(2)} €
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  totals.balance >= 0 ? "bg-green-50" : "bg-red-50"
                }`}>
                <h3 className='text-sm font-medium text-gray-800'>Solde</h3>
                <p
                  className={`text-2xl font-bold ${
                    totals.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                  {totals.balance.toFixed(2)} €
                </p>
              </div>
            </div>

            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Transactions
            </h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Nom
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Catégorie
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Montant
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Description
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === "depense"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                          {transaction.type === "depense"
                            ? "Dépense"
                            : "Revenu"}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {transaction.nom}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {transaction.categorie}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {transaction.montant.toFixed(2)} €
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        {transaction.description}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className='text-indigo-600 hover:text-indigo-900 mr-4'>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className='text-red-600 hover:text-red-900'>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
