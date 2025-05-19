import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

/**
 * Ajoute une notification à Firestore
 * @param {string} type - Type de notification (recurrent, echelonne, depense, revenu)
 * @param {string} title - Titre de la notification
 * @param {string} desc - Description de la notification
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<string>} - ID du document créé
 */
export const addNotification = async (type, title, desc, userId) => {
  try {
    console.log(`Ajout notification pour utilisateur: ${userId}`);
    const docRef = await addDoc(collection(db, "notifications"), {
      type,
      title,
      desc,
      date: new Date().toLocaleDateString("fr-FR"),
      read: false,
      createdAt: serverTimestamp(),
      userId,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la notification:", error);
    throw error;
  }
};

/**
 * Fonction utilitaire pour créer des notifications lors d'opérations CRUD
 * @param {string} operation - Type d'opération (add, update, delete)
 * @param {string} type - Type d'élément (recurrent, echelonne, depense, revenu)
 * @param {string} nom - Nom de l'élément
 * @param {number} montant - Montant de l'élément
 * @param {string} userId - ID de l'utilisateur
 */
export const createNotificationForOperation = async (
  operation,
  type,
  nom,
  montant,
  userId
) => {
  const absAmount = Math.abs(parseFloat(montant)).toFixed(2);
  const capitalizedName = nom.charAt(0).toUpperCase() + nom.slice(1);

  let title, desc;

  switch (operation) {
    case "add":
      title =
        type === "revenu"
          ? "Nouveau revenu"
          : type === "depense"
          ? "Nouvelle dépense"
          : type === "recurrent"
          ? "Nouveau paiement récurrent"
          : "Nouveau paiement échelonné";
      desc = `Ajout de ${capitalizedName} (${absAmount}€)`;
      break;
    case "update":
      title =
        type === "revenu"
          ? "Revenu modifié"
          : type === "depense"
          ? "Dépense modifiée"
          : type === "recurrent"
          ? "Paiement récurrent modifié"
          : "Paiement échelonné modifié";
      desc = `Modification de ${capitalizedName} (${absAmount}€)`;
      break;
    case "delete":
      title =
        type === "revenu"
          ? "Revenu supprimé"
          : type === "depense"
          ? "Dépense supprimée"
          : type === "recurrent"
          ? "Paiement récurrent supprimé"
          : "Paiement échelonné supprimé";
      desc = `Suppression de ${capitalizedName} (${absAmount}€)`;
      break;
    default:
      throw new Error("Type d'opération non supporté");
  }

  await addNotification(type, title, desc, userId);
};

/**
 * Marque une notification comme lue
 * @param {string} notificationId - ID de la notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  } catch (error) {
    console.error(
      "Erreur lors du marquage de la notification comme lue:",
      error
    );
    throw error;
  }
};

/**
 * Récupère toutes les notifications d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Tableau des notifications
 */
export const getAllNotifications = async (userId) => {
  try {
    console.log(`Récupération des notifications pour utilisateur: ${userId}`);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    throw error;
  }
};

/**
 * Supprime une notification
 * @param {string} notificationId - ID de la notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    throw error;
  }
};

/**
 * Supprime toutes les notifications d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
export const deleteAllNotifications = async (userId) => {
  try {
    console.log(`Suppression des notifications pour utilisateur: ${userId}`);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const batchDeletes = snapshot.docs.map((d) =>
      deleteDoc(doc(db, "notifications", d.id))
    );
    await Promise.all(batchDeletes);
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de toutes les notifications:",
      error
    );
    throw error;
  }
};

/**
 * Rafraîchit les données du Dashboard
 */
export const refreshDashboard = () => {
  window.dispatchEvent(new Event("data-updated"));
};

/**
 * Gère l'ajout, la modification ou la suppression d'un élément avec notification
 * @param {string} operation - Type d'opération (add, update, delete)
 * @param {string} collectionName - Nom de la collection Firestore
 * @param {Object} data - Données de l'élément
 * @param {string} userId - ID de l'utilisateur
 * @param {string} [id] - ID de l'élément (pour update/delete)
 * @returns {Promise<string|void>} - ID du document créé (pour add)
 */
export const handleItemOperation = async (
  operation,
  collectionName,
  data,
  userId,
  id = null
) => {
  try {
    console.log(
      `Opération ${operation} sur ${collectionName} pour utilisateur: ${userId}`
    );
    let documentId = id;
    const simplifiedType =
      collectionName === "recurrent"
        ? "recurrent"
        : collectionName === "xfois"
        ? "echelonne"
        : collectionName === "depense"
        ? "depense"
        : "revenu";

    // Ajout de l'ID utilisateur aux données
    const dataWithUserId = {
      ...data,
      userId,
    };

    switch (operation) {
      case "add":
        const docRef = await addDoc(collection(db, collectionName), {
          ...dataWithUserId,
          createdAt: serverTimestamp(),
        });
        documentId = docRef.id;
        break;

      case "update":
        if (!id) throw new Error("ID requis pour la mise à jour");
        await updateDoc(doc(db, collectionName, id), {
          ...dataWithUserId,
          updatedAt: serverTimestamp(),
        });
        break;

      case "delete":
        if (!id) throw new Error("ID requis pour la suppression");
        await deleteDoc(doc(db, collectionName, id));
        break;

      default:
        throw new Error("Type d'opération non supporté");
    }

    // Créer une notification pour l'opération
    await createNotificationForOperation(
      operation,
      simplifiedType,
      data.nom,
      data.montant,
      userId
    );

    // Rafraîchir le dashboard
    refreshDashboard();

    return documentId;
  } catch (error) {
    console.error(
      `Erreur lors de l'opération ${operation} sur ${collectionName}:`,
      error
    );
    throw error;
  }
};

/**
 * Récupère tous les éléments d'une collection pour un utilisateur spécifique
 * @param {string} collectionName - Nom de la collection Firestore
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Tableau des éléments
 */
export const getItemsByUserId = async (collectionName, userId) => {
  try {
    console.log(
      `Récupération des ${collectionName} pour utilisateur: ${userId}`
    );
    const q = query(
      collection(db, collectionName),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des ${collectionName}:`,
      error
    );
    throw error;
  }
};
