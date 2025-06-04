// Fichier central pour les fonctions de calcul du projet
// ------------------------------------------------------
// ONGLETS :
// =====================
// DÉPENSES & REVENUS
// =====================

/**
 * Calcule le total des dépenses et revenus
 * @param {Array} depenseRevenu - Tableau de dépenses et revenus
 * @param {boolean} isDepense - Si true, calcule le montant en valeur absolue
 * @returns {number} - Total des dépenses et revenus
 */
export const calculateDepenseRevenuTotal = (
  depenseRevenu,
  isDepense = false
) => {
  return depenseRevenu.reduce(
    (acc, t) => acc + (isDepense ? Math.abs(t.montant || 0) : t.montant || 0),
    0
  );
};

/**
 * Calcule le total des dépenses du mois
 * @param {Array} depenseRevenu - Tableau de dépenses et revenus
 * @param {Date} date - Date de référence
 * @returns {number} - Total des dépenses du mois
 */
export function calculTotalDepensesMois(depenseRevenu, date = new Date()) {
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
    .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant)), 0);
}

/**
 * Calcule le total des revenus du mois
 * @param {Array} depenseRevenu - Tableau de dépenses et revenus
 * @param {Date} date - Date de référence
 * @returns {number} - Total des revenus du mois
 */
export function totalRevenusGlobalMois(depenseRevenu, date = new Date()) {
  if (!depenseRevenu || !Array.isArray(depenseRevenu)) {
    return 0;
  }

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
    .reduce((acc, d) => acc + parseFloat(d.montant), 0);
}

/**
 * Calcule les économies (revenus - dépenses)
 * @param {number} revenus - Total des revenus
 * @param {number} depenses - Total des dépenses
 * @returns {number} - Montant des économies
 */
export function calculEconomies(revenus, depenses) {
  return revenus - depenses;
}

// =====================
// RÉCURRENTS
// =====================

/**
 * Calcule le total des paiements récurrents du mois
 * @param {Array} paiementsRecurrents - Tableau des paiements récurrents
 * @param {Date} date - Date de référence
 * @returns {number} - Total des paiements récurrents du mois
 */
export function calculTotalRecurrentsMois(
  paiementsRecurrents = [],
  date = new Date()
) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  const total = paiementsRecurrents
    .filter((p) => {
      if (!p || !p.jourPrelevement || !p.dateDebut) {
        return false;
      }

      const estDepense = p.type === "depense";
      const dateDebut = new Date(p.dateDebut + "-01");
      const jourPrelevement = parseInt(p.jourPrelevement);

      // Vérifie si le paiement est actif pour ce mois
      const estActif = dateDebut <= dateObj;

      // Vérifie si le jour de prélèvement est dans le mois en cours
      const dernierJourDuMois = new Date(annee, mois + 1, 0).getDate();
      const estDansMoisCourant = jourPrelevement <= dernierJourDuMois;

      const estValide = estDepense && estActif && estDansMoisCourant;

      return estValide;
    })
    .reduce((acc, p) => {
      const montant = Math.abs(parseFloat(p.montant));
      return acc + montant;
    }, 0);

  return total;
}

/**
 * Calcule le total des dépenses récurrentes du mois
 * @param {Array} paiementsRecurrents - Tableau des paiements récurrents
 * @param {Date} date - Date de référence
 * @returns {number} - Total des dépenses récurrentes du mois
 */
export const calculTotalDepensesRecurrentesMois = (
  paiementsRecurrents,
  date
) => {
  if (!paiementsRecurrents || !date) return 0;

  const dateObj = new Date(date);
  const mois = dateObj.getMonth() + 1;
  const annee = dateObj.getFullYear();
  const dernierJourDuMois = new Date(annee, mois, 0).getDate();

  const total = paiementsRecurrents
    .filter((p) => {
      if (!p || !p.jourPrelevement) {
        return false;
      }
      if (p.type !== "depense") {
        return false;
      }

      // Vérifie uniquement si le jour de prélèvement est valide pour ce mois
      return p.jourPrelevement <= dernierJourDuMois;
    })
    .reduce((total, p) => total + Math.abs(parseFloat(p.montant)), 0);

  return total;
};

/**
 * Calcule le total des revenus récurrents du mois
 * @param {Array} paiementsRecurrents - Tableau des paiements récurrents
 * @param {Date} date - Date de référence
 * @returns {number} - Total des revenus récurrents du mois
 */
export const calculTotalRevenusRecurrentsMois = (paiementsRecurrents, date) => {
  if (!paiementsRecurrents || !date) return 0;

  const dateObj = new Date(date);
  const mois = dateObj.getMonth() + 1;
  const annee = dateObj.getFullYear();
  const dernierJourDuMois = new Date(annee, mois, 0).getDate();

  const total = paiementsRecurrents
    .filter((p) => {
      if (!p || !p.jourPrelevement) {
        return false;
      }
      if (p.type !== "revenu") {
        return false;
      }

      // Vérifie uniquement si le jour de prélèvement est valide pour ce mois
      return p.jourPrelevement <= dernierJourDuMois;
    })
    .reduce((total, p) => total + parseFloat(p.montant), 0);

  return total;
};

