/**
 * @file dashboardConstantes.js
 * @description Constantes utilisées dans le dashboard
 */

export const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const CURRENT_MONTH = MONTH_NAMES[new Date().getMonth()];

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
