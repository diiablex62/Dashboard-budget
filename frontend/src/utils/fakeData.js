// Données factices centralisées et helpers

// Transactions (uniquement mai 2025)
export const fakeTransactions = [
  {
    id: 1,
    nom: "Loyer",
    montant: 800,
    categorie: "Logement",
    date: "2024-03-01",
    type: "depense",
  },
  {
    id: 2,
    nom: "Salaire",
    montant: 2500,
    categorie: "Salaire",
    date: "2024-03-05",
    type: "revenu",
  },
  {
    id: 3,
    nom: "Courses",
    montant: 150,
    categorie: "Alimentation",
    date: "2024-03-10",
    type: "depense",
  },
  {
    id: 4,
    nom: "Freelance",
    montant: 800,
    categorie: "Freelance",
    date: "2024-03-15",
    type: "revenu",
  },
  {
    id: 5,
    nom: "Électricité",
    montant: 120,
    categorie: "Factures",
    date: "2024-03-20",
    type: "depense",
  },
];

// Paiements récurrents (uniquement mai 2025)
export const fakePaiementsRecurrents = [
  {
    id: 1,
    nom: "Loyer",
    montant: 800,
    categorie: "Loyer",
    date: "2024-03-01",
    frequence: "mensuel",
    type: "depense",
  },
  {
    id: 2,
    nom: "Électricité",
    montant: 120,
    categorie: "Électricité",
    date: "2024-03-15",
    frequence: "mensuel",
    type: "depense",
  },
  {
    id: 3,
    nom: "Internet",
    montant: 40,
    categorie: "Internet",
    date: "2024-03-20",
    frequence: "mensuel",
    type: "depense",
  },
];

// Paiements échelonnés (tous commencent en mai 2025)
export const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "Crédit auto",
    montant: 15000,
    mensualites: 36,
    mensualitesPayees: 12,
    debutDate: "2024-01-01",
    categorie: "Crédit auto",
    type: "depense",
  },
  {
    id: 2,
    nom: "Formation",
    montant: 3000,
    mensualites: 12,
    mensualitesPayees: 6,
    debutDate: "2024-02-01",
    categorie: "Formation",
    type: "depense",
  },
  {
    id: 3,
    nom: "Équipement",
    montant: 2000,
    mensualites: 10,
    mensualitesPayees: 3,
    debutDate: "2024-03-01",
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
