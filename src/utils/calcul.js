// Fichier central pour les fonctions de calcul du projet
// ------------------------------------------------------

// =====================
// DÉPENSES & REVENUS
// =====================

// total calcul depense par mois : [calculTotalDepensesMois]
export function calculTotalDepensesMois(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes,
  date = new Date()
) {
  // Dépenses du mois
  const depensesMois = depenseRevenu
    .filter(
      (d) =>
        d.type === "depense" &&
        new Date(d.date).getFullYear() === date.getFullYear() &&
        new Date(d.date).getMonth() === date.getMonth()
    )
    .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant)), 0);

  // Paiements récurrents du mois
  const recurrentsMois = paiementsRecurrents
    .filter((p) => {
      if (p.type !== "depense") return false;
      const jourPrelevement = p.jourPrelevement;
      const jourActuel = date.getDate();
      return jourPrelevement <= jourActuel;
    })
    .reduce((acc, p) => acc + Math.abs(parseFloat(p.montant)), 0);

  // Paiements échelonnés du mois
  const echelonnesMois = paiementsEchelonnes
    .filter((e) => e.type === "depense")
    .reduce((acc, e) => {
      const debutDate = new Date(e.debutDate);
      const finDate = new Date(debutDate);
      finDate.setMonth(finDate.getMonth() + parseInt(e.mensualites) - 1);

      const moisActuel = new Date(date.getFullYear(), date.getMonth(), 1);
      const moisFin = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      if (moisActuel <= finDate && moisFin >= debutDate) {
        return acc + Math.abs(parseFloat(e.montant)) / parseInt(e.mensualites);
      }
      return acc;
    }, 0);

  return depensesMois + recurrentsMois + echelonnesMois;
}

// total calcul revenus récurrents du mois : [calculTotalRevenusRecurrentsMois]
export function calculTotalRevenusRecurrentsMois(paiements, date) {
  return paiements
    .filter((p) => p.type === "revenu")
    .reduce((total, p) => total + p.montant, 0);
}

// total calcul dépenses récurrentes du mois : [calculTotalDepensesRecurrentesMois]
export function calculTotalDepensesRecurrentesMois(paiements, date) {
  return paiements
    .filter((p) => p.type === "depense")
    .reduce((total, p) => total + p.montant, 0);
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

      // Vérifie si le mois actuel est dans la période de paiement
      const moisActuel = new Date(date.getFullYear(), date.getMonth(), 1);
      const moisFin = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      if (moisActuel <= finDate && moisFin >= debutDate) {
        // On ajoute la mensualité si on est dans la période
        return acc + Math.abs(parseFloat(e.montant)) / parseInt(e.mensualites);
      }
      return acc;
    }, 0);
}

// total calcul paiements récurrents du mois : [calculTotalRecurrentsMois]
export function calculTotalRecurrentsMois(paiements, date = new Date()) {
  return paiements
    .filter((p) => {
      // On ne garde que les dépenses récurrentes
      if (p.type !== "depense") return false;
      // On vérifie si le jour de prélèvement correspond au jour actuel ou est déjà passé
      const jourPrelevement = p.jourPrelevement;
      const jourActuel = date.getDate();
      return jourPrelevement <= jourActuel;
    })
    .reduce((total, p) => total + Math.abs(p.montant), 0);
}

// total calcul économies (revenus - dépenses) : [calculEconomies]
export function calculEconomies(totalRevenus, totalDepense) {
  return totalRevenus - totalDepense;
}

// =====================
// AGRÉGATIONS & GRAPHIQUES
// =====================

// calcul des dépenses par catégorie : [calculDepensesParCategorie]
export function calculDepensesParCategorie(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes,
  CATEGORY_PALETTE,
  date = new Date()
) {
  // Filtrer les dépenses du mois en cours
  const depensesMois = depenseRevenu.filter(
    (d) =>
      d.type === "depense" &&
      new Date(d.date).getFullYear() === date.getFullYear() &&
      new Date(d.date).getMonth() === date.getMonth()
  );

  // Filtrer les paiements récurrents du mois en cours
  const recurrentsMois = paiementsRecurrents.filter(
    (p) =>
      p.type === "depense" &&
      new Date(p.date).getFullYear() === date.getFullYear() &&
      new Date(p.date).getMonth() === date.getMonth()
  );

  // Filtrer les paiements échelonnés du mois en cours
  const echelonnesMois = paiementsEchelonnes.filter((e) => {
    if (e.type !== "depense") return false;
    const debutDate = new Date(e.debutDate);
    const finDate = new Date(debutDate);
    finDate.setMonth(finDate.getMonth() + parseInt(e.mensualites) - 1);
    const moisActuel = new Date(date.getFullYear(), date.getMonth(), 1);
    const moisFin = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return moisActuel <= finDate && moisFin >= debutDate;
  });

  // Fusionner toutes les dépenses
  const toutesDepenses = [
    ...depensesMois,
    ...recurrentsMois,
    ...echelonnesMois.map((e) => ({
      ...e,
      montant: Math.abs(parseFloat(e.montant)) / parseInt(e.mensualites),
    })),
  ];

  // Calculer le total par catégorie
  const categories = {};
  toutesDepenses.forEach((d) => {
    if (!categories[d.categorie]) categories[d.categorie] = 0;
    categories[d.categorie] += Math.abs(parseFloat(d.montant));
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
  depenseRevenu,
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
    const depensesMois = depenseRevenu
      .filter(
        (d) =>
          d.type === "depense" &&
          new Date(d.date).getFullYear() === year &&
          new Date(d.date).getMonth() === month
      )
      .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant)), 0);
    const recurrentsMois = paiementsRecurrents
      .filter(
        (p) =>
          p.type === "depense" &&
          new Date(p.date).getFullYear() === year &&
          new Date(p.date).getMonth() === month
      )
      .reduce((acc, p) => acc + Math.abs(parseFloat(p.montant)), 0);
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
          return acc + Math.abs(parseFloat(e.montant)) / nbMensualites;
        }
        return acc;
      }, 0);
    const depenses = depensesMois + recurrentsMois + echelonnesMois;
    const revenus = depenseRevenu
      .filter(
        (d) =>
          d.type === "revenu" &&
          new Date(d.date).getFullYear() === year &&
          new Date(d.date).getMonth() === month
      )
      .reduce((acc, d) => acc + parseFloat(d.montant), 0);
    return {
      mois: label.charAt(0).toUpperCase() + label.slice(1),
      depenses,
      revenus,
    };
  });
}

