// Chargement des variables d'environnement
require("dotenv").config();

// Importation du serveur
const app = require("./api");

console.log(
  "Serveur d'authentification par email démarré sur le port",
  process.env.PORT || 3001
);
