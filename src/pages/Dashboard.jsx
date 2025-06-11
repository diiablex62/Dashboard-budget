import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
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
  calculRevenusClassiquesJusquaAujourdhui,
  calculRevenusClassiquesTotal,
  calculRevenusRecurrentsJusquaAujourdhui,
  calculRevenusRecurrentsTotal,
  calculRevenusEchelonnesJusquaAujourdhui,
  calculRevenusEchelonnesTotal,
} from "../components/dashboard/calculDashboard";
import {
  getTotalRevenusJusquaAujourdhui,
  getTotalDepenseJusquaAujourdhui,
} from "../components/dashboard/calculSynchro";
import { ThemeContext } from "../context/ThemeContext";
import { getCourbeRevenusDepenses6Mois } from "../components/dashboard/graphiques/calculGraph6";

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

  // Ajout d'une clé de rafraîchissement pour forcer le rechargement des données
  const [refreshKey, setRefreshKey] = useState(0);

  const themeCtx = React.useContext(ThemeContext);

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener("data-updated", handleDataUpdated);
    return () => window.removeEventListener("data-updated", handleDataUpdated);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "a") {
        setIsPrevisionnel(false);
      } else if (e.key.toLowerCase() === "p") {
        setIsPrevisionnel(true);
      } else if (e.key.toLowerCase() === "l") {
        themeCtx?.setIsDarkMode && themeCtx.setIsDarkMode(false);
      } else if (e.key.toLowerCase() === "d") {
        themeCtx?.setIsDarkMode && themeCtx.setIsDarkMode(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [themeCtx]);

  // Utilisation de refreshKey dans le useMemo pour getData
  const { depenseRevenu, paiementsRecurrents, paiementsEchelonnes } = useMemo(
    () => getData() || {},
    [getData, refreshKey]
  );

  // Sécurisation des données pour éviter les erreurs si non chargées
  const safeDepenseRevenu = Array.isArray(depenseRevenu) ? depenseRevenu : [];
  const safePaiementsRecurrents = Array.isArray(paiementsRecurrents)
    ? paiementsRecurrents
    : [];
  const safePaiementsEchelonnes = Array.isArray(paiementsEchelonnes)
    ? paiementsEchelonnes
    : [];

  // Utilisation des valeurs par défaut pour les revenus et économies
  const { totalEconomiesJusquaAujourdhui } = DEFAULT_AMOUNTS;

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

  // Calculs explicites pour les totaux à afficher dans la carte économies et le tooltip
  const revenusClassiquesJusquaAujourdhui =
    calculRevenusClassiquesJusquaAujourdhui(safeDepenseRevenu, new Date());
  const recurrentsRevenuJusquaAujourdhui =
    calculRevenusRecurrentsJusquaAujourdhui(
      safePaiementsRecurrents,
      new Date()
    );
  const echelonnesRevenuJusquaAujourdhui =
    calculDepensesEchelonneesJusquaAujourdhui(
      safePaiementsEchelonnes,
      new Date()
    );
  const totalRevenusJusquaAujourdhui =
    revenusClassiquesJusquaAujourdhui +
    recurrentsRevenuJusquaAujourdhui +
    echelonnesRevenuJusquaAujourdhui;

  const depensesClassiquesJusquaAujourdhui =
    calculDepensesClassiquesJusquaAujourdhui(safeDepenseRevenu, new Date());
  const recurrentsDepenseJusquaAujourdhui =
    calculDepensesRecurrentesJusquaAujourdhui(
      safePaiementsRecurrents,
      new Date()
    );
  const echelonnesDepenseJusquaAujourdhui =
    calculRevenusEchelonnesJusquaAujourdhui(
      safePaiementsEchelonnes,
      new Date()
    );
  const totalDepenseJusquaAujourdhui =
    depensesClassiquesJusquaAujourdhui +
    recurrentsDepenseJusquaAujourdhui +
    echelonnesDepenseJusquaAujourdhui;

  const totalEconomiesActuel = useMemo(() => {
    return totalRevenusJusquaAujourdhui - totalDepenseJusquaAujourdhui;
  }, [totalRevenusJusquaAujourdhui, totalDepenseJusquaAujourdhui]);

  // Prévisionnel
  const revenusClassiquesPrevisionnel = calculRevenusClassiquesTotal(
    safeDepenseRevenu,
    new Date()
  );
  const recurrentsRevenuPrevisionnel = calculRevenusRecurrentsTotal(
    safePaiementsRecurrents,
    new Date()
  );
  const echelonnesRevenuPrevisionnel = calculRevenusEchelonnesTotal(
    safePaiementsEchelonnes,
    new Date()
  );
  const totalRevenus = useMemo(() => {
    return (
      revenusClassiquesPrevisionnel +
      recurrentsRevenuPrevisionnel +
      echelonnesRevenuPrevisionnel
    );
  }, [
    revenusClassiquesPrevisionnel,
    recurrentsRevenuPrevisionnel,
    echelonnesRevenuPrevisionnel,
  ]);

  const depensesClassiquesPrevisionnel = calculDepensesClassiquesTotal(
    safeDepenseRevenu,
    new Date()
  );
  const recurrentsDepensePrevisionnel = calculDepensesRecurrentesTotal(
    safePaiementsRecurrents,
    new Date()
  );
  const echelonnesDepensePrevisionnel = calculDepensesEchelonneesTotal(
    safePaiementsEchelonnes,
    new Date()
  );
  const totalDepense = useMemo(() => {
    return (
      depensesClassiquesPrevisionnel +
      recurrentsDepensePrevisionnel +
      echelonnesDepensePrevisionnel
    );
  }, [
    depensesClassiquesPrevisionnel,
    recurrentsDepensePrevisionnel,
    echelonnesDepensePrevisionnel,
  ]);

  const totalEconomiesPrevisionnel = useMemo(() => {
    return totalRevenus - totalDepense;
  }, [totalRevenus, totalDepense]);

  // Mois précédent
  const dateMoisPrecedent = getPreviousMonth();
  const revenusClassiquesMoisPrec = calculRevenusClassiquesTotal(
    safeDepenseRevenu,
    dateMoisPrecedent
  );
  const recurrentsRevenuMoisPrec = calculRevenusRecurrentsTotal(
    safePaiementsRecurrents,
    dateMoisPrecedent
  );
  const echelonnesRevenuMoisPrec = calculDepensesEchelonneesTotal(
    safePaiementsEchelonnes,
    dateMoisPrecedent
  );
  const totalRevenusMoisPrecedent =
    revenusClassiquesMoisPrec +
    recurrentsRevenuMoisPrec +
    echelonnesRevenuMoisPrec;

  const depensesClassiquesMoisPrec = calculDepensesClassiquesTotal(
    safeDepenseRevenu,
    dateMoisPrecedent
  );
  const recurrentsDepenseMoisPrec = calculDepensesRecurrentesTotal(
    safePaiementsRecurrents,
    dateMoisPrecedent
  );
  const echelonnesDepenseMoisPrec = calculRevenusEchelonnesTotal(
    safePaiementsEchelonnes,
    dateMoisPrecedent
  );
  const totalDepenseMoisPrecedent =
    depensesClassiquesMoisPrec +
    recurrentsDepenseMoisPrec +
    echelonnesDepenseMoisPrec;

  const totalEconomiesMoisPrecedent = useMemo(() => {
    return totalRevenusMoisPrecedent - totalDepenseMoisPrecedent;
  }, [totalRevenusMoisPrecedent, totalDepenseMoisPrecedent]);

  // Calcul de la différence de revenus avec le mois précédent
  const differenceRevenusMoisPrecedentJusquaAujourdhui =
    totalRevenusJusquaAujourdhui - totalRevenusMoisPrecedent;
  const differenceRevenusMoisPrecedentPrevisionnel =
    totalRevenus - totalRevenusMoisPrecedent;

  // Fonction pour calculer le total des paiements échelonnés du mois
  const calculTotalEchelonnesMois = useCallback(() => {
    return safePaiementsEchelonnes
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
  }, [safePaiementsEchelonnes]);

  // Utiliser le hook personnalisé pour le tri
  const { paiementsRecurrentsTries, paiementsEchelonnesTries } =
    useSortedPayments(safePaiementsRecurrents, safePaiementsEchelonnes);

  // Totaux paiements échelonnés (dépenses uniquement)
  // const totalEchelonnesJusquaAujourdhui =
  //   calculDepensesEchelonneesJusquaAujourdhui(paiementsEchelonnes, new Date());
  // const totalEchelonnesPrevisionnel = calculDepensesEchelonneesTotal(
  //   paiementsEchelonnes,
  //   new Date()
  // );

  // Calcul de la différence des économies (inversé pour avoir la bonne direction)
  const differenceEconomies = useMemo(() => {
    return isPrevisionnel
      ? totalEconomiesPrevisionnel - totalEconomiesMoisPrecedent
      : totalEconomiesActuel - totalEconomiesMoisPrecedent;
  }, [
    isPrevisionnel,
    totalEconomiesMoisPrecedent,
    totalEconomiesPrevisionnel,
    totalEconomiesActuel,
  ]);

  const dashboardRef = useRef(null);

  // Fonction utilitaire pour regrouper toutes les dépenses du mois courant par catégorie
  function getDepensesParCategoriePourMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    date = new Date()
  ) {
    const mois = date.getMonth();
    const annee = date.getFullYear();
    // Dépenses classiques
    const depensesMois = depenseRevenu.filter(
      (d) =>
        d.type === "depense" &&
        new Date(d.date).getMonth() === mois &&
        new Date(d.date).getFullYear() === annee
    );
    // Dépenses récurrentes (on suppose qu'elles ont une propriété categorie et montant)
    const recurrentsMois = paiementsRecurrents.filter(
      (d) =>
        d.type === "depense" &&
        (!d.debut ||
          (new Date(d.debut).getMonth() <= mois &&
            new Date(d.debut).getFullYear() <= annee)) &&
        (!d.fin ||
          (new Date(d.fin).getMonth() >= mois &&
            new Date(d.fin).getFullYear() >= annee))
    );
    // Dépenses échelonnées (on inclut aussi les crédits)
    const echelonnesMois = paiementsEchelonnes.filter(
      (d) =>
        (d.type === "depense" || d.type === "credit") &&
        (!d.debut ||
          (new Date(d.debut).getMonth() <= mois &&
            new Date(d.debut).getFullYear() <= annee)) &&
        (!d.fin ||
          (new Date(d.fin).getMonth() >= mois &&
            new Date(d.fin).getFullYear() >= annee))
    );
    // Regroupement par catégorie
    const parCategorie = {};
    depensesMois.forEach((d) => {
      if (!parCategorie[d.categorie]) parCategorie[d.categorie] = 0;
      parCategorie[d.categorie] += Number(d.montant);
    });
    recurrentsMois.forEach((d) => {
      if (!parCategorie[d.categorie]) parCategorie[d.categorie] = 0;
      parCategorie[d.categorie] += Number(d.montant);
    });
    echelonnesMois.forEach((d) => {
      if (!parCategorie[d.categorie]) parCategorie[d.categorie] = 0;
      parCategorie[d.categorie] += Number(d.montant);
    });
    return Object.entries(parCategorie).map(([name, value]) => ({
      name,
      value,
    }));
  }

  const courbeData = getCourbeRevenusDepenses6Mois(
    safeDepenseRevenu,
    safePaiementsRecurrents,
    safePaiementsEchelonnes,
    isPrevisionnel
  );

  // Correction du calcul de la différence pour la carte Dépenses (après harmonisation)
  const differenceAvecMoisDernierJusquaAujourdhui =
    totalDepenseJusquaAujourdhui - totalDepenseMoisPrecedent;
  const differenceAvecMoisDernierPrevisionnel =
    totalDepense - totalDepenseMoisPrecedent;

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
        {/* Carte Revenus */}
        <RevenuCard
          totalRevenus={
            isPrevisionnel ? totalRevenus : totalRevenusJusquaAujourdhui
          }
          totalRevenusJusquaAujourdhui={totalRevenusJusquaAujourdhui}
          totalRevenusMoisPrecedent={totalRevenusMoisPrecedent}
          differenceRevenusMoisPrecedent={
            isPrevisionnel
              ? differenceRevenusMoisPrecedentPrevisionnel
              : differenceRevenusMoisPrecedentJusquaAujourdhui
          }
          revenusClassiquesCourant={revenusClassiquesJusquaAujourdhui}
          recurrentsRevenuCourant={recurrentsRevenuJusquaAujourdhui}
          echelonnesRevenuCourant={echelonnesRevenuJusquaAujourdhui}
          revenusClassiquesPrevisionnel={revenusClassiquesPrevisionnel}
          recurrentsRevenuPrevisionnel={recurrentsRevenuPrevisionnel}
          echelonnesRevenuPrevisionnel={echelonnesRevenuPrevisionnel}
          revenusClassiquesMoisPrec={revenusClassiquesMoisPrec}
          recurrentsRevenuMoisPrec={recurrentsRevenuMoisPrec}
          echelonnesRevenuMoisPrec={echelonnesRevenuMoisPrec}
          isPrevisionnel={isPrevisionnel}
        />
        {/* Carte Dépenses */}
        <DepenseCard
          totalDepense={
            isPrevisionnel ? totalDepense : totalDepenseJusquaAujourdhui
          }
          totalDepenseJusquaAujourdhui={totalDepenseJusquaAujourdhui}
          totalDepenseMoisPrecedent={totalDepenseMoisPrecedent}
          differenceMoisPrecedent={
            isPrevisionnel
              ? differenceAvecMoisDernierPrevisionnel
              : differenceAvecMoisDernierJusquaAujourdhui
          }
          isHoveringCalculator={isHoveringCalculator}
          setIsHoveringCalculator={setIsHoveringCalculator}
          depensesClassiquesCourant={depensesClassiquesJusquaAujourdhui}
          recurrentsDepenseCourant={recurrentsDepenseJusquaAujourdhui}
          echelonnesDepenseCourant={echelonnesDepenseJusquaAujourdhui}
          depensesClassiquesMoisPrec={depensesClassiquesMoisPrec}
          recurrentsDepenseMoisPrec={recurrentsDepenseMoisPrec}
          echelonnesDepenseMoisPrec={echelonnesDepenseMoisPrec}
          isPrevisionnel={isPrevisionnel}
          depenseRevenu={safeDepenseRevenu}
          paiementsRecurrents={safePaiementsRecurrents}
          paiementsEchelonnes={safePaiementsEchelonnes}
          calculTotalEchelonnesMois={calculTotalEchelonnesMois}
          isCurrentMonth={isCurrentMonth}
        />

        {/* Carte Paiements échelonnés */}
        {/* <EchelonneCard
          totalEchelonnes={
            isPrevisionnel
              ? totalEchelonnesPrevisionnel
              : totalEchelonnesJusquaAujourdhui
          }
          isPrevisionnel={isPrevisionnel}
        /> */}

        {/* Carte Budget prévisionnel */}
        <BudgetCard budgetPrevisionnel={totalRevenus - totalDepense} />
      </div>

      {/* Carte Économies actuelles */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <EconomieCard
          totalEconomies={
            isPrevisionnel ? totalEconomiesPrevisionnel : totalEconomiesActuel
          }
          totalEconomiesJusquaAujourdhui={totalEconomiesActuel}
          totalEconomiesMoisPrecedent={totalEconomiesMoisPrecedent}
          differenceEconomiesMoisPrecedent={differenceEconomies}
          totalRevenusJusquaAujourdhui={totalRevenusJusquaAujourdhui}
          totalDepenseJusquaAujourdhui={totalDepenseJusquaAujourdhui}
          totalRevenus={totalRevenus}
          totalDepense={totalDepense}
          totalRevenusMoisPrecedent={totalRevenusMoisPrecedent}
          totalDepenseMoisPrecedent={totalDepenseMoisPrecedent}
          isHoveringCalculatorEconomies={isHoveringCalculatorEconomies}
          setIsHoveringCalculatorEconomies={setIsHoveringCalculatorEconomies}
          onUpdateBalance={() => setIsBalanceModalOpen(true)}
          isPrevisionnel={isPrevisionnel}
          messageSynchronisation={`Vous n'avez pas actuellement ${totalEconomiesActuel.toLocaleString(
            "fr-FR",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )} € ? Veuillez cliquer sur le bouton ci-dessous pour mettre à jour :`}
        />
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <GraphiqueCard title='Dépenses du mois par catégorie'>
          <DepensesParCategorieChart
            data={getDepensesParCategoriePourMois(
              safeDepenseRevenu,
              safePaiementsRecurrents,
              safePaiementsEchelonnes
            )}
            isPrevisionnel={isPrevisionnel}
          />
        </GraphiqueCard>
        <GraphiqueCard title='Dépenses et revenus des 6 derniers mois'>
          <DepensesRevenus6MoisCourbe
            data={courbeData}
            isPrevisionnel={isPrevisionnel}
          />
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
        currentCalculatedBalance={totalEconomiesActuel}
        totalEconomiesActuel={totalEconomiesActuel}
      />
    </div>
  );
}
