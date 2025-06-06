// =============================
// calculGraph6.js
// Fonctions utilitaires pour le graphique des 6 derniers mois (revenus/dépenses)
// =============================

/**
 * Calcule les totaux revenus et dépenses pour les 6 derniers mois.
 * - Mois courant : prévisionnel (tout ce qui est prévu jusqu'à la fin du mois)
 * - Mois précédents : réel (uniquement ce qui a été effectivement enregistré)
 *
 * @param {Array} depenseRevenu
 * @param {Array} paiementsRecurrents
 * @param {Array} paiementsEchelonnes
 * @returns {Array} [{ mois: 'MM/YYYY', depenses, revenus }]
 */

import {
  calculDepensesClassiquesTotal,
  calculDepensesRecurrentesTotal,
  calculDepensesEchelonneesTotal,
  calculRevenusClassiquesTotal,
  calculRevenusRecurrentsTotal,
  calculRevenusEchelonnesTotal,
} from "../calculDashboard";

// Retourne true si le paiement (récurrent ou échelonné) est actif pour le mois/année donnés
function isPaiementActifCeMois(paiement, mois, annee) {
  const debut = paiement.debut ? new Date(paiement.debut) : null;
  const fin = paiement.fin ? new Date(paiement.fin) : null;
  const dateDebut = debut || new Date(2000, 0, 1);
  const dateFin = fin || new Date(2100, 0, 1);
  const dateCourante = new Date(annee, mois, 1);
  return (
    dateCourante >=
      new Date(dateDebut.getFullYear(), dateDebut.getMonth(), 1) &&
    dateCourante <= new Date(dateFin.getFullYear(), dateFin.getMonth(), 1)
  );
}

// Retourne la mensualité pour un paiement échelonné/crédit pour un mois donné
function getMensualiteEchelonnee(paiement, mois, annee) {
  if (!paiement.mensualites || !paiement.debutDate) return 0;
  const debut = new Date(paiement.debutDate);
  const idxMois =
    (annee - debut.getFullYear()) * 12 + (mois - debut.getMonth());
  if (idxMois < 0 || idxMois >= Number(paiement.mensualites)) return 0;
  return Number(paiement.montant) / Number(paiement.mensualites);
}

export function getCourbeRevenusDepenses6Mois(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes
) {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mois = date.getMonth();
    const annee = date.getFullYear();
    const moisLabel = (mois + 1).toString().padStart(2, "0") + "/" + annee;
    const isCurrentMonth =
      mois === now.getMonth() && annee === now.getFullYear();

    let depenses = 0;
    let revenus = 0;
    const details = {
      depenses: { classiques: [], recurrents: [], echelonnes: [] },
      revenus: { classiques: [], recurrents: [], echelonnes: [] },
    };

    if (isCurrentMonth) {
      // PRÉVISIONNEL pour le mois courant
      details.depenses.classiques = depenseRevenu.filter(
        (d) => d.type === "depense"
      );
      details.depenses.recurrents = paiementsRecurrents.filter(
        (d) => d.type === "depense"
      );
      details.depenses.echelonnes = paiementsEchelonnes.filter(
        (d) => d.type === "depense" || d.type === "credit"
      );
      details.depenses.totalClassiques = details.depenses.classiques.reduce(
        (acc, d) => acc + Number(d.montant),
        0
      );
      details.depenses.totalRecurrents = details.depenses.recurrents.reduce(
        (acc, d) => acc + Number(d.montant),
        0
      );
      details.depenses.totalEchelonnes = details.depenses.echelonnes.reduce(
        (acc, d) => acc + Number(d.montant),
        0
      );
      depenses =
        details.depenses.totalClassiques +
        details.depenses.totalRecurrents +
        details.depenses.totalEchelonnes;
      details.revenus.classiques = depenseRevenu.filter(
        (d) => d.type === "revenu"
      );
      details.revenus.recurrents = paiementsRecurrents.filter(
        (d) => d.type === "revenu"
      );
      details.revenus.echelonnes = paiementsEchelonnes.filter(
        (d) => d.type === "revenu"
      );
      details.revenus.totalClassiques = details.revenus.classiques.reduce(
        (acc, d) => acc + Number(d.montant),
        0
      );
      details.revenus.totalRecurrents = details.revenus.recurrents.reduce(
        (acc, d) => acc + Number(d.montant),
        0
      );
      details.revenus.totalEchelonnes = details.revenus.echelonnes.reduce(
        (acc, d) => acc + Number(d.montant),
        0
      );
      revenus =
        details.revenus.totalClassiques +
        details.revenus.totalRecurrents +
        details.revenus.totalEchelonnes;
      console.log(`[GRAPH] Mois courant (${moisLabel}) - Détail calcul :`);
      console.log("  Dépenses classiques:", details.depenses.classiques);
      console.log("  Dépenses récurrentes:", details.depenses.recurrents);
      console.log("  Dépenses échelonnées:", details.depenses.echelonnes);
      console.log("  Total Dépenses:", depenses);
      console.log("  Revenus classiques:", details.revenus.classiques);
      console.log("  Revenus récurrents:", details.revenus.recurrents);
      console.log("  Revenus échelonnés:", details.revenus.echelonnes);
      console.log("  Total Revenus:", revenus);
    } else {
      // RÉEL pour les autres mois (utilise les mêmes fonctions que les encadrés)
      const dateMois = new Date(annee, mois, 1);
      const totalDepensesClassiques = calculDepensesClassiquesTotal(
        depenseRevenu,
        dateMois
      );
      const totalDepensesRecurrents = calculDepensesRecurrentesTotal(
        paiementsRecurrents,
        dateMois
      );
      const totalDepensesEchelonnees = calculDepensesEchelonneesTotal(
        paiementsEchelonnes,
        dateMois
      );
      depenses =
        totalDepensesClassiques +
        totalDepensesRecurrents +
        totalDepensesEchelonnees;
      const totalRevenusClassiques = calculRevenusClassiquesTotal(
        depenseRevenu,
        dateMois
      );
      const totalRevenusRecurrents = calculRevenusRecurrentsTotal(
        paiementsRecurrents,
        dateMois
      );
      const totalRevenusEchelonnes = calculRevenusEchelonnesTotal(
        paiementsEchelonnes,
        dateMois
      );
      revenus =
        totalRevenusClassiques +
        totalRevenusRecurrents +
        totalRevenusEchelonnes;
      console.log(`[GRAPH] Mois ${moisLabel} - Détail calcul :`);
      console.log("  Dépenses classiques:", totalDepensesClassiques);
      console.log("  Dépenses récurrentes:", totalDepensesRecurrents);
      console.log("  Dépenses échelonnées:", totalDepensesEchelonnees);
      console.log("  Total Dépenses:", depenses);
      console.log("  Revenus classiques:", totalRevenusClassiques);
      console.log("  Revenus récurrents:", totalRevenusRecurrents);
      console.log("  Revenus échelonnés:", totalRevenusEchelonnes);
      console.log("  Total Revenus:", revenus);
    }
    result.push({ mois: moisLabel, depenses, revenus, details });
  }
  return result;
}
