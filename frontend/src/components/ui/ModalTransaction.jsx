import React, { useState, useRef, useEffect, useCallback } from "react";

export default function ModalTransaction({
  visible,
  onClose,
  onSave,
  steps,
  initialValues = {},
  type = "depense",
  categories = [],
  title = "Ajouter une transaction",
  editMode = false,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setForm(initialValues);
      setError(null);
    }
  }, [visible, initialValues]);

  useEffect(() => {
    if (visible && inputRefs.current[step - 1]) {
      setTimeout(() => {
        inputRefs.current[step - 1].focus();
      }, 100);
    }
  }, [step, visible]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }, []);

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  const isLastStep = step === steps.length;
  const current = steps[step - 1];

  const validateStep = () => {
    if (
      !form[current.name] ||
      (current.type === "number" && parseFloat(form[current.name]) <= 0)
    ) {
      setError(current.error || "Ce champ est requis");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e) => {
    e && e.preventDefault();
    if (!validateStep()) return;
    if (isLastStep) {
      onSave(form);
      onClose();
    } else {
      handleNext();
    }
  };

  if (!visible) return null;

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
          {title}
        </div>
        {error && (
          <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {current.type === "text" && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='text'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                placeholder={current.placeholder}
                ref={(el) => (inputRefs.current[step - 1] = el)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form[current.name]) handleSubmit(e);
                }}
              />
              {step === 1 && (
                <div className='flex justify-end'>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
                    type='submit'
                    disabled={!form[current.name]}>
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}
          {current.type === "number" && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <input
                type='number'
                name={current.name}
                value={form[current.name] || ""}
                onChange={handleChange}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                min={current.min || "0.01"}
                step={current.step || "0.01"}
                placeholder={current.placeholder}
                ref={(el) => (inputRefs.current[step - 1] = el)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form[current.name]) handleSubmit(e);
                }}
              />
            </div>
          )}
          {current.type === "select" && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <select
                name={current.name}
                value={form[current.name] || ""}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    const newForm = { ...form, [current.name]: e.target.value };
                    setTimeout(() => {
                      if (!newForm[current.name]) return;
                      if (isLastStep) {
                        onSave(newForm);
                        onClose();
                      } else {
                        setForm(newForm);
                        setStep((s) => s + 1);
                      }
                    }, 0);
                  }
                }}
                ref={(el) => (inputRefs.current[step - 1] = el)}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 cursor-pointer'
                size={current.options?.length + 1 || 2}
                autoFocus
                onKeyDown={(e) => {
                  const options = current.options || categories;
                  const currentIndex = options.indexOf(form[current.name]);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextIndex =
                      currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    handleChange({
                      target: { name: current.name, value: options[nextIndex] },
                    });
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevIndex =
                      currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    handleChange({
                      target: { name: current.name, value: options[prevIndex] },
                    });
                  } else if (e.key === "Enter" && form[current.name]) {
                    handleSubmit();
                  }
                }}>
                <option value=''>Sélectionner une catégorie</option>
                {(current.options || categories).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
          {current.type === "date" && (
            <div>
              <label className='block mb-2 font-medium dark:text-white'>
                {current.label}
              </label>
              <div className='relative'>
                <input
                  type='date'
                  name={current.name}
                  value={form[current.name] || ""}
                  onChange={(e) => {
                    handleChange(e);
                    if (isLastStep && e.target.value) {
                      const newForm = {
                        ...form,
                        [current.name]: e.target.value,
                      };
                      setTimeout(() => {
                        if (!newForm[current.name]) return;
                        onSave(newForm);
                        onClose();
                      }, 0);
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4 appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden'
                  ref={(el) => (inputRefs.current[step - 1] = el)}
                  style={{ paddingRight: "2.5rem" }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form[current.name])
                      handleSubmit(e);
                  }}
                />
                {current.icon && (
                  <current.icon
                    className='absolute right-3 top-3 text-xl text-gray-400 dark:text-white cursor-pointer'
                    onClick={() => inputRefs.current[step - 1]?.showPicker()}
                  />
                )}
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
            {step > 1 && (
              <button
                className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer'
                type='submit'
                disabled={!form[current.name]}>
                {isLastStep
                  ? editMode
                    ? "Valider la modification"
                    : "Valider l'ajout"
                  : "Suivant"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
