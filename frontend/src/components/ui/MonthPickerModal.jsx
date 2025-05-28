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

export default function MonthPickerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [viewYear, setViewYear] = useState(today.getFullYear());

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

  const handleMonthClick = (idx) => {
    setSelectedMonth(idx);
    setSelectedYear(viewYear);
    setIsOpen(false);
  };

  const handlePrevYear = (e) => {
    e.stopPropagation();
    setViewYear((y) => y - 1);
  };
  const handleNextYear = (e) => {
    e.stopPropagation();
    setViewYear((y) => y + 1);
  };

  return (
    <div className='relative w-[480px]'>
      <div className='flex justify-end'>
        <div className='bg-white border border-gray-200 rounded-2xl shadow-md py-3 px-6 text-xl font-bold text-[#1a2332] flex items-center justify-center gap-4 w-auto min-w-[200px]'>
          <AiOutlineArrowLeft
            className='text-2xl cursor-pointer'
            onClick={() => {
              setSelectedMonth((m) => (m === 0 ? 11 : m - 1));
              if (selectedMonth === 0) setSelectedYear((y) => y - 1);
            }}
          />
          <button
            onClick={() => setIsOpen(true)}
            className='mx-2 select-none text-center w-[170px]'>
            {months[selectedMonth]} {selectedYear}
          </button>
          <AiOutlineArrowRight
            className='text-2xl cursor-pointer'
            onClick={() => {
              setSelectedMonth((m) => (m === 11 ? 0 : m + 1));
              if (selectedMonth === 11) setSelectedYear((y) => y + 1);
            }}
          />
        </div>
      </div>
      {isOpen && (
        <div className='absolute right-0 top-0 w-[480px] z-[100] animate-fadeIn'>
          <div
            ref={ref}
            className='bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-6 flex flex-col items-center w-full'>
            {/* Header année + flèches */}
            <div className='flex items-center justify-center w-full mb-6 gap-6'>
              <button
                onClick={handlePrevYear}
                className='p-2 rounded-full hover:bg-gray-50 text-2xl text-[#1a2332] transition-colors'>
                <AiOutlineArrowLeft />
              </button>
              <span className='font-bold text-2xl text-[#1a2332] select-none'>
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
                  onClick={() => handleMonthClick(idx)}
                  className={`min-w-[104px] py-2 px-2 rounded-lg font-medium text-base transition-all
                    ${
                      idx === selectedMonth && viewYear === selectedYear
                        ? "bg-[#f2998a] text-white shadow-sm"
                        : "bg-white text-[#1a2332] hover:bg-gray-50"
                    }
                  `}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
