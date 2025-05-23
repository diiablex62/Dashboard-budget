// Données factices centralisées et helpers

// Récupère le mois courant au format AAAA-MM
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const currentMonth = `${year}-${month}`;

// Dépenses & Revenus (uniquement mai 2025)
export const fakeDepenseRevenu = [
  {
    id: 1,
    nom: "Loyer",
    montant: 800,
    categorie: "Logement",
    date: `${currentMonth}-01`,
    type: "depense",
  },
  {
    id: 2,
    nom: "Salaire",
    montant: 2500,
    categorie: "Salaire",
    date: `${currentMonth}-05`,
    type: "revenu",
  },
  {
    id: 3,
    nom: "Courses",
    montant: 150,
    categorie: "Alimentation",
    date: `${currentMonth}-10`,
    type: "depense",
  },
  {
    id: 4,
    nom: "Freelance",
    montant: 800,
    categorie: "Freelance",
    date: `${currentMonth}-15`,
    type: "revenu",
  },
  {
    id: 5,
    nom: "Électricité",
    montant: 120,
    categorie: "Factures",
    date: `${currentMonth}-20`,
    type: "depense",
  },
];

// Paiements récurrents (dates en brut)
export const fakePaiementsRecurrents = [
  {
    id: 1,
    nom: "Loyer",
    montant: 800,
    categorie: "Logement",
    date: "2025-05-01",
    type: "depense",
    frequence: "mensuel",
  },
  {
    id: 2,
    nom: "Salaire",
    montant: 2500,
    categorie: "Salaire",
    date: "2025-05-05",
    type: "revenu",
    frequence: "mensuel",
  },
  {
    id: 3,
    nom: "Électricité",
    montant: 120,
    categorie: "Factures",
    date: "2025-05-10",
    type: "depense",
    frequence: "mensuel",
  },
];

// Paiements échelonnés (tous commencent en 2025)
export const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "Crédit auto",
    montant: 15000,
    mensualites: 36,
    mensualitesPayees: 12,
    debutDate: "2025-01-01",
    categorie: "Crédit auto",
    type: "depense",
  },
  {
    id: 2,
    nom: "Formation",
    montant: 3000,
    mensualites: 12,
    mensualitesPayees: 6,
    debutDate: "2025-02-01",
    categorie: "Formation",
    type: "depense",
  },
  {
    id: 3,
    nom: "Équipement",
    montant: 2000,
    mensualites: 10,
    mensualitesPayees: 3,
    debutDate: "2025-03-01",
    categorie: "Équipement",
    type: "depense",
  },
];

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
