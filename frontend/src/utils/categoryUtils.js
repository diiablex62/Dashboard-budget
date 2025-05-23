/**
 * Fichier de gestion centralisée des catégories pour l'application de budget
 */

// Fonction auxiliaire pour éliminer les doublons d'un tableau
const uniqueArray = (array) => [...new Set(array)];

/**
 * Catégories pour les dépenses
 * Organisées par fréquence d'utilisation
 */
export const DEPENSES_CATEGORIES = [
  "Alimentation",
  "Transport",
  "Logement",
  "Santé",
  "Loisirs",
  "Shopping",
  "Factures",
  "Éducation",
  "Voyages",
  "Autres",
];

/**
 * Catégories pour les revenus
 * Organisées par fréquence d'utilisation
 */
export const REVENUS_CATEGORIES = [
  "Salaire",
  "Freelance",
  "Investissements",
  "Ventes",
  "Prestations",
  "Allocations",
  "Autres",
];

/**
 * Catégories pour les paiements récurrents
 * Mises en avant pour correspondre aux usages typiques (loyers, abonnements)
 */
export const RECURRENT_CATEGORIES = [
  "Loyer",
  "Électricité",
  "Eau",
  "Internet",
  "Téléphone",
  "Assurance",
  "Abonnements",
  "Autres",
];

/**
 * Catégories pour les paiements échelonnés
 * Adaptées aux crédits et achats importants en plusieurs fois
 */
export const ECHELONNE_CATEGORIES = [
  "Crédit immobilier",
  "Crédit auto",
  "Crédit conso",
  "Équipement",
  "Voyage",
  "Formation",
  "Autres",
];

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
 * Catégories globales pour toutes les dépenses et revenus
 */
export const DEPENSE_REVENU_CATEGORIES = uniqueArray([
  ...DEPENSES_CATEGORIES,
  ...REVENUS_CATEGORIES,
]);

/**
 * Récupère les catégories adaptées au type de dépense & revenu
 * @param {string} type - Type ('depenseRevenu', 'recurrent', ou 'echelonne')
 * @returns {Array} - Liste des catégories appropriées
 */
export const getCategoriesByType = (type) => {
  switch (type) {
    case "depenseRevenu":
      return DEPENSES_CATEGORIES.concat(REVENUS_CATEGORIES);
    case "recurrent":
      return RECURRENT_CATEGORIES;
    case "echelonne":
      return ECHELONNE_CATEGORIES;
    default:
      return DEPENSES_CATEGORIES.concat(REVENUS_CATEGORIES);
  }
};

/**
 * Retourne le mois en toutes lettres
 * @param {number} monthIndex - Index du mois (0-11)
 * @returns {string} - Nom du mois
 */
export const getMonthName = (monthIndex) => {
  return MONTHS[monthIndex];
};

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
    Alimentation: "shopping-cart",
    Transport: "car",
    Factures: "file-text",
    Prêt: "credit-card",
    Véhicule: "truck",
    Abonnements: "tv",
    Santé: "heart",
    Loisirs: "film",
    Shopping: "shopping-bag",
    Électronique: "smartphone",
    Électroménager: "coffee",
    Mobilier: "layout",
    Travaux: "tool",
    Voyage: "map",
    Éducation: "book",
    Assurance: "shield",
    Épargne: "piggy-bank",
    Salaire: "dollar-sign",
    Employé: "briefcase",
    Travail: "tool",
    Aide: "gift",
  };

  return icons[category] || "circle"; // icône par défaut
};

/**
 * Retourne la couleur associée à une catégorie
 * @param {string} category - Nom de la catégorie
 * @returns {string} - Code couleur hexadécimal
 */
export const getCategoryColor = (category) => {
  const colors = {
    // Revenus
    Salaire: "#4ade80", // vert clair
    Prime: "#22c55e", // vert
    Travail: "#34d399", // vert émeraude
    Employé: "#10b981", // vert teal
    Freelance: "#16a34a", // vert foncé
    Investissement: "#15803d", // vert très foncé
    Épargne: "#22c55e", // vert
    Aide: "#84cc16", // lime vert

    // Dépenses
    Logement: "#f87171", // rouge clair
    Alimentation: "#ef4444", // rouge
    Courses: "#ef4444", // rouge
    Restaurant: "#dc2626", // rouge foncé
    Transport: "#b91c1c", // rouge très foncé
    Factures: "#f59e0b", // orange
    Santé: "#818cf8", // bleu-violet
    Loisirs: "#6366f1", // indigo
    Shopping: "#d946ef", // rose
    Assurance: "#f97316", // orange foncé
    Abonnements: "#8b5cf6", // violet
    Électronique: "#3b82f6", // bleu
    Électroménager: "#0ea5e9", // bleu ciel
    Mobilier: "#14b8a6", // turquoise
    Travaux: "#f59e0b", // orange
    Voyage: "#8b5cf6", // violet
    Véhicule: "#dc2626", // rouge foncé
    Prêt: "#f97316", // orange foncé
    Éducation: "#3b82f6", // bleu

    // Par défaut
    Autre: "#94a3b8", // gris
  };

  return colors[category] || colors["Autre"]; // couleur par défaut si la catégorie n'est pas définie
};

// Palette de couleurs pour les catégories
export const CATEGORY_COLORS = {
  // Dépenses
  Alimentation: "#FF6B6B",
  Transport: "#4ECDC4",
  Logement: "#45B7D1",
  Santé: "#96CEB4",
  Loisirs: "#FFEEAD",
  Shopping: "#D4A5A5",
  Factures: "#9B59B6",
  Éducation: "#3498DB",
  Voyages: "#E67E22",
  Autres: "#95A5A6",

  // Revenus
  Salaire: "#2ECC71",
  Freelance: "#F1C40F",
  Investissements: "#1ABC9C",
  Ventes: "#E74C3C",
  Prestations: "#9B59B6",
  Allocations: "#3498DB",

  // Paiements récurrents
  Loyer: "#E74C3C",
  Électricité: "#F1C40F",
  Eau: "#3498DB",
  Internet: "#2ECC71",
  Téléphone: "#9B59B6",
  Assurance: "#1ABC9C",
  Abonnements: "#E67E22",

  // Paiements échelonnés
  "Crédit immobilier": "#E74C3C",
  "Crédit auto": "#3498DB",
  "Crédit conso": "#2ECC71",
  Équipement: "#F1C40F",
  Voyage: "#1ABC9C",
  Formation: "#9B59B6",
};
