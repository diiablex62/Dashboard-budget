import * as dotenv from "dotenv";
dotenv.config();

console.log("=== Test des variables d'environnement ===");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "Non défini");
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "[Défini]" : "Non défini"
);
console.log("VITE_API_URL:", process.env.VITE_API_URL || "Non défini");
console.log(
  "VITE_CLOUDINARY_API_KEY:",
  process.env.VITE_CLOUDINARY_API_KEY || "Non défini"
);

// Configuration de l'environnement de test
const testEnv = {
  NODE_ENV: "test",
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || "test_secret",
  API_URL: process.env.API_URL || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/test",
};

// Exporter la configuration
module.exports = testEnv;
