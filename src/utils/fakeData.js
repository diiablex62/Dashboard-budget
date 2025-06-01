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
    id: 6,
    nom: "Salaire",
    montant: 2500,
    categorie: "Salaire",
    date: "2025-05-01",
    type: "revenu",
  },
  {
    id: 7,
    nom: "Loyer",
    montant: 800,
    categorie: "Logement",
    date: "2025-05-05",
    type: "depense",
  },
  {
    id: 8,
    nom: "Courses",
    montant: 180,
    categorie: "Alimentation",
    date: "2025-05-12",
    type: "depense",
  },
  {
    id: 9,
    nom: "Freelance",
    montant: 600,
    categorie: "Travail",
    date: "2025-05-18",
    type: "revenu",
  },
  {
    id: 10,
    nom: "Électricité",
    montant: 85,
    categorie: "Factures",
    date: "2025-05-25",
    type: "depense",
  },
  // Juin 2025
  {
    id: 1,
    nom: "Salaire",
    montant: 2500,
    categorie: "Salaire",
    date: "2025-06-01",
    type: "revenu",
  },
  {
    id: 2,
    nom: "Loyer",
    montant: 800,
    categorie: "Logement",
    date: "2025-06-05",
    type: "depense",
  },
  {
    id: 3,
    nom: "Courses",
    montant: 220,
    categorie: "Alimentation",
    date: "2025-06-10",
    type: "depense",
  },
  {
    id: 4,
    nom: "Freelance",
    montant: 750,
    categorie: "Travail",
    date: "2025-06-15",
    type: "revenu",
  },
  {
    id: 5,
    nom: "Électricité",
    montant: 90,
    categorie: "Factures",
    date: "2025-06-20",
    type: "depense",
  },
  {
    id: 11,
    nom: "Restaurant",
    montant: 65,
    categorie: "Alimentation",
    date: "2025-06-25",
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
    jourPrelevement: 5,
    type: "depense",
    frequence: "mensuel",
    debut: "2025-05-01",
  },
  {
    id: 2,
    nom: "Spotify",
    montant: 9.99,
    categorie: "Divertissement",
    jourPrelevement: 10,
    type: "depense",
    frequence: "mensuel",
    debut: "2025-05-01",
  },
  {
    id: 3,
    nom: "Salaire",
    montant: 2500,
    categorie: "Salaire",
    jourPrelevement: 1,
    type: "revenu",
    frequence: "mensuel",
    debut: "2025-05-01",
  },
];

// Données fictives pour les paiements échelonnés
export const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "iPhone 15",
    montant: 999,
    mensualites: 12,
    mensualitesPayees: 3,
    debutDate: "2025-05-01",
    categorie: "Électronique",
    type: "depense",
  },
  {
    id: 2,
    nom: "MacBook Pro",
    montant: 1999,
    mensualites: 24,
    mensualitesPayees: 6,
    debutDate: "2025-05-01",
    categorie: "Électronique",
    type: "depense",
  },
];

// Fonction pour vérifier si l'utilisateur est connecté
const isUserConnected = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Fonction pour obtenir les données en fonction de l'état de connexion
export const getFakeData = () => {
  if (!isUserConnected()) {
    return {
      fakeDepenseRevenu: [],
      fakePaiementsRecurrents: [],
      fakePaiementsEchelonnes: [],
    };
  }
  return {
    fakeDepenseRevenu,
    fakePaiementsRecurrents,
    fakePaiementsEchelonnes,
  };
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
