import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const months = [
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

const years = Array.from({ length: 20 }, (_, i) => 2020 + i);

export default function DataPickerDay({
  isOpen,
  onClose,
  onSelect,
  initialMonth,
  initialYear,
  dropdownPosition,
}) {
  const today = new Date();
  const [month, setMonth] = useState(initialMonth ?? today.getMonth());
  const [year, setYear] = useState(initialYear ?? today.getFullYear());

  useEffect(() => {
    if (isOpen) {
      setMonth(initialMonth ?? today.getMonth());
      setYear(initialYear ?? today.getFullYear());
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  // Génère la grille des jours
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = (day) => {
    if (day) {
      onSelect && onSelect(year, month);
      onClose && onClose();
    }
  };

  if (!isOpen) return null;

  // Affichage dropdown (popper) si dropdownPosition fourni
  if (dropdownPosition) {
    const dropdown = (
      <div
        className='z-50'
        style={{
          position: "absolute",
          top: (dropdownPosition.top ?? 0) + 4,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}>
        <div className='bg-white rounded-xl shadow-lg p-4 w-full border border-gray-200'>
          {/* Header */}
          <div className='flex items-center justify-between mb-4 rounded-lg px-3 py-2 text-black'>
            <button
              onClick={handlePrev}
              className='p-1 rounded hover:bg-gray-100 text-black'>
              <span className='text-xl'>&#x2039;</span>
            </button>
            <div className='flex items-center gap-2 font-semibold text-lg'>
              <select
                className='bg-transparent focus:outline-none text-black font-semibold'
                value={months[month]}
                onChange={(e) => setMonth(months.indexOf(e.target.value))}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className='bg-transparent focus:outline-none text-black font-semibold'
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleNext}
              className='p-1 rounded hover:bg-gray-100 text-black'>
              <span className='text-xl'>&#x203A;</span>
            </button>
          </div>
          {/* Jours de la semaine */}
          <div className='grid grid-cols-7 text-center text-xs text-gray-500 mb-1'>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className='py-1 font-medium'>
                {d}
              </div>
            ))}
          </div>
          {/* Grille des jours */}
          <div className='grid grid-cols-7 text-center'>
            {days.map((d, i) => (
              <div
                key={i}
                className='py-1 h-8 flex items-center justify-center'>
                {d ? (
                  <span
                    onClick={() => handleDayClick(d)}
                    className='text-sm text-black cursor-pointer hover:bg-blue-100 w-8 h-8 flex items-center justify-center rounded-full'>
                    {d}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    return ReactDOM.createPortal(dropdown, document.body);
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-lg p-6 w-80'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={handlePrev}
            className='p-1 rounded hover:bg-gray-100'>
            <span className='text-xl'>&#x2039;</span>
          </button>
          <div className='flex items-center gap-2'>
            <select
              className='font-semibold text-lg bg-transparent focus:outline-none'
              value={months[month]}
              onChange={(e) => setMonth(months.indexOf(e.target.value))}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className='font-semibold text-lg bg-transparent focus:outline-none'
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNext}
            className='p-1 rounded hover:bg-gray-100'>
            <span className='text-xl'>&#x203A;</span>
          </button>
        </div>
        {/* Jours de la semaine */}
        <div className='grid grid-cols-7 text-center text-xs text-gray-500 mb-1'>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className='py-1 font-medium'>
              {d}
            </div>
          ))}
        </div>
        {/* Grille des jours */}
        <div className='grid grid-cols-7 text-center'>
          {days.map((d, i) => (
            <div key={i} className='py-1 h-8 flex items-center justify-center'>
              {d ? (
                <span
                  onClick={() => handleDayClick(d)}
                  className='text-sm text-black cursor-pointer hover:bg-blue-100 w-8 h-8 flex items-center justify-center rounded-full'>
                  {d}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
