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
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

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

  const handlePrev = (e) => {
    e.stopPropagation();
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className='inline-block relative'>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-white border border-gray-200 rounded-2xl shadow-md py-3 px-6 text-lg font-bold text-[#1a2332] text-center flex items-center justify-center gap-4 w-[320px]'>
        <span
          onClick={handlePrev}
          className='cursor-pointer hover:bg-[#f3f6fa] dark:hover:bg-[#232b3b] rounded p-1 flex items-center justify-center'>
          <AiOutlineArrowLeft />
        </span>
        <span className='mx-2 select-none'>
          {months[month]} {year}
        </span>
        <span
          onClick={handleNext}
          className='cursor-pointer hover:bg-[#f3f6fa] dark:hover:bg-[#232b3b] rounded p-1 flex items-center justify-center'>
          <AiOutlineArrowRight />
        </span>
      </button>
      {isOpen && (
        <div className='absolute left-0 w-full mt-2 z-50'>
          <div
            ref={ref}
            className='bg-white rounded-xl p-8 shadow-lg w-full min-w-[250px] flex items-center justify-center'>
            {/* Remplace ceci par ton calendrier réel */}
            <div>Modal calendrier ici</div>
          </div>
        </div>
      )}
    </div>
  );
}
