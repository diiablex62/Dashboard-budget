import { userApi } from "./api";

/**
 * Crée ou met à jour un compte utilisateur
 * @param {Object} user - Objet utilisateur
 * @param {string} provider - Fournisseur d'authentification (google, github, email)
 * @returns {Promise<Object>} - Données de l'utilisateur
 */
export const createOrUpdateUserAccount = async (user, provider) => {
  try {
    console.log(
      `Création/mise à jour du compte utilisateur: ${user.email} via ${provider}`
    );

    const userData = {
      displayName: user.displayName || user.email.split("@")[0],
      emails: [user.email],
      authMethods: [provider],
      photoURL: user.photoURL || "",
      lastProvider: provider,
    };

    const updatedUser = await userApi.createOrUpdate(userData);
    console.log("Compte utilisateur créé/mis à jour:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Erreur création/mise à jour compte utilisateur:", error);
    throw error;
  }
};

/**
 * Récupère un utilisateur par email
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object>} - Données de l'utilisateur
 */
export const getUserByEmail = async (email) => {
  try {
    console.log("Recherche utilisateur par email:", email);
    const user = await userApi.getByEmail(email);
    console.log("Utilisateur trouvé:", user);
    return user;
  } catch (error) {
    console.error("Erreur recherche utilisateur:", error);
    throw error;
  }
};
