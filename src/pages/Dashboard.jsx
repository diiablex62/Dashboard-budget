import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
  AiOutlineDollarCircle,
  AiOutlineInfoCircle,
  AiOutlineSync,
  AiOutlinePieChart,
} from "react-icons/ai";
import { MdCalculate } from "react-icons/md";
import { BsCalculator } from "react-icons/bs";
import CATEGORY_PALETTE from "../utils/categoryPalette";
import {
  calculTotalDepensesMois,
  totalRevenusGlobalMois,
  calculDepensesParCategorie,
  calculBarChartData,
  calculTotalRecurrentsMois,
  calculTotalEchelonnesMois,
  calculPaiementsEchelonnesActifs,
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculDepensesEchelonneesJusquaAujourdhui,
  calculRevenusClassiquesJusquaAujourdhui,
  calculRevenusRecurrentsJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui,
  calculTotalRevenusJusquaAujourdhui,
  calculTotalDepensesJusquaAujourdhui,
  calculEconomiesJusquaAujourdhui,
  calculDepensesClassiquesMoisPrecedent,
  calculDepensesRecurrentesMoisPrecedent,
  calculDepensesEchelonneesMoisPrecedent,
  calculRevenusClassiquesMoisPrecedent,
  calculRevenusRecurrentsMoisPrecedent,
  calculRevenusEchelonnesMoisPrecedent,
  calculTotalRevenusRecurrentsMois,
  formatMontant,
} from "../utils/calcul";
import DepensesRevenus6MoisCourbe from "../components/graphiques/DepensesRevenus6MoisCourbe";
import DepensesParCategorieChart from "../components/graphiques/DepensesParCategorieChart";
import { useAuth } from "../context/AuthContext";
import SynchroUpdateModal from "../components/ui/SynchroUpdateModal";
import MonthPickerModal from "../components/ui/MonthPickerModal";

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
  const { getData } = useAuth();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [barChartData, setBarChartData] = useState([]);
  const [isHoveringCalculator, setIsHoveringCalculator] = useState(false);
  const [isHoveringCalculatorRevenus, setIsHoveringCalculatorRevenus] =
    useState(false);
  const [isHoveringCalculatorEconomies, setIsHoveringCalculatorEconomies] =
    useState(false);

  // Utiliser getData pour les données
  const { depenseRevenu, paiementsRecurrents, paiementsEchelonnes } = useMemo(
    () => getData(),
    [getData]
  );

  // Tri des paiements récurrents du plus récent au plus ancien
  const paiementsRecurrentsTries = useMemo(() => {
    return [...paiementsRecurrents].sort((a, b) => {
      // Si les paiements ont un jour de prélèvement, on trie par ce jour
      if (a.jourPrelevement && b.jourPrelevement) {
        return b.jourPrelevement - a.jourPrelevement;
      }
      // Sinon on utilise la date
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

  // Calcul du total des paiements échelonnés (dépenses) du mois
  const now = new Date();
  const totalEchelonnes = useMemo(() => {
    return 0;
  }, []);

  // Calcul des économies (revenus - tout ce qui sort)
  const totalRevenus = 0;
  const totalDepense = 0;
  const totalEconomies = 0;

  // Fusion de toutes les dépenses (dépenses classiques, récurrents, échelonnés)
  const depensesParCategorie = [];

  useEffect(() => {
    const data = [];
    setBarChartData(data);
  }, [depenseRevenu, paiementsRecurrents, paiementsEchelonnes]);

  const totalRecurrents = useMemo(() => {
    return 0;
  }, [paiementsRecurrents]);

  // --- Détail des sous-totaux pour le mois courant ---
  const depensesClassiquesCourant = 0;
  const recurrentsDepenseCourant = 0;
  const echelonnesDepenseCourant = 0;

  // --- Détail des sous-totaux pour le mois précédent ---
  const depensesClassiquesMoisPrec = 0;
  const recurrentsDepenseMoisPrec = 0;
  const echelonnesDepenseMoisPrec = 0;

  // --- Détail des revenus pour le mois précédent ---
  const revenusClassiquesMoisPrec = 0;
  const recurrentsRevenuMoisPrec = 0;
  const echelonnesRevenuMoisPrec = 0;

  // --- Totaux revenus jusqu'à aujourd'hui ---
  const totalRevenusJusquaAujourdhui = 0;
  const totalDepenseJusquaAujourdhui = 0;
  const totalEconomiesJusquaAujourdhui = 0;

  // --- Totaux du mois précédent (mois complet) ---
  const totalRevenusMoisPrecedent = 0;
  const totalDepenseMoisPrecedent = 0;
  const totalEconomiesMoisPrecedent = 0;

  const differenceEconomiesMoisPrecedent = 0;

  // --- Déclarations pour la carte revenus (tooltip) ---
  const revenusClassiquesCourant = 0;
  const recurrentsRevenuCourant = 0;
  const echelonnesRevenuCourant = 0;

  // Différence dépenses mois précédent (alignée avec le détail du tooltip)
  const differenceMoisPrecedent = useMemo(() => {
    const totalCourant =
      depensesClassiquesCourant +
      recurrentsDepenseCourant +
      echelonnesDepenseCourant;
    const totalPrec =
      depensesClassiquesMoisPrec +
      recurrentsDepenseMoisPrec +
      echelonnesDepenseMoisPrec;
    return totalCourant - totalPrec;
  }, [
    depensesClassiquesCourant,
    recurrentsDepenseCourant,
    echelonnesDepenseCourant,
    depensesClassiquesMoisPrec,
    recurrentsDepenseMoisPrec,
    echelonnesDepenseMoisPrec,
  ]);

  // Calcul du budget prévisionnel du mois en cours
  const today = new Date();

  // Dépenses et revenus récurrents/échelonnés à venir (déclaration unique)
  const depensesRecEchAVenir = 0;
  const revenusRecEchAVenir = 0;

  // Dépenses et revenus classiques à venir
  const depensesAVenir = 0;
  const revenusAVenir = 0;

  const budgetPrevisionnel = 0;

  // Calculs pour le détail du prévisionnel
  const isCurrentMonth = (date) =>
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const isFuture = (date) => date > today;

  // Calcul du total dépensé ce mois-ci jusqu'à aujourd'hui (identique au détail)
  const totalDepensePrelevee = 0;

  // Différence revenus mois précédent (alignée avec le détail du tooltip)
  const differenceRevenusMoisPrecedent = useMemo(() => {
    const totalCourant = totalRevenusJusquaAujourdhui;
    const totalPrec = totalRevenusMoisPrecedent;
    return totalCourant - totalPrec;
  }, [totalRevenusJusquaAujourdhui, totalRevenusMoisPrecedent]);

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
                  Total dépensé actuellement en {monthNames[now.getMonth()]}{" "}
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
                {formatMontant(totalDepensePrelevee)}€
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
          {/* Tooltip des dépenses */}
          <div className='absolute bottom-6 right-6 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
            <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <div className='whitespace-pre-line'>
                <div>
                  <div className='mb-2'>
                    <span className='font-semibold'>
                      Dépenses depuis le 1er du mois :
                    </span>{" "}
                    {formatMontant(
                      depensesClassiquesCourant +
                        recurrentsDepenseCourant +
                        echelonnesDepenseCourant
                    )}
                    €
                  </div>
                  <ul className='mb-2'>
                    <li className='text-red-400'>
                      <span className='font-bold' style={{ color: "#ef4444" }}>
                        Dépenses :
                      </span>{" "}
                      {formatMontant(depensesClassiquesCourant)}€
                    </li>
                    <li className='text-blue-400'>
                      Paiements récurrents :{" "}
                      {formatMontant(recurrentsDepenseCourant)}€
                    </li>
                    <li className='text-purple-400'>
                      Paiements échelonnés :{" "}
                      {formatMontant(calculTotalEchelonnesMois())}€
                    </li>
                  </ul>
                  <div className='mb-2 mt-4'>
                    <span className='font-semibold'>
                      Mois Actuel (total prévisionnel) :
                    </span>{" "}
                    {formatMontant(totalDepense)}€
                  </div>
                  <ul className='mb-2'>
                    <li className='text-red-400'>
                      <span className='font-bold' style={{ color: "#ef4444" }}>
                        Dépenses :
                      </span>{" "}
                      {formatMontant(
                        depenseRevenu
                          .filter(
                            (d) =>
                              d.type === "depense" &&
                              isCurrentMonth(new Date(d.date))
                          )
                          .reduce(
                            (acc, d) => acc + Math.abs(parseFloat(d.montant)),
                            0
                          )
                      )}
                      €
                    </li>
                    <li className='text-blue-400'>
                      Paiements récurrents :{" "}
                      {formatMontant(
                        paiementsRecurrents
                          .filter(
                            (p) =>
                              p.type === "depense" &&
                              (!p.debut || new Date(p.debut) <= new Date())
                          )
                          .reduce(
                            (acc, p) => acc + Math.abs(parseFloat(p.montant)),
                            0
                          )
                      )}
                      €
                    </li>
                    <li className='text-purple-400'>
                      Paiements échelonnés :{" "}
                      {formatMontant(
                        paiementsEchelonnes
                          .filter((e) => e.type === "depense")
                          .reduce(
                            (acc, e) =>
                              acc +
                              Math.abs(parseFloat(e.montant)) /
                                parseInt(e.mensualites),
                            0
                          )
                      )}
                      €
                    </li>
                  </ul>
                  <div className='mb-2'>
                    <span className='font-semibold'>Mois précédent :</span>{" "}
                    {formatMontant(
                      depensesClassiquesMoisPrec +
                        recurrentsDepenseMoisPrec +
                        echelonnesDepenseMoisPrec
                    )}
                    €
                  </div>
                  <ul>
                    <li className='text-red-400'>
                      <span className='font-bold' style={{ color: "#ef4444" }}>
                        Dépenses :
                      </span>{" "}
                      {formatMontant(depensesClassiquesMoisPrec)}€
                    </li>
                    <li className='text-blue-400'>
                      Paiements récurrents (dépense) :{" "}
                      {formatMontant(recurrentsDepenseMoisPrec)}€
                    </li>
                    <li className='text-purple-400'>
                      Paiements échelonnés (dépense) :{" "}
                      {formatMontant(echelonnesDepenseMoisPrec)}€
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Carte Revenus */}
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <div className='relative flex-1'>
              {!isHoveringCalculatorRevenus ? (
                <span className='text-gray-500 font-medium'>
                  Total revenus actuellement en {monthNames[now.getMonth()]}{" "}
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
          {/* Tooltip des revenus */}
          <div className='absolute bottom-6 right-6 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
            <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <div className='whitespace-pre-line'>
                <div>
                  <div className='mb-2'>
                    <span className='font-semibold'>
                      Revenus depuis le 1er du mois :
                    </span>{" "}
                    {formatMontant(
                      revenusClassiquesCourant +
                        recurrentsRevenuCourant +
                        echelonnesRevenuCourant
                    )}
                    €
                  </div>
                  <ul className='mb-2'>
                    <li className='text-green-400'>
                      <span className='font-bold'>Revenus :</span>{" "}
                      {formatMontant(revenusClassiquesCourant)}€
                    </li>
                    <li className='text-blue-400'>
                      Paiements récurrents :{" "}
                      {formatMontant(recurrentsRevenuCourant)}€
                    </li>
                    <li className='text-purple-400'>
                      Paiements échelonnés :{" "}
                      {formatMontant(echelonnesRevenuCourant)}€
                    </li>
                  </ul>
                  <div className='mb-2 mt-4'>
                    <span className='font-semibold'>
                      Mois Actuel (total prévisionnel) :
                    </span>{" "}
                    {formatMontant(totalRevenus)}€
                  </div>
                  <ul className='mb-2'>
                    <li className='text-green-400'>
                      <span className='font-bold'>Revenus :</span>{" "}
                      {formatMontant(
                        depenseRevenu
                          .filter(
                            (d) =>
                              d.type === "revenu" &&
                              isCurrentMonth(new Date(d.date))
                          )
                          .reduce((acc, d) => acc + parseFloat(d.montant), 0)
                      )}
                      €
                    </li>
                    <li className='text-blue-400'>
                      Paiements récurrents :{" "}
                      {formatMontant(
                        paiementsRecurrents
                          .filter(
                            (p) =>
                              p.type === "revenu" &&
                              (!p.debut || new Date(p.debut) <= new Date())
                          )
                          .reduce((acc, p) => acc + parseFloat(p.montant), 0)
                      )}
                      €
                    </li>
                    <li className='text-purple-400'>
                      Paiements échelonnés :{" "}
                      {formatMontant(
                        paiementsEchelonnes
                          .filter((e) => e.type === "revenu")
                          .reduce(
                            (acc, e) =>
                              acc +
                              Math.abs(parseFloat(e.montant)) /
                                parseInt(e.mensualites),
                            0
                          )
                      )}
                      €
                    </li>
                  </ul>
                  <div className='mb-2'>
                    <span className='font-semibold'>Mois précédent :</span>{" "}
                    {formatMontant(
                      revenusClassiquesMoisPrec +
                        recurrentsRevenuMoisPrec +
                        echelonnesRevenuMoisPrec
                    )}
                    €
                  </div>
                  <ul>
                    <li className='text-green-400'>
                      <span className='font-bold'>Revenus :</span>{" "}
                      {formatMontant(revenusClassiquesMoisPrec)}€
                    </li>
                    <li className='text-blue-400'>
                      Paiements récurrents :{" "}
                      {formatMontant(recurrentsRevenuMoisPrec)}€
                    </li>
                    <li className='text-purple-400'>
                      Paiements échelonnés :{" "}
                      {formatMontant(echelonnesRevenuMoisPrec)}€
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium flex items-baseline gap-1'>
              <span className='text-xl font-bold'>
                {calculPaiementsEchelonnesActifs(
                  paiementsEchelonnes,
                  now,
                  false
                )}
              </span>
              Paiements échelonnés
            </span>
            <AiOutlineCreditCard className='text-green-600 text-xl dark:text-white' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-2xl font-bold dark:text-white'>
              {formatMontant(
                calculTotalEchelonnesMois(paiementsEchelonnes, now)
              )}
              €
            </span>
            <span className='text-xs text-gray-400 font-normal'>/mois</span>
          </div>
          <button
            className='mt-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800'
            onClick={() => navigate("/echelonne")}>
            Gérer →
          </button>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-900 font-bold text-xl'>
              Budget prévisionnel {moisEnCours}
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
          <div className='absolute bottom-2 right-2 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
            <div className='absolute top-0 left-full ml-2 w-96 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg'>
              <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help absolute top-2 right-2 text-lg' />
              <div className='font-semibold mb-2'>Montants à venir :</div>
              <div className='mb-2'>
                {(() => {
                  const depenses = [
                    ...depenseRevenu.filter(
                      (item) =>
                        item.type === "depense" &&
                        isCurrentMonth(new Date(item.date)) &&
                        isFuture(new Date(item.date))
                    ),
                  ].sort((a, b) => new Date(a.date) - new Date(b.date));
                  return depenses.length > 0 ? (
                    <div className='mb-2'>
                      <span className='font-bold' style={{ color: "#ef4444" }}>
                        Dépenses :
                      </span>
                      <ul className='ml-2 list-disc'>
                        {depenses.map((item) => (
                          <li key={item.id || item.nom + item.date}>
                            {item.nom} : {formatMontant(item.montant)}€{" "}
                            <span className='text-gray-300'>
                              {(function () {
                                const d = new Date(item.date);
                                return `(le ${d.getDate()} ${
                                  monthNames[d.getMonth()]
                                })`;
                              })()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className='mb-2'>
                {(() => {
                  const revenus = [
                    ...depenseRevenu.filter(
                      (item) =>
                        item.type === "revenu" &&
                        isCurrentMonth(new Date(item.date)) &&
                        isFuture(new Date(item.date))
                    ),
                  ].sort((a, b) => new Date(a.date) - new Date(b.date));
                  return revenus.length > 0 ? (
                    <div className='mb-2'>
                      <span className='font-bold' style={{ color: "#2ECC71" }}>
                        Revenus :
                      </span>
                      <ul className='ml-2 list-disc'>
                        {revenus.map((item) => (
                          <li key={item.id || item.nom + item.date}>
                            {item.nom} : {formatMontant(item.montant)}€{" "}
                            <span className='text-gray-300'>
                              {(function () {
                                const d = new Date(item.date);
                                return `(le ${d.getDate()} ${
                                  monthNames[d.getMonth()]
                                })`;
                              })()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className='mb-2'>
                {(() => {
                  const recurrents = [
                    ...paiementsRecurrents
                      .filter((p) => (p.type === "revenu" ? false : true))
                      .filter((p) => {
                        if (p.jourPrelevement) {
                          return (
                            isCurrentMonth(
                              new Date(
                                today.getFullYear(),
                                today.getMonth(),
                                p.jourPrelevement
                              )
                            ) && p.jourPrelevement > today.getDate()
                          );
                        }
                        return false;
                      }),
                  ].sort((a, b) => a.jourPrelevement - b.jourPrelevement);
                  return recurrents.length > 0 ? (
                    <div className='mb-2'>
                      <span className='font-bold' style={{ color: "#a78bfa" }}>
                        Récurrents à venir :
                      </span>
                      <ul className='ml-2 list-disc'>
                        {recurrents.map((p) => (
                          <li key={p.id || p.nom + p.jourPrelevement}>
                            {p.nom} : {formatMontant(p.montant)}€{" "}
                            <span className='text-gray-300'>
                              {(function () {
                                return `(le ${p.jourPrelevement} ${
                                  monthNames[today.getMonth()]
                                })`;
                              })()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className='mb-2'>
                {(() => {
                  const echelonnes = [
                    ...paiementsEchelonnes
                      .filter((e) => e.type === "depense")
                      .flatMap((e) => {
                        const debut = new Date(e.debutDate);
                        const mensualites = parseInt(e.mensualites, 10);
                        return Array.from({ length: mensualites }, (_, i) => {
                          const datePrelevement = new Date(debut);
                          datePrelevement.setMonth(debut.getMonth() + i);
                          if (
                            isCurrentMonth(datePrelevement) &&
                            datePrelevement > today
                          ) {
                            return {
                              id: e.id + "-" + i,
                              nom: e.nom,
                              montant:
                                Math.abs(parseFloat(e.montant)) / mensualites,
                              date: datePrelevement,
                            };
                          }
                          return null;
                        }).filter(Boolean);
                      }),
                  ].sort((a, b) => a.date - b.date);
                  return echelonnes.length > 0 ? (
                    <div className='mb-2'>
                      <span className='font-bold' style={{ color: "#4ECDC4" }}>
                        Échelonnés à venir :
                      </span>
                      <ul className='ml-2 list-disc'>
                        {echelonnes.map((ech) => (
                          <li key={ech.id}>
                            {ech.nom} : {formatMontant(ech.montant)}€{" "}
                            <span className='text-gray-300'>
                              {(function () {
                                const d = ech.date;
                                return `(le ${d.getDate()} ${
                                  monthNames[d.getMonth()]
                                })`;
                              })()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carte Économies actuelles */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative col-span-2'>
          <div className='flex'>
            {/* Partie gauche : calculatrice, titre, montant, différence, tooltip */}
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
              {/* Tooltip économies */}
              <div className='absolute bottom-2 right-2 group'>
                <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
                <div className='absolute top-0 left-full ml-2 w-96 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg'>
                  <p className='font-semibold mb-0'>Comprendre le calcul : </p>
                  <ul className='list-disc list-inside space-y-0.5'>
                    <li className='text-green-400'>
                      Total revenus :{" "}
                      {totalRevenusJusquaAujourdhui.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                    <li className='text-red-400'>
                      Total dépenses :{" "}
                      {totalDepenseJusquaAujourdhui.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                    <li className='text-white'>
                      Total économies :{" "}
                      {totalEconomiesJusquaAujourdhui.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                  </ul>
                  <div className='h-1' />
                  <div className='font-semibold mt-1 mb-0'>
                    Prévisionnel pour la fin du mois :
                  </div>
                  <ul className='list-disc list-inside space-y-0.5'>
                    <li className='text-green-400'>
                      Total revenus :{" "}
                      {totalRevenus.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                    <li className='text-red-400'>
                      Total dépenses :{" "}
                      {totalDepense.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                    <li className='text-white'>
                      Total économies :{" "}
                      {totalEconomies.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                  </ul>
                  <div className='h-1' />
                  <div className='font-semibold mt-1 mb-0'>
                    Mois précédent :
                  </div>
                  <ul className='list-disc list-inside space-y-0.5'>
                    <li className='text-green-400'>
                      Revenu :{" "}
                      {totalRevenusMoisPrecedent.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                    <li className='text-red-400'>
                      Dépenses :{" "}
                      {totalDepenseMoisPrecedent.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                    <li className='text-white'>
                      Total économies :{" "}
                      {totalEconomiesMoisPrecedent.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </li>
                  </ul>
                  <div className='mt-1 text-[10px] text-gray-300'>
                    Les économies sont calculées en soustrayant le total des
                    dépenses du total des revenus.
                  </div>
                </div>
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
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-lg transition-colors dark:bg-blue-500 dark:hover:bg-blue-600'>
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
            <DepensesParCategorieChart data={depensesParCategorie} />
          </div>
        </div>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 dark:text-white'>
          <h2 className='text-lg font-semibold mb-4 text-center'>
            Dépenses et revenus des 6 derniers mois
          </h2>
          <div className='h-[300px]'>
            <DepensesRevenus6MoisCourbe data={barChartData} />
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
