import { transactionApi } from "./api";

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
    const response = await transactionApi.migrateUserData(userId);
    console.log(`Migration terminée pour l'utilisateur: ${userId}`);
    return response.data;
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

// Fonction pour migrer les données
export const migrateData = async () => {
  try {
    console.log("Début de la migration des données");
    const response = await transactionApi.migrateData();
    console.log("Migration des données terminée avec succès");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la migration des données:", error);
    throw error;
  }
};
