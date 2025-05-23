import React from "react";
import {
  fakeDepenseRevenu,
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
} from "../../utils/fakeData";

const CATEGORIES = [
  {
    key: "echelonnes",
    label: "Paiements Échelonnés",
    color: "bg-blue-500",
    getEvents: (year, month, selectionEvenement) =>
      fakePaiementsEchelonnes.filter((e) => {
        const debut = new Date(e.debutDate);
        const nbMensualites = parseInt(e.mensualites, 10);
        let match = false;
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
            if (
              !selectionEvenement ||
              selectionEvenement.categorie !== "echelonnes" ||
              dateMensualite.getDate() === selectionEvenement.day
            ) {
              match = true;
              break;
            }
          }
        }
        return match;
      }),
  },
  {
    key: "recurrents",
    label: "Paiements Récurrents",
    color: "bg-purple-400",
    getEvents: (year, month) =>
      fakePaiementsRecurrents.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      }),
  },
  {
    key: "depenses",
    label: "Dépenses",
    color: "bg-red-500",
    text: "text-red-600",
    getEvents: (year, month) =>
      fakeDepenseRevenu.filter(
        (e) =>
          e.type === "depense" &&
          new Date(e.date).getFullYear() === year &&
          new Date(e.date).getMonth() === month
      ),
  },
  {
    key: "revenus",
    label: "Revenus",
    color: "bg-green-500",
    text: "text-green-600",
    getEvents: (year, month) =>
      fakeDepenseRevenu.filter(
        (e) =>
          e.type === "revenu" &&
          new Date(e.date).getFullYear() === year &&
          new Date(e.date).getMonth() === month
      ),
  },
];

export default function AgendaEvenement({
  year,
  month,
  selectionEvenement,
  onClearSelection,
}) {
  // DEBUG : afficher la sélection courante
  if (selectionEvenement) {
    console.log("Selection:", selectionEvenement);
  }
  return (
    <div className='grid grid-cols-2 gap-4'>
      {CATEGORIES.map((cat) => {
        const events =
          cat.key === "echelonnes"
            ? cat.getEvents(year, month, selectionEvenement)
            : cat.getEvents(year, month);
        let isSelected = false;
        if (selectionEvenement && selectionEvenement.categorie === cat.key) {
          if (cat.key === "echelonnes") {
            isSelected = events.some((e) => {
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
                  dateMensualite.getMonth() === month &&
                  dateMensualite.getDate() === selectionEvenement.day
                ) {
                  return true;
                }
              }
              return false;
            });
          } else {
            isSelected = events.some((e) => {
              const d = new Date(e.date || e.debutDate);
              return (
                d.getFullYear() === year &&
                d.getMonth() === month &&
                d.getDate() === selectionEvenement.day
              );
            });
          }
        }
        const borderColor = cat.color.replace("bg-", "border-");
        // DEBUG : log pour la catégorie echelonnes
        if (cat.key === "echelonnes") {
          console.log(
            "[DEBUG] Paiements Échelonnés - events:",
            events,
            "selectionEvenement:",
            selectionEvenement
          );
        }
        return (
          <div
            key={cat.key}
            className={`border rounded-2xl p-4 flex flex-col items-start transition-all duration-150 bg-white border-[#ececec] dark:bg-black dark:border-gray-800 ${
              isSelected
                ? `border-2 ${borderColor} bg-gray-50 dark:bg-gray-900`
                : ""
            }`}>
            <div className='flex items-center mb-2'>
              <span className={`w-3 h-3 rounded-full ${cat.color} mr-2`}></span>
              <span className={`font-semibold ${cat.text || ""}`}>
                {cat.label}
              </span>
            </div>
            {isSelected && (
              <button
                onClick={onClearSelection}
                className='mb-2 text-xs text-gray-500 underline'>
                Désélectionner
              </button>
            )}
            {events.length === 0 ? (
              <span className='text-sm text-gray-500'>
                Aucun {cat.label.toLowerCase()} ce mois-ci
              </span>
            ) : (
              <ul className='text-sm text-gray-700 space-y-1 dark:text-gray-200'>
                {events.map((e) => {
                  let isEventSelected = false;
                  if (isSelected && selectionEvenement) {
                    if (cat.key === "echelonnes") {
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
                          dateMensualite.getMonth() === month &&
                          dateMensualite.getDate() === selectionEvenement.day
                        ) {
                          isEventSelected = true;
                          break;
                        }
                      }
                    } else {
                      const d = new Date(e.date || e.debutDate);
                      isEventSelected =
                        d.getFullYear() === year &&
                        d.getMonth() === month &&
                        d.getDate() === selectionEvenement.day;
                    }
                  }
                  return (
                    <li
                      key={e.id || e.nom}
                      className={
                        isEventSelected
                          ? "font-bold text-black dark:text-white"
                          : ""
                      }
                      style={{ display: "flex", alignItems: "center" }}>
                      <span className='overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] block'>
                        {e.nom || e.categorie}
                      </span>
                      {cat.key === "echelonnes" && (
                        <span className='ml-2 text-xs text-gray-400 whitespace-nowrap'>
                          (
                          {new Date(e.debutDate).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                          )
                        </span>
                      )}
                      {cat.key === "echelonnes" && isEventSelected && (
                        <span className='ml-2 text-xs text-blue-600'>
                          (mensualité ce jour)
                        </span>
                      )}
                      {cat.key !== "echelonnes" && (
                        <span className='ml-2 text-xs text-gray-400 whitespace-nowrap'>
                          (
                          {new Date(e.date || e.debutDate).toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "2-digit" }
                          )}
                          )
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
