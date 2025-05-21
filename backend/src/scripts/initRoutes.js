const mongoose = require("mongoose");
const Route = require("../models/Route");
require("dotenv").config();

const defaultRoutes = [
  {
    path: "/budget",
    component: "Dashboard",
    isAuth: true,
    isPublic: false,
    order: 1,
    category: "main",
    icon: "dashboard",
    label: "Tableau de bord",
    description: "Vue d'ensemble de vos finances",
  },
  {
    path: "/budget/users",
    component: "Profil",
    isAuth: true,
    isPublic: false,
    order: 2,
    category: "main",
    icon: "user",
    label: "Profil",
    description: "Gérer votre profil utilisateur",
  },
  {
    path: "/budget/agenda",
    component: "Agenda",
    isAuth: true,
    isPublic: false,
    order: 3,
    category: "main",
    icon: "calendar",
    label: "Agenda",
    description: "Voir vos événements financiers",
  },
  {
    path: "/budget/recurrents",
    component: "PaiementRecurrent",
    isAuth: true,
    isPublic: false,
    order: 4,
    category: "main",
    icon: "repeat",
    label: "Paiements récurrents",
    description: "Gérer vos paiements récurrents",
  },
  {
    path: "/budget/echelonne",
    component: "PaiementEchelonne",
    isAuth: true,
    isPublic: false,
    order: 5,
    category: "main",
    icon: "credit-card",
    label: "Paiements échelonnés",
    description: "Gérer vos paiements échelonnés",
  },
  {
    path: "/budget/notifications",
    component: "Notifications",
    isAuth: true,
    isPublic: false,
    order: 6,
    category: "main",
    icon: "bell",
    label: "Notifications",
    description: "Voir vos notifications",
  },
  {
    path: "/budget/depenses-revenus",
    component: "DepensesRevenus",
    isAuth: true,
    isPublic: false,
    order: 7,
    category: "main",
    icon: "money",
    label: "Dépenses et revenus",
    description: "Gérer vos dépenses et revenus",
  },
  {
    path: "/auth",
    component: "Auth",
    isAuth: false,
    isPublic: true,
    order: 1,
    category: "auth",
    icon: "login",
    label: "Connexion",
    description: "Connectez-vous à votre compte",
  },
  {
    path: "/auth/confirm",
    component: "AuthConfirm",
    isAuth: false,
    isPublic: true,
    order: 2,
    category: "auth",
    icon: "check-circle",
    label: "Confirmation",
    description: "Confirmez votre compte",
  },
  {
    path: "/privacy-policy",
    component: "PrivacyPolicy",
    isAuth: false,
    isPublic: true,
    order: 1,
    category: "legal",
    icon: "shield",
    label: "Politique de confidentialité",
    description: "Notre politique de confidentialité",
  },
  {
    path: "/terms",
    component: "Terms",
    isAuth: false,
    isPublic: true,
    order: 2,
    category: "legal",
    icon: "file-text",
    label: "Conditions d'utilisation",
    description: "Nos conditions d'utilisation",
  },
];

async function initRoutes() {
  try {
    console.log("Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connecté à MongoDB");

    console.log("Suppression des routes existantes...");
    await Route.deleteMany({});
    console.log("Routes existantes supprimées");

    console.log("Création des routes par défaut...");
    await Route.insertMany(defaultRoutes);
    console.log("Routes par défaut créées avec succès");

    console.log("Routes créées :");
    const routes = await Route.find().sort({ order: 1 });
    routes.forEach((route) => {
      console.log(`- ${route.path} (${route.label})`);
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation des routes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Déconnecté de MongoDB");
  }
}

// Exécuter le script
initRoutes();
