import React, { useMemo, useState, useRef, useCallback } from "react";
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
import {
  calculDepensesRecurrentesJusquaAujourdhui,
  calculDepensesRecurrentesTotal,
  calculDepensesEchelonneesJusquaAujourdhui,
  calculDepensesEchelonneesTotal,
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesClassiquesTotal,
} from "../components/dashboard/calculDashboard";

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

  // Récupérer toutes les données
  const { depenseRevenu, paiementsRecurrents, paiementsEchelonnes } = useMemo(
    () => getData(),
    [getData]
  );

  // Utilisation des valeurs par défaut pour les revenus et économies
  const {
    totalRevenus,
    totalEconomies,
    totalRevenusJusquaAujourdhui,
    totalEconomiesJusquaAujourdhui,
    totalRevenusMoisPrecedent,
    totalEconomiesMoisPrecedent,
    differenceEconomiesMoisPrecedent,
    budgetPrevisionnel,
  } = DEFAULT_AMOUNTS;

  // Fonction pour vérifier si une date est dans le mois courant
  const isCurrentMonth = (date) => {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  // Fonction pour obtenir le mois précédent
  const getPreviousMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  };

  // Calcul des dépenses classiques du mois courant
  const depensesClassiquesCourant = useMemo(() => {
    return isPrevisionnel
      ? calculDepensesClassiquesTotal(depenseRevenu, new Date())
      : calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, new Date());
  }, [depenseRevenu, isPrevisionnel]);

  // Calcul des paiements récurrents du mois courant
  const recurrentsDepenseCourant = useMemo(() => {
    return isPrevisionnel
      ? calculDepensesRecurrentesTotal(paiementsRecurrents, new Date())
      : calculDepensesRecurrentesJusquaAujourdhui(
          paiementsRecurrents,
          new Date()
        );
  }, [paiementsRecurrents, isPrevisionnel]);

  // Calcul des paiements échelonnés du mois courant
  const echelonnesDepenseCourant = useMemo(() => {
    return isPrevisionnel
      ? calculDepensesEchelonneesTotal(paiementsEchelonnes, new Date())
      : calculDepensesEchelonneesJusquaAujourdhui(
          paiementsEchelonnes,
          new Date()
        );
  }, [paiementsEchelonnes, isPrevisionnel]);

  // Calcul des dépenses classiques du mois précédent
  const depensesClassiquesMoisPrec = useMemo(() => {
    const dateMoisPrecedent = getPreviousMonth();
    return calculDepensesClassiquesTotal(depenseRevenu, dateMoisPrecedent);
  }, [depenseRevenu]);

  // Calcul des paiements récurrents du mois précédent
  const recurrentsDepenseMoisPrec = useMemo(() => {
    const dateMoisPrecedent = getPreviousMonth();
    return calculDepensesRecurrentesTotal(
      paiementsRecurrents,
      dateMoisPrecedent
    );
  }, [paiementsRecurrents]);

  // Calcul des paiements échelonnés du mois précédent
  const echelonnesDepenseMoisPrec = useMemo(() => {
    const dateMoisPrecedent = getPreviousMonth();
    return calculDepensesEchelonneesTotal(
      paiementsEchelonnes,
      dateMoisPrecedent
    );
  }, [paiementsEchelonnes]);

  // Calcul du total des dépenses jusqu'à aujourd'hui
  const totalDepenseJusquaAujourdhui = useMemo(() => {
    return (
      depensesClassiquesCourant +
      recurrentsDepenseCourant +
      echelonnesDepenseCourant
    );
  }, [
    depensesClassiquesCourant,
    recurrentsDepenseCourant,
    echelonnesDepenseCourant,
  ]);

  // Calcul du total des dépenses du mois précédent
  const totalDepenseMoisPrecedent = useMemo(() => {
    return (
      depensesClassiquesMoisPrec +
      recurrentsDepenseMoisPrec +
      echelonnesDepenseMoisPrec
    );
  }, [
    depensesClassiquesMoisPrec,
    recurrentsDepenseMoisPrec,
    echelonnesDepenseMoisPrec,
  ]);

  // Calcul de la différence avec le mois précédent
  const differenceMoisPrecedent = useMemo(() => {
    return totalDepenseJusquaAujourdhui - totalDepenseMoisPrecedent;
  }, [totalDepenseJusquaAujourdhui, totalDepenseMoisPrecedent]);

  // Calcul du total des dépenses (prévisionnel)
  const totalDepense = useMemo(() => {
    return (
      depensesClassiquesCourant +
      recurrentsDepenseCourant +
      echelonnesDepenseCourant
    );
  }, [
    depensesClassiquesCourant,
    recurrentsDepenseCourant,
    echelonnesDepenseCourant,
  ]);

  // Calcul de la différence des revenus avec le mois précédent
  const differenceRevenusMoisPrecedent = useMemo(() => {
    return totalRevenusJusquaAujourdhui - totalRevenusMoisPrecedent;
  }, [totalRevenusJusquaAujourdhui, totalRevenusMoisPrecedent]);

  // Fonction pour calculer le total des paiements échelonnés du mois
  const calculTotalEchelonnesMois = useCallback(() => {
    return paiementsEchelonnes
      .filter(
        (e) =>
          e.type === "depense" &&
          (!e.debut || new Date(e.debut) <= new Date()) &&
          (!e.fin || new Date(e.fin) >= new Date())
      )
      .reduce(
        (acc, e) =>
          acc +
          Math.abs(parseFloat(e.montant || 0)) / parseInt(e.mensualites || 1),
        0
      );
  }, [paiementsEchelonnes]);

  // Utiliser le hook personnalisé pour le tri
  const { paiementsRecurrentsTries, paiementsEchelonnesTries } =
    useSortedPayments(paiementsRecurrents, paiementsEchelonnes);

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
          depensesClassiquesCourant={depensesClassiquesCourant}
          recurrentsDepenseCourant={recurrentsDepenseCourant}
          echelonnesDepenseCourant={echelonnesDepenseCourant}
          depensesClassiquesMoisPrec={depensesClassiquesMoisPrec}
          recurrentsDepenseMoisPrec={recurrentsDepenseMoisPrec}
          echelonnesDepenseMoisPrec={echelonnesDepenseMoisPrec}
          isPrevisionnel={isPrevisionnel}
          depenseRevenu={depenseRevenu}
          paiementsRecurrents={paiementsRecurrents}
          paiementsEchelonnes={paiementsEchelonnes}
          calculTotalEchelonnesMois={calculTotalEchelonnesMois}
          isCurrentMonth={isCurrentMonth}
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
