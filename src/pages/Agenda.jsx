import React, { useState, useMemo } from "react";
import {
  AiOutlineCalendar,
  AiOutlinePlus,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import AgendaEvenement from "../components/ui/AgendaEvenement";
import MonthPickerModal from "../components/ui/MonthPickerModal";
import { useAuth } from "../context/AuthContext";

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
  const { getData, isAuthenticated } = useAuth();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectionEvenement, setSelectionEvenement] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysMatrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  // Utiliser getData pour les données
  const data = useMemo(() => {
    if (!isAuthenticated)
      return {
        depenseRevenu: [],
        paiementsRecurrents: [],
        paiementsEchelonnes: [],
      };
    return (
      getData() || {
        depenseRevenu: [],
        paiementsRecurrents: [],
        paiementsEchelonnes: [],
      }
    );
  }, [getData, isAuthenticated]);

  const { depenseRevenu, paiementsRecurrents, paiementsEchelonnes } = data;

  // Regrouper les événements par jour
  const eventsByDay = useMemo(() => {
    const events = {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Ajouter les dépenses et revenus
    depenseRevenu.forEach((item) => {
      const date = new Date(item.date);
      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        const day = date.getDate();
        if (!events[day]) {
          events[day] = { depense: false, revenu: false };
        }
        if (item.type === "depense") {
          events[day].depense = true;
        } else {
          events[day].revenu = true;
        }
      }
    });

    // Ajouter les paiements récurrents
    paiementsRecurrents.forEach((item) => {
      const day = item.jourPrelevement;
      if (!events[day]) {
        events[day] = { depense: false, revenu: false, recurrent: false };
      }
      events[day].recurrent = true;
    });

    // Ajouter les paiements échelonnés
    paiementsEchelonnes.forEach((item) => {
      const debut = new Date(item.debutDate);
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + parseInt(item.mensualites) - 1);

      if (
        debut.getMonth() <= currentMonth &&
        fin.getMonth() >= currentMonth &&
        debut.getFullYear() <= currentYear &&
        fin.getFullYear() >= currentYear
      ) {
        const day = debut.getDate();
        if (!events[day]) {
          events[day] = {
            depense: false,
            revenu: false,
            recurrent: false,
            echelonne: false,
          };
        }
        events[day].echelonne = true;
      }
    });

    return events;
  }, [depenseRevenu, paiementsRecurrents, paiementsEchelonnes, currentDate]);

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
                {isAuthenticated
                  ? "Visualisez vos paiements"
                  : "Connectez-vous pour visualiser vos paiements"}
              </div>
            </div>
            <div className='flex items-center justify-end mb-4'>
              <MonthPickerModal
                selectedDate={currentDate}
                onDateChange={setCurrentDate}
                size='small'
              />
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
                      onClick={() => {
                        if (currentDay) {
                          setSelectedDay(currentDay);
                        }
                      }}>
                      <span
                        className={`text-lg ${
                          currentDay === selectedDay
                            ? "font-bold text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                        {currentDay || ""}
                      </span>
                      {currentDay && eventsByDay[currentDay] && (
                        <div className='flex gap-0.5 mt-1'>
                          {eventsByDay[currentDay].echelonne && (
                            <span className='w-2 h-2 rounded-full bg-blue-500 inline-block'></span>
                          )}
                          {eventsByDay[currentDay].recurrent && (
                            <span className='w-2 h-2 rounded-full bg-purple-400 inline-block'></span>
                          )}
                          {eventsByDay[currentDay].depense && (
                            <span className='w-2 h-2 rounded-full bg-red-500 inline-block'></span>
                          )}
                          {eventsByDay[currentDay].revenu && (
                            <span className='w-2 h-2 rounded-full bg-green-500 inline-block'></span>
                          )}
                        </div>
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
              onClearSelection={() => setSelectionEvenement([])}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
