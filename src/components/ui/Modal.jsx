import React, { useState, useRef, useEffect } from "react";

export function ModalDepenseRevenu({
  visible,
  onClose,
  onSave,
  initialValues = {},
  categories = [],
  title = "Ajouter une transaction",
  editMode = false,
}) {
  const steps = [
    { name: "nom", label: "Nom", type: "text" },
    { name: "categorie", label: "Catégorie", type: "select" },
    { name: "montant", label: "Montant (€)", type: "number" },
    { name: "date", label: "Date", type: "date" },
  ];

  const defaultForm = {
    nom: "",
    categorie: "",
    montant: "",
    date: new Date().toISOString().split("T")[0],
  };

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const inputRef = useRef(null);
  const isKeyboardNavigation = useRef(false);

  useEffect(() => {
    if (visible) {
      console.log("Modal ouverte - Réinitialisation du formulaire");
      setForm(initialValues || defaultForm);
      setError(null);
      setStep(1);
      setSelectedDate(null);
      isKeyboardNavigation.current = false;
    }
  }, [visible, initialValues]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, visible]);

  const current = steps[step - 1];

  const handleChange = (e) => {
    console.log(
      "handleChange - Type:",
      e.target.type,
      "Valeur:",
      e.target.value
    );
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    console.log(
      "handleCategoryChange - Nouvelle catégorie:",
      newCategory,
      "Navigation clavier:",
      isKeyboardNavigation.current
    );
    setForm((prev) => ({ ...prev, categorie: newCategory }));

    // On ne valide que si ce n'est pas une navigation au clavier
    if (!isKeyboardNavigation.current) {
      if (validateStep()) {
        handleNext();
      }
    }
    isKeyboardNavigation.current = false;
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    console.log("handleDateChange - Nouvelle date:", newDate);
    setSelectedDate(newDate);
    setForm((prev) => ({ ...prev, date: newDate }));
  };

  const validateStep = () => {
    console.log("validateStep - État actuel:", {
      currentStep: current.name,
      formValue: form[current.name],
      selectedDate,
    });

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
  };

  const handleNext = () => {
    console.log("handleNext - Avant validation");
    if (!validateStep()) {
      console.log("handleNext - Validation échouée");
      return;
    }
    if (step < steps.length) {
      console.log("handleNext - Passage à l'étape suivante:", step + 1);
      setStep(step + 1);
    } else {
      console.log("handleNext - Validation finale du formulaire:", form);
      onSave(form);
      onClose();
    }
  };

  // Effet pour gérer la validation automatique de la date
  useEffect(() => {
    if (selectedDate && step === 4) {
      console.log("Validation automatique de la date:", selectedDate);
      const timer = setTimeout(() => {
        if (validateStep()) {
          handleNext();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDate]);

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleKeyDown = (e) => {
    console.log(
      "handleKeyDown - Touche pressée:",
      e.key,
      "Type:",
      current.type
    );

    if (e.key === "Enter") {
      console.log("handleKeyDown - Validation avec Entrée");
      e.preventDefault();
      handleNext();
    } else if (current.type === "select") {
      console.log("handleKeyDown - Select détecté, navigation clavier");
      isKeyboardNavigation.current = true;
      return;
    }
  };

  const renderPreviousAnswers = () => {
    return (
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
    );
  };

  if (!visible) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
