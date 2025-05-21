import api from "../utils/api";

// Squelette de la fonction d'appel API pour l'envoi du lien magique
// À compléter avec l'appel réel à l'API backend

/**
 * Envoie un lien magique de connexion à l'utilisateur
 * @param {string} email - L'adresse email de l'utilisateur
 * @returns {Promise<void>} - À compléter pour gérer la réponse de l'API
 */
export async function sendMagicLink(email) {
  const response = await api.post("/auth/login-magic-link", { email });
  if (response.status !== 200) {
    throw new Error(
      response.data?.message || "Erreur lors de l'envoi du lien magique"
    );
  }
}
