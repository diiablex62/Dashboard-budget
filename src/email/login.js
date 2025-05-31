// Je retire toute logique d'appel à une API, toute référence à api, et je laisse uniquement des helpers locaux si besoin. Le fichier peut être vidé si tout est inutile.

/**
 * Envoie un lien magique de connexion à l'utilisateur
 * @param {string} email - L'adresse email de l'utilisateur
 * @returns {Promise<void>} - À compléter pour gérer la réponse de l'API
 */
export async function sendMagicLink(email) {
  try {
    // Générer un token unique
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Stocker le token dans le localStorage avec une expiration de 1 heure
    const expiration = Date.now() + 3600000; // 1 heure
    localStorage.setItem(
      "magicLinkToken",
      JSON.stringify({
        token,
        email,
        expiration,
      })
    );

    // Simuler l'envoi d'un email (dans un vrai projet, on appellerait une API)
    console.log(`Lien magique envoyé à ${email} avec le token: ${token}`);

    // Retourner le token pour le développement
    return { success: true, token };
  } catch (error) {
    console.error("Erreur lors de l'envoi du lien magique:", error);
    throw new Error(
      "Impossible d'envoyer le lien magique. Veuillez réessayer."
    );
  }
}

/**
 * Vérifie si un token magique est valide
 * @param {string} token - Le token à vérifier
 * @returns {Promise<{success: boolean, email?: string}>} - Le résultat de la vérification
 */
export async function verifyMagicLink(token) {
  try {
    const storedData = localStorage.getItem("magicLinkToken");
    if (!storedData) {
      return { success: false, error: "Aucun lien magique trouvé" };
    }

    const { token: storedToken, email, expiration } = JSON.parse(storedData);

    // Vérifier si le token correspond et n'est pas expiré
    if (token === storedToken && Date.now() < expiration) {
      // Supprimer le token utilisé
      localStorage.removeItem("magicLinkToken");
      return { success: true, email };
    }

    return { success: false, error: "Lien magique invalide ou expiré" };
  } catch (error) {
    console.error("Erreur lors de la vérification du lien magique:", error);
    return { success: false, error: "Erreur lors de la vérification du lien" };
  }
}
