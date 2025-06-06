// =============================
// calculSynchro.js
// Fonctions utilitaires pour calculer les totaux réels (jusqu'à aujourd'hui)
// Utilisé pour la synchronisation (modal, texte, etc.)
// ATTENTION : Suite à une inversion demandée, les paiements échelonnés sont traités différemment :
// - Les paiements de type "debit" sont considérés comme des revenus échelonnés
// - Les paiements de type "credit" sont considérés comme des dépenses échelonnées
// =============================

import {
  calculRevenusClassiquesJusquaAujourdhui,
  calculRevenusRecurrentsJusquaAujourdhui,
  calculDepensesEchelonneesJusquaAujourdhui, // Inversé : utilise les dépenses échelonnées pour les revenus
  calculRevenusClassiquesTotal,
  calculRevenusRecurrentsTotal,
  calculDepensesEchelonneesTotal, // Inversé : utilise les dépenses échelonnées pour les revenus
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui, // Inversé : utilise les revenus échelonnés pour les dépenses
  calculDepensesClassiquesTotal,
  calculDepensesRecurrentesTotal,
  calculRevenusEchelonnesTotal, // Inversé : utilise les revenus échelonnés pour les dépenses
} from "./calculDashboard";

// Calcule le total des revenus réels jusqu'à aujourd'hui
export function getTotalRevenusJusquaAujourdhui(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes
) {
  return (
    (calculRevenusClassiquesJusquaAujourdhui(depenseRevenu, new Date()) || 0) +
    (calculRevenusRecurrentsJusquaAujourdhui(paiementsRecurrents, new Date()) ||
      0) +
    (calculDepensesEchelonneesJusquaAujourdhui(
      paiementsEchelonnes,
      new Date()
    ) || 0)
  );
}

// Calcule le total des dépenses réelles jusqu'à aujourd'hui
export function getTotalDepenseJusquaAujourdhui(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes
) {
  return (
    (calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, new Date()) || 0) +
    (calculDepensesRecurrentesJusquaAujourdhui(
      paiementsRecurrents,
      new Date()
    ) || 0) +
    (calculRevenusEchelonnesJusquaAujourdhui(paiementsEchelonnes, new Date()) ||
      0)
  );
}
