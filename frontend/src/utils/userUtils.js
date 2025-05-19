import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Crée ou met à jour un compte utilisateur avec un ID de compte principal
 * @param {Object} user - Objet utilisateur Firebase Auth
 * @param {string} provider - Fournisseur d'authentification (google, github, email)
 * @returns {Promise<string>} - ID du compte principal utilisateur
 */
export const createOrUpdateUserAccount = async (user, provider) => {
  try {
    console.log(
      `Création/mise à jour du compte utilisateur: ${user.email} via ${provider}`
    );

    // 1. Vérifier si l'email existe déjà dans un compte
    const userQuery = query(
      collection(db, "userAccounts"),
      where("emails", "array-contains", user.email)
    );

    const userSnapshot = await getDocs(userQuery);

    // 2a. Si un compte existe avec cet email
    if (!userSnapshot.empty) {
      const userAccountDoc = userSnapshot.docs[0];
      const userAccountData = userAccountDoc.data();
      const mainAccountId = userAccountDoc.id;

      console.log(`Compte existant trouvé avec l'ID: ${mainAccountId}`);

      // Ajouter la méthode d'authentification si elle n'existe pas déjà
      if (!userAccountData.authMethods.includes(provider)) {
        await updateDoc(doc(db, "userAccounts", mainAccountId), {
          authMethods: arrayUnion(provider),
          lastLogin: serverTimestamp(),
          lastProvider: provider,
        });
        console.log(
          `Méthode d'authentification ${provider} ajoutée au compte ${mainAccountId}`
        );
      } else {
        // Simplement mettre à jour la dernière connexion
        await updateDoc(doc(db, "userAccounts", mainAccountId), {
          lastLogin: serverTimestamp(),
          lastProvider: provider,
        });
        console.log(
          `Dernière connexion mise à jour pour le compte ${mainAccountId}`
        );
      }

      // Mettre à jour le profil utilisateur
      await updateUserProfile(mainAccountId, user, provider);

      return mainAccountId;
    }
    // 2b. Si aucun compte n'existe avec cet email
    else {
      // Créer un nouveau compte utilisateur
      const mainAccountId = user.uid; // Utiliser l'ID Firebase Auth comme ID principal

      const newUserAccount = {
        emails: [user.email],
        authMethods: [provider],
        displayName: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastProvider: provider,
      };

      await setDoc(doc(db, "userAccounts", mainAccountId), newUserAccount);
      console.log(`Nouveau compte créé avec l'ID: ${mainAccountId}`);

      // Créer le profil utilisateur de base
      await updateUserProfile(mainAccountId, user, provider);

      return mainAccountId;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour du compte utilisateur:",
      error
    );
    throw error;
  }
};

/**
 * Met à jour le profil utilisateur
 * @param {string} mainAccountId - ID du compte principal
 * @param {Object} user - Objet utilisateur Firebase Auth
 * @param {string} provider - Fournisseur d'authentification
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (mainAccountId, user, provider) => {
  try {
    console.log(`Mise à jour du profil pour l'utilisateur: ${mainAccountId}`);

    // Vérifier si un profil existe déjà
    const profileDoc = await getDoc(doc(db, "users", mainAccountId));

    if (profileDoc.exists()) {
      // Mettre à jour uniquement si des données sont manquantes
      const profileData = profileDoc.data();
      const updates = {};

      // Ne pas écraser les informations existantes
      if (!profileData.prenom && user.displayName) {
        updates.prenom = user.displayName.split(" ")[0] || "";
      }

      if (!profileData.nom && user.displayName) {
        updates.nom = user.displayName.split(" ")[1] || "";
      }

      if (!profileData.photoURL && user.photoURL) {
        updates.photoURL = user.photoURL;
      }

      // Ajouter la méthode d'authentification
      if (!profileData.authProviders) {
        updates.authProviders = [provider];
      } else if (!profileData.authProviders.includes(provider)) {
        updates.authProviders = [...profileData.authProviders, provider];
      }

      updates.lastLogin = serverTimestamp();
      updates.lastProvider = provider;

      // Ne mettre à jour que s'il y a des modifications
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "users", mainAccountId), updates);
        console.log(`Profil mis à jour pour: ${mainAccountId}`);
      }
    } else {
      // Créer un nouveau profil
      const defaultProfile = {
        prenom: user.displayName ? user.displayName.split(" ")[0] : "",
        nom: user.displayName ? user.displayName.split(" ")[1] : "",
        email: user.email,
        telephone: "",
        adresse: "",
        photoURL: user.photoURL || "",
        authProviders: [provider],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastProvider: provider,
      };

      await setDoc(doc(db, "users", mainAccountId), defaultProfile);
      console.log(`Nouveau profil créé pour: ${mainAccountId}`);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du profil utilisateur:",
      error
    );
    throw error;
  }
};

/**
 * Récupère l'ID du compte principal d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<string|null>} - ID du compte principal ou null si aucun compte n'existe
 */
export const getMainAccountId = async (email) => {
  try {
    const userQuery = query(
      collection(db, "userAccounts"),
      where("emails", "array-contains", email)
    );

    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      return userSnapshot.docs[0].id;
    }

    return null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'ID du compte principal:",
      error
    );
    throw error;
  }
};

/**
 * Associe un nouvel email à un compte utilisateur existant
 * @param {string} mainAccountId - ID du compte principal
 * @param {string} newEmail - Nouvel email à associer
 * @returns {Promise<void>}
 */
export const addEmailToAccount = async (mainAccountId, newEmail) => {
  try {
    // Vérifier si l'email est déjà associé à un autre compte
    const existingAccount = await getMainAccountId(newEmail);

    if (existingAccount && existingAccount !== mainAccountId) {
      throw new Error(
        "Cet email est déjà associé à un autre compte utilisateur"
      );
    }

    // Ajouter l'email au compte
    await updateDoc(doc(db, "userAccounts", mainAccountId), {
      emails: arrayUnion(newEmail),
      updatedAt: serverTimestamp(),
    });

    console.log(`Email ${newEmail} ajouté au compte ${mainAccountId}`);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'email au compte:", error);
    throw error;
  }
};

/**
 * Récupère toutes les méthodes d'authentification d'un utilisateur
 * @param {string} mainAccountId - ID du compte principal
 * @returns {Promise<Object>} - Objet contenant les méthodes d'authentification et emails
 */
export const getUserAuthMethods = async (mainAccountId) => {
  try {
    const accountDoc = await getDoc(doc(db, "userAccounts", mainAccountId));

    if (accountDoc.exists()) {
      const data = accountDoc.data();
      return {
        authMethods: data.authMethods || [],
        emails: data.emails || [],
        lastProvider: data.lastProvider,
      };
    }

    return {
      authMethods: [],
      emails: [],
      lastProvider: null,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des méthodes d'authentification:",
      error
    );
    throw error;
  }
};
