/**
 * Ce fichier contient les fonctions de calcul pour le graphique prévisionnel
 * Il est utilisé dans src/pages/Previsionnel.jsx pour générer les données du graphique
 */

import { addMonths, differenceInMonths } from "date-fns";
import {
  calculRevenusClassiquesTotal as calculRevenusClassiquesTotalPrevisionnel,
  calculRevenusRecurrentsTotal as calculRevenusRecurrentsTotalPrevisionnel,
  calculRevenusEchelonnesTotal as calculRevenusEchelonnesTotalPrevisionnel,
  calculDepensesClassiquesTotal as calculDepensesClassiquesTotalPrevisionnel,
  calculDepensesRecurrentesTotal as calculDepensesRecurrentesTotalPrevisionnel,
  calculDepensesEchelonneesTotal as calculDepensesEchelonneesTotalPrevisionnel,
} from "./calculPrevisionnel";

/**
 * Génère les données prévisionnelles pour le graphique
 * @param {Object} data - Les données nécessaires pour les calculs
 * @param {Array} data.depenseRevenu - Liste des dépenses et revenus classiques
 * @param {Array} data.paiementsRecurrents - Liste des paiements récurrents
 * @param {Array} data.paiementsEchelonnes - Liste des paiements échelonnés
 * @param {Date} data.now - Date de référence pour les calculs
 * @param {Array} data.moisLabels - Liste des noms des mois
 * @param {number} data.nbMois - Nombre de mois à calculer
 * @returns {Array} Données prévisionnelles pour le graphique
 */
export function genererDonneesPrevisionnelles({
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes,
  now,
  moisLabels,
  nbMois,
}) {
  // Collecter toutes les dates de toutes les sources
  const dates = [
    // Dates des transactions classiques
    ...depenseRevenu.map((t) => new Date(t.date)),
    // Dates de début des paiements échelonnés
    ...paiementsEchelonnes.map((t) => new Date(t.debutDate)),
  ];

  // Trouver la date la plus ancienne
  const premierMois = dates.reduce((premier, date) => {
    if (!premier || date < premier) {
      return date;
    }
    return premier;
  }, null);

  // Calculer le solde cumulé jusqu'au mois actuel (now)
  let soldeCumule = 0;
  if (premierMois) {
    const monthsToCalculate = differenceInMonths(now, premierMois);
    for (let i = 0; i < monthsToCalculate; i++) {
      const dateMois = addMonths(premierMois, i);

      const { revenus, depenses } = calculateMonthlyTotals(
        dateMois,
        depenseRevenu,
        paiementsRecurrents,
        paiementsEchelonnes
      );

      soldeCumule += revenus - depenses;
    }
  }

  // Calculer les données pour chaque mois à partir du mois actuel
  const donneesMensuelles = Array.from({ length: nbMois }).map((_, i) => {
    const dateMois = addMonths(now, i);
    const mois = moisLabels[dateMois.getMonth()];

    const { revenus, depenses } = calculateMonthlyTotals(
      dateMois,
      depenseRevenu,
      paiementsRecurrents,
      paiementsEchelonnes
    );

    // Calculer le solde du mois
    const soldeMois = revenus - depenses;
    // Ajouter au solde cumulé
    soldeCumule += soldeMois;

    return {
      mois,
      revenus,
      depenses,
      solde: soldeCumule, // Utiliser le solde cumulé pour le graphique
    };
  });

  return donneesMensuelles;
}

/**
 * Calcule les totaux de revenus et de dépenses pour un mois donné.
 * @param {Date} dateMois - La date du mois pour lequel calculer les totaux.
 * @param {Array} depenseRevenu - Liste des dépenses et revenus classiques.
 * @param {Array} paiementsRecurrents - Liste des paiements récurrents.
 * @param {Array} paiementsEchelonnes - Liste des paiements échelonnés.
 * @returns {{revenus: number, depenses: number}} Les totaux des revenus et dépenses.
 */
const calculateMonthlyTotals = (
  dateMois,
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes
) => {
  const revenusClassiques = calculRevenusClassiquesTotalPrevisionnel(
    depenseRevenu,
    dateMois
  );
  const revenusRecurrents = calculRevenusRecurrentsTotalPrevisionnel(
    paiementsRecurrents,
    dateMois
  );
  const revenusEchelonnes = calculRevenusEchelonnesTotalPrevisionnel(
    paiementsEchelonnes,
    dateMois
  );
  const revenus = revenusClassiques + revenusRecurrents + revenusEchelonnes;

  const depensesClassiques = calculDepensesClassiquesTotalPrevisionnel(
    depenseRevenu,
    dateMois
  );
  const depensesRecurrentes = calculDepensesRecurrentesTotalPrevisionnel(
    paiementsRecurrents,
    dateMois
  );
  const depensesEchelonnees = calculDepensesEchelonneesTotalPrevisionnel(
    paiementsEchelonnes,
    dateMois
  );
  const depenses =
    depensesClassiques + depensesRecurrentes + depensesEchelonnees;

  return { revenus, depenses };
};
