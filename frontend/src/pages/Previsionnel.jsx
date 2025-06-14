import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { formatMontant } from "../utils/calcul";
import {
  CURRENT_MONTH,
  MONTH_NAMES,
} from "../components/dashboard/dashboardConstantes";
import {
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui,
} from "../components/dashboard/calculDashboard";
import GraphiquePrevisionnel from "../components/dashboard/GraphiquePrevisionnel";
import { genererDonneesPrevisionnelles } from "../utils/calculGraphPrevi";
import {
  calculRevenusClassiquesTotal as calculRevenusClassiquesTotalPrevisionnel,
  calculRevenusRecurrentsTotal as calculRevenusRecurrentsTotalPrevisionnel,
  calculRevenusEchelonnesTotal as calculRevenusEchelonnesTotalPrevisionnel,
  calculDepensesClassiquesTotal as calculDepensesClassiquesTotalPrevisionnel,
  calculDepensesRecurrentesTotal as calculDepensesRecurrentesTotalPrevisionnel,
  calculDepensesEchelonneesTotal as calculDepensesEchelonneesTotalPrevisionnel,
} from "../utils/calculPrevisionnel";

export default function Previsionnel() {
  const { getData } = useAuth();
  const { depenseRevenu, paiementsRecurrents, paiementsEchelonnes } = useMemo(
    () => getData(),
    [getData]
  );

  // Protection pour le chargement des données
  if (
    !depenseRevenu?.length ||
    !paiementsRecurrents?.length ||
    !paiementsEchelonnes?.length
  ) {
    return <div className='p-8'>Chargement des données...</div>;
  }

  // Utiliser le dernier jour du mois courant pour tous les calculs prévisionnels
  const now = new Date();
  const dernierJourMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // REVENUS prévisionnels (logique graphique 6 mois)
  const revenusClassiquesPrevisionnel =
    calculRevenusClassiquesTotalPrevisionnel(depenseRevenu, dernierJourMois);
  const recurrentsRevenuPrevisionnel = calculRevenusRecurrentsTotalPrevisionnel(
    paiementsRecurrents,
    dernierJourMois
  );
  const echelonnesRevenuPrevisionnel = calculRevenusEchelonnesTotalPrevisionnel(
    paiementsEchelonnes,
    dernierJourMois
  );
  const totalRevenusPrevisionnel =
    revenusClassiquesPrevisionnel +
    recurrentsRevenuPrevisionnel +
    echelonnesRevenuPrevisionnel;

  // DEPENSES prévisionnelles (logique graphique 6 mois)
  const depensesClassiquesPrevisionnel =
    calculDepensesClassiquesTotalPrevisionnel(depenseRevenu, dernierJourMois);
  const recurrentsDepensePrevisionnel =
    calculDepensesRecurrentesTotalPrevisionnel(
      paiementsRecurrents,
      dernierJourMois
    );
  const echelonnesDepensePrevisionnel =
    calculDepensesEchelonneesTotalPrevisionnel(
      paiementsEchelonnes,
      dernierJourMois
    );
  const totalDepensePrevisionnel =
    depensesClassiquesPrevisionnel +
    recurrentsDepensePrevisionnel +
    echelonnesDepensePrevisionnel;

  // Nouveau solde prévisionnel
  const budgetRestant = totalRevenusPrevisionnel - totalDepensePrevisionnel;

  // Calcul des dépenses actuelles (jusqu'à aujourd'hui)
  const depensesClassiquesJusquaAujourdhui =
    calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, new Date());
  const recurrentsDepenseJusquaAujourdhui =
    calculDepensesRecurrentesJusquaAujourdhui(paiementsRecurrents, new Date());
  const echelonnesDepenseJusquaAujourdhui =
    calculRevenusEchelonnesJusquaAujourdhui(paiementsEchelonnes, new Date());
  const totalDepenseJusquaAujourdhui =
    depensesClassiquesJusquaAujourdhui +
    recurrentsDepenseJusquaAujourdhui +
    echelonnesDepenseJusquaAujourdhui;

  // Calcul des dépenses restantes
  const depensesRestantes =
    totalDepensePrevisionnel - totalDepenseJusquaAujourdhui;

  // Calcul du budget journalier restant (en supposant qu'il reste autant de jours dans le mois)
  const today = new Date();
  const joursRestants = dernierJourMois.getDate() - today.getDate();
  const budgetJournalierRestant =
    joursRestants > 0 ? budgetRestant / joursRestants : 0;

  // Génération des données prévisionnelles pour les 6 prochains mois
  const nbMois = 6;
  const dataPrevisionnelle = genererDonneesPrevisionnelles({
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    now,
    moisLabels: MONTH_NAMES,
    nbMois,
  });

  // Analyse du solde cumulé futur pour les conseils budgétaires
  const soldeFuturNegatif = dataPrevisionnelle.some((item) => item.solde < 0);
  const premierMoisSoldeNegatif = soldeFuturNegatif
    ? dataPrevisionnelle.find((item) => item.solde < 0)
    : null;

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
            <div
              className={`text-3xl font-bold ${
                budgetRestant >= 0 ? "text-green-600" : "text-red-600"
              } mb-3`}>
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
            <div
              className={`text-3xl font-bold ${
                budgetJournalierRestant >= 0 ? "text-green-600" : "text-red-600"
              } mb-3`}>
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

        {/* Graphique des mois à venir */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8'>
          <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4'>
            Prévision des dépenses et revenus des prochains mois
          </h2>
          <GraphiquePrevisionnel data={dataPrevisionnelle} />
        </div>

        {/* Conseils budgétaires */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4'>
            Conseils budgétaires
          </h2>
          <div className='space-y-3'>
            {/* Alerte immédiate si budget négatif */}
            {budgetRestant < 0 ? (
              <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                <p className='text-red-700 dark:text-red-400'>
                  Attention : Votre budget est négatif. Réduisez vos dépenses
                  immédiatement.
                </p>
              </div>
            ) : budgetRestant < 200 ? (
              <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                <p className='text-yellow-700 dark:text-yellow-400'>
                  Vigilance : Votre budget est serré. Limitez les dépenses
                  supplémentaires.
                </p>
              </div>
            ) : (
              <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                <p className='text-green-700 dark:text-green-400'>
                  Félicitations : Votre budget est équilibré. Envisagez
                  d'épargner le surplus.
                </p>
              </div>
            )}

            {/* Alerte future si solde négatif prévu */}
            {soldeFuturNegatif && (
              <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                <p className='text-red-700 dark:text-red-400'>
                  Alerte future : Votre solde pourrait devenir négatif
                  {premierMoisSoldeNegatif &&
                    ` à partir de ${
                      premierMoisSoldeNegatif.mois
                    } ${premierMoisSoldeNegatif.dateMois.getFullYear()}`}
                  . Planifiez dès maintenant.
                </p>
              </div>
            )}

            {/* Conseil sur le budget journalier */}
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <p className='text-blue-700 dark:text-blue-400'>
                Budget journalier recommandé :{" "}
                {formatMontant(budgetJournalierRestant * 0.8)}€ pour une marge
                de sécurité.
              </p>
            </div>

            {/* Analyse des variations mensuelles significatives */}
            {(() => {
              let conseilVariation = null;
              for (let i = 1; i < dataPrevisionnelle.length; i++) {
                const soldeMoisPrecedent = dataPrevisionnelle[i - 1].solde;
                const soldeMoisActuel = dataPrevisionnelle[i].solde;
                const difference = soldeMoisActuel - soldeMoisPrecedent;

                if (difference < -500) {
                  conseilVariation = (
                    <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                      <p className='text-red-700 dark:text-red-400'>
                        Attention : Une baisse significative est prévue pour{" "}
                        {dataPrevisionnelle[i].mois}.
                      </p>
                    </div>
                  );
                  break;
                } else if (difference > 500) {
                  conseilVariation = (
                    <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                      <p className='text-green-700 dark:text-green-400'>
                        Opportunité : Une augmentation notable est prévue pour{" "}
                        {dataPrevisionnelle[i].mois}.
                      </p>
                    </div>
                  );
                  break;
                }
              }
              return conseilVariation;
            })()}

            {/* Synthèse générale */}
            {(() => {
              let conseilGeneral = "";
              let bgColor = "bg-gray-50 dark:bg-gray-900/20";
              let borderColor = "border-gray-200 dark:border-gray-800";
              let textColor = "text-gray-700 dark:text-gray-400";

              const premierSolde = dataPrevisionnelle.length > 0 ? dataPrevisionnelle[0].solde : 0;
              const dernierSolde = dataPrevisionnelle.length > 0 ? dataPrevisionnelle[dataPrevisionnelle.length - 1].solde : 0;

              if (soldeFuturNegatif) {
                conseilGeneral = "Votre budget est sous pression. Une action rapide est recommandée.";
                bgColor = "bg-red-50 dark:bg-red-900/20";
                borderColor = "border-red-200 dark:border-red-800";
                textColor = "text-red-700 dark:text-red-400";
              } else if (budgetRestant < 0) {
                conseilGeneral = "Concentrez-vous sur la réduction des dépenses immédiates.";
                bgColor = "bg-red-50 dark:bg-red-900/20";
                borderColor = "border-red-200 dark:border-red-800";
                textColor = "text-red-700 dark:text-red-400";
              } else if (dernierSolde < premierSolde - 100) {
                conseilGeneral = "Attention : Votre solde cumulé diminue. Revoyez vos habitudes budgétaires.";
                bgColor = "bg-red-50 dark:bg-red-900/20";
                borderColor = "border-red-200 dark:border-red-800";
                textColor = "text-red-700 dark:text-red-400";
              } else if (dernierSolde > premierSolde + 100 && budgetRestant >= 0) {
                conseilGeneral = "Votre situation financière s'améliore !";
                bgColor = "bg-green-50 dark:bg-green-900/20";
                borderColor = "border-green-200 dark:border-green-800";
                textColor = "text-green-700 dark:text-green-400";
              } else if (budgetRestant < 200) {
                conseilGeneral = "Votre budget est gérable mais serré. Optimisez vos dépenses.";
                bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
                borderColor = "border-yellow-200 dark:border-yellow-800";
                textColor = "text-yellow-700 dark:text-yellow-400";
              } else {
                conseilGeneral = "Votre budget est bien géré. Continuez à surveiller vos dépenses.";
              }

              return (
                <div className={`${bgColor} ${borderColor} p-3 border rounded-lg`}>
                  <p className={`${textColor}`}>Analyse Globale : {conseilGeneral}</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
