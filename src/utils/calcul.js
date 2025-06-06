// Fichier central pour les fonctions de calcul du projet
// ------------------------------------------------------
// ONGLETS :
// =====================
// DÉPENSES & REVENUS
// =====================

// Calcul du total des dépenses et revenus
export const calculateDepenseRevenuTotal = (
  depenseRevenu,
  isDepense = false
) => {
  const total = depenseRevenu.reduce(
    (acc, t) => acc + (isDepense ? Math.abs(t.montant || 0) : t.montant || 0),
    0
  );
  return total;
};

// Calcul du total des dépenses du mois
export function calculTotalDepensesMois(depenseRevenu, date = new Date()) {
  if (
    !depenseRevenu ||
    !Array.isArray(depenseRevenu) ||
    depenseRevenu.length === 0
  ) {
    return 0;
  }
  const dateObj = date instanceof Date ? date : new Date(date);
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
  return total;
}

// Calcule le total des revenus du mois
export function totalRevenusGlobalMois(depenseRevenu, date = new Date()) {
  if (
    !depenseRevenu ||
    !Array.isArray(depenseRevenu) ||
    depenseRevenu.length === 0
  ) {
    return 0;
  }
  const dateObj = date instanceof Date ? date : new Date(date);
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
  return total;
}

// =====================
// RÉCURRENTS
// =====================

// Calcule le total des paiements récurrents du mois
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

// Calcule le total des dépenses récurrentes du mois
export const calculTotalDepensesRecurrentesMois = (
  paiementsRecurrents,
  date
) => {
  if (!paiementsRecurrents || !date) {
    return 0;
  }

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

// Calcule le total des revenus récurrents du mois
export const calculTotalRevenusRecurrentsMois = (paiementsRecurrents, date) => {
  if (!paiementsRecurrents || !date) {
    return 0;
  }

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

// Calcule le total des paiements échelonnés du mois
export const calculTotalEchelonnesMois = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !date) {
    return 0;
  }

  const dateObj = new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();

  const total = paiementsEchelonnes
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
      return (
        total + (p.type === "debit" ? Math.abs(montantMensuel) : montantMensuel)
      );
    }, 0);

  return total;
};

// Calcule le total des crédits échelonnés du mois
export const calculTotalCreditEchelonneesMois = (paiementsEchelonnes, date) => {
  // Vérification des paramètres
  if (!paiementsEchelonnes?.length || !date) {
    return 0;
  }

  // Initialisation des variables
  const dateObj = new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  const dateActuelle = new Date(annee, mois);
  const dateActuelleFin = new Date(annee, mois + 1, 0);

  // Calcul du total des crédits échelonnés
  const total = paiementsEchelonnes
    .filter((p) => {
      if (!p.debutDate || !p.mensualites || !p.montant) return false;
      if (p.type !== "credit") return false;

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

      return estActif;
    })
    .reduce((total, p) => {
      const mensualite = Number(p.montant) / Number(p.mensualites);
      return total + mensualite;
    }, 0);

  return total;
};

// Calcule le total des débits échelonnés du mois
export const calculTotalDebitEchelonneesMois = (paiementsEchelonnes, date) => {
  // Vérification des paramètres
  if (!paiementsEchelonnes?.length || !date) {
    return 0;
  }

  // Initialisation des variables
  const dateObj = new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();
  const dateActuelle = new Date(annee, mois);
  const dateActuelleFin = new Date(annee, mois + 1, 0);

  // Calcul du total des débits échelonnés
  const total = paiementsEchelonnes
    .filter((p) => {
      if (!p.debutDate || !p.mensualites || !p.montant) return false;
      if (p.type !== "debit") return false;

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

      return estActif;
    })
    .reduce((total, p) => {
      const mensualite = Number(p.montant) / Number(p.mensualites);
      return total + Math.abs(mensualite);
    }, 0);

  return total;
};

