/**
 * @file calculDashboard.js
 * @description Fonctions de calcul spécifiques au dashboard
 */

// Calcul du total des dépenses récurrentes du mois (jusqu'à aujourd'hui)
export const calculDepensesRecurrentesJusquaAujourdhui = (
  paiementsRecurrents,
  date
) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) {
    return 0;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const jourActuel = dateObj.getDate();

  const filtered = paiementsRecurrents.filter((p) => {
    if (!p || !p.jourPrelevement) return false;
    if (p.type !== "depense") return false;
    return parseInt(p.jourPrelevement) <= jourActuel;
  });
  const total = filtered.reduce(
    (total, p) => total + Math.abs(parseFloat(p.montant || 0)),
    0
  );

  return total;
};

// Calcul du total des dépenses récurrentes du mois (total)
export const calculDepensesRecurrentesTotal = (paiementsRecurrents, date) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) {
    return 0;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  const dernierJourDuMois = new Date(annee, mois + 1, 0).getDate();

  const filtered = paiementsRecurrents.filter((p) => {
    if (!p || !p.jourPrelevement) return false;
    if (p.type !== "depense") return false;
    const jour = parseInt(p.jourPrelevement, 10);
    return jour >= 1 && jour <= dernierJourDuMois;
  });
  const total = filtered.reduce(
    (total, p) => total + Math.abs(parseFloat(p.montant || 0)),
    0
  );

  return total;
};

// Calcul du total des dépenses échelonnées du mois (jusqu'à aujourd'hui)
export const calculDepensesEchelonneesJusquaAujourdhui = (
  paiementsEchelonnes,
  date
) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    return 0;
  }

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
        dateMensualite.getFullYear() === annee &&
        dateMensualite <= dateObj
      ) {
        const mensualite = Number(p.montant) / Number(p.mensualites);
        total += Math.abs(mensualite);
      }
    }
  });

  return total;
};

// Calcul du total des dépenses échelonnées du mois (total)
export const calculDepensesEchelonneesTotal = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    return 0;
  }

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
};

// Calcul du total des dépenses classiques du mois (jusqu'à aujourd'hui)
export const calculDepensesClassiquesJusquaAujourdhui = (depenses, date) => {
  if (!depenses || !Array.isArray(depenses)) {
    return 0;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const jourActuel = dateObj.getDate();

  const filtered = depenses.filter((d) => {
    if (!d || !d.date) return false;
    if (d.type !== "depense") return false;
    const dateDepense = new Date(d.date);
    return (
      dateDepense.getMonth() === dateObj.getMonth() &&
      dateDepense.getFullYear() === dateObj.getFullYear() &&
      dateDepense.getDate() <= jourActuel
    );
  });
  const total = filtered.reduce(
    (total, d) => total + Math.abs(parseFloat(d.montant || 0)),
    0
  );

  return total;
};

// Calcul du total des dépenses classiques du mois (total)
export const calculDepensesClassiquesTotal = (depenses, date) => {
  if (!depenses || !Array.isArray(depenses)) {
    return 0;
  }
  const dateObj = date instanceof Date ? date : new Date(date);
  const filtered = depenses.filter((d) => {
    if (!d || !d.date) return false;
    if (d.type !== "depense") return false;
    const dateDepense = new Date(d.date);
    return (
      dateDepense.getMonth() === dateObj.getMonth() &&
      dateDepense.getFullYear() === dateObj.getFullYear()
    );
  });
  const total = filtered.reduce(
    (total, d) => total + Math.abs(parseFloat(d.montant || 0)),
    0
  );

  return total;
};

// =====================
// CALCULS GÉNÉRAUX
// =====================

// Calcule les économies (revenus - dépenses)
export const calculEconomies = (totalRevenus, totalDepenses) => {
  const economie = totalRevenus - totalDepenses;

  return economie;
};

// Calcule le total des dépenses par catégorie
export function calculDepensesParCategorie() {
  return [];
}

// REVENUS CLASSIQUES
export const calculRevenusClassiquesJusquaAujourdhui = (revenus, date) => {
  if (!revenus || !Array.isArray(revenus)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const jourActuel = dateObj.getDate();
  return revenus
    .filter(
      (r) =>
        r.type === "revenu" &&
        new Date(r.date).getMonth() === dateObj.getMonth() &&
        new Date(r.date).getFullYear() === dateObj.getFullYear() &&
        new Date(r.date).getDate() <= jourActuel
    )
    .reduce((acc, r) => acc + Math.abs(parseFloat(r.montant || 0)), 0);
};
export const calculRevenusClassiquesTotal = (revenus, date) => {
  if (!revenus || !Array.isArray(revenus)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const revenusFiltres = revenus.filter(
    (r) =>
      r.type === "revenu" &&
      new Date(r.date).getMonth() === dateObj.getMonth() &&
      new Date(r.date).getFullYear() === dateObj.getFullYear()
  );
  return revenusFiltres.reduce(
    (acc, r) => acc + Math.abs(parseFloat(r.montant || 0)),
    0
  );
};
// REVENUS RECCURENTS
export const calculRevenusRecurrentsJusquaAujourdhui = (
  paiementsRecurrents,
  date
) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const jourActuel = dateObj.getDate();
  return paiementsRecurrents
    .filter(
      (p) => p.type === "revenu" && parseInt(p.jourPrelevement) <= jourActuel
    )
    .reduce((acc, p) => acc + Math.abs(parseFloat(p.montant || 0)), 0);
};
export const calculRevenusRecurrentsTotal = (paiementsRecurrents, date) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) return 0;
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  const dernierJourDuMois = new Date(annee, mois + 1, 0).getDate();
  const revenusFiltres = paiementsRecurrents.filter(
    (p) =>
      p.type === "revenu" &&
      parseInt(p.jourPrelevement) >= 1 &&
      parseInt(p.jourPrelevement) <= dernierJourDuMois
  );
  return revenusFiltres.reduce(
    (acc, p) => acc + Math.abs(parseFloat(p.montant || 0)),
    0
  );
};
// REVENUS ECHELONNES
export const calculRevenusEchelonnesJusquaAujourdhui = (
  paiementsEchelonnes,
  date
) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) return 0;

  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  let total = 0;

  paiementsEchelonnes.forEach((p) => {
    if (!p || !p.debutDate || !p.mensualites) return;
    if (p.type !== "debit") return;
    const dateDebut = new Date(p.debutDate);
    for (let i = 0; i < Number(p.mensualites); i++) {
      const dateMensualite = new Date(dateDebut);
      dateMensualite.setMonth(dateDebut.getMonth() + i);
      if (
        dateMensualite.getMonth() === mois &&
        dateMensualite.getFullYear() === annee &&
        dateMensualite <= dateObj
      ) {
        const mensualite = Number(p.montant) / Number(p.mensualites);
        total += Math.abs(mensualite);
      }
    }
  });

  return total;
};
export const calculRevenusEchelonnesTotal = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) return 0;

  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  let total = 0;

  paiementsEchelonnes.forEach((p) => {
    if (!p || !p.debutDate || !p.mensualites) return;
    if (p.type !== "debit") return;
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
};
