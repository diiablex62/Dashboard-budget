// Données factices centralisées et helpers

import {
  calculRevenusClassiquesTotal,
  calculRevenusRecurrentsTotal,
  calculRevenusEchelonnesTotal,
  calculDepensesClassiquesTotal,
  calculDepensesRecurrentesTotal,
  calculDepensesEchelonneesTotal,
} from "./calculPrevisionnel";

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
  // Ajout : Revenu en août
  {
    id: 100,
    nom: "Revenu Août",
    montant: 1200,
    categorie: "Revenus",
    date: "2025-08-10",
    type: "revenu",
  },
  // Ajout : Dépense en septembre
  {
    id: 101,
    nom: "Dépense Septembre",
    montant: 300,
    categorie: "Alimentation",
    date: "2025-09-15",
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
  // Ajout : Paiement échelonné revenu sur 2 mois (octobre-novembre)
  {
    id: 200,
    nom: "Prime Projet",
    montant: 2000,
    mensualites: 2,
    mensualitesPayees: 0,
    debutDate: "2025-10-01",
    categorie: "Revenus",
    type: "revenu",
  },
];

// Fonction pour vérifier si l'utilisateur est connecté
const isUserConnected = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

// Fonction pour obtenir les données en fonction de l'état de connexion
export const getFakeData = () => {
  if (isUserConnected()) {
    return {
      fakeDepenseRevenu: [...fakeDepenseRevenu],
      fakePaiementsRecurrents,
      fakePaiementsEchelonnes,
    };
  }
  return {
    fakeDepenseRevenu: [],
    fakePaiementsRecurrents: [],
    fakePaiementsEchelonnes: [],
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

// Fonction pour ajouter le solde du mois précédent
export const ajouterSoldeMoisPrecedent = (transactions, annee, mois) => {
  // Calcule le mois précédent
  const moisPrecedent = mois - 1;
  let soldeMoisPrecedent = 0;
  if (moisPrecedent >= 1) {
    const dateMoisPrecedent = new Date(annee, moisPrecedent - 1, 1);
    // Calculs pour le mois précédent
    const revenusClassiques =
      calculRevenusClassiquesTotal(fakeDepenseRevenu, dateMoisPrecedent) || 0;
    const revenusRecurrents =
      calculRevenusRecurrentsTotal(
        fakePaiementsRecurrents,
        dateMoisPrecedent
      ) || 0;
    const revenusEchelonnes =
      calculDepensesEchelonneesTotal(
        fakePaiementsEchelonnes,
        dateMoisPrecedent
      ) || 0;
    const depensesClassiques =
      calculDepensesClassiquesTotal(fakeDepenseRevenu, dateMoisPrecedent) || 0;
    const depensesRecurrentes =
      calculDepensesRecurrentesTotal(
        fakePaiementsRecurrents,
        dateMoisPrecedent
      ) || 0;
    const depensesEchelonnees =
      calculRevenusEchelonnesTotal(
        fakePaiementsEchelonnes,
        dateMoisPrecedent
      ) || 0;
    const totalRevenus =
      revenusClassiques + revenusRecurrents + revenusEchelonnes;
    const totalDepenses =
      depensesClassiques + depensesRecurrentes + depensesEchelonnees;
    soldeMoisPrecedent = totalRevenus - totalDepenses;
  }
  // Crée la transaction pour le solde du mois précédent
  const soldeTransaction = {
    id: `solde-${annee}-${String(mois).padStart(2, "0")}`,
    date: `${annee}-${String(mois).padStart(2, "0")}-01`,
    montant: Math.abs(soldeMoisPrecedent),
    type: "revenu",
    categorie: "Autre revenu",
    nom: "Solde mois précédent",
    description: `Solde du mois précédent`,
  };
  // Insère la transaction au début du tableau
  return [soldeTransaction, ...transactions];
};
