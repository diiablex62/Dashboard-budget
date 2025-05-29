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
import MonthPickerModal from "../components/ui/MonthPickerModal";
import TransactionCard from "../components/ui/TransactionCard";

// Import des catégories et données centralisées
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  getMonthYear,
  CATEGORY_COLORS,
  CATEGORIES,
} from "../utils/categoryUtils";
import { fakeDepenseRevenu } from "../utils/fakeData";

import {
  calculTotalDepensesMois,
  totalRevenusGlobalMois,
  calculEconomies,
} from "../utils/calcul";
import { deletePaiementWithUndo } from "../utils/paiementActions.jsx";

function RevenuModal({ onClose, onSave, revenu = null, stepInit = 1 }) {
  console.log("REVENUS_CATEGORIES:", REVENUS_CATEGORIES);
  const [step, setStep] = useState(stepInit);
  const [form, setForm] = useState({
    id: revenu?.id || null,
    nom: revenu?.nom || "",
    montant: revenu?.montant ? revenu.montant.toString() : "",
    categorie: revenu?.categorie || "",
    date: revenu?.date || new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState(null);
  const montantInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const categorieSelectRef = useRef(null);
  const [dateInput, setDateInput] = useState("");

  const handleChange = useCallback((e) => {
    console.log(e.target.name, e.target.value);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }, []);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  const handleDateInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      let formattedValue = value;
      if (value.length > 2) {
        formattedValue = value.slice(0, 2) + "/" + value.slice(2);
      }
      if (value.length > 4) {
        formattedValue =
          value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
      }
      setDateInput(formattedValue);

      // Mise à jour de la date complète
      if (value.length === 8) {
        const year = value.slice(4, 8);
        const month = value.slice(2, 4);
        const day = value.slice(0, 2);
        const dateStr = `${year}-${month}-${day}`;
        handleChange({ target: { name: "date", value: dateStr } });
      }
    }
  };

  useEffect(() => {
    if (step === 2 && categorieSelectRef.current) {
      setTimeout(() => {
        categorieSelectRef.current.focus();
      }, 100);
    }
    if (step === 3 && montantInputRef.current) {
      setTimeout(() => {
        montantInputRef.current.focus();
      }, 100);
    }
    if (step === 4 && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current.focus();
      }, 100);
    }
  }, [step]);

  useEffect(() => {
    if (form.date) {
      const [year, month, day] = form.date.split("-");
      setDateInput(`${day}/${month}/${year}`);
    }
  }, [form.date]);

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
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'
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
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                placeholder='Ex: Salaire'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.nom) handleNext();
                }}
              />
              <div className='flex justify-end'>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
                    handleNext();
                  }
                }}
                onKeyDown={(e) => {
                  const currentIndex = CATEGORIES.indexOf(form.categorie);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextIndex =
                      currentIndex < CATEGORIES.length - 1
                        ? currentIndex + 1
                        : 0;
                    handleChange({
                      target: {
                        name: "categorie",
                        value: CATEGORIES[nextIndex],
                      },
                    });
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevIndex =
                      currentIndex > 0
                        ? currentIndex - 1
                        : CATEGORIES.length - 1;
                    handleChange({
                      target: {
                        name: "categorie",
                        value: CATEGORIES[prevIndex],
                      },
                    });
                  } else if (e.key === "Enter" && form.categorie) {
                    handleNext();
                  }
                }}
                ref={categorieSelectRef}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                size={CATEGORIES.length + 1}
                style={{ overflowY: "auto" }}>
                <option value=''>Sélectionner une catégorie</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400 cursor-pointer'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
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
                  className='text-gray-600 dark:text-gray-400 cursor-pointer'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
              <div className='relative'>
                <input
                  type='date'
                  name='date'
                  value={form.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (newDate) {
                      onSave({
                        ...form,
                        date: newDate,
                        montant: parseFloat(form.montant),
                        id: form.id,
                      });
                      onClose();
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden'
                  style={{
                    paddingRight: "2.5rem",
                  }}
                  ref={dateInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.date) handleSubmit(e);
                  }}
                />
                <AiOutlineCalendar
                  className='absolute right-3 top-3 text-xl text-gray-400 dark:text-white cursor-pointer'
                  onClick={() => {
                    if (dateInputRef.current) {
                      dateInputRef.current.showPicker();
                    }
                  }}
                />
              </div>
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400 cursor-pointer'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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

