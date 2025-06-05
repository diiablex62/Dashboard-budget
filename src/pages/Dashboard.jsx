import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineInfoCircle,
  AiOutlineSync,
} from "react-icons/ai";
import { BsCalculator } from "react-icons/bs";
import DepensesRevenus6MoisCourbe from "../components/dashboard/graphiques/DepensesRevenus6MoisCourbe";
import DepensesParCategorieChart from "../components/dashboard/graphiques/DepensesParCategorieChart";
import { useAuth } from "../context/AuthContext";
import SynchroUpdateModal from "../components/ui/SynchroUpdateModal";
import DepenseCard from "../components/dashboard/DepenseCard";
import RevenuCard from "../components/dashboard/RevenuCard";
import EchelonneCard from "../components/dashboard/EchelonneCard";
import BudgetCard from "../components/dashboard/BudgetCard";
import EconomieCard from "../components/dashboard/EconomieCard";
import PaiementsRecurrentsList from "../components/dashboard/PaiementsRecurrentsList";
import PaiementsEchelonnesList from "../components/dashboard/PaiementsEchelonnesList";
import GraphiqueCard from "../components/dashboard/GraphiqueCard";
import SectionTitle from "../components/dashboard/SectionTitle";
import StatCard from "../components/dashboard/StatCard";
import VueSwitch from "../components/dashboard/VueSwitch";
import DarkModeSwitch from "../components/ui/DarkModeSwitch";
import { useSortedPayments } from "../utils/useSortedPayments";
import {
  MONTH_NAMES,
  CURRENT_MONTH,
  DEFAULT_AMOUNTS,
} from "../components/dashboard/dashboardConstantes";

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
  const [isPrevisionnel, setIsPrevisionnel] = useState(false);

  // Utiliser getData pour les données
  const { paiementsRecurrents, paiementsEchelonnes } = useMemo(
    () => getData(),
    [getData]
  );

  // Utiliser le hook personnalisé pour le tri
  const { paiementsRecurrentsTries, paiementsEchelonnesTries } =
    useSortedPayments(paiementsRecurrents, paiementsEchelonnes);

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
      {/* En-tête avec le switch */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
          DASHBOARD
        </h1>
        <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex justify-between items-center'>
          <DarkModeSwitch />
          <VueSwitch
            isPrevisionnel={isPrevisionnel}
            setIsPrevisionnel={setIsPrevisionnel}
          />
        </div>
      </div>

      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {/* Carte Dépenses */}
        <DepenseCard
          totalDepense={
            isPrevisionnel ? totalDepense : totalDepenseJusquaAujourdhui
          }
          totalDepenseJusquaAujourdhui={totalDepenseJusquaAujourdhui}
          totalDepenseMoisPrecedent={totalDepenseMoisPrecedent}
          differenceMoisPrecedent={differenceMoisPrecedent}
          isHoveringCalculator={isHoveringCalculator}
          setIsHoveringCalculator={setIsHoveringCalculator}
          depensesClassiquesCourant={0}
          recurrentsDepenseCourant={0}
          echelonnesDepenseCourant={0}
          depensesClassiquesMoisPrec={0}
          recurrentsDepenseMoisPrec={0}
          echelonnesDepenseMoisPrec={0}
          isPrevisionnel={isPrevisionnel}
        />

        {/* Carte Revenus */}
        <RevenuCard
          totalRevenus={
            isPrevisionnel ? totalRevenus : totalRevenusJusquaAujourdhui
          }
          totalRevenusJusquaAujourdhui={totalRevenusJusquaAujourdhui}
          totalRevenusMoisPrecedent={totalRevenusMoisPrecedent}
          differenceRevenusMoisPrecedent={differenceRevenusMoisPrecedent}
          isHoveringCalculatorRevenus={isHoveringCalculatorRevenus}
          setIsHoveringCalculatorRevenus={setIsHoveringCalculatorRevenus}
          revenusClassiquesCourant={0}
          recurrentsRevenuCourant={0}
          echelonnesRevenuCourant={0}
          revenusClassiquesMoisPrec={0}
          recurrentsRevenuMoisPrec={0}
          echelonnesRevenuMoisPrec={0}
          isPrevisionnel={isPrevisionnel}
        />

        {/* Carte Paiements échelonnés */}
        <EchelonneCard />

        {/* Carte Budget prévisionnel */}
        <BudgetCard budgetPrevisionnel={budgetPrevisionnel} />
      </div>

      {/* Carte Économies actuelles */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <EconomieCard
          totalEconomies={
            isPrevisionnel ? totalEconomies : totalEconomiesJusquaAujourdhui
          }
          totalEconomiesJusquaAujourdhui={totalEconomiesJusquaAujourdhui}
          totalEconomiesMoisPrecedent={totalEconomiesMoisPrecedent}
          differenceEconomiesMoisPrecedent={differenceEconomiesMoisPrecedent}
          isHoveringCalculatorEconomies={isHoveringCalculatorEconomies}
          setIsHoveringCalculatorEconomies={setIsHoveringCalculatorEconomies}
          onUpdateBalance={() => setIsBalanceModalOpen(true)}
          isPrevisionnel={isPrevisionnel}
        />
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <GraphiqueCard title='Dépenses du mois par catégorie'>
          <DepensesParCategorieChart data={[]} />
        </GraphiqueCard>
        <GraphiqueCard title='Dépenses et revenus des 6 derniers mois'>
          <DepensesRevenus6MoisCourbe data={[]} />
        </GraphiqueCard>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <PaiementsRecurrentsList
          paiements={paiementsRecurrentsTries}
          onViewAll={() => navigate("/recurrents")}
        />
        <PaiementsEchelonnesList
          paiements={paiementsEchelonnesTries}
          onViewAll={() => navigate("/echelonne")}
        />
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
