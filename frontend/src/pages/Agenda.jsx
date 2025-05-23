import React, { useState, useMemo } from "react";
import { AiOutlineCalendar, AiOutlinePlus } from "react-icons/ai";

const fakeEvents = [
  { date: "2025-05-07", title: "Prélèvement Netflix" },
  { date: "2025-05-12", title: "Assurance voiture" },
  { date: "2025-05-15", title: "Spotify" },
  { date: "2025-05-20", title: "Salle de sport" },
  { date: "2025-05-25", title: "Loyer" },
];

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMonthYear(date) {
  return date.toLocaleString("fr-FR", { month: "long", year: "numeric" });
}

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = (firstDay.getDay() + 6) % 7;
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

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 7)); // mai 2025, 7 mai sélectionné
  const [selectedDay, setSelectedDay] = useState(7);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysMatrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  // Événements du mois (pour les pastilles)
  const eventsByDay = useMemo(() => {
    const map = {};
    fakeEvents.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [month, year]);

  // Événements du jour sélectionné
  const selectedDateStr = `${year}-${String(month + 1).padStart(
    2,
    "0"
  )}-${String(selectedDay).padStart(2, "0")}`;
  const eventsOfDay = fakeEvents.filter((e) => e.date === selectedDateStr);

  // Navigation mois
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      setSelectedDay(1);
      return d;
    });
  };
  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      setSelectedDay(1);
      return d;
    });
  };

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8'>
      <div className='max-w-7xl mx-auto flex gap-8'>
        {/* Partie gauche : calendrier */}
        <div className='flex-1 bg-white rounded-2xl shadow border border-[#ececec] p-8'>
          <div className='mb-2'>
            <h1 className='text-2xl font-bold text-gray-900'>Agenda mensuel</h1>
            <div className='text-gray-500 text-base'>
              Planifiez vos paiements
            </div>
          </div>
          <div className='flex items-center justify-end mb-4'>
            <button className='flex items-center gap-2 border rounded px-3 py-1 text-gray-700 bg-white shadow-sm cursor-pointer'>
              <AiOutlineCalendar className='text-lg' />
              {getMonthYear(currentDate)}
            </button>
            <button
              onClick={handlePrevMonth}
              className='ml-2 text-gray-400 hover:text-gray-700 text-xl cursor-pointer'>
              &#8592;
            </button>
            <button
              onClick={handleNextMonth}
              className='ml-1 text-gray-400 hover:text-gray-700 text-xl cursor-pointer'>
              &#8594;
            </button>
          </div>
          <div className='grid grid-cols-7 gap-y-2 mb-4'>
            {DAYS.map((day) => (
              <div key={day} className='text-center text-gray-500 font-medium'>
                {day}
              </div>
            ))}
            {daysMatrix.map((week, i) =>
              week.map((day, j) => (
                <div
                  key={i + "-" + j}
                  className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all ${
                    day === selectedDay ? "bg-teal-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => day && setSelectedDay(day)}>
                  <span
                    className={`text-lg ${
                      day === selectedDay
                        ? "font-bold text-gray-900"
                        : "text-gray-700"
                    }`}>
                    {day || ""}
                  </span>
                  {day && eventsByDay[day] && (
                    <span className='w-2 h-2 rounded-full bg-teal-400 mt-1 inline-block'></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {/* Partie droite : événements du jour */}
        <div className='w-[350px] flex flex-col justify-between bg-white rounded-2xl shadow border border-[#ececec] p-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='font-semibold'>
              Evenements du {String(selectedDay).padStart(2, "0")}/
              {String(month + 1).padStart(2, "0")}/{year}
            </div>
            <button className='flex items-center gap-2 bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-600 transition cursor-pointer'>
              <AiOutlinePlus /> Ajouter
            </button>
          </div>
          <div className='flex-1 flex flex-col justify-between'>
            {eventsOfDay.length === 0 ? (
              <div className='text-gray-400 text-center py-8'>
                Aucun événement pour cette date
              </div>
            ) : (
              <ul className='space-y-2'>
                {eventsOfDay.map((e, idx) => (
                  <li
                    key={idx}
                    className='bg-gray-50 rounded p-3 text-gray-700 shadow-sm'>
                    {e.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
