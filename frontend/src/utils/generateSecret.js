// Script pour générer une clé secrète sécurisée pour JWT
// Exécutez avec: node src/utils/generateSecret.js

import crypto from "crypto";

// Générer une clé secrète aléatoire suffisamment longue (64 octets)
const secretKey = crypto.randomBytes(64).toString("hex");

console.log("----------- CLÉ SECRÈTE JWT GÉNÉRÉE -----------");
console.log(secretKey);
console.log("-----------------------------------------------");
console.log("Ajoutez cette clé à votre fichier .env comme:");
console.log("JWT_SECRET_KEY=" + secretKey);
