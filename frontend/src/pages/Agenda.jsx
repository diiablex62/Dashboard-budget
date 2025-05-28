import React, { useState, useMemo } from "react";
import {
  AiOutlineCalendar,
  AiOutlinePlus,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
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
      // Vérifie si le paiement est actif pour le mois/année affiché
      let actif = true;
      if (e.debut) {
        const debut = new Date(e.debut);
        actif =
          year > debut.getFullYear() ||
          (year === debut.getFullYear() && month >= debut.getMonth());
      }
      if (actif && e.jourPrelevement >= 1 && e.jourPrelevement <= 31) {
        const day = e.jourPrelevement;
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
        {/* Titre */}
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Agenda
          </h1>
        </div>
        {/* Carte principale : calendrier + événements */}
        <div className='flex gap-8'>
          {/* Partie gauche : calendrier dans sa propre carte */}
          <div className='flex-1 bg-white rounded-2xl shadow border border-[#ececec] p-8 dark:bg-black dark:text-white dark:border-gray-800'>
            <div className='mb-2'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Mon agenda
              </h2>
              <div className='text-gray-500 text-base dark:text-gray-300'>
                Visualisez vos paiements
              </div>
            </div>
            <div className='flex items-center justify-end mb-4'>
              <div className='flex items-center bg-[#f6f9fb] rounded-xl px-4 py-2 shadow-none border border-transparent dark:bg-gray-900'>
                <button
                  className='text-[#222] text-xl px-2 py-1 rounded hover:bg-[#e9eef2] transition cursor-pointer dark:text-white dark:hover:bg-gray-800'
                  onClick={handlePrevMonth}
                  aria-label='Mois précédent'
                  type='button'>
                  <AiOutlineArrowLeft />
                </button>
                <div className='mx-4 text-[#222] text-lg font-medium w-40 text-center cursor-pointer hover:bg-[#e9eef2] px-3 py-1 rounded transition dark:text-white dark:hover:bg-gray-800'>
                  {getMonthYear(currentDate)}
                </div>
                <button
                  className='text-[#222] text-xl px-2 py-1 rounded hover:bg-[#e9eef2] transition cursor-pointer dark:text-white dark:hover:bg-gray-800'
                  onClick={handleNextMonth}
                  aria-label='Mois suivant'
                  type='button'>
                  <AiOutlineArrowRight />
                </button>
              </div>
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
          {/* Partie droite : événements du mois dans sa propre carte */}
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
