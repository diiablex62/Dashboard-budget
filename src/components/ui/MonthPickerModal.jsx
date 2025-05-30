import React, { useState, useRef, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

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

export default function MonthPickerModal({
  selectedDate = new Date(),
  onDateChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [yearPageStart, setYearPageStart] = useState(
    selectedDate.getFullYear() - 5
  );
  const [tempYear, setTempYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    if (!isOpen) setShowYearSelect(false);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevYear = () => {
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setViewYear((y) => y + 1);
  };

  const handlePrevMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const newDate = new Date(newYear, newMonth, 1);
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onDateChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    const newDate = new Date(newYear, newMonth, 1);
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onDateChange?.(newDate);
  };

  // Gestion sélection année
  const handleCancelYear = () => {
    setShowYearSelect(false);
    setTempYear(selectedYear);
  };

  // Génération de la grille d'années (3 colonnes, 4 lignes)
  const years = Array.from({ length: 12 }, (_, i) => yearPageStart + i);

  return (
    <div className='relative w-[480px]'>
      <div className='flex justify-end'>
        <div className='bg-white border border-gray-200 rounded-2xl shadow-md py-3 px-6 text-xl font-bold text-[#1a2332] flex items-center justify-center gap-4 w-auto min-w-[200px]'>
          <AiOutlineArrowLeft
            className='text-2xl cursor-pointer'
            onClick={handlePrevMonth}
          />
          <button
            onClick={() => setIsOpen(true)}
            className='mx-2 select-none text-center w-[170px]'>
            {months[selectedMonth]} {selectedYear}
          </button>
          <AiOutlineArrowRight
            className='text-2xl cursor-pointer'
            onClick={handleNextMonth}
          />
        </div>
      </div>
      {isOpen && (
        <div className='absolute right-0 top-0 w-[480px] z-[100] animate-fadeIn'>
          <div
            ref={ref}
            className='bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-6 flex flex-col items-center w-full'>
            {showYearSelect ? (
              <>
                {/* Header année + flèches */}
                <div className='flex items-center justify-center w-full mb-6 gap-6'>
                  <button
                    onClick={() => setYearPageStart((y) => y - 12)}
                    className='p-2 rounded-full hover:bg-gray-50 text-2xl text-[#1a2332] transition-colors'>
                    <AiOutlineArrowLeft />
                  </button>
                  <span className='font-bold text-2xl text-[#1a2332] select-none'>
                    Sélectionner une année
                  </span>
                  <button
                    onClick={() => setYearPageStart((y) => y + 12)}
                    className='p-2 rounded-full hover:bg-gray-50 text-2xl text-[#1a2332] transition-colors'>
                    <AiOutlineArrowRight />
                  </button>
                </div>
                {/* Grille des années */}
                <div className='grid grid-cols-3 gap-x-3 gap-y-4 w-full justify-items-center mb-6'>
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setViewYear(year);
                        setSelectedYear(year);
                        setShowYearSelect(false);
                      }}
                      className={`min-w-[80px] py-2 px-2 rounded-lg text-xl transition-all
                        ${
                          year === tempYear
                            ? "bg-[#1a2332] text-white shadow-sm"
                            : "bg-white text-[#1a2332] hover:bg-gray-50"
                        }
                      `}>
                      {year}
                    </button>
                  ))}
                </div>
                {/* Bouton Annuler */}
                <div className='flex w-full justify-end gap-4'>
                  <button
                    onClick={handleCancelYear}
                    className='border border-gray-300 rounded-lg px-6 py-2 font-semibold text-[#17695b] bg-white hover:bg-gray-50'>
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header année + flèches */}
                <div className='flex items-center justify-center w-full mb-6 gap-6'>
                  <button
                    onClick={handlePrevYear}
                    className='p-2 rounded-full hover:bg-gray-50 text-2xl text-[#1a2332] transition-colors'>
                    <AiOutlineArrowLeft />
                  </button>
                  <span
                    className='text-xl text-[#1a2332] select-none cursor-pointer hover:underline'
                    onClick={() => {
                      setShowYearSelect(true);
                      setYearPageStart(viewYear - 5);
                      setTempYear(viewYear);
                    }}>
                    {viewYear}
                  </span>
                  <button
                    onClick={handleNextYear}
                    className='p-2 rounded-full hover:bg-gray-50 text-2xl text-[#1a2332] transition-colors'>
                    <AiOutlineArrowRight />
                  </button>
                </div>
                {/* Grille des mois */}
                <div className='grid grid-cols-4 gap-x-3 gap-y-4 w-full justify-items-center'>
                  {months.map((m, idx) => (
                    <button
                      key={m}
                      onClick={() => {
                        const newDate = new Date(viewYear, idx, 1);
                        setSelectedMonth(idx);
                        setSelectedYear(viewYear);
                        setIsOpen(false);
                        onDateChange?.(newDate);
                      }}
                      className={`min-w-[104px] py-2 px-2 rounded-lg text-xl transition-all
                        ${
                          idx === selectedMonth && viewYear === selectedYear
                            ? "bg-[#1a2332] text-white shadow-sm"
                            : "bg-white text-[#1a2332] hover:bg-gray-50"
                        }
                      `}>
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
