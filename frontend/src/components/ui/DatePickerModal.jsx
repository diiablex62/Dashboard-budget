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

const WheelPicker = ({ items, value, onChange, height = 200 }) => {
  const visibleCount = 5;
  const itemHeight = height / visibleCount;
  const currentIndex = items.findIndex((item) => item === value);

  // Scroll à la molette
  const handleWheel = (e) => {
    e.preventDefault();
    let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
    newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    onChange(items[newIndex]);
  };

  // Style perspective
  const getStyle = (offset) => {
    if (offset === 0) {
      return {
        fontWeight: "bold",
        fontSize: "2.2rem",
        color: "var(--picker-selected, #fff)",
        opacity: 1,
        transform: "scale(1)",
        fontFamily: "system-ui, monospace",
        letterSpacing: "0.08em",
        lineHeight: `${itemHeight}px`,
        height: `${itemHeight}px`,
        transition: "all 0.2s",
      };
    }
    const abs = Math.abs(offset);
    return {
      fontWeight: "normal",
      fontSize: abs === 1 ? "1.3rem" : "1rem",
      color: "#b0b8c1",
      opacity: abs === 1 ? 0.7 : 0.4,
      transform: `scale(${abs === 1 ? 0.92 : 0.85})`,
      fontFamily: "system-ui, monospace",
      letterSpacing: "0.08em",
      lineHeight: `${itemHeight}px`,
      height: `${itemHeight}px`,
      transition: "all 0.2s",
    };
  };

  return (
    <div className='flex flex-col items-center w-32'>
      <button
        type='button'
        className='mb-1 p-1 rounded-full bg-transparent text-[#3fd0ff] hover:bg-[#222] transition disabled:opacity-40 disabled:cursor-not-allowed'
        onClick={() => {
          if (currentIndex > 0) onChange(items[currentIndex - 1]);
        }}
        disabled={currentIndex === 0}
        tabIndex={-1}
        aria-label='Valeur précédente'
        style={{ zIndex: 2 }}>
        <AiOutlineUp size={22} />
      </button>
      <div
        className='flex flex-col items-center justify-center w-full relative'
        style={{ height: `${itemHeight * visibleCount}px` }}
        tabIndex={0}
        role='listbox'
        aria-activedescendant={`wheel-item-${currentIndex}`}
        onWheel={handleWheel}>
        {[...Array(visibleCount)].map((_, i) => {
          const offset = i - Math.floor(visibleCount / 2);
          const itemIdx = currentIndex + offset;
          return (
            <div
              key={i}
              id={offset === 0 ? `wheel-item-${currentIndex}` : undefined}
              className='w-full text-center select-none'
              style={getStyle(offset)}
              role='option'
              aria-selected={offset === 0}>
              {items[itemIdx] || ""}
            </div>
          );
        })}
        {/* Dégradés haut/bas */}
        <div className='pointer-events-none absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-[#181e29] to-transparent' />
        <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#181e29] to-transparent' />
      </div>
      <button
        type='button'
        className='mt-1 p-1 rounded-full bg-transparent text-[#3fd0ff] hover:bg-[#222] transition disabled:opacity-40 disabled:cursor-not-allowed'
        onClick={() => {
          if (currentIndex < items.length - 1)
            onChange(items[currentIndex + 1]);
        }}
        disabled={currentIndex === items.length - 1}
        tabIndex={-1}
        aria-label='Valeur suivante'
        style={{ zIndex: 2 }}>
        <AiOutlineDown size={22} />
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

  const years = Array.from({ length: 12 }, (_, i) => 2018 + i);
  const months = MONTHS;
  const days = Array.from(
    { length: daysInMonth(tempDate.getFullYear(), tempDate.getMonth()) },
    (_, i) => i + 1
  );

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60'>
      <div
        className='bg-[#181e29] rounded-2xl shadow-xl px-0 pt-0 pb-6 w-[410px] max-w-full relative'
        style={{ minWidth: 320 }}>
        {/* Header avec boutons et titre */}
        <div className='flex items-center justify-between px-6 pt-5 pb-2'>
          <button
            className='text-[#3fd0ff] text-xl font-semibold px-2 py-1 rounded focus:outline-none'
            onClick={onClose}
            style={{ fontFamily: "system-ui, monospace" }}>
            Annuler
          </button>
          <div
            className='text-2xl font-bold text-white text-center flex-1'
            style={{
              fontFamily: "system-ui, monospace",
              letterSpacing: "0.08em",
            }}>
            Date
          </div>
          <button
            className='text-[#3fd0ff] text-xl font-semibold px-2 py-1 rounded focus:outline-none'
            onClick={() => {
              onConfirm(tempDate);
              onChange && onChange(tempDate);
            }}
            style={{ fontFamily: "system-ui, monospace" }}>
            Confirmer
          </button>
        </div>
        {/* Roues */}
        <div
          className='flex flex-row items-center justify-center gap-2 px-2 py-2'
          style={{ minHeight: 220 }}>
          <WheelPicker
            items={days}
            value={tempDate.getDate()}
            onChange={handleDaySelect}
          />
          <WheelPicker
            items={months}
            value={months[tempDate.getMonth()]}
            onChange={(month) => handleMonthSelect(months.indexOf(month))}
          />
          <WheelPicker
            items={years}
            value={tempDate.getFullYear()}
            onChange={handleYearSelect}
          />
        </div>
      </div>
    </div>
  );
}
