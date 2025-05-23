// Données factices centralisées et helpers

// Transactions (uniquement mai 2025)
export const fakeTransactions = [
  {
    id: 1,
    nom: "Loyer",
    montant: 1000,
    categorie: "Logement",
    date: "2025-05-01",
    type: "depense",
  },
  {
    id: 2,
    nom: "Courses",
    montant: 220.5,
    categorie: "Alimentation",
    date: "2025-05-03",
    type: "depense",
  },
  {
    id: 3,
    nom: "Essence",
    montant: 80,
    categorie: "Transport",
    date: "2025-05-07",
    type: "depense",
  },
  {
    id: 4,
    nom: "Vente Vinted",
    montant: 45,
    categorie: "Ventes",
    date: "2025-05-10",
    type: "revenu",
  },
];

// Paiements récurrents (uniquement mai 2025)
export const fakePaiementsRecurrents = [
  {
    id: 1,
    nom: "Netflix",
    categorie: "Divertissement",
    montant: 14.99,
    frequence: "Mensuel",
    date: "2025-05-15",
    type: "depense",
  },
  {
    id: 2,
    nom: "Spotify",
    categorie: "Divertissement",
    montant: 9.99,
    frequence: "Mensuel",
    date: "2025-05-20",
    type: "depense",
  },
  {
    id: 3,
    nom: "Salaire principal",
    categorie: "Salaire",
    montant: 2200,
    frequence: "Mensuel",
    date: "2025-05-01",
    type: "revenu",
  },
];

// Paiements échelonnés (tous commencent en mai 2025)
export const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "Smartphone Samsung",
    montant: 3599.8,
    mensualites: 24,
    debutDate: "2025-05-01",
    categorie: "High-Tech",
    type: "depense",
  },
  {
    id: 2,
    nom: "Assurance Auto",
    montant: 720,
    mensualites: 12,
    debutDate: "2025-05-01",
    categorie: "Assurance",
    type: "depense",
  },
  {
    id: 3,
    nom: "Crédit Mobilier",
    montant: 995,
    mensualites: 10,
    debutDate: "2025-05-01",
    categorie: "Crédit",
    type: "depense",
  },
  {
    id: 4,
    nom: "Électroménagers",
    montant: 722.7,
    mensualites: 6,
    debutDate: "2025-05-01",
    categorie: "Maison",
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
