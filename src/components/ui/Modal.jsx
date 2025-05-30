import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export function ModalDepenseRevenu({
  visible,
  onClose,
  onSave,
  initialValues = {},
  categories = [],
  title = "Ajouter une transaction",
  editMode = false,
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

  // Références dérivées
  const current = useMemo(() => steps[step - 1], [steps, step]);

  // Effets
  useEffect(() => {
    if (visible) {
      console.log("Modal ouverte - Réinitialisation du formulaire");
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
      console.log("Validation automatique de la catégorie:", form.categorie);
      handleNext();
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
    if (!form[current.name]) {
      setError(`Le champ "${current.label}" est obligatoire`);
      return false;
    }
    if (
      current.name === "montant" &&
      (isNaN(parseFloat(form.montant)) || parseFloat(form.montant) <= 0)
    ) {
      setError("Le montant doit être un nombre positif");
      return false;
    }
    setError(null);
    return true;
  }, [current, form]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;

    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onSave(form);
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

    if (!isKeyboardNavigation.current) {
      shouldValidateCategory.current = true;
    }
    isKeyboardNavigation.current = false;
  }, []);

  const handleDateChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, date: e.target.value }));
    shouldValidateDate.current = true;
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (current.type === "select") {
        // On marque la navigation au clavier mais on ne bloque pas les flèches
        isKeyboardNavigation.current = true;
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
      className='fixed inset-0 z-[9999] flex items-center justify-center'
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
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
          {current.type === "date" && (
            <div className='mb-6'>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='date'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleDateChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                ref={inputRef}
                onKeyDown={handleKeyDown}
                autoFocus
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
    if (
      current.name === "montant" &&
      (isNaN(parseFloat(form.montant)) || parseFloat(form.montant) <= 0)
    ) {
      setError("Le montant doit être un nombre positif");
      return false;
    }
    if (
      current.name === "jour" &&
      (!form.jour || form.jour < 1 || form.jour > 31)
    ) {
      setError("Le jour doit être compris entre 1 et 31");
      return false;
    }
    setError(null);
    return true;
  }, [current, form]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;

    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onSave(form);
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

    if (!isKeyboardNavigation.current) {
      shouldValidateCategory.current = true;
    }
    isKeyboardNavigation.current = false;
  }, []);

  const handleDayClick = useCallback((day) => {
    setForm((prev) => ({ ...prev, jour: day.toString() }));
    shouldValidateDay.current = true;
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
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
      className='fixed inset-0 z-[9999] flex items-center justify-center'
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
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
