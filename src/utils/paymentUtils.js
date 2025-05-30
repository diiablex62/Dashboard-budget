// Je retire tout ce qui concerne paymentApi et les appels API, et je laisse uniquement des helpers locaux ou je vide le fichier si tout est inutile.

/**
 * Récupère tous les paiements récurrents
 * @returns {Promise<Array>} - Tableau des paiements récurrents
 */
export const getAllRecurrentPayments = async () => {
  try {
    console.log("Récupération des paiements récurrents");
    const response = await paymentApi.getRecurrentPayments();
    return response.data;
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
    console.log("Récupération des paiements échelonnés");
    const response = await paymentApi.getEchelonnePayments();
    return response.data;
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
    if (!p.debutDate || !p.mensualites) return false;

    // Extraire l'année, le mois et le jour de la date de début
    const startDate = new Date(p.debutDate);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;

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

  if (!payment.debutDate) {
    errors.push("La date de début est requise");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Ajoute ou met à jour un paiement récurrent
 * @param {Object} payment - Données du paiement
 * @param {string} [id] - ID du paiement (pour mise à jour)
 * @returns {Promise<string|null>} - ID du document créé (si ajout)
 */
export const addOrUpdateRecurrentPayment = async (payment, id = null) => {
  try {
    const { nom, montant, categorie } = payment;

    // Validation basique
    if (!nom || !montant) {
      throw new Error("Nom et montant sont obligatoires");
    }

    const montantValue = parseFloat(montant);
    if (isNaN(montantValue) || montantValue <= 0) {
      throw new Error("Le montant doit être un nombre positif");
    }

    const paymentData = {
      nom,
      montant: montantValue,
      categorie: categorie || "Autre",
      updatedAt: serverTimestamp(),
    };

    if (id) {
      // Mise à jour
      await updateDoc(doc(db, "recurrent", id), paymentData);
      return null;
    } else {
      // Ajout
      paymentData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, "recurrent"), paymentData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout/mise à jour du paiement:", error);
    throw error;
  }
};

/**
 * Ajoute ou met à jour un paiement échelonné
 * @param {Object} payment - Données du paiement
 * @param {string} [id] - ID du paiement (pour mise à jour)
 * @returns {Promise<string|null>} - ID du document créé (si ajout)
 */
export const addOrUpdateEchelonnePayment = async (payment, id = null) => {
  try {
    // Validation avec la fonction dédiée
    const validation = validateEchelonnePayment(payment);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const paymentData = {
      nom: payment.nom.trim(),
      montant: parseFloat(payment.montant),
      mensualites: parseInt(payment.mensualites, 10),
      debutDate: payment.debutDate,
      categorie: payment.categorie || "Autre",
      updatedAt: serverTimestamp(),
    };

    if (id) {
      // Mise à jour
      await updateDoc(doc(db, "echelonne", id), paymentData);
      return null;
    } else {
      // Ajout
      paymentData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, "echelonne"), paymentData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout/mise à jour du paiement:", error);
    throw error;
  }
};

/**
 * Supprime un paiement récurrent
 * @param {string} id - ID du paiement à supprimer
 * @returns {Promise<void>}
 */
export const deleteRecurrentPayment = async (id) => {
  if (!id) throw new Error("ID requis");
  try {
    await deleteDoc(doc(db, "recurrent", id));
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement:", error);
    throw error;
  }
};

/**
 * Supprime un paiement échelonné
 * @param {string} id - ID du paiement à supprimer
 * @returns {Promise<void>}
 */
export const deleteEchelonnePayment = async (id) => {
  if (!id) throw new Error("ID requis");
  try {
    await deleteDoc(doc(db, "echelonne", id));
    console.log("PaymentUtils: Suppression réussie dans 'echelonne'");
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement:", error);
    throw error;
  }
};

/**
 * Calcule le pourcentage de progression d'un paiement échelonné
 * @param {Object} payment - Paiement échelonné
 * @returns {Object} - {percentProgress, paiementsEffectues, montantRestant, mensualite}
 */
export const calculateEchelonneProgress = (payment) => {
  if (!payment.debutDate || !payment.mensualites || !payment.montant) {
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
  const startDate = new Date(payment.debutDate);
  const debutAnnee = startDate.getFullYear();
  const debutMois = startDate.getMonth() + 1;

  const maintenant = new Date();
  const moisEcoules =
    (maintenant.getFullYear() - debutAnnee) * 12 +
    maintenant.getMonth() -
    (debutMois - 1) +
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

/**
 * Récupère tous les paiements échelonnés pour une date donnée
 * @param {Date} date - Date pour laquelle récupérer les paiements
 * @returns {Promise<Array>} - Paiements échelonnés pour la date
 */
export const getEchelonnePaymentsForDate = async (date) => {
  try {
    // Récupérer tous les paiements échelonnés
    const allPayments = await getAllEchelonnePayments();
    console.log(
      `Récupération des paiements échelonnés pour le ${date.toLocaleDateString()}`
    );

    // Filtrer pour ne garder que ceux dont le jour du mois correspond à la date de début
    return allPayments.filter((payment) => {
      if (!payment.mensualites) return false;

      // Date de début du paiement
      const startDate = new Date(payment.debutDate);

      // Date de fin (pour vérifier si le paiement est toujours actif)
      const endDate = new Date(startDate);
      endDate.setMonth(
        startDate.getMonth() + parseInt(payment.mensualites) - 1
      );

      // On vérifie si:
      // 1. Le jour du mois de la date fournie correspond au jour de début du paiement
      // 2. La date fournie est dans la période d'activité du paiement (entre début et fin)
      return (
        date.getDate() === startDate.getDate() &&
        date >= startDate &&
        date <= endDate
      );
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements pour la date:",
      error
    );
    // Retourner un tableau vide pour éviter les crashs
    return [];
  }
};

/**
 * Récupère tous les paiements récurrents pour une date donnée
 * @param {Date} date - Date pour laquelle récupérer les paiements
 * @returns {Promise<Array>} - Paiements récurrents pour la date
 */
export const getRecurrentPaymentsForDate = async (date) => {
  try {
    // Récupérer tous les paiements récurrents
    const allPayments = await getAllRecurrentPayments();
    const jourDuMois = date.getDate();
    const dateObj = new Date(date);

    console.log(
      `Récupération des paiements récurrents pour le ${date.toLocaleDateString()}`
    );

    // Filtrer pour ne garder que les paiements récurrents dont
    // le jour de prélèvement correspond au jour de la date
    const paymentsForDay = allPayments.filter((payment) => {
      // Vérifier si le jour de prélèvement correspond
      if (payment.jourPrelevement !== jourDuMois) {
        return false;
      }

      return true;
    });

    // Ajouter la date exacte à chaque paiement
    return paymentsForDay.map((payment) => ({
      ...payment,
      type: "recurrent",
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`,
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements récurrents pour la date:",
      error
    );
    // Retourner un tableau vide pour éviter les crashs
    return [];
  }
};
