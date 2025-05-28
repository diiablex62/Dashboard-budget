import React, { useState } from "react";
import { AiOutlineUp, AiOutlineDown } from "react-icons/ai";

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

const WheelPicker = ({ items, value, onChange, height = 120, label }) => {
  const itemHeight = height / 3;
  const currentIndex = items.findIndex((item) => item === value);

  // Scroll à la molette
  const handleWheel = (e) => {
    e.preventDefault();
    let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
    newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    onChange(items[newIndex]);
  };

  return (
    <div className='flex flex-col items-center w-24'>
      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center'>
        {label}
      </label>
      <button
        type='button'
        className={`mb-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed`}
        onClick={() => {
          if (currentIndex > 0) onChange(items[currentIndex - 1]);
        }}
        disabled={currentIndex === 0}
        tabIndex={-1}
        aria-label='Valeur précédente'
        style={{ zIndex: 2 }}>
        <AiOutlineUp />
      </button>
      <div
        className='flex flex-col items-center justify-center w-full relative'
        style={{ height: `${itemHeight * 3}px` }}
        tabIndex={0}
        role='listbox'
        aria-activedescendant={`wheel-item-${currentIndex}`}
        onWheel={handleWheel}>
        {/* Valeur précédente */}
        <div
          className='w-full text-center text-gray-400 select-none text-sm'
          style={{ height: `${itemHeight}px`, lineHeight: `${itemHeight}px` }}
          role='option'
          aria-selected='false'>
          {items[currentIndex - 1] || ""}
        </div>
        {/* Valeur sélectionnée */}
        <div
          id={`wheel-item-${currentIndex}`}
          className='w-full text-center text-teal-500 font-bold text-lg select-none'
          style={{ height: `${itemHeight}px`, lineHeight: `${itemHeight}px` }}
          role='option'
          aria-selected='true'>
          {items[currentIndex]}
        </div>
        {/* Valeur suivante */}
        <div
          className='w-full text-center text-gray-400 select-none text-sm'
          style={{ height: `${itemHeight}px`, lineHeight: `${itemHeight}px` }}
          role='option'
          aria-selected='false'>
          {items[currentIndex + 1] || ""}
        </div>
      </div>
      <button
        type='button'
        className={`mt-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed`}
        onClick={() => {
          if (currentIndex < items.length - 1)
            onChange(items[currentIndex + 1]);
        }}
        disabled={currentIndex === items.length - 1}
        tabIndex={-1}
        aria-label='Valeur suivante'
        style={{ zIndex: 2 }}>
        <AiOutlineDown />
      </button>
    </div>
  );
};

export default function DatePickerModal({
  show,
  onClose,
  onConfirm,
  selectedDate,
  onChange,
}) {
  const [tempDate, setTempDate] = useState(selectedDate || new Date());

  const handleYearSelect = (year) => {
    setTempDate((prev) => new Date(year, prev.getMonth(), prev.getDate()));
  };

  const handleMonthSelect = (month) => {
    setTempDate((prev) => new Date(prev.getFullYear(), month, prev.getDate()));
  };

  const handleDaySelect = (day) => {
    setTempDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), day));
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  if (!show) return null;

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i);
  const months = MONTHS;
  const days = Array.from(
    { length: daysInMonth(tempDate.getFullYear(), tempDate.getMonth()) },
    (_, i) => i + 1
  );

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-[400px]'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
            Sélectionner une date
          </h3>
          <button
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            onClick={onClose}>
            &times;
          </button>
        </div>

        <div className='flex justify-between items-end gap-4 mb-6'>
          <WheelPicker
            items={days}
            value={tempDate.getDate()}
            onChange={handleDaySelect}
            label='Jour'
          />
          <WheelPicker
            items={months}
            value={months[tempDate.getMonth()]}
            onChange={(month) => handleMonthSelect(months.indexOf(month))}
            label='Mois'
          />
          <WheelPicker
            items={years}
            value={tempDate.getFullYear()}
            onChange={handleYearSelect}
            label='Année'
          />
        </div>

        {/* Boutons d'action */}
        <div className='flex justify-end space-x-2'>
          <button
            className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600'
            onClick={onClose}>
            Annuler
          </button>
          <button
            className='px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600'
            onClick={() => {
              onConfirm(tempDate);
              onChange && onChange(tempDate);
            }}>
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
