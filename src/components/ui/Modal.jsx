import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import ScrollProgress from "./ScrollProgress";

const Modal = ({ open, onClose, children }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
      <div className='bg-white rounded-[40px] shadow-xl max-w-2xl w-full mx-4 animate-fadeIn overflow-hidden'>
        <div
          ref={contentRef}
          className='max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          <div className='sticky top-0 bg-white z-10 flex justify-end p-4'>
            <button
              onClick={onClose}
              className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-2xl text-gray-500 transition'
              title='Fermer'>
              &#10005;
            </button>
          </div>
          <div className='px-8 pb-8 pt-0'>{children}</div>
        </div>
        <ScrollProgress containerRef={contentRef} />
      </div>
    </div>
  );
};

export default Modal;

export function ModalDepenseRevenu({
  visible,
  onClose,
  onSave,
  initialValues = {},
  categories = [],
  title = "Ajouter une transaction",
  editMode = false,
  isViewMode = false,
}) {
  // Configuration statique
  const steps = useMemo(
    () => [
      { name: "nom", label: "Nom", type: "text" },
      { name: "categorie", label: "Catégorie", type: "select" },
      { name: "montant", label: "Montant (€)", type: "number" },
      { name: "date", label: "Date", type: "date" },
    ],
    []
  );

  const defaultForm = useMemo(
    () => ({
      nom: "",
      categorie: "",
      montant: "",
      date: new Date().toISOString().split("T")[0],
    }),
    []
  );

  // États
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const isKeyboardNavigation = useRef(false);
  const shouldValidateCategory = useRef(false);
  const shouldValidateDate = useRef(false);
  const lastCategory = useRef("");

  // Références dérivées
  const current = useMemo(() => steps[step - 1], [steps, step]);

  // Effets
  useEffect(() => {
    if (visible) {
      setForm(initialValues || defaultForm);
      setError(null);
      if (!isViewMode) {
        setStep(1);
      }
      isKeyboardNavigation.current = false;
      shouldValidateCategory.current = false;
      shouldValidateDate.current = false;
    }
  }, [visible, initialValues, defaultForm, isViewMode]);

  useEffect(() => {
    if (visible && inputRef.current && !isViewMode) {
      inputRef.current.focus();
    }
  }, [step, visible, isViewMode]);

  useEffect(() => {
    if (shouldValidateCategory.current && form.categorie && step === 2) {
      shouldValidateCategory.current = false;
    }
  }, [form.categorie, step]);

  useEffect(() => {
    if (shouldValidateDate.current && form.date && step === 4) {
      handleNext();
      shouldValidateDate.current = false;
    }
  }, [form.date, step]);

  // Handlers
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const validateStep = useCallback(() => {
    if (isViewMode) return true;

    if (!form[current.name]) {
      setError(`Le champ "${current.label}" est obligatoire`);
      return false;
    }

    if (current.name === "montant") {
      const montant = parseFloat(form.montant);
      if (isNaN(montant) || montant <= 0) {
        setError("Le montant doit être un nombre positif");
        return false;
      }
    }

    if (current.name === "dateDebut") {
      if (!form.dateDebut) {
        setError("La date de début est obligatoire");
        return false;
      }
    }

    setError(null);
    return true;
  }, [current, form, isViewMode]);

  const handleNext = useCallback(() => {
    if (!validateStep()) {
      return;
    }

    if (step < steps.length) {
      setStep(step + 1);
    } else {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const jourPrelevement = form.date.split("-")[2];

      const today = currentDate.getDate();
      let targetMonth = currentMonth;
      let targetYear = currentYear;

      if (today > jourPrelevement) {
        targetMonth = currentMonth + 1;
        if (targetMonth > 12) {
          targetMonth = 1;
          targetYear++;
        }
      }

      const dateDebut = `${targetYear}-${targetMonth
        .toString()
        .padStart(2, "0")}-${jourPrelevement.toString().padStart(2, "0")}`;

      const finalForm = {
        ...form,
        dateDebut,
      };
      onSave(finalForm);
      onClose();
    }
  }, [step, steps.length, validateStep, form, onSave, onClose]);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleChange = useCallback(
    (e) => {
      if (isViewMode) return;
      if (e.target.name === "dateDebut") {
      } else {
        setForm((prev) => {
          const newForm = { ...prev, [e.target.name]: e.target.value };
          return newForm;
        });
      }
    },
    [isViewMode]
  );

  const handleCategoryChange = useCallback(
    (e) => {
      if (isViewMode) return;
      const newCategory = e.target.value;
      setForm((prev) => ({ ...prev, categorie: newCategory }));
      setError(null);
    },
    [isViewMode]
  );

  const handleCategoryClick = useCallback(() => {
    if (isViewMode) return;
    if (
      form.categorie &&
      form.categorie !== lastCategory.current &&
      step === 2
    ) {
      lastCategory.current = form.categorie;
      handleNext();
    }
  }, [form.categorie, step, handleNext, isViewMode]);

  const handleKeyDown = useCallback(
    (e) => {
      if (isViewMode) return;
      if (e.key === "Enter" && current.type === "select") {
        e.preventDefault();
        handleNext();
      } else if (current.type === "select") {
        isKeyboardNavigation.current = true;
      } else if (current.type === "date") {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
        }
      }
    },
    [current.type, handleNext, isViewMode]
  );

  const renderPreviousAnswers = useCallback(
    () => (
      <div className='mb-4 space-y-2'>
        {steps.slice(0, step - 1).map((s) => (
          <div key={s.name} className='text-sm'>
            <span className='text-gray-500 dark:text-gray-400'>
              {s.label} :{" "}
            </span>
            <span className='font-medium dark:text-white'>
              {s.name === "montant"
                ? `${form[s.name]} €`
                : s.name === "date"
                ? new Date(form[s.name]).toLocaleDateString("fr-FR")
                : form[s.name]}
            </span>
          </div>
        ))}
      </div>
    ),
    [steps, step, form]
  );

  if (!visible) return null;

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={handleBackdropClick}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'
          onClick={onClose}
          aria-label='Fermer'>
          ✕
        </button>
        <div className='mb-6 text-lg font-semibold dark:text-white'>
          {title}
        </div>
        {error && (
          <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        {step > 1 && renderPreviousAnswers()}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}>
          <div className='mb-6'>
            <label
              htmlFor={current.name}
              className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>
              {current.label}
            </label>
            {current.type === "text" && (
              <input
                type='text'
                id={current.name}
                name={current.name}
                value={form[current.name]}
                onChange={handleChange}
                ref={inputRef}
                readOnly={isViewMode}
                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  isViewMode
                    ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    : ""
                }`}
              />
            )}
            {current.type === "number" && (
              <input
                type='number'
                id={current.name}
                name={current.name}
                value={form[current.name]}
                onChange={handleChange}
                ref={inputRef}
                readOnly={isViewMode}
                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  isViewMode
                    ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    : ""
                }`}
              />
            )}
            {current.type === "select" && (
              <select
                id={current.name}
                name={current.name}
                value={form[current.name]}
                onChange={handleCategoryChange}
                ref={inputRef}
                disabled={isViewMode}
                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  isViewMode
                    ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    : ""
                }`}>
                <option value=''>Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
            {current.type === "date" && (
              <DatePicker
                selected={form.date ? new Date(form.date) : null}
                onChange={(date) =>
                  handleChange({
                    target: {
                      name: current.name,
                      value: date.toISOString().split("T")[0],
                    },
                  })
                }
                locale={fr}
                dateFormat='dd/MM/yyyy'
                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  isViewMode
                    ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    : ""
                }`}
                readOnly={isViewMode}
                disabled={isViewMode}
              />
            )}
            {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
          </div>
          {!isViewMode && (
            <div className='flex justify-between mt-6'>
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition'>
                  Précédent
                </button>
              )}
              <button
                onClick={handleNext}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                  step === 1 && "ml-auto"
                }`}>
                {step < steps.length
                  ? "Suivant"
                  : editMode
                  ? "Modifier"
                  : "Ajouter"}
              </button>
            </div>
          )}
          {isViewMode && (
            <div className='flex justify-end mt-6'>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition'>
                Fermer
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export function ModalRecurrent({
  visible,
  onClose,
  onSave,
  initialValues = {},
  categories = [],
  title = "Ajouter une transaction récurrente",
  editMode = false,
}) {
  // Configuration statique
  const steps = useMemo(
    () => [
      { name: "nom", label: "Nom", type: "text" },
      { name: "categorie", label: "Catégorie", type: "select" },
      { name: "montant", label: "Montant (€)", type: "number" },
      { name: "jour", label: "Jour de prélèvement", type: "grid" },
    ],
    []
  );

  const defaultForm = useMemo(
    () => ({
      nom: "",
      categorie: "",
      montant: "",
      jour: "",
    }),
    []
  );

  // États
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const isKeyboardNavigation = useRef(false);
  const shouldValidateCategory = useRef(false);
  const shouldValidateDay = useRef(false);
  const gridRef = useRef(null);
  const lastCategory = useRef("");

  // Références dérivées
  const current = useMemo(() => steps[step - 1], [steps, step]);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  // Effets
  useEffect(() => {
    if (visible) {
      setForm(initialValues || defaultForm);
      setError(null);
      setStep(1);
      isKeyboardNavigation.current = false;
      shouldValidateCategory.current = false;
      shouldValidateDay.current = false;
    }
  }, [visible, initialValues, defaultForm]);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, visible]);

  useEffect(() => {
    if (shouldValidateCategory.current && form.categorie && step === 2) {
      handleNext();
      shouldValidateCategory.current = false;
    }
  }, [form.categorie, step]);

  useEffect(() => {
    if (shouldValidateDay.current && form.jour && step === 4) {
      handleNext();
      shouldValidateDay.current = false;
    }
  }, [form.jour, step]);

  // Handlers
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const validateStep = useCallback(() => {
    if (!form[current.name]) {
      setError(`Le champ "${current.label}" est obligatoire`);
      return false;
    }

    if (current.name === "montant") {
      const montant = parseFloat(form.montant);
      if (isNaN(montant) || montant <= 0) {
        setError("Le montant doit être un nombre positif");
        return false;
      }
    }

    if (current.name === "jour") {
      const jour = parseInt(form.jour);
      if (!form.jour || jour < 1 || jour > 31) {
        setError("Le jour doit être compris entre 1 et 31");
        return false;
      }
    }

    setError(null);
    return true;
  }, [current, form, step]);

  const handleNext = useCallback(() => {
    if (!validateStep()) {
      return;
    }

    if (step < steps.length) {
      setStep(step + 1);
    } else {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const jourPrelevement = form.jour;

      const today = currentDate.getDate();
      let targetMonth = currentMonth;
      let targetYear = currentYear;

      if (today > jourPrelevement) {
        targetMonth = currentMonth + 1;
        if (targetMonth > 12) {
          targetMonth = 1;
          targetYear++;
        }
      }

      const dateDebut = `${targetYear}-${targetMonth
        .toString()
        .padStart(2, "0")}-${jourPrelevement.toString().padStart(2, "0")}`;

      const finalForm = {
        ...form,
        dateDebut,
      };
      onSave(finalForm);
      onClose();
    }
  }, [step, steps.length, validateStep, form, onSave, onClose]);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    const newCategory = e.target.value;
    setForm((prev) => ({ ...prev, categorie: newCategory }));
    setError(null);
  }, []);

  const handleCategoryClick = useCallback(() => {
    if (
      form.categorie &&
      form.categorie !== lastCategory.current &&
      step === 2
    ) {
      lastCategory.current = form.categorie;
      handleNext();
    }
  }, [form.categorie, step, handleNext]);

  const handleDayClick = useCallback(
    (day) => {
      setForm((prev) => ({ ...prev, jour: day.toString() }));
      handleNext();
    },
    [handleNext]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && current.type === "select") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Enter" && current.type === "grid") {
        e.preventDefault();
        handleNext();
      } else if (current.type === "select") {
        isKeyboardNavigation.current = true;
      } else if (current.type === "grid" && gridRef.current) {
        const currentDay = parseInt(form.jour) || 1;
        let newDay = currentDay;

        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            newDay = Math.max(1, currentDay - 7);
            break;
          case "ArrowDown":
            e.preventDefault();
            newDay = Math.min(31, currentDay + 7);
            break;
          case "ArrowLeft":
            e.preventDefault();
            newDay = Math.max(1, currentDay - 1);
            break;
          case "ArrowRight":
            e.preventDefault();
            newDay = Math.min(31, currentDay + 1);
            break;
          default:
            return;
        }

        setForm((prev) => ({ ...prev, jour: newDay.toString() }));
        const dayElement = gridRef.current.querySelector(
          `[data-day="${newDay}"]`
        );
        if (dayElement) {
          dayElement.focus();
        }
      }
    },
    [current.type, form.jour, handleNext]
  );

  // Effet pour mettre le focus sur le premier jour au chargement de la grille
  useEffect(() => {
    if (current.type === "grid" && gridRef.current) {
      const firstDay = gridRef.current.querySelector('[data-day="1"]');
      if (firstDay) {
        firstDay.focus();
      }
    }
  }, [current.type]);

  const renderPreviousAnswers = useCallback(
    () => (
      <div className='mb-4 space-y-2'>
        {steps.slice(0, step - 1).map((s) => (
          <div key={s.name} className='text-sm'>
            <span className='text-gray-500 dark:text-gray-400'>
              {s.label} :{" "}
            </span>
            <span className='font-medium dark:text-white'>
              {s.name === "montant"
                ? `${form[s.name]} €`
                : s.name === "jour"
                ? `Le ${form[s.name]} de chaque mois`
                : form[s.name]}
            </span>
          </div>
        ))}
      </div>
    ),
    [steps, step, form]
  );

  if (!visible) return null;

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={handleBackdropClick}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'
          onClick={onClose}
          aria-label='Fermer'>
          ✕
        </button>
        <div className='mb-6 text-lg font-semibold dark:text-white'>
          {title}
        </div>
        {error && (
          <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        {step > 1 && renderPreviousAnswers()}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}>
          {current.type === "text" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='text'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}
          {current.type === "select" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <select
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleCategoryChange}
                onClick={handleCategoryClick}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
                size={categories.length + 1}>
                <option value=''>Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
          {current.type === "number" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='number'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                min='0.01'
                step='0.01'
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}
          {current.type === "grid" && (
            <div className='mb-6'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <div
                ref={gridRef}
                className='grid grid-cols-7 gap-2'
                onKeyDown={handleKeyDown}
                tabIndex={-1}>
                {days.map((day) => (
                  <button
                    key={day}
                    type='button'
                    data-day={day}
                    onClick={() => handleDayClick(day)}
                    className={`p-2 text-center rounded focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white ${
                      form.jour === day.toString()
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    tabIndex={0}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className='flex justify-between mt-4'>
            {step > 1 && (
              <button
                type='button'
                className='text-gray-600 dark:text-gray-400 cursor-pointer'
                onClick={handlePrev}>
                Précédent
              </button>
            )}
            <button
              className={`bg-gray-900 text-white px-4 py-2 rounded cursor-pointer ${
                step === 1 ? "ml-auto" : ""
              }`}
              type='submit'>
              {step === steps.length
                ? editMode
                  ? "Valider la modification"
                  : "Valider l'ajout"
                : "Suivant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalEchelonne({
  visible,
  onClose,
  onSave,
  initialValues = {},
  categories = [],
  title = "Ajouter un paiement échelonné",
  editMode = false,
}) {
  // Configuration statique
  const steps = useMemo(
    () => [
      { name: "nom", label: "Nom", type: "text" },
      { name: "categorie", label: "Catégorie", type: "select" },
      { name: "montant", label: "Montant total (€)", type: "number" },
      { name: "mensualites", label: "Nombre de mensualités", type: "number" },
      { name: "debutDate", label: "Date de début", type: "date" },
    ],
    []
  );

  const defaultForm = useMemo(
    () => ({
      nom: "",
      categorie: "",
      montant: "",
      mensualites: "",
      debutDate: "",
    }),
    []
  );

  // États
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const isKeyboardNavigation = useRef(false);
  const shouldValidateCategory = useRef(false);
  const shouldValidateDate = useRef(false);
  const lastCategory = useRef("");

  // Références dérivées
  const current = useMemo(() => steps[step - 1], [steps, step]);

  // Effets
  useEffect(() => {
    if (visible) {
      setForm(initialValues || defaultForm);
      setError(null);
      setStep(1);
      isKeyboardNavigation.current = false;
      shouldValidateCategory.current = false;
      shouldValidateDate.current = false;
    }
  }, [visible, initialValues, defaultForm]);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, visible]);

  useEffect(() => {
    if (shouldValidateCategory.current && form.categorie && step === 2) {
      handleNext();
      shouldValidateCategory.current = false;
    }
  }, [form.categorie, step]);

  useEffect(() => {
    if (shouldValidateDate.current && form.debutDate && step === 5) {
      handleNext();
      shouldValidateDate.current = false;
    }
  }, [form.debutDate, step]);

  // Handlers
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const validateStep = useCallback(() => {
    if (!form[current.name]) {
      setError(`Le champ "${current.label}" est obligatoire`);
      return false;
    }

    if (current.name === "montant") {
      const montant = parseFloat(form.montant);
      if (isNaN(montant) || montant <= 0) {
        setError("Le montant doit être un nombre positif");
        return false;
      }
    }

    if (
      current.name === "mensualites" &&
      (isNaN(parseInt(form.mensualites)) || parseInt(form.mensualites) <= 0)
    ) {
      setError("Le nombre de mensualités doit être un nombre positif");
      return false;
    }

    if (current.name === "dateDebut") {
      if (!form.dateDebut) {
        setError("La date de début est obligatoire");
        return false;
      }
    }

    setError(null);
    return true;
  }, [current, form, step]);

  const handleNext = useCallback(() => {
    if (!validateStep()) {
      return;
    }

    if (step < steps.length) {
      setStep(step + 1);
    } else {
      const finalForm = {
        ...form,
        dateDebut: form.debutDate,
      };
      onSave(finalForm);
      onClose();
    }
  }, [step, steps.length, validateStep, form, onSave, onClose]);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleChange = useCallback((e) => {
    if (e.target.name === "dateDebut") {
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [e.target.name]: e.target.value };
        return newForm;
      });
    }
  }, []);

  const handleCategoryChange = useCallback((e) => {
    const newCategory = e.target.value;
    setForm((prev) => ({ ...prev, categorie: newCategory }));
    setError(null);
  }, []);

  const handleCategoryClick = useCallback(() => {
    if (
      form.categorie &&
      form.categorie !== lastCategory.current &&
      step === 2
    ) {
      lastCategory.current = form.categorie;
      handleNext();
    }
  }, [form.categorie, step, handleNext]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (current.type === "select") {
        isKeyboardNavigation.current = true;
      } else if (current.type === "date") {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
        }
      }
    },
    [current.type, handleNext]
  );

  const renderPreviousAnswers = useCallback(
    () => (
      <div className='mb-4 space-y-2'>
        {steps.slice(0, step - 1).map((s) => (
          <div key={s.name} className='text-sm'>
            <span className='text-gray-500 dark:text-gray-400'>
              {s.label} :{" "}
            </span>
            <span className='font-medium dark:text-white'>
              {s.name === "montant"
                ? `${form[s.name]} €`
                : s.name === "mensualites"
                ? `${form[s.name]} mensualités`
                : s.name === "debutDate"
                ? new Date(form[s.name]).toLocaleDateString("fr-FR")
                : form[s.name]}
            </span>
          </div>
        ))}
      </div>
    ),
    [steps, step, form]
  );

  if (!visible) return null;

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={handleBackdropClick}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'
          onClick={onClose}
          aria-label='Fermer'>
          ✕
        </button>
        <div className='mb-6 text-lg font-semibold dark:text-white'>
          {title}
        </div>
        {error && (
          <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        {step > 1 && renderPreviousAnswers()}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}>
          {current.type === "text" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='text'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}
          {current.type === "select" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <select
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleCategoryChange}
                onClick={handleCategoryClick}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
                size={categories.length + 1}>
                <option value=''>Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
          {current.type === "number" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='number'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                min={current.name === "mensualites" ? "1" : "0.01"}
                step={current.name === "mensualites" ? "1" : "0.01"}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}
          {current.type === "date" && (
            <div className='mb-6'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <DatePicker
                selected={form.debutDate ? new Date(form.debutDate) : null}
                onChange={(date, event) => {
                  if (
                    event &&
                    event.target &&
                    event.target.className &&
                    event.target.className.includes(
                      "react-datepicker__navigation"
                    )
                  ) {
                  } else {
                    setForm((prev) => ({
                      ...prev,
                      debutDate: date ? date.toISOString().split("T")[0] : "",
                    }));
                    shouldValidateDate.current = true;
                  }
                }}
                dateFormat='dd/MM/yyyy'
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                calendarClassName='dark:bg-gray-900 dark:text-white'
                wrapperClassName='w-full'
                locale={fr}
                placeholderText='Choisir une date'
                showPopperArrow={false}
              />
            </div>
          )}
          <div className='flex justify-between mt-4'>
            {step > 1 && (
              <button
                type='button'
                className='text-gray-600 dark:text-gray-400 cursor-pointer'
                onClick={handlePrev}>
                Précédent
              </button>
            )}
            <button
              className={`bg-gray-900 text-white px-4 py-2 rounded cursor-pointer ${
                step === 1 ? "ml-auto" : ""
              }`}
              type='submit'>
              {step === steps.length
                ? editMode
                  ? "Valider la modification"
                  : "Valider l'ajout"
                : "Suivant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
