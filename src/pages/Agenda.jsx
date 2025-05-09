import React, { useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMonthMatrix(year, month) {
  // month: 0-based
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = (firstDay.getDay() + 6) % 7; // 0=Monday
  // Fill first week
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

const fakeEvents = {
  "2025-05-07": [],
  "2025-05-12": ["Paiement EDF"],
  "2025-05-15": ["Loyer"],
  "2025-05-20": ["Internet"],
  "2025-05-25": ["Assurance"],
};

export default function Agenda() {
  // Par défaut : mai 2025 comme sur l'image
  const [month, setMonth] = useState(4); // 0-based, 4 = mai
  const [year, setYear] = useState(2025);
  const [selected, setSelected] = useState({ day: 7, month: 4, year: 2025 });

  const matrix = getMonthMatrix(year, month);

  const handleSelect = (day) => {
    if (day) setSelected({ day, month, year });
  };

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const selectedDateStr = `${selected.year}-${String(
    selected.month + 1
  ).padStart(2, "0")}-${String(selected.day).padStart(2, "0")}`;
  const events = fakeEvents[selectedDateStr] || [];

  return (
    <div className='min-h-screen  flex items-start justify-start p-6'>
      <div className='bg-white rounded-2xl shadow border border-gray-200 p-8 w-full max-w-xl'>
        <div className='mb-6'>
          <div className='text-2xl font-semibold text-gray-800 mb-1'>
            Agenda Mensuel
          </div>
          <div className='text-gray-500 text-sm'>Planifiez vos paiements</div>
        </div>
        <div className='flex justify-end mb-4'>
          <div className='flex items-center border rounded-lg px-4 py-2 text-gray-700 bg-white font-medium text-lg'>
            <AiOutlineCalendar className='mr-2' />
            {MONTHS[month]} {year}
          </div>
        </div>
        <div className='mb-6'>
          <div className='grid grid-cols-7 text-center mb-2 text-gray-500 font-medium'>
            {DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1'>
            {matrix.map((week, i) =>
              week.map((day, j) => {
                const isSelected =
                  day &&
                  day === selected.day &&
                  month === selected.month &&
                  year === selected.year;
                // Points pour certains jours
                const hasDot =
                  [1, 12, 15, 20, 25].includes(day) &&
                  month === 4 &&
                  year === 2025;
                return (
                  <div
                    key={i + "-" + j}
                    className={`aspect-square flex flex-col items-center justify-center cursor-pointer rounded-lg
                      ${isSelected ? "bg-teal-100" : ""}
                      ${day ? "hover:bg-gray-100" : ""}
                      transition`}
                    onClick={() => handleSelect(day)}>
                    <span
                      className={`text-base font-semibold ${
                        isSelected ? "text-gray-700" : "text-gray-800"
                      }`}>
                      {day ? day : ""}
                    </span>
                    {hasDot && (
                      <span className='w-2 h-2 rounded-full bg-teal-400 mt-1'></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className='flex items-center justify-between mt-8 mb-2'>
          <div className='text-gray-700 font-medium'>
            Evenements du {String(selected.day).padStart(2, "0")}/
            {String(selected.month + 1).padStart(2, "0")}/{selected.year}
          </div>
          <button className='flex items-center bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 py-2 rounded-lg transition'>
            <span className='mr-2 text-xl'>＋</span> Ajouter
          </button>
        </div>
        <div className='py-8 text-center'>
          {events.length === 0 ? (
            <span className='text-gray-400 text-lg'>
              Aucun événement pour cette date
            </span>
          ) : (
            events.map((ev, idx) => (
              <div key={idx} className='text-gray-700'>
                {ev}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
