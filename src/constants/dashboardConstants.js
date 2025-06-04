/**
 * @file dashboardConstants.js
 * @description Constantes et configurations globales pour le dashboard
 * Ce fichier contient toutes les constantes utilisées dans le composant Dashboard
 */

// -------------------
// Constantes pour le dashboard
// -------------------

// Liste des noms des mois en français
export const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

// Mois en cours formaté
export const CURRENT_MONTH =
  MONTH_NAMES[new Date().getMonth()] + " " + new Date().getFullYear();

// Valeurs par défaut pour les montants
export const DEFAULT_AMOUNTS = {
  totalRevenus: 0,
  totalDepense: 0,
  totalEconomies: 0,
  totalRevenusJusquaAujourdhui: 0,
  totalDepenseJusquaAujourdhui: 0,
  totalEconomiesJusquaAujourdhui: 0,
  totalRevenusMoisPrecedent: 0,
  totalDepenseMoisPrecedent: 0,
  totalEconomiesMoisPrecedent: 0,
  differenceEconomiesMoisPrecedent: 0,
  differenceMoisPrecedent: 0,
  differenceRevenusMoisPrecedent: 0,
  budgetPrevisionnel: 0,
};