// Calcule le nombre de paiements échelonnés actifs pour un mois donné
export const calculPaiementsEchelonnesActifs = (
  paiementsEchelonnes,
  date,
  isRevenus
) => {
  if (!paiementsEchelonnes || !date) {
    return 0;
  }

  const count = paiementsEchelonnes
    .filter((p) => p.type === (isRevenus ? "debit" : "credit"))
    .filter((paiement) => {
      const debut = new Date(paiement.debutDate);
      const fin = new Date(paiement.debutDate);
      fin.setMonth(fin.getMonth() + parseInt(paiement.mensualites) - 1);
      const afterStart =
        date.getFullYear() > debut.getFullYear() ||
        (date.getFullYear() === debut.getFullYear() &&
          date.getMonth() >= debut.getMonth());
      const beforeEnd =
        date.getFullYear() < fin.getFullYear() ||
        (date.getFullYear() === fin.getFullYear() &&
          date.getMonth() <= fin.getMonth());
      return afterStart && beforeEnd;
    }).length;

  return count;
};

// Calcule les informations de progression d'un paiement échelonné
export const calculProgressionPaiementEchelonne = (paiement, dateReference) => {
  const debut = new Date(paiement.debutDate);
  const moisEcoules =
    (dateReference.getFullYear() - debut.getFullYear()) * 12 +
    (dateReference.getMonth() - debut.getMonth()) +
    1;
  const mensualitesPayees = Math.max(
    1,
    Math.min(moisEcoules, paiement.mensualites)
  );
  const pourcentage = (mensualitesPayees / paiement.mensualites) * 100;
  const finDate = new Date(
    new Date(paiement.debutDate).setMonth(
      new Date(paiement.debutDate).getMonth() +
        parseInt(paiement.mensualites) -
        1
    )
  );

  const montantTotal = Math.abs(parseFloat(paiement.montant));
  const nombreMensualites = parseInt(paiement.mensualites);
  const montantMensuel = montantTotal / nombreMensualites;

  return {
    mensualitesPayees,
    pourcentage,
    finDate,
    montantMensuel,
    montantTotal,
    nombreMensualites,
  };
};

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

export function calculRevenusEchelonnesJusquaAujourdhui(
  paiementsEchelonnes,
  date = new Date()
) {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    console.log("[Echelonne] Aucun paiement échelonné fourni.");
    return 0;
  }

  let total = 0;
  console.log(
    "[Echelonne] --- Détail des revenus échelonnés jusqu'à aujourd'hui ---"
  );
  paiementsEchelonnes.forEach((e) => {
    if (e.type !== "debit") return; // On ne prend que les revenus
    const debut = new Date(e.debutDate);
    const nbMois = parseInt(e.mensualites);
    for (let i = 0; i < nbMois; i++) {
      const moisEcheance = new Date(debut);
      moisEcheance.setMonth(debut.getMonth() + i);
      if (
        (moisEcheance.getFullYear() < date.getFullYear() ||
          (moisEcheance.getFullYear() === date.getFullYear() &&
            moisEcheance.getMonth() <= date.getMonth())) &&
        moisEcheance <= date
      ) {
        total += parseFloat(e.montant);
        console.log(
          `[Echelonne] +${e.montant}€ pour "${e.nom}" (échéance ${
            i + 1
          }/$${nbMois}) - Date: ${moisEcheance.toLocaleDateString("fr-FR")}`
        );
      }
    }
  });
  console.log(
    `[Echelonne] Total revenus échelonnés jusqu'à aujourd'hui : ${total}€`
  );
  return total;
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

// Calcul du total des dépenses classiques du mois
export const calculDepensesClassiquesMois = (depenses, date) => {
  if (!depenses || !Array.isArray(depenses) || depenses.length === 0) {
    return 0;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const mois = dateObj.getMonth();
  const annee = dateObj.getFullYear();

  const total = depenses
    .filter((d) => {
      if (!d || !d.date) return false;
      const dDate = new Date(d.date);
      return (
        d.type === "depense" &&
        dDate.getMonth() === mois &&
        dDate.getFullYear() === annee
      );
    })
    .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant || 0)), 0);

  return total;
};

