// Fichier central pour les fonctions de calcul du projet
// ------------------------------------------------------
// ONGLETS :
// =====================
// DÉPENSES & REVENUS
// =====================

// total calcul depense par mois : [calculTotalDepensesMois]
export function calculTotalDepensesMois(depenseRevenu, date = new Date()) {
  console.log("=== CALCUL TOTAL DÉPENSES DU MOIS ===");

  // S'assurer que date est un objet Date
  const dateObj = date instanceof Date ? date : new Date(date);
  console.log(
    "Mois calculé:",
    dateObj.toLocaleString("fr-FR", { month: "long", year: "numeric" })
  );

  // Dépenses classiques du mois
  const total = depenseRevenu
    .filter((d) => {
      const dDate = new Date(d.date);
      return (
        d.type === "depense" &&
        dDate.getMonth() === dateObj.getMonth() &&
        dDate.getFullYear() === dateObj.getFullYear()
      );
    })
    .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant)), 0);

  console.log("Total des dépenses du mois:", total);
  console.log("================================");

  return total;
}

// total calcul paiements échelonnés du mois : [calculTotalEchelonnesMois]
export function calculTotalEchelonnesMois() {
  return 0;
}

// total calcul paiements récurrents du mois : [calculTotalRecurrentsMois]
export function calculTotalRecurrentsMois() {
  return 0;
}

// total calcul revenus par mois : [totalRevenusGlobalMois]
export function totalRevenusGlobalMois(depenseRevenu, date = new Date()) {
  console.log("=== CALCUL TOTAL REVENUS DU MOIS ===");

  // S'assurer que date est un objet Date
  const dateObj = date instanceof Date ? date : new Date(date);
  console.log(
    "Mois calculé:",
    dateObj.toLocaleString("fr-FR", { month: "long", year: "numeric" })
  );

  // Revenus classiques du mois
  const total = depenseRevenu
    .filter((d) => {
      const dDate = new Date(d.date);
      return (
        d.type === "revenu" &&
        dDate.getMonth() === dateObj.getMonth() &&
        dDate.getFullYear() === dateObj.getFullYear()
      );
    })
    .reduce((acc, d) => acc + parseFloat(d.montant), 0);

  console.log("Total des revenus du mois:", total);
  console.log("================================");

  return total;
}

// total calcul économies (revenus - dépenses) : [calculEconomies]
export function calculEconomies(revenus, depenses) {
  console.log("=== CALCUL DES ÉCONOMIES ===");
  console.log("Revenus:", revenus);
  console.log("Dépenses:", depenses);

  const economie = revenus - depenses;
  console.log("Économies calculées:", economie);
  console.log("================================");

  return economie;
}

// =====================
// AGRÉGATIONS & GRAPHIQUES
// =====================

// calcul des dépenses par catégorie : [calculDepensesParCategorie]
export function calculDepensesParCategorie() {
  return [];
}

// calcul des données du bar chart (6 derniers mois) : [calculBarChartData]
export function calculBarChartData() {
  return [];
}

// =====================
// CALCULS JUSQU'À AUJOURD'HUI
// =====================

// Calcul des dépenses classiques jusqu'à aujourd'hui
export function calculDepensesClassiquesJusquaAujourdhui() {
  return 0;
}

// Calcul des dépenses récurrentes jusqu'à aujourd'hui
export function calculDepensesRecurrentesJusquaAujourdhui() {
  return 0;
}

// Calcul des dépenses échelonnées jusqu'à aujourd'hui
export function calculDepensesEchelonneesJusquaAujourdhui() {
  return 0;
}

// Calcul des revenus classiques jusqu'à aujourd'hui
export function calculRevenusClassiquesJusquaAujourdhui() {
  return 0;
}

// Calcul des revenus récurrents jusqu'à aujourd'hui
export function calculRevenusRecurrentsJusquaAujourdhui() {
  return 0;
}

// Calcul des revenus échelonnés jusqu'à aujourd'hui
export function calculRevenusEchelonnesJusquaAujourdhui() {
  return 0;
}

// Calcul du total des revenus jusqu'à aujourd'hui
export function calculTotalRevenusJusquaAujourdhui() {
  return 0;
}

// Calcul du total des dépenses jusqu'à aujourd'hui
export function calculTotalDepensesJusquaAujourdhui() {
  return 0;
}

// Calcul des économies jusqu'à aujourd'hui
export function calculEconomiesJusquaAujourdhui() {
  return 0;
}

// =====================
// CALCULS DU MOIS PRÉCÉDENT
// =====================

// Calcul des dépenses classiques du mois précédent
export function calculDepensesClassiquesMoisPrecedent() {
  return 0;
}

// Calcul des dépenses récurrentes du mois précédent
export function calculDepensesRecurrentesMoisPrecedent() {
  return 0;
}

// Calcul des dépenses échelonnées du mois précédent
export function calculDepensesEchelonneesMoisPrecedent() {
  return 0;
}

// Calcul des revenus classiques du mois précédent
export function calculRevenusClassiquesMoisPrecedent() {
  return 0;
}

// Calcul des revenus récurrents du mois précédent
export function calculRevenusRecurrentsMoisPrecedent() {
  return 0;
}

// Calcul des revenus échelonnés du mois précédent
export function calculRevenusEchelonnesMoisPrecedent() {
  return 0;
}

// total calcul dépenses récurrentes du mois : [calculTotalDepensesRecurrentesMois]
export function calculTotalDepensesRecurrentesMois(
  paiementsRecurrents = [],
  date = new Date()
) {
  const dateObj = date instanceof Date ? date : new Date(date);

  const total = paiementsRecurrents
    .filter((p) => {
      if (!p || !p.jourPrelevement || !p.dateDebut) {
        return false;
      }

      const estDepense = p.type === "depense";
      const dateDebut = new Date(p.dateDebut + "-01");
      const estActif = dateDebut <= dateObj;

      return estDepense && estActif;
    })
    .reduce((acc, p) => {
      const montant = Math.abs(parseFloat(p.montant));
      return acc + montant;
    }, 0);

  return total;
}

// total calcul revenus récurrents du mois : [calculTotalRevenusRecurrentsMois]
export function calculTotalRevenusRecurrentsMois() {
  return 0;
}

/**
 * Formate un nombre avec 2 chiffres après la virgule
 * @param {number} montant - Le montant à formater
 * @returns {string} Le montant formaté avec 2 chiffres après la virgule
 */
export const formatMontant = (montant) => {
  return montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
