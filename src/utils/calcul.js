// Fichier central pour les fonctions de calcul du projet
// ------------------------------------------------------

// =====================
// DÉPENSES & REVENUS
// =====================

// total calcul depense par mois : [calculTotalDepensesMois]
export function calculTotalDepensesMois() {
  return 0;
}

// total calcul paiements échelonnés du mois : [calculTotalEchelonnesMois]
export function calculTotalEchelonnesMois() {
  return 0;
}

// total calcul paiements récurrents du mois : [calculTotalRecurrentsMois]
export function calculTotalRecurrentsMois() {
  return 0;
}

// total calcul revenus par mois : [totalRevenusGlobalMois]
export function totalRevenusGlobalMois() {
  return 0;
}

// total calcul économies (revenus - dépenses) : [calculEconomies]
export function calculEconomies() {
  return 0;
}

// =====================
// AGRÉGATIONS & GRAPHIQUES
// =====================

// calcul des dépenses par catégorie : [calculDepensesParCategorie]
export function calculDepensesParCategorie() {
  return [];
}

// calcul des données du bar chart (6 derniers mois) : [calculBarChartData]
export function calculBarChartData() {
  return [];
}

// =====================
// CALCULS JUSQU'À AUJOURD'HUI
// =====================

// Calcul des dépenses classiques jusqu'à aujourd'hui
export function calculDepensesClassiquesJusquaAujourdhui() {
  return 0;
}

// Calcul des dépenses récurrentes jusqu'à aujourd'hui
export function calculDepensesRecurrentesJusquaAujourdhui() {
  return 0;
}

// Calcul des dépenses échelonnées jusqu'à aujourd'hui
export function calculDepensesEchelonneesJusquaAujourdhui() {
  return 0;
}

// Calcul des revenus classiques jusqu'à aujourd'hui
export function calculRevenusClassiquesJusquaAujourdhui() {
  return 0;
}

// Calcul des revenus récurrents jusqu'à aujourd'hui
export function calculRevenusRecurrentsJusquaAujourdhui() {
  return 0;
}

// Calcul des revenus échelonnés jusqu'à aujourd'hui
export function calculRevenusEchelonnesJusquaAujourdhui() {
  return 0;
}

// Calcul du total des revenus jusqu'à aujourd'hui
export function calculTotalRevenusJusquaAujourdhui() {
  return 0;
}

// Calcul du total des dépenses jusqu'à aujourd'hui
export function calculTotalDepensesJusquaAujourdhui() {
  return 0;
}

// Calcul des économies jusqu'à aujourd'hui
export function calculEconomiesJusquaAujourdhui() {
  return 0;
}

// =====================
// CALCULS DU MOIS PRÉCÉDENT
// =====================

// Calcul des dépenses classiques du mois précédent
export function calculDepensesClassiquesMoisPrecedent() {
  return 0;
}

// Calcul des dépenses récurrentes du mois précédent
export function calculDepensesRecurrentesMoisPrecedent() {
  return 0;
}

// Calcul des dépenses échelonnées du mois précédent
export function calculDepensesEchelonneesMoisPrecedent() {
  return 0;
}

// Calcul des revenus classiques du mois précédent
export function calculRevenusClassiquesMoisPrecedent() {
  return 0;
}

// Calcul des revenus récurrents du mois précédent
export function calculRevenusRecurrentsMoisPrecedent() {
  return 0;
}

// Calcul des revenus échelonnés du mois précédent
export function calculRevenusEchelonnesMoisPrecedent() {
  return 0;
}

// total calcul dépenses récurrentes du mois : [calculTotalDepensesRecurrentesMois]
export function calculTotalDepensesRecurrentesMois() {
  return 0;
}

// total calcul revenus récurrents du mois : [calculTotalRevenusRecurrentsMois]
export function calculTotalRevenusRecurrentsMois() {
  return 0;
}

/**
 * Formate un nombre avec 2 chiffres après la virgule
 * @param {number} montant - Le montant à formater
 * @returns {string} Le montant formaté avec 2 chiffres après la virgule
 */
export const formatMontant = (montant) => {
  return montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
