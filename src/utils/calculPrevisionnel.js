// calculPrevisionnel.js
// Ce fichier regroupe toutes les fonctions de calcul prévisionnel et de solde du mois précédent pour le dashboard budget.
// Il centralise la logique de calcul pour garantir la cohérence entre l'affichage, les tooltips et l'injection de la carte "Solde mois précédent".

// À compléter avec les fonctions extraites de fakeData.js

// Revenus classiques du mois
export function calculRevenusClassiquesTotal(depenseRevenu, date) {
  if (!depenseRevenu || !Array.isArray(depenseRevenu)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  return depenseRevenu
    .filter((d) => {
      const dDate = new Date(d.date);
      return (
        d.type === "revenu" &&
        dDate.getMonth() === dateObj.getMonth() &&
        dDate.getFullYear() === dateObj.getFullYear()
      );
    })
    .reduce((acc, d) => acc + Number(d.montant), 0);
}

// Revenus récurrents du mois
export function calculRevenusRecurrentsTotal(paiementsRecurrents, date) {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth() + 1;
  const annee = dateObj.getFullYear();
  const dernierJourDuMois = new Date(annee, mois, 0).getDate();
  return paiementsRecurrents
    .filter(
      (p) => p.type === "revenu" && p.jourPrelevement <= dernierJourDuMois
    )
    .reduce((acc, p) => acc + Number(p.montant), 0);
}

// Revenus échelonnés du mois
export function calculRevenusEchelonnesTotal(paiementsEchelonnes, date) {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    return 0;
  }
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  let total = 0;

  paiementsEchelonnes.forEach((p) => {
    if (p.type !== "credit") {
      return;
    }

    if (!p.debutDate || !p.mensualites) {
      return;
    }

    const dateDebut = new Date(p.debutDate);
    for (let i = 0; i < Number(p.mensualites); i++) {
      const dateMensualite = new Date(dateDebut);
      dateMensualite.setMonth(dateDebut.getMonth() + i);

      if (
        dateMensualite.getMonth() === mois &&
        dateMensualite.getFullYear() === annee
      ) {
        const mensualite = Number(p.montant) / Number(p.mensualites);
        total += Math.abs(mensualite);
      }
    }
  });

  return total;
}

// Dépenses classiques du mois
export function calculDepensesClassiquesTotal(depenseRevenu, date) {
  if (!depenseRevenu || !Array.isArray(depenseRevenu)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  return depenseRevenu
    .filter((d) => {
      const dDate = new Date(d.date);
      return (
        d.type === "depense" &&
        dDate.getMonth() === dateObj.getMonth() &&
        dDate.getFullYear() === dateObj.getFullYear()
      );
    })
    .reduce((acc, d) => acc + Number(d.montant), 0);
}

// Dépenses récurrentes du mois
export function calculDepensesRecurrentesTotal(paiementsRecurrents, date) {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth() + 1;
  const annee = dateObj.getFullYear();
  const dernierJourDuMois = new Date(annee, mois, 0).getDate();
  return paiementsRecurrents
    .filter(
      (p) => p.type === "depense" && p.jourPrelevement <= dernierJourDuMois
    )
    .reduce((acc, p) => acc + Number(p.montant), 0);
}

// Dépenses échelonnées du mois
export function calculDepensesEchelonneesTotal(paiementsEchelonnes, date) {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  let total = 0;
  paiementsEchelonnes.forEach((p) => {
    if (!p || !p.debutDate || !p.mensualites) return;
    if (p.type !== "credit") return;
    const dateDebut = new Date(p.debutDate);
    for (let i = 0; i < Number(p.mensualites); i++) {
      const dateMensualite = new Date(dateDebut);
      dateMensualite.setMonth(dateDebut.getMonth() + i);
      if (
        dateMensualite.getMonth() === mois &&
        dateMensualite.getFullYear() === annee
      ) {
        const mensualite = Number(p.montant) / Number(p.mensualites);
        total += Math.abs(mensualite);
      }
    }
  });
  return total;
}
