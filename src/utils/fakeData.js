// Données factices centralisées et helpers

// Récupère le mois courant au format AAAA-MM
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const currentMonth = `${year}-${month}`;

// Données fictives pour les dépenses et revenus
export const fakeDepenseRevenu = [
  // Mai 2025
  {
    id: 1,
    nom: "Revenus Mai",
    montant: 2500,
    categorie: "Revenus",
    date: "2025-05-01",
    type: "revenu",
  },
  {
    id: 2,
    nom: "Courses Mai",
    montant: 200,
    categorie: "Alimentation",
    date: "2025-05-01",
    type: "depense",
  },
  {
    id: 3,
    nom: "Prime Mai",
    montant: 300,
    categorie: "Revenus",
    date: "2025-05-30",
    type: "revenu",
  },
  {
    id: 4,
    nom: "Loyer Mai",
    montant: 800,
    categorie: "Logement",
    date: "2025-05-30",
    type: "depense",
  },
  // Juin 2025
  {
    id: 5,
    nom: "Revenus Juin",
    montant: 2500,
    categorie: "Revenus",
    date: "2025-06-01",
    type: "revenu",
  },
  {
    id: 6,
    nom: "Courses Juin",
    montant: 220,
    categorie: "Alimentation",
    date: "2025-06-01",
    type: "depense",
  },
  {
    id: 7,
    nom: "Prime Juin",
    montant: 350,
    categorie: "Revenus",
    date: "2025-06-30",
    type: "revenu",
  },
  {
    id: 8,
    nom: "Loyer Juin",
    montant: 800,
    categorie: "Logement",
    date: "2025-06-30",
    type: "depense",
  },
];

// Données fictives pour les paiements récurrents
export const fakePaiementsRecurrents = [
  {
    id: 1,
    nom: "Netflix",
    montant: 15.99,
    categorie: "Divertissement",
    jourPrelevement: 1,
    type: "depense",
  },
  {
    id: 2,
    nom: "Spotify",
    montant: 5.99,
    categorie: "Divertissement",
    jourPrelevement: 30,
    type: "depense",
  },
  {
    id: 3,
    nom: "Revenus 1",
    montant: 1800,
    categorie: "Revenus",
    jourPrelevement: 1,
    type: "revenu",
  },
  {
    id: 4,
    nom: "Revenus 2",
    montant: 2200,
    categorie: "Revenus",
    jourPrelevement: 30,
    type: "revenu",
  },
];

// Données fictives pour les paiements échelonnés
export const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "Achat vélo",
    montant: 400,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-04-01",
    categorie: "Loisirs",
    type: "credit",
  },
  {
    id: 2,
    nom: "Achat ordinateur",
    montant: 1200,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-05-30",
    categorie: "Équipement",
    type: "credit",
  },
  {
    id: 3,
    nom: "Achat canapé",
    montant: 800,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-06-01",
    categorie: "Maison",
    type: "credit",
  },

  {
    id: 4,
    nom: "Asso",
    montant: 400,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-06-01",
    categorie: "Maison",
    type: "debit",
  },
];

