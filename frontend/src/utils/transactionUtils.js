import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { handleItemOperation } from "./firebaseUtils";
import {
  TRANSACTION_CATEGORIES,
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
export const DEFAULT_CATEGORIES = TRANSACTION_CATEGORIES;

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
 * Filtre les transactions par mois et année
 * @param {Array} transactions - Tableau de transactions
 * @param {Date} selectedDate - Date sélectionnée
 * @returns {Array} - Transactions filtrées
 */
export const filterTransactionsByMonth = (transactions, selectedDate) => {
  return transactions.filter(
    (t) =>
      new Date(t.date).getMonth() === selectedDate.getMonth() &&
      new Date(t.date).getFullYear() === selectedDate.getFullYear()
  );
};

/**
 * Calcule le total des transactions
 * @param {Array} transactions - Tableau de transactions
 * @param {boolean} isDepense - Si true, calcule le montant en valeur absolue
 * @returns {number} - Total des transactions
 */
export const calculateTransactionsTotal = (transactions, isDepense = false) => {
  return transactions.reduce(
    (acc, t) => acc + (isDepense ? Math.abs(t.montant || 0) : t.montant || 0),
    0
  );
};

/**
 * Valide une transaction (revenu ou dépense)
 * @param {Object} transaction - Transaction à valider
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export const validateTransaction = (transaction) => {
  const errors = [];

  if (!transaction.nom || transaction.nom.trim() === "") {
    errors.push("Le nom est requis");
  }

  if (!transaction.categorie || transaction.categorie.trim() === "") {
    errors.push("La catégorie est requise");
  }

  const montant = parseFloat(transaction.montant);
  if (isNaN(montant) || montant === 0) {
    errors.push("Le montant doit être un nombre non nul");
  }

  if (!transaction.date) {
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
  const { isValid, errors } = validateTransaction(depense);

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
  const { isValid, errors } = validateTransaction(revenu);

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
 * Supprime une transaction (revenu ou dépense)
 * @param {Object} transaction - Transaction à supprimer
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (transaction) => {
  if (!transaction || !transaction.id) {
    throw new Error("Transaction ID est requis pour la suppression");
  }

  const collectionName = transaction.montant >= 0 ? "revenu" : "depense";

  return handleItemOperation(
    "delete",
    collectionName,
    transaction,
    transaction.id
  );
};

/**
 * Calcule le total des dépenses mensuelles en combinant toutes les sources
 * @param {Date} date - Date pour laquelle calculer le total (par défaut le mois courant)
 * @returns {Promise<Object>} - Objet contenant les détails des dépenses mensuelles
 */
export const calculateMonthlyTotalExpenses = async (date = new Date()) => {
  try {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Définir les limites du mois
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Récupérer toutes les données des dépenses et paiements récurrents
    const [depensesSnap, recurrentsSnap] = await Promise.all([
      getDocs(collection(db, "depense")),
      getDocs(collection(db, "recurrent")),
    ]);

    // Récupérer les paiements échelonnés avec gestion des erreurs
    let echelonnesSnap;
    try {
      echelonnesSnap = await getDocs(collection(db, "echelonne"));
      console.log(
        "Utilisation de la collection 'echelonne' pour les paiements échelonnés"
      );
    } catch (echelonneError) {
      console.error("Erreur avec collection 'echelonne':", echelonneError);
      // Si la collection échoue, créer un snapshot vide
      echelonnesSnap = { docs: [] };
    }

    // 1. Traiter les dépenses régulières du mois
    const depenses = depensesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const depensesDuMois = depenses.filter((d) => {
      const depenseDate = new Date(d.date);
      return depenseDate >= startDate && depenseDate <= endDate;
    });

    const totalDepensesRegulieres = Math.abs(
      depensesDuMois.reduce((acc, d) => acc + (parseFloat(d.montant) || 0), 0)
    );

    // 2. Traiter les paiements récurrents
    const paiementsRecurrents = recurrentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalRecurrents = paiementsRecurrents.reduce(
      (acc, p) => acc + (parseFloat(p.montant) || 0),
      0
    );

    // 3. Traiter les paiements échelonnés actifs ce mois-ci
    const paiementsEchelonnes = echelonnesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtrer les paiements échelonnés actifs ce mois-ci (avec prise en charge standard debutDate)
    const echelonnesActifs = paiementsEchelonnes.filter((p) => {
      // Vérifier si nous avons les champs nécessaires
      if (!p.mensualites || !p.debutDate) return false;

      // Extraire l'année et le mois du début
      const [startYear, startMonth] = p.debutDate.split("-").map(Number);
      const debut = new Date(startYear, startMonth - 1);

      // Calculer la date de fin
      const fin = new Date(
        startYear,
        startMonth - 1 + Number(p.mensualites) - 1
      );

      // Vérifier si le mois actuel est dans la période active
      return startDate >= debut && startDate <= fin;
    });

    // Calculer le total des mensualités échelonnées
    const totalEchelonnes = echelonnesActifs.reduce((acc, p) => {
      if (!p.montant || !p.mensualites) return acc;
      return acc + Number(p.montant) / Number(p.mensualites);
    }, 0);

    // 4. Calculer le total général
    const totalGeneral =
      totalDepensesRegulieres + totalRecurrents + totalEchelonnes;

    // Retourner un objet avec les détails
    return {
      total: totalGeneral,
      regulieres: totalDepensesRegulieres,
      recurrentes: totalRecurrents,
      echelonnees: totalEchelonnes,
      nombreDepenses: depensesDuMois.length,
      nombreRecurrentes: paiementsRecurrents.length,
      nombreEchelonnees: echelonnesActifs.length,
      // Ajouter les données par catégorie également
      parCategorie: categorizeExpenses(
        depensesDuMois,
        paiementsRecurrents,
        echelonnesActifs
      ),
    };
  } catch (error) {
    console.error("Erreur lors du calcul des dépenses mensuelles:", error);
    // Retourner un objet vide mais structuré en cas d'erreur pour éviter les crashs
    return {
      total: 0,
      regulieres: 0,
      recurrentes: 0,
      echelonnees: 0,
      nombreDepenses: 0,
      nombreRecurrentes: 0,
      nombreEchelonnees: 0,
      parCategorie: [],
    };
  }
};

/**
 * Catégorise toutes les dépenses par type
 * @param {Array} depenses - Dépenses régulières
 * @param {Array} recurrentes - Dépenses récurrentes
 * @param {Array} echelonnees - Dépenses échelonnées
 * @returns {Array} - Tableau des dépenses par catégorie
 */
const categorizeExpenses = (depenses, recurrentes, echelonnees) => {
  // Créer un objet pour stocker les totaux par catégorie
  const categoriesObj = {};

  // Traiter les dépenses régulières
  depenses.forEach((d) => {
    const categorie = d.categorie || "Autre";
    if (!categoriesObj[categorie]) {
      categoriesObj[categorie] = 0;
    }
    categoriesObj[categorie] += Math.abs(parseFloat(d.montant) || 0);
  });

  // Traiter les dépenses récurrentes
  recurrentes.forEach((r) => {
    const categorie = r.categorie || "Autre";
    if (!categoriesObj[categorie]) {
      categoriesObj[categorie] = 0;
    }
    categoriesObj[categorie] += parseFloat(r.montant) || 0;
  });

  // Traiter les dépenses échelonnées
  echelonnees.forEach((e) => {
    const categorie = e.categorie || "Autre";
    if (!categoriesObj[categorie]) {
      categoriesObj[categorie] = 0;
    }
    const montantMensuel =
      (parseFloat(e.montant) || 0) / (parseInt(e.mensualites) || 1);
    categoriesObj[categorie] += montantMensuel;
  });

  // Convertir l'objet en tableau pour le graphique
  return Object.entries(categoriesObj).map(([name, value]) => ({
    name,
    value,
  }));
};
