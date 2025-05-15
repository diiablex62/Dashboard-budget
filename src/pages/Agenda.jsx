import React, { useState, useEffect, useRef } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  getAllEchelonnePayments,
  getAllRecurrentPayments,
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

export default function Agenda() {
  // Par défaut : mai 2025 comme sur l'image
  const [month, setMonth] = useState(4); // 0-based, 4 = mai
  const [year, setYear] = useState(2025);
  const [selected, setSelected] = useState({ day: 7, month: 4, year: 2025 });

  // États pour les transactions du mois
  const [depensesMois, setDepensesMois] = useState([]);
  const [revenusMois, setRevenusMois] = useState([]);
  const [echelonnesMois, setEchelonnesMois] = useState([]);
  const [recurrentsMois, setRecurrentsMois] = useState([]);

  // État pour les jours avec des transactions
  const [joursDepsRev, setJoursDepsRev] = useState({});

  // Références pour scroller vers les éléments sélectionnés
  const depensesListRef = useRef(null);
  const revenusListRef = useRef(null);
  const echelonnesListRef = useRef(null);
  const recurrentsListRef = useRef(null);

  const { user } = useAuth();

  const matrix = getMonthMatrix(year, month);

  const handleSelect = (day) => {
    if (day) {
      console.log(`🔍 Sélection du jour ${day}/${month + 1}/${year}`);

      // Vérifier si ce jour a des paiements récurrents
      const jourInfo = joursDepsRev[day];
      if (jourInfo) {
        console.log(
          `Information pour le jour ${day}:`,
          `depenses=${jourInfo.depenses}, ` +
            `revenus=${jourInfo.revenus}, ` +
            `echelonnes=${jourInfo.echelonnes}, ` +
            `recurrents=${jourInfo.recurrents}`
        );
      } else {
        console.log(`Aucune information trouvée pour le jour ${day}`);
      }

      setSelected({ day, month, year });

      // Mettre à jour les paiements récurrents pour le nouveau jour
      updateRecurrentsForSelectedDay(day);

      // Attendre que le state soit mis à jour avant de scroller
      setTimeout(() => {
        scrollToSelectedTransactions(day);
      }, 100);
    }
  };

  // Fonction pour mettre à jour les paiements récurrents en fonction du jour sélectionné
  const updateRecurrentsForSelectedDay = (day) => {
    console.log(
      `Mise à jour des paiements récurrents pour le jour ${day}/${
        month + 1
      }/${year}`
    );

    // Formater la date sélectionnée au format YYYY-MM-DD
    const selectedDateStr = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    console.log(`Date formatée pour recherche: ${selectedDateStr}`);

    // Vérifier si des paiements récurrents sont attachés à ce jour
    const jourSelectionne = joursDepsRev[day];
    if (jourSelectionne && jourSelectionne.recurrents) {
      console.log("Ce jour contient des paiements récurrents");

      // Filtrer les paiements récurrents pour n'afficher que ceux du jour sélectionné
      // Utiliser le jourPrelevement plutôt que la date complète pour la comparaison
      const paiementsJourSelectionne = recurrentsMois.filter((p) => {
        // Vérifier si le jour de prélèvement correspond au jour sélectionné
        const correspondance = p.jourEffectif === day;

        console.log(
          `Comparaison paiement ${p.nom}: jourEffectif=${p.jourEffectif}, jourPrelevement=${p.jourPrelevement}, jour sélectionné=${day}, correspondance=${correspondance}`
        );

        return correspondance;
      });

      console.log(
        `${paiementsJourSelectionne.length} paiements récurrents trouvés pour le jour ${day}`
      );

      // Forcer une nouvelle sélection pour s'assurer que l'UI se met à jour
      setSelected({ day, month, year });

      // Vérification de l'état de selection pour déboguer
      recurrentsMois.forEach((p) => {
        const pDate = new Date(p.date);
        const pJour = pDate.getDate();

        console.log(
          `Paiement: ${p.nom}, date=${p.date}, jour=${pJour}, jourEffectif=${
            p.jourEffectif
          }, jourPrelevement=${p.jourPrelevement}, sélectionné=${
            p.jourEffectif === day
          }`
        );
      });
    } else {
      console.log("Aucun paiement récurrent pour ce jour");
    }
  };

  // Fonction pour scroller vers les transactions de la date sélectionnée
  const scrollToSelectedTransactions = (day) => {
    console.log(`Scroll vers les transactions du jour ${day}`);

    // S'assurer que la date est correctement formatée
    const selectedDateStr = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    console.log(`Date formatée pour recherche: ${selectedDateStr}`);

    // Trouver les éléments correspondant à la date sélectionnée
    const depenseElement = document.getElementById(
      `depense-${selectedDateStr}`
    );
    const revenuElement = document.getElementById(`revenu-${selectedDateStr}`);
    const echelonneElement = document.getElementById(
      `echelonne-${selectedDateStr}`
    );

    // Pour les récurrents, chercher par le jourEffectif plutôt que par la date complète
    let recurrentElement = null;

    // Vérifier dans la liste des paiements récurrents si un correspond au jour sélectionné
    const recurrentPourCeJour = recurrentsMois.find((p) => {
      return p.jourEffectif === day;
    });

    console.log(
      `Recherche des éléments pour la date ${selectedDateStr} et le jour ${day}`
    );
    if (depenseElement) console.log("Élément dépense trouvé");
    if (revenuElement) console.log("Élément revenu trouvé");
    if (echelonneElement) console.log("Élément échelonné trouvé");

    if (recurrentPourCeJour) {
      console.log(
        `Paiement récurrent trouvé pour le jour ${day}: ${recurrentPourCeJour.nom} (date=${recurrentPourCeJour.date}, jourEffectif=${recurrentPourCeJour.jourEffectif})`
      );

      // Rechercher l'élément récurrent par son ID avec la date formatée
      recurrentElement = document.getElementById(
        `recurrent-${recurrentPourCeJour.date}`
      );

      if (recurrentElement) {
        console.log(
          `Élément récurrent trouvé avec ID: recurrent-${recurrentPourCeJour.date}`
        );
      } else {
        console.log(
          `Élément récurrent non trouvé avec ID: recurrent-${recurrentPourCeJour.date}`
        );

        // Si on ne trouve pas l'élément par son ID, chercher tous les éléments récurrents
        const recurrentElements =
          document.querySelectorAll(`[id^="recurrent-"]`);
        console.log(
          `Nombre d'éléments récurrents trouvés: ${recurrentElements.length}`
        );

        // Parcourir tous les éléments récurrents pour trouver celui qui correspond au nom
        recurrentElements.forEach((el) => {
          console.log(`ID trouvé: ${el.id}`);

          // Vérifier si cet élément contient le nom du paiement récurrent
          if (el.textContent.includes(recurrentPourCeJour.nom)) {
            console.log(
              `Élément récurrent trouvé par son contenu (nom): ${el.id}`
            );
            recurrentElement = el;
          }
        });
      }
    } else {
      console.log(`Aucun paiement récurrent trouvé pour le jour ${day}`);
    }

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

    // Scroller vers l'élément de paiement récurrent si existant
    if (recurrentElement && recurrentsListRef.current) {
      console.log(
        `Défilement vers l'élément récurrent: ${recurrentElement.id}`
      );
      recurrentsListRef.current.scrollTop =
        recurrentElement.offsetTop - recurrentsListRef.current.offsetTop;
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
        const uniqueEchelonnes = Object.values(paymentsByDate).flat();

        setEchelonnesMois(uniqueEchelonnes);

        // Récupérer les paiements récurrents pour chaque jour du mois
        console.log("Récupération des paiements récurrents pour le mois");
        const allRecurrents = await getAllRecurrentPayments();
        const recurrentsMoisArray = [];

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
              recurrents: false,
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
              recurrents: false,
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
              recurrents: false,
            };
          } else {
            jourTransactions[jour].echelonnes = true;
          }
        });

        // Pour chaque paiement récurrent, ajouter une entrée sur son jour de prélèvement
        allRecurrents.forEach((recurrent) => {
          // S'assurer que jourPrelevement est bien un nombre
          const jourPrelevement = parseInt(recurrent.jourPrelevement) || 1;

          // Vérifier que le jour existe dans ce mois (maximum = nombre de jours dans le mois)
          const jourEffectif = Math.min(
            jourPrelevement,
            currentMonthEnd.getDate()
          );

          // Créer la date pour ce paiement dans le mois courant
          const dateRecurrent = new Date(year, month, jourEffectif);
          const dateStr = dateRecurrent.toISOString().split("T")[0];

          console.log(
            `Paiement récurrent ${recurrent.nom} assigné au jour ${jourEffectif} (jour de prélèvement ${jourPrelevement}) avec date ${dateStr}`
          );

          // Ajouter le paiement à la liste avec le jourPrelevement normalisé en nombre
          recurrentsMoisArray.push({
            ...recurrent,
            date: dateStr, // Ceci est utilisé pour l'ID HTML
            jourEffectif: jourEffectif, // Jour effectif dans ce mois
            jourPrelevement: jourPrelevement, // Jour de prélèvement d'origine (stocké comme nombre)
          });

          // Marquer le jour comme ayant un paiement récurrent
          // IMPORTANT: Marquer le jour du jourEffectif (pas celui de la date qui peut être différent)
          if (!jourTransactions[jourEffectif]) {
            jourTransactions[jourEffectif] = {
              depenses: false,
              revenus: false,
              echelonnes: false,
              recurrents: true,
            };
            console.log(
              `✅ Jour ${jourEffectif} marqué comme ayant un paiement récurrent`
            );
          } else {
            jourTransactions[jourEffectif].recurrents = true;
            console.log(
              `✅ Drapeau 'recurrents' ajouté au jour ${jourEffectif}`
            );
          }
        });

        // Trier les paiements récurrents par date
        recurrentsMoisArray.sort((a, b) => new Date(a.date) - new Date(b.date));

        setRecurrentsMois(recurrentsMoisArray);
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
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 flex-1 min-w-0 md:w-2/5 w-full'>
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
                  const hasRecurrents =
                    hasTransactions && joursDepsRev[day].recurrents;

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
                          <div className='w-2 h-2 rounded-full bg-red-500'></div>
                        )}
                        {hasRevenus && (
                          <div className='w-2 h-2 rounded-full bg-green-500'></div>
                        )}
                        {hasEchelonnes && (
                          <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                        )}
                        {hasRecurrents && (
                          <div className='w-2 h-2 rounded-full bg-purple-500'></div>
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
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 flex-1 min-w-0 md:w-3/5 w-full flex flex-col'>
          <div className='text-lg font-semibold mb-4 text-gray-800 dark:text-white'>
            Événements de {MONTHS[month]}
          </div>
          {/* Deuxième ligne : Paiements échelonnés et récurrents */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            {/* Colonne des paiements échelonnés */}
            <div className='border dark:border-gray-800 rounded-lg p-4'>
              <h3 className='text-base font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center'>
                <span className='w-3 h-3 bg-blue-400 rounded-full mr-2'></span>
                Paiements Échelonnés
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

                      // Calculer la date de fin
                      let dateFinStr = "";
                      if (echelonne.debutDate && echelonne.mensualites) {
                        const dateDebut = new Date(echelonne.debutDate);
                        const dateFin = new Date(dateDebut);
                        dateFin.setMonth(
                          dateDebut.getMonth() +
                            parseInt(echelonne.mensualites) -
                            1
                        );
                        const jourFin = dateFin
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const moisFin = (dateFin.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const anneeFin = dateFin.getFullYear();
                        dateFinStr = `${jourFin}/${moisFin}/${anneeFin}`;
                      }

                      return (
                        <li
                          key={`${echelonne.id}-${echelonne.date}`}
                          id={`echelonne-${echelonne.date}`}
                          className={`flex items-center justify-between pb-2 transition-all duration-300 ${
                            isSelected
                              ? "border-l-4 border-blue-400 dark:border-blue-500 pl-2 bg-blue-50 dark:bg-blue-900/10 rounded"
                              : "border-b border-gray-100 dark:border-gray-800"
                          }`}>
                          <div>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {dateSimple} - {echelonne.nom}
                            </span>
                            {dateFinStr && (
                              <div className='text-xs text-gray-500 dark:text-gray-400'>
                                Fin: {dateFinStr}
                              </div>
                            )}
                          </div>
                          <span className='font-medium text-gray-800 dark:text-gray-200'>
                            {(
                              parseFloat(echelonne.montant) /
                              parseInt(echelonne.mensualites)
                            ).toFixed(2)}
                            €
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

            {/* Colonne des paiements récurrents */}
            <div className='border dark:border-gray-800 rounded-lg p-4'>
              <h3 className='text-base font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center'>
                <span className='w-3 h-3 bg-purple-400 rounded-full mr-2'></span>
                Paiements Récurrents
              </h3>
              <div
                ref={recurrentsListRef}
                className='max-h-60 overflow-y-auto text-sm'>
                {recurrentsMois.length > 0 ? (
                  <ul className='space-y-2'>
                    {recurrentsMois.map((payment) => {
                      // Vérifier si la transaction est pour la date sélectionnée
                      // Comparer le jour effectif avec le jour sélectionné
                      const isSelected = payment.jourEffectif === selected.day;

                      console.log(
                        `Affichage paiement récurrent: ${payment.nom}, jourEffectif=${payment.jourEffectif}, jourPrelevement=${payment.jourPrelevement}, date=${payment.date}, sélectionné=${isSelected}, jour sélectionné=${selected.day}`
                      );

                      return (
                        <li
                          key={payment.id}
                          id={`recurrent-${payment.date}`}
                          className={`flex items-center justify-between pb-2 transition-all duration-300 ${
                            isSelected
                              ? "border-l-4 border-purple-400 dark:border-purple-500 pl-2 bg-purple-50 dark:bg-purple-900/10 rounded"
                              : "border-b border-gray-100 dark:border-gray-800"
                          }`}
                          onClick={() => {
                            console.log(
                              `Clic sur paiement récurrent: ${payment.nom}, date=${payment.date}, jourEffectif=${payment.jourEffectif}, jourPrelevement=${payment.jourPrelevement}`
                            );
                            // Utiliser le jour effectif pour la sélection
                            const clickedDay = payment.jourEffectif;
                            // Simuler un clic sur le jour dans le calendrier
                            handleSelect(clickedDay);
                          }}>
                          <div>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {payment.nom}
                            </span>
                            <div className='text-xs text-gray-500 dark:text-gray-400'>
                              {payment.jourPrelevement} du mois
                            </div>
                          </div>
                          <span className='font-medium text-gray-800 dark:text-gray-200'>
                            {payment.montant.toFixed(2)}€
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className='text-gray-500 dark:text-gray-400 text-center'>
                    Aucun paiement récurrent ce mois-ci
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Première ligne : Dépenses et Revenus */}
          <div className='grid grid-cols-2 gap-4 '>
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
                      const isSelected = depense.date === selectedDateFormatted;
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
                      const isSelected = revenu.date === selectedDateFormatted;
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
          </div>
        </div>
      </div>
    </div>
  );
}