// Fonction pour vérifier si l'utilisateur est connecté
const isUserConnected = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Ajoute dynamiquement la transaction 'Solde mois précédent' selon le solde du mois précédent
function injectSoldeMoisPrecedent(depenseRevenu) {
  // Récupère le mois courant et le précédent
  const now = new Date();
  const anneeCourante = now.getFullYear();
  const moisCourant = now.getMonth();
  const premierJourMoisCourant = new Date(anneeCourante, moisCourant, 1);
  const dernierJourMoisPrecedent = new Date(anneeCourante, moisCourant, 0);
  const moisPrecedent = dernierJourMoisPrecedent.getMonth();
  const anneePrecedente = dernierJourMoisPrecedent.getFullYear();

  // --- Dépenses classiques ---
  const depensesMoisPrecedent = depenseRevenu.filter((item) => {
    const d = new Date(item.date);
    return (
      item.type === "depense" &&
      d.getMonth() === moisPrecedent &&
      d.getFullYear() === anneePrecedente
    );
  });
  // --- Revenus classiques ---
  const revenusMoisPrecedent = depenseRevenu.filter((item) => {
    const d = new Date(item.date);
    return (
      item.type === "revenu" &&
      d.getMonth() === moisPrecedent &&
      d.getFullYear() === anneePrecedente
    );
  });

  // --- Dépenses récurrentes ---
  const depensesRecurrents = fakePaiementsRecurrents
    .filter((item) => {
      return (
        item.type === "depense" &&
        item.jourPrelevement >= 1 &&
        item.jourPrelevement <= 31
      );
    })
    .map((item) => {
      // Date de prélèvement pour le mois précédent
      return {
        ...item,
        date: `${anneePrecedente}-${String(moisPrecedent + 1).padStart(
          2,
          "0"
        )}-${String(item.jourPrelevement).padStart(2, "0")}`,
      };
    })
    .filter((item) => {
      const d = new Date(item.date);
      return (
        d.getMonth() === moisPrecedent && d.getFullYear() === anneePrecedente
      );
    });

  // --- Revenus récurrents ---
  const revenusRecurrents = fakePaiementsRecurrents
    .filter((item) => {
      return (
        item.type === "revenu" &&
        item.jourPrelevement >= 1 &&
        item.jourPrelevement <= 31
      );
    })
    .map((item) => {
      return {
        ...item,
        date: `${anneePrecedente}-${String(moisPrecedent + 1).padStart(
          2,
          "0"
        )}-${String(item.jourPrelevement).padStart(2, "0")}`,
      };
    })
    .filter((item) => {
      const d = new Date(item.date);
      return (
        d.getMonth() === moisPrecedent && d.getFullYear() === anneePrecedente
      );
    });

  // --- Dépenses échelonnées ---
  const depensesEchelonnees = fakePaiementsEchelonnes.filter((item) => {
    // On considère les types 'debit' ou 'depense' comme dépenses
    if (item.type !== "debit" && item.type !== "depense") return false;
    // Calcule la date de la mensualité à payer
    const debut = new Date(item.debutDate);
    for (let i = 0; i < item.mensualites; i++) {
      const dateMensualite = new Date(
        debut.getFullYear(),
        debut.getMonth() + i,
        debut.getDate()
      );
      if (
        dateMensualite.getMonth() === moisPrecedent &&
        dateMensualite.getFullYear() === anneePrecedente &&
        i < item.mensualitesPayees
      ) {
        return true;
      }
    }
    return false;
  });

  // --- Revenus échelonnés ---
  const revenusEchelonnes = fakePaiementsEchelonnes.filter((item) => {
    // On considère les types 'credit' ou 'revenu' comme revenus
    if (item.type !== "credit" && item.type !== "revenu") return false;
    const debut = new Date(item.debutDate);
    for (let i = 0; i < item.mensualites; i++) {
      const dateMensualite = new Date(
        debut.getFullYear(),
        debut.getMonth() + i,
        debut.getDate()
      );
      if (
        dateMensualite.getMonth() === moisPrecedent &&
        dateMensualite.getFullYear() === anneePrecedente &&
        i < item.mensualitesPayees
      ) {
        return true;
      }
    }
    return false;
  });

  // --- Sommes ---
  const totalDepenses = [
    ...depensesMoisPrecedent,
    ...depensesRecurrents,
    ...depensesEchelonnees,
  ].reduce((acc, t) => acc + Number(t.montant), 0);
  const totalRevenus = [
    ...revenusMoisPrecedent,
    ...revenusRecurrents,
    ...revenusEchelonnes,
  ].reduce((acc, t) => acc + Number(t.montant), 0);
  const solde = totalRevenus - totalDepenses;

  // Vérifie si la transaction existe déjà pour le mois courant
  const existe = depenseRevenu.some((item) => {
    const d = new Date(item.date);
    return (
      item.nom === "Solde mois précédent" &&
      d.getMonth() === moisCourant &&
      d.getFullYear() === anneeCourante
    );
  });

  if (existe) return depenseRevenu;

  // Crée la transaction
  const transaction = {
    id: Date.now(),
    nom: "Solde mois précédent",
    montant: Math.abs(solde),
    categorie: solde >= 0 ? "Autre revenu" : "Autre dépense",
    date: `${anneeCourante}-${String(moisCourant + 1).padStart(2, "0")}-01`,
    type: solde >= 0 ? "revenu" : "depense",
    description: `Solde reporté du mois de ${dernierJourMoisPrecedent.toLocaleString(
      "fr-FR",
      { month: "long", year: "numeric" }
    )}`,
  };
  console.log("Transaction injectée:", transaction);
  return [transaction, ...depenseRevenu];
}

// Fonction pour obtenir les données en fonction de l'état de connexion
export const getFakeData = () => {
  if (!isUserConnected()) {
    return {
      fakeDepenseRevenu: [],
      fakePaiementsRecurrents: [],
      fakePaiementsEchelonnes: [],
    };
  }
  const data = {
    fakeDepenseRevenu: injectSoldeMoisPrecedent(fakeDepenseRevenu),
    fakePaiementsRecurrents,
    fakePaiementsEchelonnes,
  };
  console.log("fakeDepenseRevenu retourné:", data.fakeDepenseRevenu);
  return data;
};

// Fonctions utilitaires pour filtrer les données
export const getDepensesRevenusByType = (type) => {
  if (!isUserConnected()) return [];
  return fakeDepenseRevenu.filter((item) => item.type === type);
};

export const getPaiementsRecurrentsByType = (type) => {
  if (!isUserConnected()) return [];
  return fakePaiementsRecurrents.filter((item) => item.type === type);
};

export const getPaiementsEchelonnesByType = (type) => {
  if (!isUserConnected()) return [];
  return fakePaiementsEchelonnes.filter((item) => item.type === type);
};

// Helpers pour filtrer dépenses et revenus
export function getRecurrentsDepenses() {
  return fakePaiementsRecurrents.filter((p) => p.type === "depense");
}
export function getRecurrentsRevenus() {
  return fakePaiementsRecurrents.filter((p) => p.type === "revenu");
}
export function getEchelonnesDepenses() {
  return fakePaiementsEchelonnes.filter((e) => e.type === "depense");
}
export function getEchelonnesRevenus() {
  return fakePaiementsEchelonnes.filter((e) => e.type === "revenu");
}
