import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { formatMontant } from "../utils/calcul";
import { CURRENT_MONTH, MONTH_NAMES } from "../components/dashboard/dashboardConstantes";
import {
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui,
  calculDepensesClassiquesTotal,
  calculDepensesRecurrentesTotal,
  calculRevenusEchelonnesTotal
} from "../components/dashboard/calculDashboard";

export default function Previsionnel() {
  const { getData } = useAuth();
  const { depenseRevenu, paiementsRecurrents, paiementsEchelonnes } = useMemo(() => getData(), [getData]);

  // Protection pour le chargement des données
  if (!depenseRevenu || !paiementsRecurrents || !paiementsEchelonnes) {
    return <div className="p-8">Chargement des données...</div>;
  }

  // Calcul des dépenses actuelles (jusqu'à aujourd'hui)
  const depensesClassiquesJusquaAujourdhui = calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, new Date());
  const recurrentsDepenseJusquaAujourdhui = calculDepensesRecurrentesJusquaAujourdhui(paiementsRecurrents, new Date());
  const echelonnesDepenseJusquaAujourdhui = calculRevenusEchelonnesJusquaAujourdhui(paiementsEchelonnes, new Date());
  const totalDepenseJusquaAujourdhui = 
    depensesClassiquesJusquaAujourdhui + 
    recurrentsDepenseJusquaAujourdhui + 
    echelonnesDepenseJusquaAujourdhui;

  // Calcul des dépenses prévisionnelles (total du mois)
  const depensesClassiquesPrevisionnel = calculDepensesClassiquesTotal(depenseRevenu, new Date());
  const recurrentsDepensePrevisionnel = calculDepensesRecurrentesTotal(paiementsRecurrents, new Date());
  const echelonnesDepensePrevisionnel = calculRevenusEchelonnesTotal(paiementsEchelonnes, new Date());
  const totalDepensePrevisionnel = 
    depensesClassiquesPrevisionnel + 
    recurrentsDepensePrevisionnel + 
    echelonnesDepensePrevisionnel;

  // Calcul des dépenses restantes
  const depensesRestantes = totalDepensePrevisionnel - totalDepenseJusquaAujourdhui;

  // Récupération du solde actuel (dans un vrai cas, il faudrait obtenir cette valeur depuis l'état global)
  const soldeActuel = 2500; // Exemple, à remplacer par la vraie valeur

  // Calcul du budget restant après toutes les dépenses
  const budgetRestant = soldeActuel - depensesRestantes;

  // Calcul du budget journalier restant (en supposant qu'il reste autant de jours dans le mois)
  const today = new Date();
  const dernierJourMois = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const joursRestants = dernierJourMois - today.getDate();
  const budgetJournalierRestant = joursRestants > 0 ? budgetRestant / joursRestants : 0;

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        {/* Titre */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap'>
            Prévisionnel
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Gérez vos prévisions financières
          </p>
        </div>

        {/* Cartes de budget */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          {/* Carte de budget restant */}
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
            <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2'>
              Budget restant {CURRENT_MONTH}
            </h2>
            <div className={`text-3xl font-bold ${budgetRestant >= 0 ? 'text-green-600' : 'text-red-600'} mb-3`}>
              {formatMontant(budgetRestant)}€
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Solde disponible après toutes les dépenses du mois
            </p>
          </div>

          {/* Carte de budget journalier */}
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
            <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2'>
              Budget journalier restant
            </h2>
            <div className={`text-3xl font-bold ${budgetJournalierRestant >= 0 ? 'text-green-600' : 'text-red-600'} mb-3`}>
              {formatMontant(budgetJournalierRestant)}€/jour
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Pour les {joursRestants} jours restants du mois
            </p>
          </div>

          {/* Carte des dépenses restantes */}
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
            <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2'>
              Dépenses restantes
            </h2>
            <div className='text-3xl font-bold text-red-600 mb-3'>
              {formatMontant(depensesRestantes)}€
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Dépenses prévues jusqu'à la fin du mois
            </p>
          </div>
        </div>

        {/* Détail des dépenses restantes */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8'>
          <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4'>
            Détail des dépenses restantes
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
              <h3 className='text-md font-medium text-gray-700 dark:text-gray-200 mb-2'>Dépenses classiques</h3>
              <p className='text-xl font-bold text-red-600'>
                {formatMontant(depensesClassiquesPrevisionnel - depensesClassiquesJusquaAujourdhui)}€
              </p>
            </div>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
              <h3 className='text-md font-medium text-gray-700 dark:text-gray-200 mb-2'>Paiements récurrents</h3>
              <p className='text-xl font-bold text-red-600'>
                {formatMontant(recurrentsDepensePrevisionnel - recurrentsDepenseJusquaAujourdhui)}€
              </p>
            </div>
            <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
              <h3 className='text-md font-medium text-gray-700 dark:text-gray-200 mb-2'>Paiements échelonnés</h3>
              <p className='text-xl font-bold text-red-600'>
                {formatMontant(echelonnesDepensePrevisionnel - echelonnesDepenseJusquaAujourdhui)}€
              </p>
            </div>
          </div>
        </div>

        {/* Conseils budgétaires */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4'>
            Conseils budgétaires
          </h2>
          <div className='space-y-3'>
            {budgetRestant < 0 ? (
              <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                <p className='text-red-700 dark:text-red-400'>
                  Attention : Votre budget est négatif. Essayez de réduire vos dépenses pour ce mois.
                </p>
              </div>
            ) : budgetRestant < 100 ? (
              <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                <p className='text-yellow-700 dark:text-yellow-400'>
                  Vigilance : Votre budget est serré. Limitez les dépenses supplémentaires.
                </p>
              </div>
            ) : (
              <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                <p className='text-green-700 dark:text-green-400'>
                  Félicitations : Votre budget est équilibré. Vous pouvez envisager d'épargner le surplus.
                </p>
              </div>
            )}
            
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <p className='text-blue-700 dark:text-blue-400'>
                Budget journalier recommandé : {formatMontant(budgetJournalierRestant * 0.8)}€ pour conserver une marge de sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}