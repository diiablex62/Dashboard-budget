import React, { useState, useMemo } from "react";
import { AiOutlineCalendar, AiOutlinePlus } from "react-icons/ai";
import AgendaEvenement from "../components/ui/AgendaEvenement";
import {
  fakeDepenseRevenu,
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
} from "../utils/fakeData";

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
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectionEvenement, setSelectionEvenement] = useState(null); // { day, categorie }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysMatrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  // Événements du mois (pour les pastilles)
  const eventsByDay = useMemo(() => {
    const map = {};
    // Dépenses & Revenus
    fakeDepenseRevenu.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day])
          map[day] = {
            depense: false,
            revenu: false,
            echelonne: false,
            recurrent: false,
          };
        if (e.type === "depense") map[day].depense = true;
        if (e.type === "revenu") map[day].revenu = true;
      }
    });
    // Récurrents
    fakePaiementsRecurrents.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day])
          map[day] = {
            depense: false,
            revenu: false,
            echelonne: false,
            recurrent: false,
          };
        map[day].recurrent = true;
      }
    });
    // Échelonnés
    fakePaiementsEchelonnes.forEach((e) => {
      const debut = new Date(e.debutDate);
      const nbMensualites = parseInt(e.mensualites, 10);
      for (let m = 0; m < nbMensualites; m++) {
        const dateMensualite = new Date(
          debut.getFullYear(),
          debut.getMonth() + m,
          debut.getDate()
        );
        if (
          dateMensualite.getFullYear() === year &&
          dateMensualite.getMonth() === month
        ) {
          const day = dateMensualite.getDate();
          if (day >= 1 && day <= 31) {
            if (!map[day])
              map[day] = {
                depense: false,
                revenu: false,
                echelonne: false,
                recurrent: false,
              };
            map[day].echelonne = true;
          }
        }
      }
    });
    return map;
  }, [month, year]);

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
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        <div className='flex gap-8'>
          {/* Partie gauche : calendrier */}
          <div className='flex-1 bg-white rounded-2xl shadow border border-[#ececec] p-8 dark:bg-black dark:text-white dark:border-gray-800'>
            <div className='mb-2'>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Mon agenda
              </h1>
              <div className='text-gray-500 text-base dark:text-gray-300'>
                Visualisez vos paiements
              </div>
            </div>
            <div className='flex items-center justify-end mb-4'>
              <button className='flex items-center gap-2 border rounded px-3 py-1 text-gray-700 bg-white shadow-sm cursor-pointer dark:bg-gray-900 dark:text-white dark:border-gray-700'>
                <AiOutlineCalendar className='text-lg' />
                {getMonthYear(currentDate)}
              </button>
              <button
                onClick={handlePrevMonth}
                className='ml-2 text-gray-400 hover:text-gray-700 text-xl cursor-pointer dark:text-gray-500 dark:hover:text-white'>
                &#8592;
              </button>
              <button
                onClick={handleNextMonth}
                className='ml-1 text-gray-400 hover:text-gray-700 text-xl cursor-pointer dark:text-gray-500 dark:hover:text-white'>
                &#8594;
              </button>
            </div>
            <div className='grid grid-cols-7 gap-y-2 mb-4'>
              {DAYS.map((day) => (
                <div
                  key={day}
                  className='text-center text-gray-500 font-medium dark:text-gray-400'>
                  {day}
                </div>
              ))}
              {daysMatrix.map((week, i) =>
                week.map((day, j) => {
                  const currentDay = day;
                  return (
                    <div
                      key={i + "-" + j}
                      className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all ${
                        currentDay === selectedDay
                          ? "bg-teal-100 dark:bg-gray-800"
                          : "hover:bg-gray-100 dark:hover:bg-gray-900"
                      }`}
                      onClick={() => currentDay && setSelectedDay(currentDay)}>
                      <span
                        className={`text-lg ${
                          currentDay === selectedDay
                            ? "font-bold text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                        {currentDay || ""}
                      </span>
                      {currentDay && eventsByDay[currentDay] && (
                        <span className='flex gap-0.5 mt-1'>
                          {eventsByDay[currentDay].echelonne && (
                            <span
                              className='w-2 h-2 rounded-full bg-blue-500 inline-block cursor-pointer'
                              onClick={() => {
                                if (!currentDay) return;
                                if (
                                  selectionEvenement &&
                                  selectionEvenement.day === currentDay &&
                                  selectionEvenement.categorie === "echelonnes"
                                ) {
                                  setSelectionEvenement(null);
                                } else {
                                  setSelectionEvenement({
                                    day: currentDay,
                                    categorie: "echelonnes",
                                  });
                                }
                              }}></span>
                          )}
                          {eventsByDay[currentDay].recurrent && (
                            <span
                              className='w-2 h-2 rounded-full bg-purple-400 inline-block cursor-pointer'
                              onClick={() => {
                                if (!currentDay) return;
                                if (
                                  selectionEvenement &&
                                  selectionEvenement.day === currentDay &&
                                  selectionEvenement.categorie === "recurrents"
                                ) {
                                  setSelectionEvenement(null);
                                } else {
                                  setSelectionEvenement({
                                    day: currentDay,
                                    categorie: "recurrents",
                                  });
                                }
                              }}></span>
                          )}
                          {eventsByDay[currentDay].depense && (
                            <span
                              className='w-2 h-2 rounded-full bg-red-500 inline-block cursor-pointer'
                              onClick={() => {
                                if (!currentDay) return;
                                if (
                                  selectionEvenement &&
                                  selectionEvenement.day === currentDay &&
                                  selectionEvenement.categorie === "depenses"
                                ) {
                                  setSelectionEvenement(null);
                                } else {
                                  setSelectionEvenement({
                                    day: currentDay,
                                    categorie: "depenses",
                                  });
                                }
                              }}></span>
                          )}
                          {eventsByDay[currentDay].revenu && (
                            <span
                              className='w-2 h-2 rounded-full bg-green-500 inline-block cursor-pointer'
                              onClick={() => {
                                if (!currentDay) return;
                                if (
                                  selectionEvenement &&
                                  selectionEvenement.day === currentDay &&
                                  selectionEvenement.categorie === "revenus"
                                ) {
                                  setSelectionEvenement(null);
                                } else {
                                  setSelectionEvenement({
                                    day: currentDay,
                                    categorie: "revenus",
                                  });
                                }
                              }}></span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* Partie droite : événements du mois */}
          <div className='flex-1 flex flex-col bg-white rounded-2xl shadow border border-[#ececec] p-8 dark:bg-black dark:text-white dark:border-gray-800'>
            <h2 className='text-xl font-bold mb-8 dark:text-white'>
              Événements de {getMonthYear(currentDate)}
            </h2>
            <AgendaEvenement
              year={year}
              month={month}
              selectionEvenement={selectionEvenement}
              onClearSelection={() => setSelectionEvenement(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
