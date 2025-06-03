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
    nom: "Salaire Mai",
    montant: 2500,
    categorie: "Salaire",
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
    categorie: "Travail",
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
    nom: "Salaire Juin",
    montant: 2500,
    categorie: "Salaire",
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
    categorie: "Travail",
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
    dateDebut: "2025-06",
  },
  {
    id: 2,
    nom: "Spotify",
    montant: 5.99,
    categorie: "Divertissement",
    jourPrelevement: 30,
    type: "depense",
    dateDebut: "2025-06",
  },
  {
    id: 3,
    nom: "Salaire Alex",
    montant: 1800,
    categorie: "Salaire",
    jourPrelevement: 1,
    type: "revenu",
    dateDebut: "2025-06",
  },
  {
    id: 4,
    nom: "Salaire Audrey",
    montant: 2200,
    categorie: "Salaire",
    jourPrelevement: 30,
    type: "revenu",
    dateDebut: "2025-06",
  },
];

// Données fictives pour les paiements échelonnés
export const fakePaiementsEchelonnes = [
  // Mai 2025
  {
    id: 1,
    nom: "iPhone 15 Mai",
    montant: 1200,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-05-01",
    categorie: "Électronique",
    type: "depense",
  },
  {
    id: 2,
    nom: "Prime Échelonnée Mai",
    montant: 600,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-05-01",
    categorie: "Travail",
    type: "revenu",
  },
  {
    id: 3,
    nom: "MacBook Pro Mai Fin",
    montant: 2400,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-05-30",
    categorie: "Électronique",
    type: "depense",
  },
  {
    id: 4,
    nom: "Prime Échelonnée Mai Fin",
    montant: 700,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-05-30",
    categorie: "Travail",
    type: "revenu",
  },
  // Juin 2025
  {
    id: 5,
    nom: "iPhone 15 Juin",
    montant: 1200,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-06-01",
    categorie: "Électronique",
    type: "depense",
  },
  {
    id: 6,
    nom: "Prime Échelonnée Juin",
    montant: 600,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-06-01",
    categorie: "Travail",
    type: "revenu",
  },
  {
    id: 7,
    nom: "MacBook Pro Juin Fin",
    montant: 2400,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-06-30",
    categorie: "Électronique",
    type: "depense",
  },
  {
    id: 8,
    nom: "Prime Échelonnée Juin Fin",
    montant: 700,
    mensualites: 2,
    mensualitesPayees: 1,
    debutDate: "2025-06-30",
    categorie: "Travail",
    type: "revenu",
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
