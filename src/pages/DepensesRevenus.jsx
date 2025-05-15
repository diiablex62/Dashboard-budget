import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlinePlus,
} from "react-icons/ai";
import { FaArrowDown, FaArrowUp, FaFilter, FaTimes } from "react-icons/fa";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

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
import { MONTHS } from "../utils/categoryUtils";

// Importation du composant TransactionsChart
import TransactionsChart from "../components/TransactionsChart";

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tab, setTab] = useState("revenus"); // Par défaut sur revenus au lieu de dépenses
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newTransaction, setNewTransaction] = useState({
    nom: "",
    montant: "",
    date: new Date().toISOString().split("T")[0],
    categorie: "",
  });
  const [depenses, setDepenses] = useState([]);
  const [revenus, setRevenus] = useState([]);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [showRevenuModal, setShowRevenuModal] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES); // État pour stocker les catégories
  // Nouvel état pour gérer le filtrage par catégorie
  const [categoryFilter, setCategoryFilter] = useState(null);
  // État pour gérer l'animation de chargement des graphiques
  const [loadingChart, setLoadingChart] = useState(false);

  // Autres états existants
  const [editTransaction, setEditTransaction] = useState(null);

  // État pour le contenu des modales
  const [depenseModalVisible, setDepenseModalVisible] = useState(false);
  const [revenuModalVisible, setRevenuModalVisible] = useState(false);

  // État pour contrôler l'affichage du sélecteur de date
  const [showDatePicker, setShowDatePicker] = useState(false);

  // États pour la sélection des transactions
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const categorieInputRef = useRef(null);

  // Chargement des données Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des catégories
        const categoriesSnap = await getDocs(collection(db, "categories"));
        if (!categoriesSnap.empty) {
          // Si la collection "categories" existe et contient des documents
          const categoriesList = categoriesSnap.docs.map(
            (doc) => doc.data().nom || doc.data().name
          );
          if (categoriesList.length > 0) {
            // Éliminer les doublons avant de mettre à jour l'état
            const uniqueCategories = Array.from(new Set(categoriesList));
            setCategories(uniqueCategories);
          }
        } else {
          // Si la collection est vide, on l'initialise avec les catégories par défaut sans doublons
          await initializeCategories();
        }

        // Dépenses
        const depenseSnap = await getDocs(
          query(collection(db, "depense"), orderBy("date", "desc"))
        );
        setDepenses(
          depenseSnap.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            icon: "€",
          }))
        );
        // Revenus
        const revenuSnap = await getDocs(
          query(collection(db, "revenu"), orderBy("date", "desc"))
        );
        setRevenus(
          revenuSnap.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            icon: "€",
          }))
        );
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
      }
    };

    // Fonction pour initialiser les catégories dans Firestore
    const initializeCategories = async () => {
      try {
        console.log("Initialisation des catégories dans Firestore");

        // S'assurer que DEFAULT_CATEGORIES n'a pas de doublons
        const uniqueDefaultCategories = Array.from(new Set(DEFAULT_CATEGORIES));

        // Ajout des catégories par défaut dans Firestore
        for (const categorie of uniqueDefaultCategories) {
          await addDoc(collection(db, "categories"), {
            nom: categorie,
            createdAt: serverTimestamp(),
          });
        }

        // Mise à jour de l'état local avec les catégories par défaut
        setCategories(uniqueDefaultCategories);
      } catch (err) {
        console.error("Erreur lors de l'initialisation des catégories:", err);
      }
    };

    fetchData();
  }, [showModal]); // recharge après ajout

  useEffect(() => {
    if (showModal && step === 1 && nomInputRef.current)
      nomInputRef.current.focus();
    if (showModal && step === 2 && montantInputRef.current)
      montantInputRef.current.focus();
    if (showModal && step === 3 && dateInputRef.current)
      dateInputRef.current.focus();
    if (showModal && step === 4 && categorieInputRef.current)
      categorieInputRef.current.focus();
  }, [showModal, step]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e) => {
    if (e) e.preventDefault();
    try {
      const collectionName = tab === "depenses" ? "depense" : "revenu";
      await addDoc(collection(db, collectionName), {
        nom: newTransaction.nom,
        montant:
          tab === "depenses"
            ? -parseFloat(newTransaction.montant)
            : parseFloat(newTransaction.montant),
        date: newTransaction.date,
        categorie: newTransaction.categorie,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setStep(1);
      setNewTransaction({
        nom: "",
        montant: "",
        date: new Date().toISOString().split("T")[0],
        categorie: "",
      });

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));
    } catch (err) {
      console.error("Erreur Firestore add:", err);
    }
  };

  // Filtres sur le mois sélectionné
  const revenusFiltres = revenus.filter(
    (r) =>
      new Date(r.date).getMonth() === selectedDate.getMonth() &&
      new Date(r.date).getFullYear() === selectedDate.getFullYear()
  );

  const depensesFiltres = depenses.filter(
    (d) =>
      new Date(d.date).getMonth() === selectedDate.getMonth() &&
      new Date(d.date).getFullYear() === selectedDate.getFullYear()
  );

  // Appliquer le filtre de catégorie si présent
  const revenusFiltersWithCategory = categoryFilter
    ? revenusFiltres.filter((r) => r.categorie === categoryFilter)
    : revenusFiltres;

  const depensesFiltersWithCategory = categoryFilter
    ? depensesFiltres.filter((d) => d.categorie === categoryFilter)
    : depensesFiltres;

  const totalRevenus = revenusFiltres.reduce(
    (acc, r) => acc + (r.montant || 0),
    0
  );
  const totalDepenses = depensesFiltres.reduce(
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

  // Fonctions pour le sélecteur de date avancé
  const handleYearSelect = (yearValue) => {
    console.log(`Année sélectionnée: ${yearValue}`);
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setFullYear(yearValue);
      return d;
    });
  };

  const handleMonthSelect = (monthIndex) => {
    console.log(`Mois sélectionné: ${MONTHS[monthIndex]} (${monthIndex})`);
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(monthIndex);
      return d;
    });
  };

  const handleDatePickerConfirm = () => {
    console.log(`Date confirmée: ${getMonthYear(selectedDate)}`);
    setShowDatePicker(false);
  };

  // Gestion du filtre par catégorie
  const handleCategoryClick = (category) => {
    if (categoryFilter === category) {
      // Si on clique sur la même catégorie, on désactive le filtre
      setCategoryFilter(null);
    } else {
      // Sinon, on active le filtre sur cette catégorie
      setCategoryFilter(category);
    }
  };

  const clearCategoryFilter = () => {
    setCategoryFilter(null);
  };

  const showEmpty =
    tab === "revenus"
      ? revenusFiltersWithCategory.length === 0
      : depensesFiltersWithCategory.length === 0;

  // Obtenir le mois et l'année correctement depuis la date sélectionnée
  const moisSelectionne = selectedDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  // Fonction pour supprimer une transaction sans toast
  const handleDelete = async (transaction) => {
    if (!transaction || !transaction.id) return;

    try {
      await deleteTransaction(transaction);

      // Mettre à jour l'état local
      if (transaction.montant >= 0) {
        setRevenus((prev) => prev.filter((r) => r.id !== transaction.id));
      } else {
        setDepenses((prev) => prev.filter((d) => d.id !== transaction.id));
      }
    } catch (error) {
      console.error(
        `❌ ERREUR critique lors de la suppression: ${error.message || error}`
      );
      console.error(error);
    }
  };

  // Fonction pour ajouter une dépense depuis la modale
  const handleAddDepense = async (depense) => {
    try {
      await addOrUpdateDepense(depense);

      // Rafraîchir les données
      const updatedDepenses = await getAllDepenses();
      setDepenses(updatedDepenses);
    } catch (err) {
      console.error("Erreur Firestore dépense:", err);
    }
  };

  // Fonction pour ajouter un revenu depuis la modale
  const handleAddRevenu = async (revenu) => {
    try {
      await addOrUpdateRevenu(revenu);

      // Rafraîchir les données
      const updatedRevenus = await getAllRevenus();
      setRevenus(updatedRevenus);
    } catch (err) {
      console.error("Erreur Firestore revenu:", err);
    }
  };

  // Fonction pour modifier une transaction
  const handleEdit = (transaction) => {
    if (transaction.montant >= 0) {
      setEditTransaction(transaction);
      setShowRevenuModal(true);
    } else {
      setEditTransaction({
        ...transaction,
        montant: Math.abs(transaction.montant),
      });
      setShowDepenseModal(true);
    }
  };

  // Fonctions de rendu des cartes de transaction
  const renderTransaction = (transaction) => {
    const montant = transaction.montant;
    const montantText =
      montant >= 0
        ? `+${Number(montant).toFixed(2)} €`
        : `${Number(montant).toFixed(2)} €`;
    const montantColor =
      montant >= 0
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";
    const dateFormatted = formatDate(transaction.date);

    return (
      <div
        key={transaction.id}
        className={`bg-white dark:bg-black rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 flex flex-col transition-all duration-200`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3'>
              <span className='text-gray-600 dark:text-gray-300'>€</span>
            </div>
            <div>
              <div className='font-semibold dark:text-white'>
                {transaction.nom.charAt(0).toUpperCase() +
                  transaction.nom.slice(1)}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                {dateFormatted} • {transaction.categorie}
              </div>
            </div>
          </div>
          <div className='flex flex-col items-end'>
            <div className={`font-bold ${montantColor}`}>{montantText}</div>
          </div>
        </div>

        <div className='flex justify-end mt-3'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(transaction);
            }}
            className='text-blue-500 dark:text-blue-400 mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
            aria-label='Modifier'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(transaction);
            }}
            className='text-red-500 dark:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
            aria-label='Supprimer'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Ajouter une animation de chargement lors du changement d'onglet
  const handleTabChange = (newTab) => {
    if (tab !== newTab) {
      // Démarrer l'animation de chargement
      console.log(
        `Changement d'onglet de ${tab} vers ${newTab} - Début du chargement`
      );
      setLoadingChart(true);
      setTab(newTab);
      setCategoryFilter(null); // Réinitialiser le filtre lors du changement d'onglet

      // Utiliser un délai pour l'animation
      setTimeout(() => {
        setLoadingChart(false);
        console.log(`Changement d'onglet vers ${newTab} - Fin du chargement`);
      }, 600);
    }
  };

  // Composant de chargement pour les graphiques
  const LoadingSpinner = () => (
    <div className='flex items-center justify-center h-full'>
      <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
    </div>
  );

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800 dark:text-white mb-1'>
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
                type='button'>
                <AiOutlineArrowLeft />
              </button>
              <div
                className='mx-4 text-[#222] dark:text-white text-lg font-medium w-40 text-center cursor-pointer hover:bg-[#e9eef2] dark:hover:bg-gray-900 px-3 py-1 rounded transition'
                onClick={() => setShowDatePicker(true)}>
                {getMonthYear(selectedDate)}
              </div>
              <button
                className='text-[#222] dark:text-white text-xl px-2 py-1 rounded hover:bg-[#e9eef2] dark:hover:bg-gray-900 transition'
                onClick={handleNextMonth}
                aria-label='Mois suivant'
                type='button'>
                <AiOutlineArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Sélecteur de mois et année */}
        {showDatePicker && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-80'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                  Sélectionner une date
                </h3>
                <button
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  onClick={() => setShowDatePicker(false)}>
                  &times;
                </button>
              </div>

              {/* Sélecteur d'année */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                  Année
                </label>
                <div className='space-y-2'>
                  {/* Décennies */}
                  {[2020, 2030, 2040, 2050].map((decennie) => (
                    <div key={decennie} className='grid grid-cols-5 gap-2 mb-2'>
                      {[...Array(10)].map((_, i) => {
                        const yearValue = decennie + i;
                        return (
                          <button
                            key={yearValue}
                            className={`py-2 px-3 rounded text-sm ${
                              yearValue === selectedDate.getFullYear()
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => handleYearSelect(yearValue)}>
                            {yearValue}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sélecteur de mois */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                  Mois
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {MONTHS.map((monthName, idx) => (
                    <button
                      key={idx}
                      className={`py-2 px-3 rounded ${
                        idx === selectedDate.getMonth()
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleMonthSelect(idx)}>
                      {monthName.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className='flex justify-end space-x-2'>
                <button
                  className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600'
                  onClick={() => setShowDatePicker(false)}>
                  Annuler
                </button>
                <button
                  className='px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600'
                  onClick={handleDatePickerConfirm}>
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtre actif */}
        {categoryFilter && (
          <div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4 flex items-center justify-between'>
            <div className='flex items-center'>
              <FaFilter className='text-blue-500 dark:text-blue-400 mr-2' />
              <span className='text-blue-700 dark:text-blue-300'>
                Filtré par catégorie: <strong>{categoryFilter}</strong>
              </span>
            </div>
            <button
              onClick={clearCategoryFilter}
              className='text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 p-1'
              aria-label='Supprimer le filtre'>
              <FaTimes />
            </button>
          </div>
        )}

        {/* Indicateurs et graphique */}
        <div className='flex flex-col md:flex-row gap-6 mb-4'>
          {/* Cartes des totaux à gauche */}
          <div className='md:w-1/2 flex flex-col gap-4'>
            {/* Total Revenus - affiché uniquement dans l'onglet revenus */}
            {tab === "revenus" && (
              <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
                <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
                  <FaArrowDown className='text-2xl mr-2' />
                  <span className='text-sm font-semibold'>Total Revenus</span>
                </div>
                <div className='text-2xl text-[#222] dark:text-white'>
                  {totalRevenus.toFixed(2)} €
                </div>
              </div>
            )}
            {/* Total Dépenses - affiché uniquement dans l'onglet dépenses */}
            {tab === "depenses" && (
              <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
                <div className='flex items-center text-red-600 dark:text-red-400 mb-2'>
                  <FaArrowUp className='text-2xl mr-2' />
                  <span className='text-sm font-semibold'>Total Dépenses</span>
                </div>
                <div className='text-2xl text-[#222] dark:text-white'>
                  {totalDepenses.toFixed(2)} €
                </div>
              </div>
            )}
            {/* Solde - toujours affiché */}
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

          {/* Graphique à droite - conteneur avec hauteur fixe */}
          <div className='md:w-1/2 relative h-[400px]'>
            {/* Graphique des revenus */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 h-full ${
                tab === "revenus" ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}>
              {loadingChart ? (
                <div className='bg-white dark:bg-gray-900 rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 h-full flex items-center justify-center'>
                  <LoadingSpinner />
                </div>
              ) : (
                <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 h-full'>
                  <TransactionsChart
                    data={revenusFiltres}
                    type='revenus'
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              )}
            </div>

            {/* Graphique des dépenses */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 h-full ${
                tab === "depenses" ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}>
              {loadingChart ? (
                <div className='bg-white dark:bg-gray-900 rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 h-full flex items-center justify-center'>
                  <LoadingSpinner />
                </div>
              ) : (
                <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 h-full'>
                  <TransactionsChart
                    data={depensesFiltres}
                    type='depenses'
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              )}
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
              onClick={() => handleTabChange("revenus")}
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
              onClick={() => handleTabChange("depenses")}
              type='button'>
              Dépenses
            </button>
          </div>
        </div>
        {/* Contenu revenus/dépenses */}
        {tab === "depenses" && (
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-2'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <div className='text-2xl font-bold text-[#222] dark:text-white'>
                  Dépenses du mois
                  {categoryFilter && (
                    <span className='ml-2 text-lg text-gray-500 dark:text-gray-400'>
                      ({categoryFilter})
                    </span>
                  )}
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Liste de toutes vos dépenses pour {moisSelectionne}
                </div>
              </div>
              {!showEmpty && (
                <div className='flex space-x-3'>
                  <button
                    className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                    onClick={() => setShowDepenseModal(true)}>
                    <span className='text-lg font-bold'>+</span>
                    <span>Ajouter</span>
                  </button>
                </div>
              )}
            </div>

            {showEmpty && (
              <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
                <p>
                  {categoryFilter
                    ? `Aucune dépense dans la catégorie "${categoryFilter}" pour cette période.`
                    : "Aucune dépense à afficher pour cette période."}
                </p>
                <button
                  onClick={() => setShowDepenseModal(true)}
                  className='mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto'>
                  <span className='text-lg font-bold'>+</span>
                  <span>Ajouter une dépense</span>
                </button>
              </div>
            )}

            {depensesFiltersWithCategory.length === 0 ? null : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {depensesFiltersWithCategory.map(renderTransaction)}
              </div>
            )}

            {showDepenseModal && (
              <DepenseModal
                onClose={() => {
                  setShowDepenseModal(false);
                  setEditTransaction(null);
                }}
                onSave={handleAddDepense}
                categories={categories}
                depense={editTransaction || {}}
              />
            )}
          </div>
        )}

        {tab === "revenus" && (
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-2'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <div className='text-2xl font-bold text-[#222] dark:text-white'>
                  Revenus du mois
                  {categoryFilter && (
                    <span className='ml-2 text-lg text-gray-500 dark:text-gray-400'>
                      ({categoryFilter})
                    </span>
                  )}
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Liste de tous vos revenus pour {moisSelectionne}
                </div>
              </div>
              {!showEmpty && (
                <div className='flex space-x-3'>
                  <button
                    className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                    onClick={() => setShowRevenuModal(true)}>
                    <span className='text-lg font-bold'>+</span>
                    <span>Ajouter</span>
                  </button>
                </div>
              )}
            </div>

            {showEmpty && (
              <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
                <p>
                  {categoryFilter
                    ? `Aucun revenu dans la catégorie "${categoryFilter}" pour cette période.`
                    : "Aucun revenu à afficher pour cette période."}
                </p>
                <button
                  onClick={() => setShowRevenuModal(true)}
                  className='mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto'>
                  <span className='text-lg font-bold'>+</span>
                  <span>Ajouter un revenu</span>
                </button>
              </div>
            )}

            {revenusFiltersWithCategory.length === 0 ? null : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {revenusFiltersWithCategory.map(renderTransaction)}
              </div>
            )}

            {showRevenuModal && (
              <RevenuModal
                onClose={() => {
                  setShowRevenuModal(false);
                  setEditTransaction(null);
                }}
                onSave={handleAddRevenu}
                categories={categories}
                revenu={editTransaction || {}}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal */}
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
                setNewTransaction({
                  nom: "",
                  montant: "",
                  date: new Date().toISOString().split("T")[0],
                  categorie: "",
                });
              }}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              Ajouter {tab === "depenses" ? "une dépense" : "un revenu"}
            </div>
            {/* Récapitulatif dynamique */}
            <div className='mb-4 dark:text-gray-300'>
              {newTransaction.nom && (
                <div>
                  <span className='font-medium'>Libellé :</span>{" "}
                  {newTransaction.nom.charAt(0).toUpperCase() +
                    newTransaction.nom.slice(1)}
                </div>
              )}
              {step > 1 && newTransaction.montant && (
                <div>
                  <span className='font-medium'>Montant :</span>{" "}
                  {parseFloat(newTransaction.montant).toFixed(2)} €
                </div>
              )}
              {step > 2 && newTransaction.date && (
                <div>
                  <span className='font-medium'>Date :</span>{" "}
                  {new Date(newTransaction.date).toLocaleDateString("fr-FR")}
                </div>
              )}
              {step > 3 && newTransaction.categorie && (
                <div>
                  <span className='font-medium'>Catégorie :</span>{" "}
                  {newTransaction.categorie}
                </div>
              )}
            </div>
            {/* Étapes */}
            {step === 1 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Nom de la transaction
                </label>
                <input
                  type='text'
                  name='nom'
                  value={newTransaction.nom}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  placeholder='Ex: Courses'
                  ref={nomInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTransaction.nom) handleNext();
                  }}
                />
                <div className='flex justify-end'>
                  <button
                    className='bg-green-600 text-white px-4 py-2 rounded'
                    disabled={!newTransaction.nom}
                    onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Montant (€)
                </label>
                <input
                  type='number'
                  name='montant'
                  value={newTransaction.montant}
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
                    if (
                      e.key === "Enter" &&
                      parseFloat(newTransaction.montant) > 0
                    )
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
                    className='bg-green-600 text-white px-4 py-2 rounded'
                    disabled={!newTransaction.montant}
                    onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Date
                </label>
                <input
                  type='date'
                  name='date'
                  value={newTransaction.date}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={dateInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTransaction.date) handleNext();
                  }}
                />
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-green-600 text-white px-4 py-2 rounded'
                    disabled={!newTransaction.date}
                    onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Catégorie
                </label>
                <select
                  name='categorie'
                  value={newTransaction.categorie}
                  onChange={(e) => {
                    handleChange(e);
                    // Passage automatique après sélection d'une catégorie (mais pas la valeur vide)
                    if (e.target.value && e.target.value !== "") {
                      setTimeout(() => handleAddTransaction(), 300);
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={categorieInputRef}
                  autoFocus>
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
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-green-600 text-white px-4 py-2 rounded'
                    disabled={!newTransaction.categorie}
                    onClick={handleAddTransaction}>
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