// =====================
// ÉCHELONNÉS
// =====================

/**
 * Calcule le total des paiements échelonnés du mois
 * @param {Array} paiementsEchelonnes - Tableau des paiements échelonnés
 * @param {Date} date - Date de référence
 * @returns {number} - Total des paiements échelonnés du mois
 */
export const calculTotalEchelonnesMois = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !date) return 0;

  const dateObj = new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();

  return paiementsEchelonnes
    .filter((p) => {
      if (!p || !p.debutDate || !p.mensualites) return false;

      const dateDebut = new Date(p.debutDate);
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + Number(p.mensualites) - 1);

      // Vérifie si le mois actuel est dans la période de paiement
      const dateActuelle = new Date(annee, mois);
      return dateActuelle >= dateDebut && dateActuelle <= dateFin;
    })
    .reduce((total, p) => {
      // Calcule le montant mensuel (montant total divisé par le nombre de mensualités)
      const montantMensuel = Number(p.montant) / Number(p.mensualites);
      return total + montantMensuel;
    }, 0);
};

/**
 * Calcule le total des dépenses échelonnées du mois
 * @param {Array} paiementsEchelonnes - Tableau des paiements échelonnés
 * @param {Date} date - Date de référence
 * @returns {number} - Total des dépenses échelonnées du mois
 */
export const calculTotalDepensesEchelonneesMois = (
  paiementsEchelonnes,
  date
) => {
  // Vérification des paramètres
  if (!paiementsEchelonnes?.length || !date) {
    return { credits: 0, debits: 0 };
  }

  // Initialisation des variables
  const dateObj = new Date(date);
  const mois = dateObj.getMonth() + 1;
  const annee = dateObj.getFullYear();
  const dateActuelle = new Date(annee, mois - 1);
  const dateActuelleFin = new Date(annee, mois, 0);

  // Calcul des totaux par type
  const { credits, debits } = paiementsEchelonnes.reduce(
    (acc, p) => {
      if (!p.debutDate || !p.mensualites || !p.montant) return acc;

      const dateDebut = new Date(p.debutDate);
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + Number(p.mensualites) - 1);

      // Vérifie si le paiement est actif pour ce mois
      const estActif =
        // Commence ce mois-ci
        (dateDebut.getMonth() === dateActuelle.getMonth() &&
          dateDebut.getFullYear() === dateActuelle.getFullYear()) ||
        // Se termine ce mois-ci
        (dateFin.getMonth() === dateActuelle.getMonth() &&
          dateFin.getFullYear() === dateActuelle.getFullYear()) ||
        // Est en cours ce mois-ci
        (dateActuelle <= dateFin && dateActuelleFin >= dateDebut);

      if (estActif) {
        const mensualite = Number(p.montant) / Number(p.mensualites);
        if (p.type === "credit") {
          acc.credits += mensualite;
        } else if (p.type === "debit") {
          acc.debits += mensualite;
        }
      }

      return acc;
    },
    { credits: 0, debits: 0 }
  );

  return { credits, debits };
};

// =====================
// DASHBOARD
// =====================

/**
 * Calcule les dépenses par catégorie
 * @returns {Array} - Tableau des dépenses par catégorie
 */
export function calculDepensesParCategorie() {
  return [];
}

/**
 * Calcule les données pour le graphique en barres (6 derniers mois)
 * @returns {Array} - Données pour le graphique
 */
export function calculBarChartData() {
  return [];
}

// =====================
// CALCULS JUSQU'À AUJOURD'HUI
// =====================

export function calculDepensesClassiquesJusquaAujourdhui() {
  return 0;
}

export function calculDepensesRecurrentesJusquaAujourdhui() {
  return 0;
}

export function calculDepensesEchelonneesJusquaAujourdhui() {
  return 0;
}

export function calculRevenusClassiquesJusquaAujourdhui() {
  return 0;
}

export function calculRevenusRecurrentsJusquaAujourdhui() {
  return 0;
}

export function calculRevenusEchelonnesJusquaAujourdhui() {
  return 0;
}

export function calculTotalRevenusJusquaAujourdhui() {
  return 0;
}

export function calculTotalDepensesJusquaAujourdhui() {
  return 0;
}

export function calculEconomiesJusquaAujourdhui() {
  return 0;
}

// =====================
// CALCULS DU MOIS PRÉCÉDENT
// =====================

export function calculDepensesClassiquesMoisPrecedent() {
  return 0;
}

export function calculDepensesRecurrentesMoisPrecedent() {
  return 0;
}

export function calculDepensesEchelonneesMoisPrecedent() {
  return 0;
}

export function calculRevenusClassiquesMoisPrecedent() {
  return 0;
}

export function calculRevenusRecurrentsMoisPrecedent() {
  return 0;
}

export function calculRevenusEchelonnesMoisPrecedent() {
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
