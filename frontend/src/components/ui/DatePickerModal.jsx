import React, { useState, useEffect, useRef } from "react";

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

const WheelPicker = ({ items, value, onChange, height = 120 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);

  const itemHeight = height / 3;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientY - startY;
    setOffset(delta);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Calculer l'index le plus proche
    const index = Math.round(-offset / itemHeight);
    const newIndex = Math.max(0, Math.min(items.length - 1, index));

    // Réinitialiser l'offset
    setOffset(0);

    // Mettre à jour la valeur
    onChange(items[newIndex]);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className='relative overflow-hidden'
      style={{ height: `${height}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}>
      <div
        className='absolute w-full transition-transform'
        style={{
          transform: `translateY(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-center h-[${itemHeight}px] text-center cursor-pointer select-none ${
              item === value
                ? "text-teal-500 font-bold text-lg"
                : "text-gray-500"
            }`}
            style={{ height: `${itemHeight}px` }}>
            {item}
          </div>
        ))}
      </div>
      {/* Indicateurs de sélection */}
      <div className='absolute top-0 left-0 right-0 h-[${itemHeight}px] bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none' />
      <div className='absolute bottom-0 left-0 right-0 h-[${itemHeight}px] bg-gradient-to-t from-white to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none' />
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

  useEffect(() => {
    setTempDate(selectedDate || new Date());
  }, [selectedDate, show]);

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

        <div className='flex justify-between items-center gap-4 mb-6'>
          {/* Sélecteur de jour */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center'>
              Jour
            </label>
            <WheelPicker
              items={days}
              value={tempDate.getDate()}
              onChange={handleDaySelect}
            />
          </div>

          {/* Sélecteur de mois */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center'>
              Mois
            </label>
            <WheelPicker
              items={months}
              value={months[tempDate.getMonth()]}
              onChange={(month) => handleMonthSelect(months.indexOf(month))}
            />
          </div>

          {/* Sélecteur d'année */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center'>
              Année
            </label>
            <WheelPicker
              items={years}
              value={tempDate.getFullYear()}
              onChange={handleYearSelect}
            />
          </div>
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
