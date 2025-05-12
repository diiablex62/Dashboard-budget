import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlinePlus,
} from "react-icons/ai";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  doc,
} from "firebase/firestore";
import Toast from "../components/Toast";

// Couleurs et icônes pour correspondre à l'image
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

// Catégories par défaut au cas où la récupération Firestore échoue
const DEFAULT_CATEGORIES = [
  "Alimentation",
  "Logement",
  "Transport",
  "Loisirs",
  "Santé",
  "Shopping",
  "Factures",
  "Autre",
];

function getMonthYear(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function RevenuModal({
  onClose,
  onSave,
  revenu = {},
  stepInit = 1,
  categories = [],
}) {
  const [step, setStep] = useState(stepInit);
  const [form, setForm] = useState({
    nom: revenu.nom || "",
    montant: revenu.montant ? revenu.montant.toString() : "",
    categorie: revenu.categorie || "",
    date: revenu.date || new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      montant: parseFloat(form.montant),
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
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'>
                <option value=''>Sélectionner une catégorie</option>
                {categories.map((cat, index) => (
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
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                min='0'
                step='0.01'
                placeholder='Ex: 2000'
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
    nom: depense.nom || "",
    montant: depense.montant ? Math.abs(depense.montant).toString() : "",
    date: depense.date || new Date().toISOString().split("T")[0],
    categorie: depense.categorie || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      montant: -Math.abs(parseFloat(form.montant)),
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
          {step > 1 && form.montant && (
            <div>
              <span className='font-medium'>Montant :</span>{" "}
              {parseFloat(form.montant).toFixed(2)} €
            </div>
          )}
          {step > 2 && form.date && (
            <div>
              <span className='font-medium'>Date :</span>{" "}
              {new Date(form.date).toLocaleDateString("fr-FR")}
            </div>
          )}
          {step > 3 && form.categorie && (
            <div>
              <span className='font-medium'>Catégorie :</span> {form.categorie}
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
                Montant (€)
              </label>
              <input
                type='number'
                name='montant'
                value={form.montant}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                min='0'
                step='0.01'
                placeholder='Ex: 99.99'
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
          {step === 3 && (
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
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'>
                <option value=''>Sélectionner une catégorie</option>
                {categories.map((cat, index) => (
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
    date: "",
    categorie: "",
  });
  const [depenses, setDepenses] = useState([]);
  const [revenus, setRevenus] = useState([]);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [showRevenuModal, setShowRevenuModal] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES); // État pour stocker les catégories
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
    loading: false,
    timeoutId: null,
  });

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
            setCategories(categoriesList);
          }
        } else {
          // Si la collection est vide, on l'initialise avec les catégories par défaut
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

        // Ajout des catégories par défaut dans Firestore
        for (const categorie of DEFAULT_CATEGORIES) {
          await addDoc(collection(db, "categories"), {
            nom: categorie,
            createdAt: serverTimestamp(),
          });
        }

        // Mise à jour de l'état local avec les catégories par défaut
        setCategories(DEFAULT_CATEGORIES);

        // Afficher un toast de succès
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        setToast({
          open: true,
          message: "Catégories initialisées avec succès",
          type: "success",
          loading: false,
          timeoutId: setTimeout(
            () => setToast((t) => ({ ...t, open: false })),
            3000
          ),
        });
      } catch (err) {
        console.error("Erreur lors de l'initialisation des catégories:", err);

        // Toast d'erreur
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        setToast({
          open: true,
          message: "Erreur lors de l'initialisation des catégories",
          type: "error",
          loading: false,
          timeoutId: setTimeout(
            () => setToast((t) => ({ ...t, open: false })),
            5000
          ),
        });
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
        date: "",
        categorie: "",
      });
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

  const showEmpty =
    tab === "revenus"
      ? revenusFiltres.length === 0
      : depensesFiltres.length === 0;

  const moisEnCours = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  // Fonction pour ajouter une dépense depuis la modale
  const handleAddDepense = async (depense) => {
    try {
      console.log("Ajout dépense Firestore :", depense);

      // Affichage du toast de chargement
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      setToast({
        open: true,
        message: "Ajout de la dépense en cours...",
        type: "loading",
        loading: true,
        timeoutId: null,
      });

      // Simplification - juste essayer d'ajouter le document
      await addDoc(collection(db, "depense"), {
        nom: depense.nom,
        montant: depense.montant, // Déjà négatif depuis le DepenseModal
        date: depense.date || new Date().toISOString().split("T")[0],
        categorie: depense.categorie,
        createdAt: serverTimestamp(),
      });

      // Rafraîchir les données
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

      // Toast de succès
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      setToast({
        open: true,
        message: "Dépense ajoutée avec succès",
        type: "success",
        loading: false,
        timeoutId: setTimeout(
          () => setToast((t) => ({ ...t, open: false })),
          3000
        ),
      });
    } catch (err) {
      console.error("Erreur Firestore add dépense:", err);

      // Toast d'erreur
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      setToast({
        open: true,
        message:
          "Erreur lors de l'ajout de la dépense. Désactivez les bloqueurs de publicités.",
        type: "error",
        loading: false,
        timeoutId: setTimeout(
          () => setToast((t) => ({ ...t, open: false })),
          5000
        ),
      });
    }
  };

  // Fonction pour ajouter un revenu depuis la modale
  const handleAddRevenu = async (revenu) => {
    try {
      console.log("Ajout revenu Firestore :", revenu);

      // Affichage du toast de chargement
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      setToast({
        open: true,
        message: "Ajout du revenu en cours...",
        type: "loading",
        loading: true,
        timeoutId: null,
      });

      // Simplification - juste essayer d'ajouter le document
      await addDoc(collection(db, "revenu"), {
        nom: revenu.nom,
        montant: revenu.montant,
        date: revenu.date || new Date().toISOString().split("T")[0],
        categorie: revenu.categorie,
        createdAt: serverTimestamp(),
      });

      // Rafraîchir les données
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

      // Toast de succès
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      setToast({
        open: true,
        message: "Revenu ajouté avec succès",
        type: "success",
        loading: false,
        timeoutId: setTimeout(
          () => setToast((t) => ({ ...t, open: false })),
          3000
        ),
      });
    } catch (err) {
      console.error("Erreur Firestore add revenu:", err);

      // Toast d'erreur
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      setToast({
        open: true,
        message:
          "Erreur lors de l'ajout du revenu. Désactivez les bloqueurs de publicités.",
        type: "error",
        loading: false,
        timeoutId: setTimeout(
          () => setToast((t) => ({ ...t, open: false })),
          5000
        ),
      });
    }
  };

  // Fonctions de rendu des cartes de transaction
  const renderTransaction = (transaction) => {
    const montant = transaction.montant;
    const montantText =
      montant >= 0
        ? `+${Number(montant).toFixed(2)} €`
        : `${Number(montant).toFixed(2)} €`;
    const montantColor = montant >= 0 ? "text-green-600" : "text-red-600";
    const dateFormatted = formatDate(transaction.date);

    return (
      <div
        key={transaction.id}
        className='bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3'>
              <span className='text-gray-600'>€</span>
            </div>
            <div>
              <div className='font-semibold'>
                {transaction.nom.charAt(0).toUpperCase() +
                  transaction.nom.slice(1)}
              </div>
              <div className='text-xs text-gray-500'>
                {dateFormatted} • {transaction.categorie}
              </div>
            </div>
          </div>
          <div className={`font-bold ${montantColor}`}>{montantText}</div>
        </div>
      </div>
    );
  };

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        loading={toast.loading}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-[#222] dark:text-white mb-1'>
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
                type='button'
                style={{ lineHeight: 1 }}>
                <AiOutlineArrowLeft />
              </button>
              <span className='font-semibold text-lg px-4 select-none text-[#222] dark:text-white'>
                {getMonthYear(selectedDate)}
              </span>
              <button
                className='text-[#222] dark:text-white text-xl px-2 py-1 rounded hover:bg-[#e9eef2] dark:hover:bg-gray-900 transition'
                onClick={handleNextMonth}
                aria-label='Mois suivant'
                type='button'
                style={{ lineHeight: 1 }}>
                <AiOutlineArrowRight />
              </button>
            </div>
          </div>
        </div>
        {/* Indicateurs */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-4'>
          {/* Total Revenus */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
              <FaArrowDown className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Revenus</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalRevenus.toFixed(2)} €
            </div>
          </div>
          {/* Total Dépenses */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-red-600 dark:text-red-400 mb-2'>
              <FaArrowUp className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Dépenses</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalDepenses.toFixed(2)} €
            </div>
          </div>
          {/* Solde */}
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
              onClick={() => setTab("revenus")}
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
              onClick={() => setTab("depenses")}
              type='button'>
              Dépenses
            </button>
          </div>
        </div>
        {/* Contenu revenus/dépenses */}
        {tab === "depenses" && (
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <div className='text-2xl font-bold'>Dépenses du mois</div>
                <div className='text-sm text-gray-500 mt-1'>
                  Liste de toutes vos dépenses pour {moisEnCours}
                </div>
              </div>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={() => setShowDepenseModal(true)}>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter</span>
              </button>
            </div>

            {depensesFiltres.length === 0 ? (
              <div className='bg-[#f7fafd] rounded-xl py-12 px-4 flex flex-col items-center justify-center'>
                <div className='text-gray-400 text-center text-sm italic mb-4'>
                  Aucune dépense pour ce mois
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {depensesFiltres.map(renderTransaction)}
              </div>
            )}

            {showDepenseModal && (
              <DepenseModal
                onClose={() => setShowDepenseModal(false)}
                onSave={handleAddDepense}
                categories={categories}
              />
            )}
          </div>
        )}

        {tab === "revenus" && (
          <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <div className='text-2xl font-bold'>Revenus du mois</div>
                <div className='text-sm text-gray-500 mt-1'>
                  Liste de tous vos revenus pour {moisEnCours}
                </div>
              </div>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={() => setShowRevenuModal(true)}>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter</span>
              </button>
            </div>

            {revenusFiltres.length === 0 ? (
              <div className='bg-[#f7fafd] rounded-xl py-12 px-4 flex flex-col items-center justify-center'>
                <div className='text-gray-400 text-center text-sm italic mb-4'>
                  Aucun revenu pour ce mois
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {revenusFiltres.map(renderTransaction)}
              </div>
            )}

            {showRevenuModal && (
              <RevenuModal
                onClose={() => setShowRevenuModal(false)}
                onSave={handleAddRevenu}
                categories={categories}
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
                  date: "",
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
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  min='0'
                  step='0.01'
                  placeholder='Ex: 99.99'
                  ref={montantInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTransaction.montant)
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
                    if (e.target.value) {
                      setTimeout(() => handleAddTransaction(), 100);
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={categorieInputRef}>
                  <option value=''>Sélectionner une catégorie</option>
                  {categories.map((cat, index) => (
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
