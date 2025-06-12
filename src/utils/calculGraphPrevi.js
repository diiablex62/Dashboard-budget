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

// Fonction utilitaire locale pour afficher les logs détaillés de chaque mois (utilisée pour le debug)
function logDetailsMois(
  mois,
  revenusClassiquesList,
  revenusRecurrentsList,
  revenusEchelonnesList,
  revenusClassiques,
  revenusRecurrents,
  revenusEchelonnes,
  revenus
) {
  console.log(`Prévisionnel - Mois: ${mois}`);
  console.log("  Revenus classiques utilisés:");
  revenusClassiquesList.forEach((e) =>
    console.log(`    - ${e.nom} | ${e.montant}€ | ${e.date}`)
  );
  console.log("  Revenus récurrents utilisés:");
  revenusRecurrentsList.forEach((e) =>
    console.log(`    - ${e.nom} | ${e.montant}€ | jour ${e.jourPrelevement}`)
  );
  console.log("  Revenus échelonnés utilisés:");
  revenusEchelonnesList.forEach((e) =>
    console.log(
      `    - ${e.nom} | ${e.montant}€ sur ${e.mensualites} mois | début ${e.debutDate}`
    )
  );
  console.log(`  Total revenus classiques: ${revenusClassiques}`);
  console.log(`  Total revenus récurrents: ${revenusRecurrents}`);
  console.log(`  Total revenus échelonnés: ${revenusEchelonnes}`);
  console.log(`  Total revenus: ${revenus}`);
}

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

    // Filtrage des entrées utilisées pour chaque type
    const revenusClassiquesList = depenseRevenu.filter(
      (e) =>
        e.type === "revenu" &&
        new Date(e.date).getMonth() === dateMois.getMonth() &&
        new Date(e.date).getFullYear() === dateMois.getFullYear()
    );
    const revenusRecurrentsList = paiementsRecurrents.filter(
      (e) => e.type === "revenu"
    );
    const revenusEchelonnesList = paiementsEchelonnes.filter(
      (e) => e.type === "revenu"
    );

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

    // LOGS DÉTAILLÉS UNIQUEMENT POUR JUIN ET JUILLET
    if (mois === "Juin" || mois === "Juillet") {
      logDetailsMois(
        mois,
        revenusClassiquesList,
        revenusRecurrentsList,
        revenusEchelonnesList,
        revenusClassiques,
        revenusRecurrents,
        revenusEchelonnes,
        revenus
      );
    }

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
