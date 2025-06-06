// =============================
// calculGraph6.js
// Fonctions utilitaires pour le graphique des 6 derniers mois (revenus/dépenses)
// =============================

/**
 * Calcule les totaux revenus et dépenses pour les 6 derniers mois.
 * - Mois courant : prévisionnel (tout ce qui est prévu jusqu'à la fin du mois)
 * - Mois précédents : réel (uniquement ce qui a été effectivement enregistré)
 *
 * @param {Array} depenseRevenu
 * @param {Array} paiementsRecurrents
 * @param {Array} paiementsEchelonnes
 * @returns {Array} [{ mois: 'MM/YYYY', depenses, revenus }]
 */
export function getCourbeRevenusDepenses6Mois(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes
) {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mois =
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      date.getFullYear();
    const isCurrentMonth =
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    let depenses = 0;
    let revenus = 0;

    if (isCurrentMonth) {
      // PRÉVISIONNEL pour le mois courant
      // Dépenses prévisionnelles
      depenses =
        depenseRevenu
          .filter((d) => d.type === "depense")
          .reduce((acc, d) => acc + Number(d.montant), 0) +
        paiementsRecurrents
          .filter((d) => d.type === "depense")
          .reduce((acc, d) => acc + Number(d.montant), 0) +
        paiementsEchelonnes
          .filter((d) => d.type === "depense" || d.type === "credit")
          .reduce((acc, d) => acc + Number(d.montant), 0);
      // Revenus prévisionnels
      revenus =
        depenseRevenu
          .filter((d) => d.type === "revenu")
          .reduce((acc, d) => acc + Number(d.montant), 0) +
        paiementsRecurrents
          .filter((d) => d.type === "revenu")
          .reduce((acc, d) => acc + Number(d.montant), 0) +
        paiementsEchelonnes
          .filter((d) => d.type === "revenu")
          .reduce((acc, d) => acc + Number(d.montant), 0);
    } else {
      // RÉEL pour les autres mois
      // Dépenses classiques
      const depensesMois = depenseRevenu.filter(
        (d) =>
          d.type === "depense" &&
          new Date(d.date).getMonth() === date.getMonth() &&
          new Date(d.date).getFullYear() === date.getFullYear()
      );
      // Dépenses récurrentes (si la récurrence couvre ce mois)
      const recurrentsMois = paiementsRecurrents.filter(
        (d) =>
          d.type === "depense" &&
          (!d.debut || new Date(d.debut) <= date) &&
          (!d.fin || new Date(d.fin) >= date)
      );
      // Dépenses échelonnées/crédit (si la période couvre ce mois)
      const echelonnesMois = paiementsEchelonnes.filter(
        (d) =>
          (d.type === "depense" || d.type === "credit") &&
          (!d.debut || new Date(d.debut) <= date) &&
          (!d.fin || new Date(d.fin) >= date)
      );
      depenses =
        depensesMois.reduce((acc, d) => acc + Number(d.montant), 0) +
        recurrentsMois.reduce((acc, d) => acc + Number(d.montant), 0) +
        echelonnesMois.reduce((acc, d) => acc + Number(d.montant), 0);
      // Revenus classiques
      const revenusMois = depenseRevenu.filter(
        (d) =>
          d.type === "revenu" &&
          new Date(d.date).getMonth() === date.getMonth() &&
          new Date(d.date).getFullYear() === date.getFullYear()
      );
      // Revenus récurrents
      const recurrentsRevenusMois = paiementsRecurrents.filter(
        (d) =>
          d.type === "revenu" &&
          (!d.debut || new Date(d.debut) <= date) &&
          (!d.fin || new Date(d.fin) >= date)
      );
      // Revenus échelonnés
      const echelonnesRevenusMois = paiementsEchelonnes.filter(
        (d) =>
          d.type === "revenu" &&
          (!d.debut || new Date(d.debut) <= date) &&
          (!d.fin || new Date(d.fin) >= date)
      );
      revenus =
        revenusMois.reduce((acc, d) => acc + Number(d.montant), 0) +
        recurrentsRevenusMois.reduce((acc, d) => acc + Number(d.montant), 0) +
        echelonnesRevenusMois.reduce((acc, d) => acc + Number(d.montant), 0);
    }
    result.push({ mois, depenses, revenus });
  }
  return result;
}
