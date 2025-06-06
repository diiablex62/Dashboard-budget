// =============================
// calculSynchro.js
// Fonctions utilitaires pour calculer les totaux réels (jusqu'à aujourd'hui)
// Utilisé pour la synchronisation (modal, texte, etc.)
// =============================

import {
  calculRevenusClassiquesJusquaAujourdhui,
  calculRevenusRecurrentsJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui,
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculDepensesEchelonneesJusquaAujourdhui,
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
    (calculRevenusEchelonnesJusquaAujourdhui(paiementsEchelonnes, new Date()) ||
      0)
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
    (calculDepensesEchelonneesJusquaAujourdhui(
      paiementsEchelonnes,
      new Date()
    ) || 0)
  );
}
