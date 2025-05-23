// Fichier central pour les fonctions de calcul du projet
// ------------------------------------------------------

// =====================
// DÉPENSES & REVENUS
// =====================

// total calcul depense par mois : [calculTotalDepensesMois]
export function calculTotalDepensesMois(
  transactions,
  paiementsRecurrents,
  paiementsEchelonnes,
  date = new Date()
) {
  const depensesMois = transactions
    .filter(
      (t) =>
        t.type === "depense" &&
        new Date(t.date).getFullYear() === date.getFullYear() &&
        new Date(t.date).getMonth() === date.getMonth()
    )
    .reduce((acc, t) => acc + parseFloat(t.montant), 0);

  const recurrentsMois = paiementsRecurrents
    .filter(
      (p) =>
        p.type === "depense" &&
        new Date(p.date).getFullYear() === date.getFullYear() &&
        new Date(p.date).getMonth() === date.getMonth()
    )
    .reduce((acc, p) => acc + parseFloat(p.montant), 0);

  const echelonnesMois = paiementsEchelonnes
    .filter((e) => e.type === "depense")
    .reduce((acc, e) => {
      const debutDate = new Date(e.debutDate);
      const debutYear = debutDate.getFullYear();
      const debutMonth = debutDate.getMonth();
      const nbMensualites = parseInt(e.mensualites, 10);
      const finDate = new Date(debutDate);
      finDate.setMonth(finDate.getMonth() + nbMensualites - 1);
      const finYear = finDate.getFullYear();
      const finMonth = finDate.getMonth();
      const current = date.getFullYear() * 12 + date.getMonth();
      const start = debutYear * 12 + debutMonth;
      const end = finYear * 12 + finMonth;
      if (current >= start && current <= end) {
        return acc + parseFloat(e.montant) / nbMensualites;
      }
      return acc;
    }, 0);

  return depensesMois + recurrentsMois + echelonnesMois;
}

// total calcul paiements récurrents du mois : [calculTotalRecurrentsMois]
export function calculTotalRecurrentsMois(paiementsRecurrents) {
  return paiementsRecurrents
    .filter((p) => p.type === "depense")
    .reduce((acc, p) => acc + parseFloat(p.montant), 0);
}

// total calcul paiements échelonnés du mois : [calculTotalEchelonnesMois]
export function calculTotalEchelonnesMois(
  paiementsEchelonnes,
  date = new Date()
) {
  return paiementsEchelonnes
    .filter((e) => e.type === "depense")
    .reduce((acc, e) => {
      const debutDate = new Date(e.debutDate);
      const finDate = new Date(debutDate);
      finDate.setMonth(finDate.getMonth() + parseInt(e.mensualites) - 1);
      const moisActuel = new Date(date.getFullYear(), date.getMonth(), 1);
      if (moisActuel >= debutDate && moisActuel <= finDate) {
        return acc + parseFloat(e.montant) / parseInt(e.mensualites);
      }
      return acc;
    }, 0);
}

// total calcul revenus (transactions + récurrents) : [calculTotalRevenus]
export function calculTotalRevenus(transactions, paiementsRecurrents) {
  const revenusTransactions = transactions
    .filter((t) => t.type === "revenu")
    .reduce((acc, t) => acc + parseFloat(t.montant), 0);
  const revenusRecurrents = paiementsRecurrents
    .filter((p) => p.type === "revenu")
    .reduce((acc, p) => acc + parseFloat(p.montant), 0);
  return revenusTransactions + revenusRecurrents;
}

// total calcul économies (revenus - dépenses) : [calculTotalEconomies]
export function calculTotalEconomies(totalRevenus, totalDepense) {
  return totalRevenus - totalDepense;
}

// =====================
// AGRÉGATIONS & GRAPHIQUES
// =====================

// calcul des dépenses par catégorie : [calculDepensesParCategorie]
export function calculDepensesParCategorie(transactions, CATEGORY_PALETTE) {
  const depenses = transactions.filter((t) => t.type === "depense");
  const categories = {};
  depenses.forEach((t) => {
    if (!categories[t.categorie]) categories[t.categorie] = 0;
    categories[t.categorie] += parseFloat(t.montant);
  });
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  return Object.entries(categories).map(([cat, value]) => ({
    name: cat,
    value,
    percent: total ? Math.round((value / total) * 100) : 0,
    color: CATEGORY_PALETTE[cat] || "#8884d8",
  }));
}

