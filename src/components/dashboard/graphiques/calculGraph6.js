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
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculDepensesEchelonneesJusquaAujourdhui,
  calculRevenusClassiquesJusquaAujourdhui,
  calculRevenusRecurrentsJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui,
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
  paiementsEchelonnes,
  isPrevisionnel = true
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

    // Ajout du log pour le mois précédent
    if (i === 1) {
      // Mois précédent
      const dateMoisPrecedent = new Date(annee, mois + 1, 0);
      const totalDepensesClassiques = calculDepensesClassiquesTotal(
        depenseRevenu,
        dateMoisPrecedent
      );
      const totalDepensesRecurrents = calculDepensesRecurrentesTotal(
        paiementsRecurrents,
        dateMoisPrecedent
      );
      const totalDepensesEchelonnees = calculDepensesEchelonneesTotal(
        paiementsEchelonnes,
        dateMoisPrecedent
      );
      const totalRevenusClassiques = calculRevenusClassiquesTotal(
        depenseRevenu,
        dateMoisPrecedent
      );
      const totalRevenusRecurrents = calculRevenusRecurrentsTotal(
        paiementsRecurrents,
        dateMoisPrecedent
      );
      const totalRevenusEchelonnes = calculRevenusEchelonnesTotal(
        paiementsEchelonnes,
        dateMoisPrecedent
      );
      console.log("[GRAPHIQUE][MOIS PRECEDENT]", moisLabel, {
        totalDepensesClassiques,
        totalDepensesRecurrents,
        totalDepensesEchelonnees,
        totalRevenusClassiques,
        totalRevenusRecurrents,
        totalRevenusEchelonnes,
        totalDepenses:
          totalDepensesClassiques +
          totalDepensesRecurrents +
          totalDepensesEchelonnees,
        totalRevenus:
          totalRevenusClassiques +
          totalRevenusRecurrents +
          totalRevenusEchelonnes,
      });
    }

    if (isCurrentMonth) {
      if (isPrevisionnel) {
        // PRÉVISIONNEL pour le mois courant
        const dernierJour = new Date(annee, mois + 1, 0);
        const totalDepensesClassiques = calculDepensesClassiquesTotal(
          depenseRevenu,
          dernierJour
        );
        const totalDepensesRecurrents = calculDepensesRecurrentesTotal(
          paiementsRecurrents,
          dernierJour
        );
        const totalDepensesEchelonnees = calculRevenusEchelonnesTotal(
          paiementsEchelonnes,
          dernierJour
        );
        depenses =
          totalDepensesClassiques +
          totalDepensesRecurrents +
          totalDepensesEchelonnees;
        const totalRevenusClassiques = calculRevenusClassiquesTotal(
          depenseRevenu,
          dernierJour
        );
        const totalRevenusRecurrents = calculRevenusRecurrentsTotal(
          paiementsRecurrents,
          dernierJour
        );
        const totalRevenusEchelonnes = calculDepensesEchelonneesTotal(
          paiementsEchelonnes,
          dernierJour
        );
        revenus =
          totalRevenusClassiques +
          totalRevenusRecurrents +
          totalRevenusEchelonnes;

        console.log("[GRAPHIQUE][MOIS COURANT][PRÉVISIONNEL]", moisLabel, {
          totalDepensesClassiques,
          totalDepensesRecurrents,
          totalDepensesEchelonnees,
          totalRevenusClassiques,
          totalRevenusRecurrents,
          totalRevenusEchelonnes,
          totalDepenses: depenses,
          totalRevenus: revenus,
        });
      } else {
        // RÉALISÉ pour le mois courant (jusqu'à aujourd'hui)
        const aujourdHui = now;
        const totalDepensesClassiques =
          calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, aujourdHui);
        const totalDepensesRecurrents =
          calculDepensesRecurrentesJusquaAujourdhui(
            paiementsRecurrents,
            aujourdHui
          );
        const totalDepensesEchelonnees =
          calculRevenusEchelonnesJusquaAujourdhui(
            paiementsEchelonnes,
            aujourdHui
          );
        depenses =
          totalDepensesClassiques +
          totalDepensesRecurrents +
          totalDepensesEchelonnees;
        const totalRevenusClassiques = calculRevenusClassiquesJusquaAujourdhui(
          depenseRevenu,
          aujourdHui
        );
        const totalRevenusRecurrents = calculRevenusRecurrentsJusquaAujourdhui(
          paiementsRecurrents,
          aujourdHui
        );
        const totalRevenusEchelonnes =
          calculDepensesEchelonneesJusquaAujourdhui(
            paiementsEchelonnes,
            aujourdHui
          );
        revenus =
          totalRevenusClassiques +
          totalRevenusRecurrents +
          totalRevenusEchelonnes;

        console.log("[GRAPHIQUE][MOIS COURANT][RÉALISÉ]", moisLabel, {
          totalDepensesClassiques,
          totalDepensesRecurrents,
          totalDepensesEchelonnees,
          totalRevenusClassiques,
          totalRevenusRecurrents,
          totalRevenusEchelonnes,
          totalDepenses: depenses,
          totalRevenus: revenus,
        });
      }
    } else {
      // RÉEL pour les autres mois (utilise les mêmes fonctions que les encadrés)
      const dateMois = new Date(annee, mois + 1, 0);
      const totalDepensesClassiques = calculDepensesClassiquesTotal(
        depenseRevenu,
        dateMois
      );
      const totalDepensesRecurrents = calculDepensesRecurrentesTotal(
        paiementsRecurrents,
        dateMois
      );
      const totalDepensesEchelonnees = calculRevenusEchelonnesTotal(
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
      const totalRevenusEchelonnes = calculDepensesEchelonneesTotal(
        paiementsEchelonnes,
        dateMois
      );
      revenus =
        totalRevenusClassiques +
        totalRevenusRecurrents +
        totalRevenusEchelonnes;

      console.log("[GRAPHIQUE][MOIS PASSÉ]", moisLabel, {
        totalDepensesClassiques,
        totalDepensesRecurrents,
        totalDepensesEchelonnees,
        totalRevenusClassiques,
        totalRevenusRecurrents,
        totalRevenusEchelonnes,
        totalDepenses: depenses,
        totalRevenus: revenus,
      });
    }
    result.push({ mois: moisLabel, depenses, revenus, details });
  }
  return result;
}
