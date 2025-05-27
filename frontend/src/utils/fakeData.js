// Données factices centralisées et helpers

// Récupère le mois courant au format AAAA-MM
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const currentMonth = `${year}-${month}`;

// Dépenses & Revenus (uniquement mai 2025)
export const fakeDepenseRevenu = [
  {
    id: 2,
    nom: "Salaire",
    montant: 2500,
    categorie: "Revenus",
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
    categorie: "Revenus",
    date: `${currentMonth}-15`,
    type: "revenu",
  },
  {
    id: 5,
    nom: "Électricité",
    montant: 120,
    categorie: "Logement",
    date: `${currentMonth}-20`,
    type: "depense",
  },
  {
    id: 6,
    nom: "Dividendes",
    montant: 300,
    categorie: "Investissements",
    date: `${currentMonth}-25`,
    type: "revenu",
  },
  {
    id: 7,
    nom: "Allocation CAF",
    montant: 150,
    categorie: "Allocations",
    date: `${currentMonth}-28`,
    type: "revenu",
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
    categorie: "Revenus",
    date: "2025-05-05",
    type: "revenu",
    frequence: "mensuel",
  },
  {
    id: 3,
    nom: "Électricité",
    montant: 120,
    categorie: "Logement",
    date: "2025-05-10",
    type: "depense",
    frequence: "mensuel",
  },
  {
    id: 4,
    nom: "Rente",
    montant: 500,
    categorie: "Investissements",
    date: "2025-05-15",
    type: "revenu",
    frequence: "mensuel",
  },
  {
    id: 5,
    nom: "Allocation logement",
    montant: 200,
    categorie: "Allocations",
    date: "2025-05-20",
    type: "revenu",
    frequence: "mensuel",
  },
];

// Paiements échelonnés 
export const fakePaiementsEchelonnes = [

  {
    id: 1,
    nom: "Formation",
    montant: 3000,
    mensualites: 12,
    mensualitesPayees: 6,
    debutDate: "2025-02-01",
    categorie: "Education",
    type: "depense",
  },
  {
    id: 2,
    nom: "Équipement",
    montant: 2000,
    mensualites: 10,
    mensualitesPayees: 3,
    debutDate: "2025-03-01",
    categorie: "Shopping",
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
