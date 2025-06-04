import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineInfoCircle,
  AiOutlineSync,
  AiOutlinePieChart,
} from "react-icons/ai";
import { BsCalculator } from "react-icons/bs";
import { formatMontant } from "../utils/calcul";
import DepensesRevenus6MoisCourbe from "../components/graphiques/DepensesRevenus6MoisCourbe";
import DepensesParCategorieChart from "../components/graphiques/DepensesParCategorieChart";
import { useAuth } from "../context/AuthContext";
import SynchroUpdateModal from "../components/ui/SynchroUpdateModal";
import {
  MONTH_NAMES,
  CURRENT_MONTH,
  DEFAULT_AMOUNTS,
} from "../constants/dashboardConstants";

// -------------------
// Composant principal
// -------------------
export default function Dashboard() {
  const navigate = useNavigate();
  const { getData } = useAuth();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isHoveringCalculator, setIsHoveringCalculator] = useState(false);
  const [isHoveringCalculatorRevenus, setIsHoveringCalculatorRevenus] =
    useState(false);
  const [isHoveringCalculatorEconomies, setIsHoveringCalculatorEconomies] =
    useState(false);

  // Utiliser getData pour les données
  const { paiementsRecurrents, paiementsEchelonnes } = useMemo(
    () => getData(),
    [getData]
  );

  // Tri des paiements récurrents du plus récent au plus ancien
  const paiementsRecurrentsTries = useMemo(() => {
    return [...paiementsRecurrents].sort((a, b) => {
      if (a.jourPrelevement && b.jourPrelevement) {
        return b.jourPrelevement - a.jourPrelevement;
      }
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getFullYear() === dateB.getFullYear()
      ) {
        return dateB.getDate() - dateA.getDate();
      }
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

  const now = new Date();

  // Utilisation des valeurs par défaut
  const {
    totalRevenus,
    totalDepense,
    totalEconomies,
    totalRevenusJusquaAujourdhui,
    totalDepenseJusquaAujourdhui,
    totalEconomiesJusquaAujourdhui,
    totalRevenusMoisPrecedent,
    totalDepenseMoisPrecedent,
    totalEconomiesMoisPrecedent,
    differenceEconomiesMoisPrecedent,
    differenceMoisPrecedent,
    differenceRevenusMoisPrecedent,
    budgetPrevisionnel,
  } = DEFAULT_AMOUNTS;

  const dashboardRef = useRef(null);

  return (
    <div
      className='p-6 bg-gray-50 dark:bg-black min-h-screen'
      ref={dashboardRef}>
      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {/* Carte Dépenses */}
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <div className='relative flex-1'>
              {!isHoveringCalculator ? (
                <span className='text-gray-500 font-medium'>
                  Total dépensé actuellement en {MONTH_NAMES[now.getMonth()]}{" "}
                  {now.getFullYear()}
                </span>
              ) : (
                <span className='text-gray-500 font-medium'>
                  Total des dépenses prévisionnelles du mois
                </span>
              )}
            </div>
            <button
              className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
              onMouseEnter={() => setIsHoveringCalculator(true)}
              onMouseLeave={() => setIsHoveringCalculator(false)}>
              <BsCalculator />
            </button>
          </div>
          <div className='relative'>
            {!isHoveringCalculator ? (
              <div className='text-2xl font-bold dark:text-white'>
                {formatMontant(totalDepenseJusquaAujourdhui)}€
              </div>
            ) : (
              <div className='text-2xl font-bold text-green-600'>
                {formatMontant(totalDepense)}€
              </div>
            )}
          </div>
          <div
            className={`text-xs font-semibold ${
              !isHoveringCalculator
                ? differenceMoisPrecedent < 0
                  ? "text-green-600"
                  : differenceMoisPrecedent > 0
                  ? "text-red-600"
                  : "text-gray-400"
                : totalDepense - totalDepenseMoisPrecedent < 0
                ? "text-green-600"
                : totalDepense - totalDepenseMoisPrecedent > 0
                ? "text-red-600"
                : "text-gray-400"
            }`}>
            {!isHoveringCalculator ? (
              <>
                {differenceMoisPrecedent < 0
                  ? "↓"
                  : differenceMoisPrecedent > 0
                  ? "↑"
                  : ""}{" "}
                {Math.abs(differenceMoisPrecedent).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}{" "}
                €{" "}
                {differenceMoisPrecedent < 0
                  ? "de moins"
                  : differenceMoisPrecedent > 0
                  ? "de plus"
                  : ""}{" "}
                que le mois dernier
              </>
            ) : (
              <>
                {totalDepense - totalDepenseMoisPrecedent < 0
                  ? "↓"
                  : totalDepense - totalDepenseMoisPrecedent > 0
                  ? "↑"
                  : ""}{" "}
                {Math.abs(
                  totalDepense - totalDepenseMoisPrecedent
                ).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}{" "}
                €{" "}
                {totalDepense - totalDepenseMoisPrecedent < 0
                  ? "de moins"
                  : totalDepense - totalDepenseMoisPrecedent > 0
                  ? "de plus"
                  : ""}{" "}
                que le mois dernier
              </>
            )}
          </div>
        </div>

        {/* Carte Revenus */}
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <div className='relative flex-1'>
              {!isHoveringCalculatorRevenus ? (
                <span className='text-gray-500 font-medium'>
                  Total revenus actuellement en {MONTH_NAMES[now.getMonth()]}{" "}
                  {now.getFullYear()}
                </span>
              ) : (
                <span className='text-gray-500 font-medium'>
                  Total des revenus prévisionnels du mois
                </span>
              )}
            </div>
            <button
              className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
              onMouseEnter={() => setIsHoveringCalculatorRevenus(true)}
              onMouseLeave={() => setIsHoveringCalculatorRevenus(false)}>
              <BsCalculator />
            </button>
          </div>
          <div className='relative'>
            {!isHoveringCalculatorRevenus ? (
              <div className='text-2xl font-bold dark:text-white'>
                {formatMontant(totalRevenusJusquaAujourdhui)}€
              </div>
            ) : (
              <div className='text-2xl font-bold text-green-600'>
                {formatMontant(totalRevenus)}€
              </div>
            )}
          </div>
          <div
            className={`text-xs font-semibold ${
              !isHoveringCalculatorRevenus
                ? differenceRevenusMoisPrecedent < 0
                  ? "text-red-600"
                  : differenceRevenusMoisPrecedent > 0
                  ? "text-green-600"
                  : "text-gray-400"
                : totalRevenus - totalRevenusMoisPrecedent < 0
                ? "text-red-600"
                : totalRevenus - totalRevenusMoisPrecedent > 0
                ? "text-green-600"
                : "text-gray-400"
            }`}>
            {!isHoveringCalculatorRevenus ? (
              <>
                {differenceRevenusMoisPrecedent < 0
                  ? "↓"
                  : differenceRevenusMoisPrecedent > 0
                  ? "↑"
                  : ""}{" "}
                {Math.abs(differenceRevenusMoisPrecedent).toLocaleString(
                  "fr-FR",
                  { minimumFractionDigits: 2 }
                )}{" "}
                €{" "}
                {differenceRevenusMoisPrecedent < 0
                  ? "de moins"
                  : differenceRevenusMoisPrecedent > 0
                  ? "de plus"
                  : ""}{" "}
                que le mois dernier
              </>
            ) : (
              <>
                {totalRevenus - totalRevenusMoisPrecedent < 0
                  ? "↓"
                  : totalRevenus - totalRevenusMoisPrecedent > 0
                  ? "↑"
                  : ""}{" "}
                {Math.abs(
                  totalRevenus - totalRevenusMoisPrecedent
                ).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                €{" "}
                {totalRevenus - totalRevenusMoisPrecedent < 0
                  ? "de moins"
                  : totalRevenus - totalRevenusMoisPrecedent > 0
                  ? "de plus"
                  : ""}{" "}
                que le mois dernier
              </>
            )}
          </div>
        </div>

        {/* Carte Paiements échelonnés */}
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-900 font-bold text-xl'>
              Paiements échelonnés
            </span>
            <AiOutlineCreditCard className='text-2xl text-green-600' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-2xl font-bold dark:text-white'>
              {formatMontant(0)}€
            </span>
            <span className='text-xs text-gray-400 font-normal'>/mois</span>
          </div>
          <button
            className='mt-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/echelonne")}>
            Gérer →
          </button>
        </div>

        {/* Carte Budget prévisionnel */}
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-900 font-bold text-xl'>
              Budget prévisionnel {CURRENT_MONTH}
            </span>
            <AiOutlinePieChart className='text-2xl text-blue-600' />
          </div>
          <div
            className={`text-2xl font-bold ${
              budgetPrevisionnel >= 0 ? "text-green-600" : "text-red-600"
            }`}>
            {formatMontant(budgetPrevisionnel)}€
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            Solde actuel ajusté des opérations à venir ce mois-ci.
          </div>
        </div>
      </div>

      {/* Carte Économies actuelles */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative col-span-2'>
          <div className='flex'>
            {/* Partie gauche : calculatrice, titre, montant, différence */}
            <div className='w-1/2'>
              <div className='flex items-center justify-between'>
                <div className='relative flex-1'>
                  {!isHoveringCalculatorEconomies ? (
                    <span className='text-gray-500 font-medium'>
                      Économies actuelles
                    </span>
                  ) : (
                    <span className='text-gray-500 font-medium'>
                      Économies prévisionnelles du mois
                    </span>
                  )}
                </div>
                <button
                  className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
                  onMouseEnter={() => setIsHoveringCalculatorEconomies(true)}
                  onMouseLeave={() => setIsHoveringCalculatorEconomies(false)}>
                  <BsCalculator />
                </button>
              </div>
              <div className='relative'>
                {!isHoveringCalculatorEconomies ? (
                  <div className='text-2xl font-bold dark:text-white'>
                    {formatMontant(totalEconomiesJusquaAujourdhui)}€
                  </div>
                ) : (
                  <div className='text-2xl font-bold text-green-600'>
                    {formatMontant(totalEconomies)}€
                  </div>
                )}
              </div>
              <div
                className={`text-xs font-semibold ${
                  !isHoveringCalculatorEconomies
                    ? differenceEconomiesMoisPrecedent < 0
                      ? "text-red-600"
                      : differenceEconomiesMoisPrecedent > 0
                      ? "text-green-600"
                      : "text-gray-400"
                    : totalEconomies - totalEconomiesMoisPrecedent < 0
                    ? "text-red-600"
                    : totalEconomies - totalEconomiesMoisPrecedent > 0
                    ? "text-green-600"
                    : "text-gray-400"
                }`}>
                {!isHoveringCalculatorEconomies ? (
                  <>
                    {differenceEconomiesMoisPrecedent < 0
                      ? "↓"
                      : differenceEconomiesMoisPrecedent > 0
                      ? "↑"
                      : ""}{" "}
                    {Math.abs(differenceEconomiesMoisPrecedent).toLocaleString(
                      "fr-FR",
                      { minimumFractionDigits: 2 }
                    )}{" "}
                    €{" "}
                    {differenceEconomiesMoisPrecedent < 0
                      ? "de moins"
                      : differenceEconomiesMoisPrecedent > 0
                      ? "de plus"
                      : ""}{" "}
                    que le mois dernier
                  </>
                ) : (
                  <>
                    {totalEconomies - totalEconomiesMoisPrecedent < 0
                      ? "↓"
                      : totalEconomies - totalEconomiesMoisPrecedent > 0
                      ? "↑"
                      : ""}{" "}
                    {Math.abs(
                      totalEconomies - totalEconomiesMoisPrecedent
                    ).toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €{" "}
                    {totalEconomies - totalEconomiesMoisPrecedent < 0
                      ? "de moins"
                      : totalEconomies - totalEconomiesMoisPrecedent > 0
                      ? "de plus"
                      : ""}{" "}
                    que le mois dernier
                  </>
                )}
              </div>
            </div>
            {/* Partie droite : bouton synchronisation */}
            <div className='w-1/2 flex flex-col items-start'>
              <span className='text-sm text-gray-500 font-medium mb-3'>
                Vous n'avez pas {totalEconomiesJusquaAujourdhui.toFixed(2)}€ sur
                votre compte&nbsp;?
              </span>
              <button
                onClick={() => setIsBalanceModalOpen(true)}
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-lg transition dark:bg-blue-500 dark:hover:bg-blue-600'>
                <AiOutlineSync className='text-lg' />
                Mettre à jour mon solde actuel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 dark:text-white'>
          <h2 className='text-lg font-semibold mb-4 text-center'>
            Dépenses du mois par catégorie
          </h2>
          <div className='h-[300px]'>
            <DepensesParCategorieChart data={[]} />
          </div>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 dark:text-white'>
          <h2 className='text-lg font-semibold mb-4 text-center'>
            Dépenses et revenus des 6 derniers mois
          </h2>
          <div className='h-[300px]'>
            <DepensesRevenus6MoisCourbe data={[]} />
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
                      {item.jourPrelevement
                        ? `Prélèvement : le ${item.jourPrelevement}`
                        : (() => {
                            try {
                              const date = new Date(item.date);
                              return date.toLocaleDateString("fr-FR");
                            } catch {
                              return "Date invalide";
                            }
                          })()}
                    </div>
                  </div>
                </div>
                <div className='font-semibold'>
                  {formatMontant(item.montant)}€
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
                  {formatMontant(item.montant / item.mensualites)}€
                </div>
              </div>
            ))}
          </div>
          <button
            className='w-full border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/echelonne")}>
            Voir tous les paiements échelonnés
          </button>
        </div>
      </div>

      {/* Modal de mise à jour du solde */}
      <SynchroUpdateModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        currentCalculatedBalance={totalEconomiesJusquaAujourdhui}
      />
    </div>
  );
}
