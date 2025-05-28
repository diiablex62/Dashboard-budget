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
    getEvents: (year, month) =>
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
            match = true;
            break;
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
      fakePaiementsRecurrents
        .filter((e) => {
          let debut = e.debut ? new Date(e.debut) : null;
          const eventYear = year;
          const eventMonth = month;
          if (!debut) return true;
          if (
            debut.getFullYear() > eventYear ||
            (debut.getFullYear() === eventYear && debut.getMonth() > eventMonth)
          ) {
            return false;
          }
          return true;
        })
        .map((e) => {
          const date = new Date(year, month, e.jourPrelevement);
          return { ...e, date: date.toISOString() };
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

export default function AgendaEvenement({ year, month }) {
  return (
    <div className='grid grid-cols-2 gap-4'>
      {CATEGORIES.map((cat) => {
        const events = cat.getEvents(year, month);

        return (
          <div
            key={cat.key}
            className='border rounded-2xl p-4 flex flex-col items-start transition-all duration-150 bg-white border-[#ececec] dark:bg-black dark:border-gray-800'>
            <div className='flex items-center mb-2'>
              <span className={`w-3 h-3 rounded-full ${cat.color} mr-2`}></span>
              <span className={`font-semibold ${cat.text || ""}`}>
                {cat.label}
              </span>
            </div>
            {events.length === 0 ? (
              <span className='text-sm text-gray-500'>
                Aucun {cat.label.toLowerCase()} ce mois-ci
              </span>
            ) : (
              <ul className='text-sm text-gray-700 space-y-1 dark:text-gray-200'>
                {events.map((e) => (
                  <li
                    key={e.id || e.nom}
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
                    {cat.key === "recurrents" && (
                      <span className='ml-2 text-xs text-gray-400 whitespace-nowrap'>
                        (
                        {new Date(e.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                        )
                      </span>
                    )}
                    {cat.key !== "echelonnes" && cat.key !== "recurrents" && (
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
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
