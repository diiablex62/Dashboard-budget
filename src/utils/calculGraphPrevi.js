/**
 * Ce fichier contient les fonctions de calcul pour le graphique prévisionnel
 * Il est utilisé dans src/pages/Previsionnel.jsx pour générer les données du graphique
 */

import { addMonths } from "date-fns";
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
  let soldeCumul = 0;

  return Array.from({ length: nbMois }).map((_, i) => {
    const dateMois = addMonths(now, i);
    const mois = moisLabels[dateMois.getMonth()];

    // --- Calcul des revenus pour le mois courant ---
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

    // --- Calcul des dépenses pour le mois courant ---
    const depensesClassiques = calculDepensesClassiquesTotalPrevisionnel(
      depenseRevenu,
      dateMois
    );
    const depensesRecurrents = calculDepensesRecurrentesTotalPrevisionnel(
      paiementsRecurrents,
      dateMois
    );
    const depensesEchelonnees = calculDepensesEchelonneesTotalPrevisionnel(
      paiementsEchelonnes,
      dateMois
    );
    const depenses =
      depensesClassiques + depensesRecurrents + depensesEchelonnees;

    // --- Calcul du solde cumulé ---
    soldeCumul += revenus - depenses;

    return {
      mois,
      revenus,
      depenses,
      solde: soldeCumul,
    };
  });
}
