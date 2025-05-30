/**
 * Fichier de gestion centralisée des catégories pour l'application de budget
 */
import CATEGORY_PALETTE from "./categoryPalette";

/**
 * Catégories standardisées pour l'application
 */
export const CATEGORIES = [
  "Logement", // Loyer, crédit immobilier, eau, électricité, équipements maison
  "Transports", // Essence, assurance auto, crédit auto
  "Alimentation", // Courses, restaurants
  "Santé", // Médicaments, mutuelle
  "Education", // Scolarité, formations
  "Loisirs", // Cinéma, sorties, abonnements
  "Shopping", // Vêtements, achats divers, crédit conso, équipements persos
  "Assurances", // Maison, santé, véhicule
  "Revenus", // Salaire, freelance, ventes
  "Investissements", // Actions, intérêts
  "Allocations", // CAF, aides, retraite
  "Voyages", // Vacances, déplacements
  "Autres", // Non catégorisé
];

/**
 * Catégories pour les dépenses et revenus (toutes les catégories)
 */
export const DEPENSES_CATEGORIES = CATEGORIES;
export const REVENUS_CATEGORIES = CATEGORIES;

/**
 * Liste des mois
 */
export const MONTHS = [
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

/**
 * Formate une date avec le mois et l'année
 * @param {Date} date - Date à formater
 * @returns {string} - Format "Mois Année"
 */
export const getMonthYear = (date) => {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Retourne l'icône recommandée pour une catégorie
 * @param {string} category - Nom de la catégorie
 * @returns {string} - Nom de l'icône recommandée
 */
export const getCategoryIcon = (category) => {
  const icons = {
    Logement: "home",
    Transports: "car",
    Alimentation: "shopping-cart",
    Santé: "heart",
    Education: "book",
    Loisirs: "film",
    Shopping: "shopping-bag",
    Assurances: "shield",
    Revenus: "dollar-sign",
    Investissements: "trending-up",
    Allocations: "gift",
    Voyages: "map",
    Autres: "circle",
  };

  return icons[category] || "circle";
};

/**
 * Retourne la couleur associée à une catégorie
 * @param {string} category - Nom de la catégorie
 * @returns {string} - Code couleur hexadécimal
 */
export const getCategoryColor = (category) => {
  return CATEGORY_PALETTE[category] || CATEGORY_PALETTE["Autres"];
};

// Exporter la palette de couleurs
export const CATEGORY_COLORS = CATEGORY_PALETTE;