function DepenseModal({ onClose, onSave, depense = {}, stepInit = 1 }) {
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
  const categorieSelectRef = useRef(null);
  const [dateInput, setDateInput] = useState("");

  const handleChange = useCallback((e) => {
    console.log(e.target.name, e.target.value);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }, []);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  const handleDateInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      let formattedValue = value;
      if (value.length > 2) {
        formattedValue = value.slice(0, 2) + "/" + value.slice(2);
      }
      if (value.length > 4) {
        formattedValue =
          value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
      }
      setDateInput(formattedValue);

      // Mise à jour de la date complète
      if (value.length === 8) {
        const year = value.slice(4, 8);
        const month = value.slice(2, 4);
        const day = value.slice(0, 2);
        const dateStr = `${year}-${month}-${day}`;
        handleChange({ target: { name: "date", value: dateStr } });
      }
    }
  };

  useEffect(() => {
    if (step === 2 && categorieSelectRef.current) {
      setTimeout(() => {
        categorieSelectRef.current.focus();
      }, 100);
    }
    if (step === 3 && montantInputRef.current) {
      setTimeout(() => {
        montantInputRef.current.focus();
      }, 100);
    }
    if (step === 4 && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current.focus();
      }, 100);
    }
  }, [step]);

  useEffect(() => {
    if (form.date) {
      const [year, month, day] = form.date.split("-");
      setDateInput(`${day}/${month}/${year}`);
    }
  }, [form.date]);

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
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'
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
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                placeholder='Ex: Loyer'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.nom) handleNext();
                }}
              />
              <div className='flex justify-end'>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
                    handleNext();
                  }
                }}
                onKeyDown={(e) => {
                  const currentIndex = CATEGORIES.indexOf(form.categorie);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextIndex =
                      currentIndex < CATEGORIES.length - 1
                        ? currentIndex + 1
                        : 0;
                    handleChange({
                      target: {
                        name: "categorie",
                        value: CATEGORIES[nextIndex],
                      },
                    });
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevIndex =
                      currentIndex > 0
                        ? currentIndex - 1
                        : CATEGORIES.length - 1;
                    handleChange({
                      target: {
                        name: "categorie",
                        value: CATEGORIES[prevIndex],
                      },
                    });
                  } else if (e.key === "Enter" && form.categorie) {
                    handleNext();
                  }
                }}
                ref={categorieSelectRef}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                size={CATEGORIES.length + 1}
                style={{ overflowY: "auto" }}>
                <option value=''>Sélectionner une catégorie</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400 cursor-pointer'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
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
                  className='text-gray-600 dark:text-gray-400 cursor-pointer'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
              <div className='relative'>
                <input
                  type='date'
                  name='date'
                  value={form.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (newDate) {
                      onSave({
                        ...form,
                        date: newDate,
                        montant: parseFloat(form.montant),
                        id: form.id,
                      });
                      onClose();
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden'
                  style={{
                    paddingRight: "2.5rem",
                  }}
                  ref={dateInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.date) handleSubmit(e);
                  }}
                />
                <AiOutlineCalendar
                  className='absolute right-3 top-3 text-xl text-gray-400 dark:text-white cursor-pointer'
                  onClick={() => {
                    if (dateInputRef.current) {
                      dateInputRef.current.showPicker();
                    }
                  }}
                />
              </div>
              <div className='flex justify-between'>
                <button
                  className='text-gray-600 dark:text-gray-400 cursor-pointer'
                  type='button'
                  onClick={handlePrev}>
                  Précédent
                </button>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
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
  const [depenses, setDepenses] = useState([]);
  const [revenus, setRevenus] = useState([]);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [showRevenuModal, setShowRevenuModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchDepenseRevenu = useCallback(() => {
    setDepenses(fakeDepenseRevenu.filter((t) => t.type === "depense"));
    setRevenus(fakeDepenseRevenu.filter((t) => t.type === "revenu"));
  }, []);

  useEffect(() => {
    fetchDepenseRevenu();
  }, [fetchDepenseRevenu]);

  useEffect(() => {
    const handleDataUpdate = () => fetchDepenseRevenu();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchDepenseRevenu]);

  const handleAddRevenu = useCallback(() => {
    setSelectedItem(null);
    setShowRevenuModal(true);
  }, []);

  const handleAddDepense = useCallback(() => {
    setSelectedItem(null);
    setShowDepenseModal(true);
  }, []);

  const handleSaveRevenu = useCallback(async (revenu) => {
    setRevenus((prev) => {
      if (revenu.id) {
        // Edition locale
        return prev.map((t) =>
          t.id === revenu.id ? { ...revenu, type: "revenu" } : t
        );
      } else {
        // Ajout local
        return [...prev, { ...revenu, id: Date.now(), type: "revenu" }];
      }
    });
  }, []);

  const handleSaveDepense = useCallback(async (depense) => {
    setDepenses((prev) => {
      if (depense.id) {
        // Edition locale
        return prev.map((t) =>
          t.id === depense.id ? { ...depense, type: "depense" } : t
        );
      } else {
        // Ajout local
        return [...prev, { ...depense, id: Date.now(), type: "depense" }];
      }
    });
  }, []);

  const filteredDepenseRevenu = useMemo(() => {
    const items = currentTab === "depense" ? depenses : revenus;
    return items.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [currentTab, depenses, revenus, selectedDate]);

  const totalDepenses = useMemo(
    () => calculTotalDepensesMois(depenses, [], [], selectedDate),
    [depenses, selectedDate]
  );
  const totalRevenus = useMemo(
    () => totalRevenusGlobalMois(revenus, [], [], selectedDate),
    [revenus, selectedDate]
  );
  const solde = useMemo(
    () => calculEconomies(totalRevenus, totalDepenses),
    [totalRevenus, totalDepenses]
  );

  const renderContent = () => {
    try {
      return (
        <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
          <div>
            {/* Titre et sélecteur de mois */}
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Dépenses et Revenus
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Dépenses du mois de {getMonthYear(selectedDate)}
                </p>
              </div>
              <MonthPickerModal
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Cartes de statistiques */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              {/* Carte 1: Total Dépenses */}
              <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center relative'>
                <div className='flex items-center text-red-600 mb-2'>
                  <AiOutlineDollarCircle className='text-2xl mr-2' />
                  <span className='text-sm font-semibold dark:text-white'>
                    Total Dépenses
                  </span>
                  <div className='relative group ml-2'>
                    <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
                    <div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                      Ce total correspond uniquement aux transactions de type
                      dépense, hors paiements récurrents et échelonnés.
                    </div>
                  </div>
                </div>
                <div className='text-2xl text-[#222] dark:text-white'>
                  {totalDepenses.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </div>
              </div>
              {/* Carte 2: Total Revenus */}
              <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center'>
                <div className='flex items-center text-green-600 mb-2'>
                  <AiOutlineCalendar className='text-2xl mr-2' />
                  <span className='text-sm font-semibold dark:text-white'>
                    Total Revenus
                  </span>
                </div>
                <div className='text-2xl text-[#222] dark:text-white'>
                  {totalRevenus.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </div>
              </div>
              {/* Carte 3: Solde */}
              <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center'>
                <div className='flex items-center text-blue-600 mb-2'>
                  <AiOutlineDollarCircle className='text-2xl mr-2' />
                  <span className='text-sm font-semibold dark:text-white'>
                    Solde
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    solde > 0
                      ? "text-green-600"
                      : solde < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}>
                  {solde > 0 && "+"}
                  {solde < 0 && "-"}
                  {Math.abs(solde).toLocaleString("fr-FR", {
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
            {/* Affichage des dépenses & revenus */}
            <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-8 mt-2 '>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <div className='text-2xl font-bold text-[#222] dark:text-white'>
                    {currentTab === "depense"
                      ? "Dépenses du mois"
                      : "Revenus du mois"}
                  </div>
                  <div className='text-sm text-gray-500 mt-1 dark:text-gray-300'>
                    {currentTab === "depense" ? "Dépenses" : "Revenus"} du mois
                    de {getMonthYear(selectedDate)}
                  </div>
                </div>
                {/* Bouton Ajouter - toujours visible ici */}
                <div className='flex space-x-3'>
                  <button
                    className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                    onClick={
                      currentTab === "depense"
                        ? handleAddDepense
                        : handleAddRevenu
                    }>
                    <span className='text-lg font-bold'>+</span>
                    <span className='cursor-pointer'>Ajouter</span>
                  </button>
                </div>
              </div>

              {filteredDepenseRevenu.length === 0 ? (
                <div className='text-center py-10 text-gray-500 dark:text-gray-300'>
                  <p>
                    Aucune {currentTab === "depense" ? "dépense" : "revenu"}{" "}
                    pour {getMonthYear(selectedDate)}.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 h-full'>
                  {filteredDepenseRevenu.map((depenseRevenuItem, idx) => (
                    <TransactionCard
                      key={depenseRevenuItem.id || idx}
                      item={depenseRevenuItem}
                      currentTab={currentTab}
                      onEdit={() => {
                        setSelectedItem(depenseRevenuItem);
                        if (currentTab === "depense") setShowDepenseModal(true);
                        else setShowRevenuModal(true);
                      }}
                      onDelete={() => {
                        if (currentTab === "depense") {
                          deletePaiementWithUndo(
                            depenseRevenuItem.id,
                            setDepenses,
                            depenseRevenuItem.nom
                          );
                        } else {
                          deletePaiementWithUndo(
                            depenseRevenuItem.id,
                            setRevenus,
                            depenseRevenuItem.nom
                          );
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {showRevenuModal && (
            <RevenuModal
              onClose={() => setShowRevenuModal(false)}
              onSave={handleSaveRevenu}
              revenu={selectedItem}
            />
          )}
          {showDepenseModal && (
            <DepenseModal
              onClose={() => setShowDepenseModal(false)}
              onSave={handleSaveDepense}
              depense={selectedItem || {}}
            />
          )}
        </div>
      );
    } catch (error) {
      console.error("Erreur dans le rendu de DepensesRevenus:", error);
      return (
        <div className='container mx-auto px-4 py-8'>
          <div
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
            role='alert'>
            <strong className='font-bold'>Erreur !</strong>
            <span className='block sm:inline'>
              {" "}
              Une erreur est survenue lors du chargement de la page.
            </span>
          </div>
        </div>
      );
    }
  };

  return renderContent();
}
