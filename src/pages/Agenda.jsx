import React, { useState, useContext, useEffect, useRef } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { formatDate } from "../utils/transactionUtils";
import {
  getEchelonnePaymentsForDate,
  getAllEchelonnePayments,
} from "../utils/paymentUtils";

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

  // États pour les transactions du mois
  const [depensesMois, setDepensesMois] = useState([]);
  const [revenusMois, setRevenusMois] = useState([]);
  const [echelonnesMois, setEchelonnesMois] = useState([]);

  // État pour les jours avec des transactions
  const [joursDepsRev, setJoursDepsRev] = useState({});

  // Références pour scroller vers les éléments sélectionnés
  const depensesListRef = useRef(null);
  const revenusListRef = useRef(null);
  const echelonnesListRef = useRef(null);

  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);
  const { user } = useAuth();

  const matrix = getMonthMatrix(year, month);

  const handleSelect = (day) => {
    if (day) {
      setSelected({ day, month, year });

      // Attendre que le state soit mis à jour avant de scroller
      setTimeout(() => {
        scrollToSelectedTransactions(day);
      }, 100);
    }
  };

  // Fonction pour scroller vers les transactions de la date sélectionnée
  const scrollToSelectedTransactions = (day) => {
    const selectedDateStr = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    // Trouver les éléments correspondant à la date sélectionnée
    const depenseElement = document.getElementById(
      `depense-${selectedDateStr}`
    );
    const revenuElement = document.getElementById(`revenu-${selectedDateStr}`);
    const echelonneElement = document.getElementById(
      `echelonne-${selectedDateStr}`
    );

    // Scroller vers l'élément de dépense si existant
    if (depenseElement && depensesListRef.current) {
      depensesListRef.current.scrollTop =
        depenseElement.offsetTop - depensesListRef.current.offsetTop;
    }

    // Scroller vers l'élément de revenu si existant
    if (revenuElement && revenusListRef.current) {
      revenusListRef.current.scrollTop =
        revenuElement.offsetTop - revenusListRef.current.offsetTop;
    }

    // Scroller vers l'élément de paiement échelonné si existant
    if (echelonneElement && echelonnesListRef.current) {
      echelonnesListRef.current.scrollTop =
        echelonneElement.offsetTop - echelonnesListRef.current.offsetTop;
    }
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

  useEffect(() => {
    const fetchMonthData = async () => {
      if (!user) return;

      try {
        // Définir les limites du mois sélectionné
        const currentMonthStart = new Date(year, month, 1);
        const currentMonthEnd = new Date(year, month + 1, 0);

        // Format des dates pour Firestore
        const startDateStr = currentMonthStart.toISOString().split("T")[0];
        const endDateStr = currentMonthEnd.toISOString().split("T")[0];

        // Récupérer les dépenses du mois
        const depensesSnap = await getDocs(collection(db, "depense"));
        const depenses = depensesSnap.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter((d) => {
            const depenseDate = new Date(d.date);
            return (
              depenseDate >= currentMonthStart && depenseDate <= currentMonthEnd
            );
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setDepensesMois(depenses);

        // Récupérer les revenus du mois
        const revenusSnap = await getDocs(collection(db, "revenu"));
        const revenus = revenusSnap.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter((r) => {
            const revenuDate = new Date(r.date);
            return (
              revenuDate >= currentMonthStart && revenuDate <= currentMonthEnd
            );
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setRevenusMois(revenus);

        // Récupérer les paiements échelonnés du mois
        const echelonnesMoisArray = [];

        // Récupérer tous les paiements échelonnés
        const allEchelonnes = await getAllEchelonnePayments();

        // Filtrer pour ne garder que ceux ayant une date de début dans le mois actuel
        // ou avec un jour correspondant dans le mois actuel et étant toujours actifs
        allEchelonnes.forEach((payment) => {
          if (!payment.debutDate || !payment.mensualites) return;

          // Date de début du paiement
          const startDate = new Date(payment.debutDate);
          const startDay = startDate.getDate();

          // Date de fin du paiement
          const endDate = new Date(startDate);
          endDate.setMonth(
            startDate.getMonth() + parseInt(payment.mensualites) - 1
          );

          // Vérifier si le paiement est actif pour le mois en cours
          const isActive =
            currentMonthEnd >= startDate && currentMonthStart <= endDate;

          // Si le paiement est actif, ajouter une entrée pour le jour correspondant à la date de début
          if (isActive) {
            // Calculer la date dans le mois courant qui correspond au jour de startDate
            const dayInCurrentMonth = Math.min(
              startDay,
              currentMonthEnd.getDate() // Ne pas dépasser le nombre de jours du mois
            );

            echelonnesMoisArray.push({
              ...payment,
              date: `${year}-${String(month + 1).padStart(2, "0")}-${String(
                dayInCurrentMonth
              ).padStart(2, "0")}`,
              type: "echelonne",
            });
          }
        });

        // Regrouper par date pour éviter les doublons pour chaque jour
        const paymentsByDate = {};
        echelonnesMoisArray.forEach((payment) => {
          if (!paymentsByDate[payment.date]) {
            paymentsByDate[payment.date] = [];
          }
          // Ne pas ajouter de doublons pour le même jour
          if (!paymentsByDate[payment.date].some((p) => p.id === payment.id)) {
            paymentsByDate[payment.date].push(payment);
          }
        });

        // Convertir l'objet en tableau
        const uniqueEchelonnes = Object.entries(paymentsByDate).flatMap(
          ([date, payments]) => payments
        );

        setEchelonnesMois(uniqueEchelonnes);

        // Créer un objet pour suivre les jours avec des transactions
        const jourTransactions = {};

        // Marquer les jours avec des dépenses
        depenses.forEach((dep) => {
          const date = new Date(dep.date);
          const jour = date.getDate();
          if (!jourTransactions[jour]) {
            jourTransactions[jour] = {
              depenses: true,
              revenus: false,
              echelonnes: false,
            };
          } else {
            jourTransactions[jour].depenses = true;
          }
        });

        // Marquer les jours avec des revenus
        revenus.forEach((rev) => {
          const date = new Date(rev.date);
          const jour = date.getDate();
          if (!jourTransactions[jour]) {
            jourTransactions[jour] = {
              depenses: false,
              revenus: true,
              echelonnes: false,
            };
          } else {
            jourTransactions[jour].revenus = true;
          }
        });

        // Marquer les jours avec des paiements échelonnés
        uniqueEchelonnes.forEach((ech) => {
          const date = new Date(ech.date);
          const jour = date.getDate();
          if (!jourTransactions[jour]) {
            jourTransactions[jour] = {
              depenses: false,
              revenus: false,
              echelonnes: true,
            };
          } else {
            jourTransactions[jour].echelonnes = true;
          }
        });

        setJoursDepsRev(jourTransactions);

        // Scroller vers les transactions de la date sélectionnée si elle existe
        if (jourTransactions[selected.day]) {
          setTimeout(() => {
            scrollToSelectedTransactions(selected.day);
          }, 300);
        }
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des données du mois:",
          err
        );
      }
    };

    fetchMonthData();
  }, [user, month, year]);

  // Formater la date sélectionnée au format YYYY-MM-DD
  const selectedDateFormatted = `${selected.year}-${String(
    selected.month + 1
  ).padStart(2, "0")}-${String(selected.day).padStart(2, "0")}`;

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-6'>
      <div className='flex flex-col md:flex-row gap-8 w-full mx-auto'>
        {/* Partie gauche : Agenda */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 flex-1 min-w-0 md:w-1/2 w-full'>
          <div className='mb-6'>
            <div className='text-2xl font-semibold text-gray-800 dark:text-white mb-1'>
              Agenda mensuel
            </div>
          </div>
          <div className='flex justify-between items-center mb-4'>
            <button
              className='text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full'
              onClick={handlePrev}
              aria-label='Mois précédent'>
              &lt;
            </button>
            <div className='flex items-center border dark:border-gray-800 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-black font-medium text-lg'>
              <AiOutlineCalendar className='mr-2' />
              {MONTHS[month]} {year}
            </div>
            <button
              className='text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full'
              onClick={handleNext}
              aria-label='Mois suivant'>
              &gt;
            </button>
          </div>
          <div className='mb-6'>
            <div className='grid grid-cols-7 text-center mb-2 text-gray-500 dark:text-gray-400 font-medium'>
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

                  // Vérifier si le jour a des transactions
                  const hasTransactions = day && joursDepsRev[day];
                  const hasDepenses =
                    hasTransactions && joursDepsRev[day].depenses;
                  const hasRevenus =
                    hasTransactions && joursDepsRev[day].revenus;
                  const hasEchelonnes =
                    hasTransactions && joursDepsRev[day].echelonnes;

                  return (
                    <div
                      key={i + "-" + j}
                      className={`aspect-square flex flex-col items-center justify-center cursor-pointer rounded-lg
                        ${isSelected ? "bg-teal-100 dark:bg-teal-900" : ""}
                        ${day ? "hover:bg-gray-100 dark:hover:bg-gray-900" : ""}
                        transition`}
                      onClick={() => handleSelect(day)}>
                      <span
                        className={`text-base font-semibold ${
                          isSelected
                            ? "text-gray-700 dark:text-white"
                            : "text-gray-800 dark:text-gray-200"
                        }`}>
                        {day ? day : ""}
                      </span>
                      <div className='flex space-x-1 mt-1'>
                        {hasDepenses && (
                          <span className='w-2 h-2 rounded-full bg-red-400 dark:bg-red-500'></span>
                        )}
                        {hasRevenus && (
                          <span className='w-2 h-2 rounded-full bg-green-400 dark:bg-green-500'></span>
                        )}
                        {hasEchelonnes && (
                          <span className='w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500'></span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {/* Partie droite : Liste des événements */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 flex-1 min-w-0 md:w-1/2 w-full flex flex-col'>
          {/* Section: Événements du mois avec listes de dépenses et revenus */}
          <div>
            <div className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>
              Événements de {MONTHS[month]}
            </div>
            <div className='grid grid-cols-3 gap-4 mb-6'>
              {/* Colonne des dépenses */}
              <div className='border dark:border-gray-800 rounded-lg p-4'>
                <h3 className='text-base font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center'>
                  <span className='w-3 h-3 bg-red-400 rounded-full mr-2'></span>
                  Dépenses
                </h3>
                <div
                  ref={depensesListRef}
                  className='max-h-60 overflow-y-auto text-sm'>
                  {depensesMois.length > 0 ? (
                    <ul className='space-y-2'>
                      {depensesMois.map((depense) => {
                        // Vérifier si la transaction est pour la date sélectionnée
                        const isSelected =
                          depense.date === selectedDateFormatted;
                        // Formater la date pour n'afficher que le jour/mois
                        const dateObj = new Date(depense.date);
                        const jour = dateObj
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const mois = (dateObj.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const dateSimple = `${jour}/${mois}`;
                        return (
                          <li
                            key={depense.id}
                            id={`depense-${depense.date}`}
                            className={`flex items-center pb-2 transition-all duration-300 ${
                              isSelected
                                ? "border-l-4 border-red-400 dark:border-red-500 pl-2 bg-red-50 dark:bg-red-900/10 rounded"
                                : "border-b border-gray-100 dark:border-gray-800"
                            }`}>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {dateSimple} - {depense.nom}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className='text-gray-500 dark:text-gray-400 text-center'>
                      Aucune dépense ce mois-ci
                    </div>
                  )}
                </div>
              </div>
              {/* Colonne des revenus */}
              <div className='border dark:border-gray-800 rounded-lg p-4'>
                <h3 className='text-base font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center'>
                  <span className='w-3 h-3 bg-green-400 rounded-full mr-2'></span>
                  Revenus
                </h3>
                <div
                  ref={revenusListRef}
                  className='max-h-60 overflow-y-auto text-sm'>
                  {revenusMois.length > 0 ? (
                    <ul className='space-y-2'>
                      {revenusMois.map((revenu) => {
                        // Vérifier si la transaction est pour la date sélectionnée
                        const isSelected =
                          revenu.date === selectedDateFormatted;
                        // Formater la date pour n'afficher que le jour/mois
                        const dateObj = new Date(revenu.date);
                        const jour = dateObj
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const mois = (dateObj.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const dateSimple = `${jour}/${mois}`;
                        return (
                          <li
                            key={revenu.id}
                            id={`revenu-${revenu.date}`}
                            className={`flex items-center pb-2 transition-all duration-300 ${
                              isSelected
                                ? "border-l-4 border-green-400 dark:border-green-500 pl-2 bg-green-50 dark:bg-green-900/10 rounded"
                                : "border-b border-gray-100 dark:border-gray-800"
                            }`}>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {dateSimple} - {revenu.nom}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className='text-gray-500 dark:text-gray-400 text-center'>
                      Aucun revenu ce mois-ci
                    </div>
                  )}
                </div>
              </div>
              {/* Colonne des paiements échelonnés */}
              <div className='border dark:border-gray-800 rounded-lg p-4'>
                <h3 className='text-base font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center'>
                  <span className='w-3 h-3 bg-blue-400 rounded-full mr-2'></span>
                  Échelonnés
                </h3>
                <div
                  ref={echelonnesListRef}
                  className='max-h-60 overflow-y-auto text-sm'>
                  {echelonnesMois.length > 0 ? (
                    <ul className='space-y-2'>
                      {echelonnesMois.map((echelonne) => {
                        // Vérifier si la transaction est pour la date sélectionnée
                        const isSelected =
                          echelonne.date === selectedDateFormatted;
                        // Formater la date pour n'afficher que le jour/mois
                        const dateObj = new Date(echelonne.date);
                        const jour = dateObj
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const mois = (dateObj.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const dateSimple = `${jour}/${mois}`;
                        return (
                          <li
                            key={`${echelonne.id}-${echelonne.date}`}
                            id={`echelonne-${echelonne.date}`}
                            className={`flex items-center pb-2 transition-all duration-300 ${
                              isSelected
                                ? "border-l-4 border-blue-400 dark:border-blue-500 pl-2 bg-blue-50 dark:bg-blue-900/10 rounded"
                                : "border-b border-gray-100 dark:border-gray-800"
                            }`}>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {dateSimple} - {echelonne.nom}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className='text-gray-500 dark:text-gray-400 text-center'>
                      Aucun paiement échelonné ce mois-ci
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
