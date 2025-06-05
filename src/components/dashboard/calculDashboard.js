/**
 * @file calculDashboard.js
 * @description Fonctions de calcul spécifiques au dashboard
 */

import { formatMontant } from "../../utils/calcul";

// Calcul du total des dépenses récurrentes du mois (jusqu'à aujourd'hui)
export const calculDepensesRecurrentesJusquaAujourdhui = (
  paiementsRecurrents,
  date
) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) {
    console.log(
      "[calculDepensesRecurrentesJusquaAujourdhui] Aucun paiement récurrent trouvé"
    );
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
  console.log(
    `[calculDepensesRecurrentesJusquaAujourdhui] Paiements filtrés:`,
    filtered
  );
  console.log(
    `[calculDepensesRecurrentesJusquaAujourdhui] Total: ${formatMontant(
      total
    )}€ (jourActuel: ${jourActuel})`
  );
  return total;
};

// Calcul du total des dépenses récurrentes du mois (total)
export const calculDepensesRecurrentesTotal = (paiementsRecurrents, date) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) {
    console.log(
      "[calculDepensesRecurrentesTotal] Aucun paiement récurrent trouvé"
    );
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
  console.log(`[calculDepensesRecurrentesTotal] Paiements filtrés:`, filtered);
  console.log(
    `[calculDepensesRecurrentesTotal] Total: ${formatMontant(
      total
    )}€ (dernierJourDuMois: ${dernierJourDuMois})`
  );
  return total;
};

// Calcul du total des dépenses échelonnées du mois (jusqu'à aujourd'hui)
export const calculDepensesEchelonneesJusquaAujourdhui = (
  paiementsEchelonnes,
  date
) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    console.log(
      "[calculDepensesEchelonneesJusquaAujourdhui] Aucun paiement échelonné trouvé"
    );
    return 0;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();

  const filtered = paiementsEchelonnes.filter((p) => {
    if (!p || !p.debutDate || !p.mensualites) return false;
    if (p.type !== "depense") return false;

    const dateDebut = new Date(p.debutDate);
    const dateFin = new Date(dateDebut);
    dateFin.setMonth(dateFin.getMonth() + Number(p.mensualites) - 1);

    return dateObj >= dateDebut && dateObj <= dateFin;
  });
  const total = filtered.reduce((total, p) => {
    const mensualite = Number(p.montant) / Number(p.mensualites);
    return total + Math.abs(mensualite);
  }, 0);
  console.log(
    `[calculDepensesEchelonneesJusquaAujourdhui] Paiements filtrés:`,
    filtered
  );
  console.log(
    `[calculDepensesEchelonneesJusquaAujourdhui] Total: ${formatMontant(
      total
    )}€`
  );
  return total;
};

// Calcul du total des dépenses échelonnées du mois (total)
export const calculDepensesEchelonneesTotal = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    console.log(
      "[calculDepensesEchelonneesTotal] Aucun paiement échelonné trouvé"
    );
    return 0;
  }
  console.log(
    "[calculDepensesEchelonneesTotal] Tous les paiements reçus :",
    paiementsEchelonnes
  );
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  let total = 0;
  let mensualitesComptabilisees = [];
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
        mensualitesComptabilisees.push({
          nom: p.nom,
          date: dateMensualite.toISOString().slice(0, 10),
          montant: mensualite,
        });
      }
    }
  });
  console.log(
    "[calculDepensesEchelonneesTotal] Mensualités comptabilisées :",
    mensualitesComptabilisees
  );
  console.log(
    `[calculDepensesEchelonneesTotal] Total: ${formatMontant(total)}€`
  );
  return total;
};

// Calcul du total des dépenses classiques du mois (jusqu'à aujourd'hui)
export const calculDepensesClassiquesJusquaAujourdhui = (depenses, date) => {
  if (!depenses || !Array.isArray(depenses)) {
    console.log(
      "[calculDepensesClassiquesJusquaAujourdhui] Aucune dépense trouvée"
    );
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
  console.log(
    `[calculDepensesClassiquesJusquaAujourdhui] Dépenses filtrées:`,
    filtered
  );
  console.log(
    `[calculDepensesClassiquesJusquaAujourdhui] Total: ${formatMontant(
      total
    )}€ (jourActuel: ${jourActuel})`
  );
  return total;
};

// Calcul du total des dépenses classiques du mois (total)
export const calculDepensesClassiquesTotal = (depenses, date) => {
  if (!depenses || !Array.isArray(depenses)) {
    console.log("[calculDepensesClassiquesTotal] Aucune dépense trouvée");
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
  console.log(`[calculDepensesClassiquesTotal] Dépenses filtrées:`, filtered);
  console.log(
    `[calculDepensesClassiquesTotal] Total: ${formatMontant(total)}€`
  );
  return total;
};

// =====================
// CALCULS GÉNÉRAUX
// =====================

// Calcule les économies (revenus - dépenses)
export const calculEconomies = (totalRevenus, totalDepenses) => {
  const economie = totalRevenus - totalDepenses;
  console.log(
    `[calculEconomies] Économies calculées: ${formatMontant(
      economie
    )}€ (Revenus: ${formatMontant(totalRevenus)}€ - Dépenses: ${formatMontant(
      totalDepenses
    )}€)`
  );
  return economie;
};

// Calcule le total des dépenses par catégorie
export function calculDepensesParCategorie() {
  return [];
}
