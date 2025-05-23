import {
  DEPENSE_REVENU_CATEGORIES,
  getMonthYear as getFormattedMonthYear,
} from "./categoryUtils";

/**
 * Formate une date au format français
 * @param {string} dateStr - Date au format ISO
 * @returns {string} - Date formatée (DD/MM/YYYY)
 */
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Formate une date pour afficher le mois et l'année
 * @param {Date} date - Objet Date
 * @returns {string} - Mois et année formatés
 */
export const getMonthYear = (date) => {
  return getFormattedMonthYear(date);
};

/**
 * Liste des catégories par défaut - Utilise maintenant les catégories centralisées
 */
export const DEFAULT_CATEGORIES = DEPENSE_REVENU_CATEGORIES;

/**
 * Récupère toutes les dépenses
 * @returns {Promise<Array>} - Tableau des dépenses
 */
export const getAllDepenses = async () => {
  try {
    const depenseSnap = await getDocs(
      query(collection(db, "depense"), orderBy("date", "desc"))
    );
    return depenseSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      icon: "€",
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses:", error);
    throw error;
  }
};

/**
 * Récupère tous les revenus
 * @returns {Promise<Array>} - Tableau des revenus
 */
export const getAllRevenus = async () => {
  try {
    const revenuSnap = await getDocs(
      query(collection(db, "revenu"), orderBy("date", "desc"))
    );
    return revenuSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      icon: "€",
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des revenus:", error);
    throw error;
  }
};

/**
 * Filtre les dépenses et revenus par mois et année
 * @param {Array} depenseRevenu - Tableau de dépenses et revenus
 * @param {Date} selectedDate - Date sélectionnée
 * @returns {Array} - Dépenses et revenus filtrés
 */
export const filterDepenseRevenuByMonth = (depenseRevenu, selectedDate) => {
  return depenseRevenu.filter(
    (t) =>
      new Date(t.date).getMonth() === selectedDate.getMonth() &&
      new Date(t.date).getFullYear() === selectedDate.getFullYear()
  );
};

/**
 * Calcule le total des dépenses et revenus
 * @param {Array} depenseRevenu - Tableau de dépenses et revenus
 * @param {boolean} isDepense - Si true, calcule le montant en valeur absolue
 * @returns {number} - Total des dépenses et revenus
 */
export const calculateDepenseRevenuTotal = (
  depenseRevenu,
  isDepense = false
) => {
  return depenseRevenu.reduce(
    (acc, t) => acc + (isDepense ? Math.abs(t.montant || 0) : t.montant || 0),
    0
  );
};

/**
 * Valide une dépense ou un revenu
 * @param {Object} depenseRevenu - Dépense ou revenu à valider
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export const validateDepenseRevenu = (depenseRevenu) => {
  const errors = [];

  if (!depenseRevenu.nom || depenseRevenu.nom.trim() === "") {
    errors.push("Le nom est requis");
  }

  if (!depenseRevenu.categorie || depenseRevenu.categorie.trim() === "") {
    errors.push("La catégorie est requise");
  }

  const montant = parseFloat(depenseRevenu.montant);
  if (isNaN(montant) || montant === 0) {
    errors.push("Le montant doit être un nombre non nul");
  }

  if (!depenseRevenu.date) {
    errors.push("La date est requise");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Ajoute ou modifie une dépense
 * @param {Object} depense - Données de la dépense
 * @returns {Promise<string|void>} - ID du document créé (si ajout)
 */
export const addOrUpdateDepense = async (depense) => {
  const { isValid, errors } = validateDepenseRevenu(depense);

  if (!isValid) {
    console.error("Validation failed:", errors);
    throw new Error(errors.join(", "));
  }

  const montant = parseFloat(depense.montant);
  const operation = depense.id ? "update" : "add";

  // Préparer les données pour la base de données
  const depenseData = {
    nom: depense.nom.trim(),
    montant: -Math.abs(montant),
    date: depense.date || new Date().toISOString().split("T")[0],
    categorie: depense.categorie.trim(),
  };

  return handleItemOperation(operation, "depense", depenseData, depense.id);
};

/**
 * Ajoute ou modifie un revenu
 * @param {Object} revenu - Données du revenu
 * @returns {Promise<string|void>} - ID du document créé (si ajout)
 */
export const addOrUpdateRevenu = async (revenu) => {
  const { isValid, errors } = validateDepenseRevenu(revenu);

  if (!isValid) {
    console.error("Validation failed:", errors);
    throw new Error(errors.join(", "));
  }

  const montant = parseFloat(revenu.montant);
  const operation = revenu.id ? "update" : "add";

  // Préparer les données pour la base de données
  const revenuData = {
    nom: revenu.nom.trim(),
    montant: montant,
    date: revenu.date || new Date().toISOString().split("T")[0],
    categorie: revenu.categorie.trim(),
  };

  return handleItemOperation(operation, "revenu", revenuData, revenu.id);
};

/**
 * Supprime une dépense ou un revenu
 * @param {Object} depenseRevenu - Dépense ou revenu à supprimer
 * @returns {Promise<void>}
 */
export const deleteDepenseRevenu = async (depenseRevenu) => {
  if (!depenseRevenu || !depenseRevenu.id) {
    throw new Error("ID est requis pour la suppression");
  }

  const collectionName = depenseRevenu.montant >= 0 ? "revenu" : "depense";

  return handleItemOperation(
    "delete",
    collectionName,
    depenseRevenu,
    depenseRevenu.id
  );
};
