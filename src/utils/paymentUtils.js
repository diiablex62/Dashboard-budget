import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { handleItemOperation } from "./firebaseUtils";

/**
 * Récupère tous les paiements récurrents
 * @returns {Promise<Array>} - Tableau des paiements récurrents
 */
export const getAllRecurrentPayments = async () => {
  try {
    const snapshot = await getDocs(collection(db, "recurrent"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements récurrents:",
      error
    );
    throw error;
  }
};

/**
 * Récupère tous les paiements échelonnés
 * @returns {Promise<Array>} - Tableau des paiements échelonnés
 */
export const getAllEchelonnePayments = async () => {
  try {
    const snapshot = await getDocs(collection(db, "xfois"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements échelonnés:",
      error
    );
    throw error;
  }
};

/**
 * Calcule le total des paiements récurrents
 * @param {Array} payments - Tableau des paiements récurrents
 * @returns {number} - Total des paiements récurrents
 */
export const calculateRecurrentTotal = (payments) => {
  return payments.reduce((acc, p) => acc + (parseFloat(p.montant) || 0), 0);
};

/**
 * Filtre les paiements échelonnés du mois courant
 * @param {Array} payments - Tableau des paiements échelonnés
 * @param {Date} [currentDate=new Date()] - Date actuelle
 * @returns {Array} - Paiements échelonnés du mois
 */
export const filterCurrentMonthEchelonnePayments = (
  payments,
  currentDate = new Date()
) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return payments.filter((p) => {
    if (!p.debutMois || !p.mensualites) return false;
    const [startYear, startMonth] = p.debutMois.split("-").map(Number);
    const debut = new Date(startYear, startMonth - 1);
    const fin = new Date(startYear, startMonth - 1 + Number(p.mensualites) - 1);
    const nowDate = new Date(currentYear, currentMonth - 1);
    return nowDate >= debut && nowDate <= fin;
  });
};

/**
 * Calcule le total des paiements échelonnés du mois courant
 * @param {Array} payments - Tableau des paiements échelonnés
 * @returns {number} - Total des paiements échelonnés
 */
export const calculateEchelonneTotal = (payments) => {
  return payments.reduce((acc, p) => {
    if (!p.montant || !p.mensualites) return acc;
    return acc + Number(p.montant) / Number(p.mensualites);
  }, 0);
};

/**
 * Validateur pour un paiement récurrent
 * @param {Object} payment - Paiement récurrent à valider
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export const validateRecurrentPayment = (payment) => {
  const errors = [];

  if (!payment.nom || payment.nom.trim() === "") {
    errors.push("Le nom est requis");
  }

  if (!payment.categorie || payment.categorie.trim() === "") {
    errors.push("La catégorie est requise");
  }

  const montant = parseFloat(payment.montant);
  if (isNaN(montant) || montant <= 0) {
    errors.push("Le montant doit être un nombre positif non nul");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validateur pour un paiement échelonné
 * @param {Object} payment - Paiement échelonné à valider
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export const validateEchelonnePayment = (payment) => {
  const errors = [];

  if (!payment.nom || payment.nom.trim() === "") {
    errors.push("Le nom est requis");
  }

  const montant = parseFloat(payment.montant);
  if (isNaN(montant) || montant <= 0) {
    errors.push("Le montant doit être un nombre positif non nul");
  }

  const mensualites = parseInt(payment.mensualites, 10);
  if (isNaN(mensualites) || mensualites <= 0) {
    errors.push("Le nombre de mensualités doit être un entier positif non nul");
  }

  if (!payment.debutMois) {
    errors.push("Le mois de début est requis");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Ajoute ou modifie un paiement récurrent
 * @param {Object} payment - Données du paiement
 * @returns {Promise<string|void>} - ID du document créé (si ajout)
 */
export const addOrUpdateRecurrentPayment = async (payment) => {
  const { isValid, errors } = validateRecurrentPayment(payment);

  if (!isValid) {
    console.error("Validation failed:", errors);
    throw new Error(errors.join(", "));
  }

  const operation = payment.id ? "update" : "add";

  // Préparer les données pour la base de données
  const paymentData = {
    nom: payment.nom.trim(),
    categorie: payment.categorie.trim(),
    montant: parseFloat(payment.montant),
  };

  return handleItemOperation(operation, "recurrent", paymentData, payment.id);
};

/**
 * Ajoute ou modifie un paiement échelonné
 * @param {Object} payment - Données du paiement
 * @returns {Promise<string|void>} - ID du document créé (si ajout)
 */
export const addOrUpdateEchelonnePayment = async (payment) => {
  const { isValid, errors } = validateEchelonnePayment(payment);

  if (!isValid) {
    console.error("Validation failed:", errors);
    throw new Error(errors.join(", "));
  }

  const operation = payment.id ? "update" : "add";

  // Préparer les données pour la base de données
  const paymentData = {
    nom: payment.nom.trim(),
    montant: parseFloat(payment.montant),
    mensualites: parseInt(payment.mensualites, 10),
    debutMois: payment.debutMois,
  };

  return handleItemOperation(operation, "xfois", paymentData, payment.id);
};

/**
 * Supprime un paiement récurrent
 * @param {string} paymentId - ID du paiement
 * @param {Object} paymentData - Données du paiement pour la notification
 * @returns {Promise<void>}
 */
export const deleteRecurrentPayment = async (paymentId, paymentData) => {
  if (!paymentId) {
    throw new Error("Payment ID est requis pour la suppression");
  }

  return handleItemOperation("delete", "recurrent", paymentData, paymentId);
};

/**
 * Supprime un paiement échelonné
 * @param {string} paymentId - ID du paiement
 * @param {Object} paymentData - Données du paiement pour la notification
 * @returns {Promise<void>}
 */
export const deleteEchelonnePayment = async (paymentId, paymentData) => {
  if (!paymentId) {
    throw new Error("Payment ID est requis pour la suppression");
  }

  return handleItemOperation("delete", "xfois", paymentData, paymentId);
};

/**
 * Calcule le pourcentage de progression d'un paiement échelonné
 * @param {Object} payment - Paiement échelonné
 * @returns {Object} - {percentProgress, paiementsEffectues, montantRestant, mensualite}
 */
export const calculateEchelonneProgress = (payment) => {
  if (!payment.debutMois || !payment.mensualites || !payment.montant) {
    return {
      percentProgress: 0,
      paiementsEffectues: 0,
      montantRestant: parseFloat(payment.montant) || 0,
      mensualite: 0,
    };
  }

  const totalPaiement = parseFloat(payment.montant);
  const mensualite = totalPaiement / parseFloat(payment.mensualites);

  // Calculer le nombre de paiements effectués
  const [debutAnnee, debutMois] = payment.debutMois.split("-").map(Number);
  const dateDebut = new Date(debutAnnee, debutMois - 1);
  const maintenant = new Date();
  const moisEcoules =
    (maintenant.getFullYear() - dateDebut.getFullYear()) * 12 +
    maintenant.getMonth() -
    dateDebut.getMonth() +
    1;

  const paiementsEffectues = Math.max(
    0,
    Math.min(moisEcoules, parseInt(payment.mensualites))
  );

  const percentProgress = Math.max(
    0,
    Math.min(100, (paiementsEffectues / parseFloat(payment.mensualites)) * 100)
  );

  const montantRestant = totalPaiement - mensualite * paiementsEffectues;

  return {
    percentProgress,
    paiementsEffectues,
    montantRestant,
    mensualite,
  };
};
