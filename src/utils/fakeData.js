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
function injectSoldeMoisPrecedentTousMois(depenseRevenu) {
  // Trouver tous les mois présents dans les données
  const moisSet = new Set(
    depenseRevenu.map((item) => {
      const d = new Date(item.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })
  );
  // Générer une transaction pour chaque mois
  let transactionsSolde = [];
  moisSet.forEach((moisStr) => {
    const [annee, mois] = moisStr.split("-").map(Number);
    const dateMois = new Date(annee, mois - 1, 1);
    const dateMoisPrecedent = new Date(annee, mois - 2, 1);
    // Calculs avec les fonctions utilitaires (INVERSION pour les échelonnés)
    const moisNom = dateMoisPrecedent.toLocaleString("fr-FR", {
      month: "long",
      year: "numeric",
    });
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
      ) || 0; // INVERSE
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
      ) || 0; // INVERSE
    const totalRevenus =
      revenusClassiques + revenusRecurrents + revenusEchelonnes;
    const totalDepenses =
      depensesClassiques + depensesRecurrentes + depensesEchelonnees;
    const solde = totalRevenus - totalDepenses;
    // Log détaillé
    console.log(
      `--- CALCUL DU MOIS PRÉCÉDENT POUR ${moisStr} (calcul sur ${moisNom}) ---`
    );
    console.log("Revenus classiques:", revenusClassiques);
    console.log("Revenus récurrents:", revenusRecurrents);
    console.log("Revenus échelonnés:", revenusEchelonnes);
    console.log("Dépenses classiques:", depensesClassiques);
    console.log("Dépenses récurrentes:", depensesRecurrentes);
    console.log("Dépenses échelonnées:", depensesEchelonnees);
    console.log("Total revenus:", totalRevenus);
    console.log("Total dépenses:", totalDepenses);
    console.log("Solde:", solde);
    // Vérifier si la transaction existe déjà
    const existe = depenseRevenu.some((item) => {
      const d = new Date(item.date);
      return (
        item.nom === "Solde mois précédent" &&
        d.getMonth() === dateMois.getMonth() &&
        d.getFullYear() === dateMois.getFullYear()
      );
    });
    if (!existe) {
      transactionsSolde.push({
        id: Date.now() + Math.floor(Math.random() * 100000),
        nom: "Solde mois précédent",
        montant: Math.abs(solde),
        categorie: solde >= 0 ? "Autre revenu" : "Autre dépense",
        date: `${annee}-${String(mois).padStart(2, "0")}-01`,
        type: solde >= 0 ? "revenu" : "depense",
        description: `Solde reporté du mois de ${dateMoisPrecedent.toLocaleString(
          "fr-FR",
          { month: "long", year: "numeric" }
        )}`,
      });
    }
  });
  return [...transactionsSolde, ...depenseRevenu];
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
    fakeDepenseRevenu: injectSoldeMoisPrecedentTousMois(fakeDepenseRevenu),
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
