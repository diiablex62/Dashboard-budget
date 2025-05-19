import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Migre toutes les données existantes vers le nouveau système d'utilisateurs avec ID de compte principal
 * @param {string} userId - ID de l'utilisateur à migrer
 * @returns {Promise<Object>} - Statistiques de migration
 */
export const migrateUserData = async (userId) => {
  try {
    console.log(
      `Début de la migration des données pour l'utilisateur: ${userId}`
    );

    // Statistiques de migration
    const stats = {
      userAccount: false,
      depenses: 0,
      revenus: 0,
      recurrents: 0,
      xfois: 0,
      notifications: 0,
    };

    // 1. Récupérer les données de l'utilisateur
    const userDoc = await getDoc(doc(db, "users", userId));

    // Si l'utilisateur n'existe pas, on arrête la migration
    if (!userDoc.exists()) {
      console.error(`Utilisateur ${userId} introuvable`);
      return { error: `Utilisateur ${userId} introuvable` };
    }

    const userData = userDoc.data();

    // 2. Créer un compte utilisateur s'il n'existe pas déjà
    const userAccountData = {
      displayName:
        `${userData.prenom || ""} ${userData.nom || ""}`.trim() ||
        userData.email.split("@")[0],
      emails: [userData.email],
      authMethods: userData.authProviders || ["unknown"],
      photoURL: userData.photoURL || "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      lastProvider: userData.lastProvider || "unknown",
    };

    await setDoc(doc(db, "userAccounts", userId), userAccountData, {
      merge: true,
    });
    stats.userAccount = true;
    console.log(`Compte utilisateur créé/mis à jour pour: ${userId}`);

    // 3. Mise à jour des collections avec l'ID utilisateur

    // 3.1 Mise à jour des dépenses
    const depensesQuery = query(collection(db, "depense"));
    const depensesSnapshot = await getDocs(depensesQuery);

    for (const depenseDoc of depensesSnapshot.docs) {
      const depenseData = depenseDoc.data();

      // Si la dépense n'est pas déjà associée à un utilisateur
      if (!depenseData.userId) {
        await updateDoc(doc(db, "depense", depenseDoc.id), {
          userId: userId,
          updatedAt: serverTimestamp(),
        });
        stats.depenses++;
      }
    }
    console.log(`${stats.depenses} dépenses migrées`);

    // 3.2 Mise à jour des revenus
    const revenusQuery = query(collection(db, "revenu"));
    const revenusSnapshot = await getDocs(revenusQuery);

    for (const revenuDoc of revenusSnapshot.docs) {
      const revenuData = revenuDoc.data();

      // Si le revenu n'est pas déjà associé à un utilisateur
      if (!revenuData.userId) {
        await updateDoc(doc(db, "revenu", revenuDoc.id), {
          userId: userId,
          updatedAt: serverTimestamp(),
        });
        stats.revenus++;
      }
    }
    console.log(`${stats.revenus} revenus migrés`);

    // 3.3 Mise à jour des paiements récurrents
    const recurrentsQuery = query(collection(db, "recurrent"));
    const recurrentsSnapshot = await getDocs(recurrentsQuery);

    for (const recurrentDoc of recurrentsSnapshot.docs) {
      const recurrentData = recurrentDoc.data();

      // Si le paiement récurrent n'est pas déjà associé à un utilisateur
      if (!recurrentData.userId) {
        await updateDoc(doc(db, "recurrent", recurrentDoc.id), {
          userId: userId,
          updatedAt: serverTimestamp(),
        });
        stats.recurrents++;
      }
    }
    console.log(`${stats.recurrents} paiements récurrents migrés`);

    // 3.4 Mise à jour des paiements échelonnés
    const xfoisQuery = query(collection(db, "xfois"));
    const xfoisSnapshot = await getDocs(xfoisQuery);

    for (const xfoisDoc of xfoisSnapshot.docs) {
      const xfoisData = xfoisDoc.data();

      // Si le paiement échelonné n'est pas déjà associé à un utilisateur
      if (!xfoisData.userId) {
        await updateDoc(doc(db, "xfois", xfoisDoc.id), {
          userId: userId,
          updatedAt: serverTimestamp(),
        });
        stats.xfois++;
      }
    }
    console.log(`${stats.xfois} paiements échelonnés migrés`);

    // 3.5 Mise à jour des notifications
    const notificationsQuery = query(collection(db, "notifications"));
    const notificationsSnapshot = await getDocs(notificationsQuery);

    for (const notifDoc of notificationsSnapshot.docs) {
      const notifData = notifDoc.data();

      // Si la notification n'est pas déjà associée à un utilisateur
      if (!notifData.userId) {
        await updateDoc(doc(db, "notifications", notifDoc.id), {
          userId: userId,
          updatedAt: serverTimestamp(),
        });
        stats.notifications++;
      }
    }
    console.log(`${stats.notifications} notifications migrées`);

    console.log(`Migration terminée pour l'utilisateur: ${userId}`);
    return stats;
  } catch (error) {
    console.error("Erreur lors de la migration des données:", error);
    throw error;
  }
};

/**
 * Utilitaire pour créer un bouton qui déclenche la migration des données
 * @param {string} userId - ID de l'utilisateur à migrer
 * @returns {JSX.Element} - Bouton de migration
 */
export const MigrationButton = ({ userId }) => {
  if (!userId) return null;

  const handleMigration = async () => {
    try {
      if (
        window.confirm(
          "Voulez-vous migrer les données existantes vers votre compte ? Cette opération associera toutes les données non-attribuées à votre compte utilisateur."
        )
      ) {
        const stats = await migrateUserData(userId);
        alert(
          `Migration terminée avec succès!\n\nDépenses: ${stats.depenses}\nRevenus: ${stats.revenus}\nPaiements récurrents: ${stats.recurrents}\nPaiements échelonnés: ${stats.xfois}\nNotifications: ${stats.notifications}`
        );
      }
    } catch (error) {
      alert(`Erreur lors de la migration: ${error.message}`);
    }
  };

  return (
    <button
      onClick={handleMigration}
      className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors duration-200'>
      Migrer les données existantes
    </button>
  );
};
