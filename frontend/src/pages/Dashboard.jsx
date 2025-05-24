import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
  AiOutlineDollarCircle,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import CATEGORY_PALETTE from "../styles/categoryPalette";
import {
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
  fakeDepenseRevenu,
} from "../utils/fakeData";
import * as calculs from "../utils/calcul";
import DepensesRevenus6Mois from "../components/graphiques/DepensesRevenus6Mois";
import DepensesParCategorieChart from "../components/graphiques/DepensesParCategorieChart";

// -------------------
// Constantes globales
// -------------------
const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E42",
  "#EF4444",
  "#A855F7",
  "#F472B6",
  "#FACC15",
  "#14B8A6",
];

const monthNames = [
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
const moisEnCours =
  monthNames[new Date().getMonth()] + " " + new Date().getFullYear();

// -------------------
// Composant principal
// -------------------
export default function Dashboard() {
  const navigate = useNavigate();

  // Données factices utilisées directement
  const depenseRevenu = fakeDepenseRevenu;
  const paiementsRecurrents = fakePaiementsRecurrents;
  const paiementsEchelonnes = fakePaiementsEchelonnes;

  // Tri des paiements récurrents du plus récent au plus ancien
  const paiementsRecurrentsTries = useMemo(() => {
    return [...paiementsRecurrents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // Si les dates sont dans le même mois, on compare les jours
      if (
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getFullYear() === dateB.getFullYear()
      ) {
        return dateB.getDate() - dateA.getDate();
      }
      // Sinon on compare les mois
      return dateB - dateA;
    });
  }, [paiementsRecurrents]);

  // Tri des paiements échelonnés du plus récent au plus ancien
  const paiementsEchelonnesTries = useMemo(() => {
    return [...paiementsEchelonnes].sort((a, b) => {
      const dateA = new Date(a.debutDate);
      const dateB = new Date(b.debutDate);
      return dateB - dateA;
    });
  }, [paiementsEchelonnes]);

  // Calcul de la différence avec le mois dernier
  const differenceMoisPrecedent = useMemo(() => {
    return calculs.calculDifferenceDepensesMoisPrecedent(
      depenseRevenu,
      paiementsRecurrents,
      paiementsEchelonnes
    );
  }, [depenseRevenu, paiementsRecurrents, paiementsEchelonnes]);

  // Calcul du total des paiements échelonnés (dépenses) du mois
  const totalEchelonnes = calculs.totalEchelonnesMois(paiementsEchelonnes);

  // Calcul des économies (revenus - tout ce qui sort)
  const totalRevenus = calculs.totalRevenusGlobalMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes
  );
  const totalDepense = calculs.calculTotalDepensesMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes
  );
  const totalEconomies = calculs.calculEconomies(totalRevenus, totalDepense);

  // Différence économies mois précédent
  const differenceEconomiesMoisPrecedent = useMemo(() => {
    return calculs.calculDifferenceEconomiesMoisPrecedent(
      depenseRevenu,
      paiementsRecurrents,
      paiementsEchelonnes,
      totalRevenus,
      totalDepense
    );
  }, [
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    totalRevenus,
    totalDepense,
  ]);

  // Fusion de toutes les dépenses (dépenses classiques, récurrents, échelonnés)
  const depensesParCategorie = calculs.calculDepensesParCategorie(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    CATEGORY_PALETTE,
    new Date()
  );

  // Préparation des données pour le graphique à barres (6 derniers mois)
  const barChartData = calculs.calculBarChartData(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes
  );

  const totalRecurrents = useMemo(
    () => calculs.calculTotalRecurrentsMois(paiementsRecurrents),
    [paiementsRecurrents]
  );

  return (
    <div className='p-6 bg-gray-50 dark:bg-black min-h-screen'>
      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Total dépensé en {moisEnCours}
            </span>
            <AiOutlineDollarCircle className='text-red-600 text-xl' />
          </div>
          <div className='text-2xl font-bold dark:text-white'>
            {totalDepense.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>
            {differenceMoisPrecedent >= 0 ? "+" : "-"}{" "}
            {Math.abs(differenceMoisPrecedent).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            € par rapport au mois dernier
          </div>
          {/* Tooltip des dépenses */}
          <div className='absolute bottom-2 right-2 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
            <div className='absolute -right-32 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <p className='font-semibold mb-1'>Détail du calcul :</p>
              <div className='whitespace-pre-line'>
                {`- Dépenses du mois : ${calculs
                  .totalDepensesMois(depenseRevenu)
                  .toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
- Paiements récurrents : ${calculs
                  .calculTotalRecurrentsMois(paiementsRecurrents)
                  .toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
- Paiements échelonnés : ${calculs
                  .calculTotalEchelonnesMois(paiementsEchelonnes)
                  .toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €

Mois précédent :
- Dépense : ${calculs
                  .calculTotalDepensesMois(
                    depenseRevenu,
                    paiementsRecurrents,
                    paiementsEchelonnes,
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() - 1,
                      1
                    )
                  )
                  .toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`}
              </div>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Paiements récurrents
            </span>
            <AiOutlineCalendar className='text-purple-400 text-xl' />
          </div>
          <div className='text-2xl font-bold dark:text-white'>
            {totalRecurrents.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>Ce mois-ci</div>
          <button
            className='mt-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/recurrents")}>
            Gérer →
          </button>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow-lg p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Paiements échelonnés
            </span>
            <AiOutlineCreditCard className='text-green-600 text-xl dark:text-white' />
          </div>
          <div className='text-2xl font-bold dark:text-white'>
            {totalEchelonnes.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>Ce mois-ci</div>
          <button
            className='mt-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/echelonnes")}>
            Gérer →
          </button>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>Économies</span>
            <AiOutlineRise className='text-blue-600 text-xl' />
          </div>
          <div className='text-2xl font-bold dark:text-white'>
            {totalEconomies.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400 dark:text-'>
            {differenceEconomiesMoisPrecedent >= 0 ? "+" : "-"}{" "}
            {Math.abs(differenceEconomiesMoisPrecedent).toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 2,
              }
            )}{" "}
            € par rapport au mois dernier
          </div>
          {/* Tooltip des économies */}
          <div className='absolute bottom-2 right-2 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
            <div className='absolute right-full mr-2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <p className='font-semibold mb-1'>Détail du calcul :</p>
              <ul className='list-disc list-inside space-y-1'>
                <li>
                  Total revenus :{" "}
                  {totalRevenus.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </li>
                <li>
                  Total dépenses :{" "}
                  {totalDepense.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </li>
              </ul>
              <div className='h-2' />
              <div className='font-semibold mt-2 mb-1'>Mois précédent :</div>
              <ul className='list-disc list-inside space-y-1'>
                <li>
                  Dépenses :{" "}
                  {calculs
                    .calculTotalDepensesMois(
                      depenseRevenu,
                      paiementsRecurrents,
                      paiementsEchelonnes,
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() - 1,
                        1
                      )
                    )
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li>
                  Revenu :{" "}
                  {calculs
                    .calculRevenusMoisPrecedent(
                      depenseRevenu,
                      paiementsRecurrents,
                      paiementsEchelonnes
                    )
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
              </ul>
              <div className='mt-2 text-[11px] text-gray-300'>
                Les économies sont calculées en soustrayant le total des
                dépenses du total des revenus.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 dark:text-white  '>
          <h2 className='text-lg font-semibold mb-4 text-center'>
            Dépenses du mois par catégorie
          </h2>
          <div className='h-[300px]'>
            <DepensesParCategorieChart data={depensesParCategorie} />
          </div>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 dark:text-white '>
          <h2 className='text-lg font-semibold mb-4 text-center'>
            Dépenses et revenus des 6 derniers mois
          </h2>
          <div className='h-[300px]'>
            <DepensesRevenus6Mois data={barChartData} />
          </div>
        </div>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-4'>Paiements récurrents récents</div>
          <div className='flex flex-col gap-2 mb-4'>
            {paiementsRecurrentsTries.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 dark:bg-black dark:text-white'>
                <div className='flex items-center gap-3'>
                  <span className='bg-blue-100 text-blue-600 rounded-full p-2'>
                    <AiOutlineCalendar />
                  </span>
                  <div>
                    <div className='font-medium'>{item.nom}</div>
                    <div className='text-xs text-gray-400'>
                      {item.frequence} -{" "}
                      {new Date(item.date).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
                <div className='font-semibold'>
                  {item.montant.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </div>
              </div>
            ))}
          </div>
          <button
            className='w-full border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/recurrents")}>
            Voir tous les paiements récurrents
          </button>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-4'>Paiements échelonnés récents</div>
          <div className='flex flex-col gap-2 mb-4'>
            {paiementsEchelonnesTries.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 dark:bg-black dark:text-white'>
                <div className='flex items-center gap-3'>
                  <span className='bg-green-100 text-green-600 rounded-full p-2'>
                    <AiOutlineCreditCard />
                  </span>
                  <div>
                    <div className='font-medium'>{item.nom}</div>
                    <div className='text-xs text-gray-400'>
                      {item.mensualitesPayees}/{item.mensualites} paiements
                    </div>
                  </div>
                </div>
                <div className='font-semibold'>
                  {(item.montant / item.mensualites).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </div>
              </div>
            ))}
          </div>
          <button
            className='w-full border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/echelonnes")}>
            Voir tous les paiements échelonnés
          </button>
        </div>
      </div>
    </div>
  );
}