// calcul des données du bar chart (6 derniers mois) : [calculBarChartData]
export function calculBarChartData(
  transactions,
  paiementsRecurrents,
  paiementsEchelonnes
) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("fr-FR", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });
  return months.map(({ label, year, month }) => {
    const depensesMois = transactions
      .filter(
        (t) =>
          t.type === "depense" &&
          new Date(t.date).getFullYear() === year &&
          new Date(t.date).getMonth() === month
      )
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);
    const recurrentsMois = paiementsRecurrents
      .filter(
        (p) =>
          p.type === "depense" &&
          new Date(p.date).getFullYear() === year &&
          new Date(p.date).getMonth() === month
      )
      .reduce((acc, p) => acc + parseFloat(p.montant), 0);
    const echelonnesMois = paiementsEchelonnes
      .filter((e) => e.type === "depense")
      .reduce((acc, e) => {
        const debutDate = new Date(e.debutDate);
        const debutYear = debutDate.getFullYear();
        const debutMonth = debutDate.getMonth();
        const nbMensualites = parseInt(e.mensualites, 10);
        const finDate = new Date(debutDate);
        finDate.setMonth(finDate.getMonth() + nbMensualites - 1);
        const finYear = finDate.getFullYear();
        const finMonth = finDate.getMonth();
        const current = year * 12 + month;
        const start = debutYear * 12 + debutMonth;
        const end = finYear * 12 + finMonth;
        if (current >= start && current <= end) {
          return acc + parseFloat(e.montant) / nbMensualites;
        }
        return acc;
      }, 0);
    const depenses = depensesMois + recurrentsMois + echelonnesMois;
    const revenus = transactions
      .filter(
        (t) =>
          t.type === "revenu" &&
          new Date(t.date).getFullYear() === year &&
          new Date(t.date).getMonth() === month
      )
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);
    return {
      mois: label.charAt(0).toUpperCase() + label.slice(1),
      depenses,
      revenus,
    };
  });
}

// =====================
// AUTRES CALCULS À VENIR
// =====================
// Ajoute ici d'autres helpers métiers, statistiques, etc.

// =====================
// DÉPENSES & REVENUS PAR MOIS (SÉPARÉS)
// =====================

// total des dépenses (transactions uniquement) pour un mois donné : [totalDepensesMois]
export function totalDepensesMois(transactions, date = new Date()) {
  return transactions
    .filter(
      (t) =>
        t.type === "depense" &&
        new Date(t.date).getFullYear() === date.getFullYear() &&
        new Date(t.date).getMonth() === date.getMonth()
    )
    .reduce((acc, t) => acc + parseFloat(t.montant), 0);
}

// total des revenus (transactions uniquement) pour un mois donné : [totalRevenusMois]
export function totalRevenusMois(transactions, date = new Date()) {
  return transactions
    .filter(
      (t) =>
        t.type === "revenu" &&
        new Date(t.date).getFullYear() === date.getFullYear() &&
        new Date(t.date).getMonth() === date.getMonth()
    )
    .reduce((acc, t) => acc + parseFloat(t.montant), 0);
}

// total des paiements récurrents pour un mois donné : [totalRecurrentsMois]
export function totalRecurrentsMois(paiementsRecurrents, date = new Date()) {
  return paiementsRecurrents
    .filter(
      (p) =>
        new Date(p.date).getFullYear() === date.getFullYear() &&
        new Date(p.date).getMonth() === date.getMonth()
    )
    .reduce((acc, p) => acc + parseFloat(p.montant), 0);
}

// total des paiements échelonnés pour un mois donné (mensualité due) : [totalEchelonnesMois]
export function totalEchelonnesMois(paiementsEchelonnes, date = new Date()) {
  return paiementsEchelonnes.reduce((acc, e) => {
    const debutDate = new Date(e.debutDate);
    const nbMensualites = parseInt(e.mensualites, 10);
    const finDate = new Date(debutDate);
    finDate.setMonth(finDate.getMonth() + nbMensualites - 1);
    const current = date.getFullYear() * 12 + date.getMonth();
    const start = debutDate.getFullYear() * 12 + debutDate.getMonth();
    const end = finDate.getFullYear() * 12 + finDate.getMonth();
    if (current >= start && current <= end) {
      return acc + parseFloat(e.montant) / nbMensualites;
    }
    return acc;
  }, 0);
}

// total général des dépenses (transactions + récurrents + échelonnés) pour un mois donné : [totalDepensesGlobalesMois]
export function totalDepensesGlobalesMois(
  transactions,
  paiementsRecurrents,
  paiementsEchelonnes,
  date = new Date()
) {
  return (
    totalDepensesMois(transactions, date) +
    totalRecurrentsMois(paiementsRecurrents, date) +
    totalEchelonnesMois(paiementsEchelonnes, date)
  );
}

// total général des revenus (transactions + récurrents) pour un mois donné : [totalRevenusGlobalMois]
export function totalRevenusGlobalMois(
  transactions,
  paiementsRecurrents,
  date = new Date()
) {
  return (
    totalRevenusMois(transactions, date) +
    totalRecurrentsMois(
      paiementsRecurrents.filter((p) => p.type === "revenu"),
      date
    )
  );
}