// Calcul du total des dépenses récurrentes du mois
export const calculDepensesRecurrentesMois = (paiementsRecurrents, date) => {
  if (!paiementsRecurrents || !Array.isArray(paiementsRecurrents)) {
    return 0;
  }

  const total = paiementsRecurrents
    .filter((p) => p.type === "depense" && p.jourPrelevement <= date.getDate())
    .reduce((total, p) => total + p.montant, 0);

  return total;
};

// Calcul du total des dépenses échelonnées du mois
export const calculDepensesEchelonneesMois = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    return 0;
  }

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const total = paiementsEchelonnes
    .filter(
      (e) =>
        e.type === "depense" &&
        e.date.getMonth() === currentMonth &&
        e.date.getFullYear() === currentYear &&
        e.date <= date
    )
    .reduce((total, e) => total + e.montant, 0);

  return total;
};

// Calcul du total général des dépenses du mois
export const calculTotalDepenseGeneralMois = (data, date) => {
  if (!data) {
    return {
      total: 0,
      depensesClassiques: 0,
      depensesRecurrentes: 0,
      depensesEchelonnees: 0,
    };
  }

  const {
    depenses = [],
    paiementsRecurrents = [],
    paiementsEchelonnes = [],
  } = data;

  const depensesClassiques = calculDepensesClassiquesMois(depenses, date);
  const depensesRecurrentes = calculDepensesRecurrentesMois(
    paiementsRecurrents,
    date
  );
  const depensesEchelonnees = calculDepensesEchelonneesMois(
    paiementsEchelonnes,
    date
  );

  const total = depensesClassiques + depensesRecurrentes + depensesEchelonnees;

  return {
    total,
    depensesClassiques,
    depensesRecurrentes,
    depensesEchelonnees,
  };
};

// Calcul du total des revenus classiques du mois
export const calculRevenusClassiquesMois = (revenus, date) => {
  if (!revenus || !Array.isArray(revenus)) {
    return 0;
  }

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const total = revenus
    .filter(
      (r) =>
        r.date.getMonth() === currentMonth &&
        r.date.getFullYear() === currentYear &&
        r.date <= date
    )
    .reduce((total, r) => total + r.montant, 0);

  return total;
};

// Calcul du total des revenus échelonnés du mois
export const calculRevenusEchelonnesMois = (paiementsEchelonnes, date) => {
  if (!paiementsEchelonnes || !Array.isArray(paiementsEchelonnes)) {
    return 0;
  }

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const total = paiementsEchelonnes
    .filter(
      (e) =>
        e.type === "revenu" &&
        e.date.getMonth() === currentMonth &&
        e.date.getFullYear() === currentYear &&
        e.date <= date
    )
    .reduce((total, e) => total + e.montant, 0);

  return total;
};

// Calcul du total général des revenus du mois
export const calculTotalRevenuGeneralMois = (data, date) => {
  if (!data) {
    return {
      total: 0,
      revenusClassiques: 0,
      revenusRecurrents: 0,
      revenusEchelonnes: 0,
    };
  }

  const {
    revenus = [],
    paiementsRecurrents = [],
    paiementsEchelonnes = [],
  } = data;

  const revenusClassiques = calculRevenusClassiquesMois(revenus, date);
  const revenusRecurrents = calculRevenusRecurrentsMois(
    paiementsRecurrents,
    date
  );
  const revenusEchelonnes = calculRevenusEchelonnesMois(
    paiementsEchelonnes,
    date
  );

  const total = revenusClassiques + revenusRecurrents + revenusEchelonnes;

  return {
    total,
    revenusClassiques,
    revenusRecurrents,
    revenusEchelonnes,
  };
};
