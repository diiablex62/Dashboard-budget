/**
 * Fichier de gestion centralisée des catégories pour l'application de budget
 */

// Fonction auxiliaire pour éliminer les doublons d'un tableau
const uniqueArray = (array) => [...new Set(array)];

/**
 * Catégories pour les dépenses et revenus
 * Organisées par fréquence d'utilisation
 */
export const TRANSACTION_CATEGORIES = uniqueArray([
  "Logement", // Loyer, charges, prêt immobilier
  "Alimentation", // Courses, restaurants
  "Transport", // Essence, transports en commun, entretien véhicule
  "Factures", // Électricité, eau, téléphone, internet
  "Santé", // Frais médicaux, pharmacie
  "Loisirs", // Cinéma, sorties, voyages
  "Shopping", // Vêtements, électronique
  "Salaire", // Pour les revenus
  "Épargne", // Pour les revenus ou transferts
  "Autre",
]);

/**
 * Catégories pour les paiements récurrents
 * Mises en avant pour correspondre aux usages typiques (loyers, abonnements)
 */
export const RECURRENT_CATEGORIES = uniqueArray([
  "Logement", // Loyer, charges
  "Prêt", // Prêt immobilier, prêt étudiant
  "Assurance", // Auto, habitation, santé
  "Abonnements", // TV, streaming, salle de sport
  "Factures", // Électricité, eau, téléphone, internet
  "Transport", // Transports en commun, parking
  "Santé", // Mutuelle
  "Éducation", // Frais de scolarité
  "Épargne", // Versements programmés
  "Autre",
]);

/**
 * Catégories pour les paiements échelonnés
 * Adaptées aux crédits et achats importants en plusieurs fois
 */
export const ECHELONNE_CATEGORIES = uniqueArray([
  "Véhicule", // Crédit auto, moto
  "Immobilier", // Crédit immobilier
  "Électroménager", // Gros achats d'équipement maison
  "Électronique", // Ordinateur, smartphone, TV
  "Mobilier", // Meubles, équipement maison
  "Travaux", // Rénovation, construction
  "Santé", // Soins importants (dentaire, optique)
  "Voyage", // Paiement en plusieurs fois
  "Éducation", // Formation, études
  "Autre",
]);

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
 * Récupère les catégories adaptées au type de transaction
 * @param {string} type - Type de transaction ("transaction", "recurrent", ou "echelonne")
 * @returns {Array} - Liste des catégories appropriées
 */
export const getCategoriesByType = (type) => {
  switch (type) {
    case "transaction":
      return TRANSACTION_CATEGORIES;
    case "recurrent":
      return RECURRENT_CATEGORIES;
    case "echelonne":
      return ECHELONNE_CATEGORIES;
    default:
      return TRANSACTION_CATEGORIES;
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
  };

  return icons[category] || "circle"; // icône par défaut
};
