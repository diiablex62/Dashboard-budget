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
  {
    id: 9991,
    nom: "Achat ordinateur",
    montant: 1200,
    categorie: "Shopping",
    date: "2025-04-10",
    type: "depense",
  },
  {
    id: 9992,
    nom: "Prime exceptionnelle",
    montant: 800,
    categorie: "Salaire",
    date: "2025-04-15",
    type: "revenu",
  },
];

// Paiements récurrents (dates en brut)
export const fakePaiementsRecurrents = [
  {
    id: 1,
    nom: "Assurance habitation",
    montant: 30,
    categorie: "Logement",
    jourPrelevement: 8,
    type: "depense",
    frequence: "mensuel",
    debut: "2025-04-08",
  },
  {
    id: 2,
    nom: "Mutuelle santé",
    montant: 50,
    categorie: "Santé",
    jourPrelevement: 12,
    type: "depense",
    frequence: "mensuel",
    debut: "2025-04-12",
  },
  {
    id: 3,
    nom: "Pension alimentaire",
    montant: 200,
    categorie: "Famille",
    jourPrelevement: 5,
    type: "revenu",
    frequence: "mensuel",
    debut: "2025-04-05",
  },
  {
    id: 4,
    nom: "Aide étudiante",
    montant: 100,
    categorie: "Allocations",
    jourPrelevement: 15,
    type: "revenu",
    frequence: "mensuel",
    debut: "2025-04-15",
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
