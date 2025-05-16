import * as dotenv from "dotenv";
dotenv.config();

console.log("=== Test des variables d'environnement ===");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "Non défini");
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "[Défini]" : "Non défini"
);
console.log(
  "FIREBASE_PROJECT_ID:",
  process.env.FIREBASE_PROJECT_ID || "Non défini"
);
console.log("VITE_API_URL:", process.env.VITE_API_URL || "Non défini");
console.log(
  "VITE_CLOUDINARY_API_KEY:",
  process.env.VITE_CLOUDINARY_API_KEY || "Non défini"
);
