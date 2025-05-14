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
  "Employé", // Pour les revenus d'emploi
  "Travail", // Pour les revenus liés au travail non salarié
  "Aide", // Pour les aides et subventions
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
