// Chargement des variables d'environnement
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  createToken,
  verifyToken,
  createUser,
  getUserByEmail,
  mockDb,
} from "./emailAuth.js";

const app = express();
// Forcer le port 3000 pour correspondre à la configuration frontend
const PORT = 3000;
console.log("Le serveur API démarre sur le port:", PORT);

// Utiliser une clé JWT secrète robuste
const JWT_SECRET =
  process.env.JWT_SECRET_KEY || crypto.randomBytes(32).toString("hex");
// Si aucune clé n'est définie, nous en générons une au démarrage (moins sécurisé, car la clé change à chaque redémarrage)
if (!process.env.JWT_SECRET_KEY) {
  console.warn(
    "⚠️ AVERTISSEMENT: JWT_SECRET_KEY non définie dans le fichier .env!"
  );
  console.warn(
    "⚠️ Une clé temporaire a été générée, mais tous les tokens seront invalidés au redémarrage du serveur."
  );
  console.warn(
    "⚠️ Exécutez 'node src/utils/generateSecret.js' pour générer une clé permanente."
  );
}

const JWT_EXPIRES_IN = "24h"; // Durée de validité du JWT (24 heures)
console.log(`Durée de validité des tokens JWT: ${JWT_EXPIRES_IN}`);

// Liste des origines autorisées
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174", // Port alternatif utilisé par Vite
  "http://127.0.0.1:5174", // Port alternatif utilisé par Vite
  // Ajoutez d'autres origines si nécessaire
];

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Permettre les requêtes sans origine (comme les appels mobiles ou Postman)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Origine non autorisée: ${origin}`);
        callback(null, true); // En développement, on autorise tout, mais on log les origines non listées
      }
    },
    credentials: true, // Permettre l'envoi de cookies entre domaines
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Logger pour débogage
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${
      req.get("Origin") || "none"
    }`
  );
  next();
});

// Middleware d'authentification pour les routes protégées
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, error: "Non authentifié" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérifier si le token est expiré
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ success: false, error: "Token expiré" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erreur JWT:", error);
    return res.status(403).json({ success: false, error: "Token invalide" });
  }
};

// Routes d'authentification
app.post("/auth/email", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Demande de connexion pour:", email);

    // Créer un token d'authentification
    const token = await createToken(email);

    // Vérifier si l'utilisateur existe, sinon le créer
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser(email);
    }

    res.json({ success: true, token, user });
  } catch (error) {
    console.error("Erreur lors de la création du token:", error);
    res.status(500).json({ error: "Erreur lors de la création du token" });
  }
});

app.post("/auth/verify", async (req, res) => {
  try {
    const { token } = req.body;
    console.log("Vérification du token");

    const decoded = await verifyToken(token);
    const user = await getUserByToken(decoded.email);

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(401).json({ error: "Token invalide" });
  }
});

// Route pour obtenir les statistiques des tokens
app.get("/auth/stats", async (req, res) => {
  try {
    const tokensArray = Array.from(mockDb.tokens.entries()).map(
      ([id, data]) => ({
        id,
        email: data.email,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        used: data.used,
      })
    );

    const tokenValuesArray = Array.from(mockDb.tokenValues.keys());

    res.json({
      success: true,
      stats: {
        tokens: tokensArray,
        tokenValues: tokenValuesArray,
        tokenValuesCount: mockDb.tokenValues.size,
        tokensCount: mockDb.tokens.size,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des statistiques" });
  }
});

// Route pour vérifier l'état d'authentification
app.get("/api/auth/status", authenticateJWT, (req, res) => {
  console.log(
    "Vérification du statut d'authentification pour:",
    req.user.email
  );
  res.status(200).json({
    success: true,
    authenticated: true,
    user: { email: req.user.email },
  });
});

// Route pour se déconnecter
app.post("/api/auth/logout", (req, res) => {
  console.log("Déconnexion demandée");
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
});

// Route de test pour vérifier que le serveur fonctionne
app.get("/api/health", (req, res) => {
  console.log("Endpoint de santé appelé");
  res
    .status(200)
    .json({ status: "OK", message: "Le serveur fonctionne correctement" });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(
    `Serveur d'authentification par email démarré sur le port ${PORT}`
  );
});

export default app;