// =====================
// DÉPENSES & REVENUS PAR MOIS (SÉPARÉS)
// =====================

// total des dépenses (depense&revenu uniquement) pour un mois donné : [totalDepensesMois]
export function totalDepensesMois(depenseRevenu, date = new Date()) {
  return depenseRevenu
    .filter(
      (d) =>
        d.type === "depense" &&
        new Date(d.date).getFullYear() === date.getFullYear() &&
        new Date(d.date).getMonth() === date.getMonth()
    )
    .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant)), 0);
}

// total des revenus (depense&revenu uniquement) pour un mois donné : [totalRevenusMois]
export function totalRevenusMois(depenseRevenu, date = new Date()) {
  return depenseRevenu
    .filter(
      (d) =>
        d.type === "revenu" &&
        new Date(d.date).getFullYear() === date.getFullYear() &&
        new Date(d.date).getMonth() === date.getMonth()
    )
    .reduce((acc, d) => acc + parseFloat(d.montant), 0);
}

// total des paiements récurrents pour un mois donné : [totalRecurrentsMois]
export function totalRecurrentsMois(paiementsRecurrents, date = new Date()) {
  return paiementsRecurrents
    .filter(
      (p) =>
        new Date(p.date).getFullYear() === date.getFullYear() &&
        new Date(p.date).getMonth() === date.getMonth()
    )
    .reduce((acc, p) => acc + Math.abs(parseFloat(p.montant)), 0);
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
      return acc + Math.abs(parseFloat(e.montant)) / nbMensualites;
    }
    return acc;
  }, 0);
}

// total général des revenus (depense&revenu + récurrents + échelonnés) pour un mois donné : [totalRevenusGlobalMois]
export function totalRevenusGlobalMois(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes = [],
  date = new Date()
) {
  return (
    totalRevenusMois(depenseRevenu, date) +
    totalRecurrentsMois(
      paiementsRecurrents.filter((p) => p.type === "revenu"),
      date
    ) +
    totalEchelonnesMois(
      paiementsEchelonnes.filter((e) => e.type === "revenu"),
      date
    )
  );
}

// =====================
// CALCULS DE DIFFÉRENCE
// =====================

// Calcul de la différence des dépenses entre le mois actuel et le mois précédent
export function calculDifferenceDepensesMoisPrecedent(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes,
  date = new Date()
) {
  // Calcul des dépenses du mois actuel
  const depensesMoisActuel = calculTotalDepensesMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    date
  );

  // Calcul des dépenses du mois précédent
  const dateMoisPrecedent = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  );
  const depensesMoisPrecedent = calculTotalDepensesMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    dateMoisPrecedent
  );

  // Calcul de la différence
  return depensesMoisActuel - depensesMoisPrecedent;
}

// Calcul des revenus du mois précédent
export function calculRevenusMoisPrecedent(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes,
  date = new Date()
) {
  const dateMoisPrecedent = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  );

  return totalRevenusGlobalMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    dateMoisPrecedent
  );
}

// Calcul de la différence des économies entre le mois actuel et le mois précédent
export function calculDifferenceEconomiesMoisPrecedent(
  depenseRevenu,
  paiementsRecurrents,
  paiementsEchelonnes,
  totalRevenus,
  totalDepense,
  date = new Date()
) {
  const economieMoisActuel = calculEconomies(totalRevenus, totalDepense);
  const economieMoisPrecedent = calculEconomies(
    calculRevenusMoisPrecedent(
      depenseRevenu,
      paiementsRecurrents,
      paiementsEchelonnes,
      date
    ),
    calculTotalDepensesMois(
      depenseRevenu,
      paiementsRecurrents,
      paiementsEchelonnes,
      new Date(date.getFullYear(), date.getMonth() - 1, 1)
    )
  );
  return economieMoisActuel - economieMoisPrecedent;
}
