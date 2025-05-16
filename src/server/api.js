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
  createAuthSession,
  verifyAuthToken,
  createFirebaseToken,
  validateEmail,
  firebaseMockDb,
} from "./emailAuth.js";

const app = express();
const PORT = process.env.PORT || 3000;

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

// Route pour demander un lien magique
app.post("/api/auth/email-login", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Demande de connexion reçue pour:", email);

    if (!email) {
      return res.status(400).json({ success: false, error: "Email requis" });
    }

    // Validation de l'email
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Format d'email invalide" });
    }

    // Récupérer l'origine de la requête pour créer le lien magique
    const origin = req.get("Origin") || `http://localhost:5173`;
    console.log("Origine de la requête:", origin);

    // Créer la session d'authentification et envoyer l'email
    const emailSent = await createAuthSession(email, origin);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Email de connexion envoyé",
        email,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Impossible d'envoyer l'email",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la demande de connexion par email:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Route pour valider un token magique
app.post("/api/auth/verify-token", async (req, res) => {
  try {
    const { token } = req.body;
    console.log(
      "Vérification du token reçue:",
      token ? token.substring(0, 10) + "..." : "null"
    );

    if (!token) {
      return res.status(400).json({ success: false, error: "Token requis" });
    }

    // Vérifier la validité du token
    const { valid, email } = await verifyAuthToken(token);
    console.log("Résultat de la vérification:", { valid, email });

    if (!valid || !email) {
      return res.status(400).json({
        success: false,
        error: "Token invalide ou expiré",
      });
    }

    // Générer un token Firebase pour l'authentification côté client
    const firebaseToken = await createFirebaseToken(email);
    console.log("Firebase token généré avec succès");

    // Créer un JWT avec des données supplémentaires et une date d'expiration
    const now = Math.floor(Date.now() / 1000);
    const jwtExpiresIn = 60 * 60 * 24; // 24 heures en secondes

    const jwtToken = jwt.sign(
      {
        email,
        authenticated: true,
        iat: now, // Issued At - quand le token a été émis
        exp: now + jwtExpiresIn, // Expiration - quand le token expire
        jti: crypto.randomBytes(16).toString("hex"), // JWT ID - identifiant unique du token
      },
      JWT_SECRET
    );

    const cookieMaxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

    // Définir le cookie avec le JWT, avec des options de sécurité appropriées
    res.cookie("token", jwtToken, {
      httpOnly: true, // Empêche l'accès au cookie via JavaScript côté client
      secure: process.env.NODE_ENV === "production", // Sécurisé en production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // En production, pour les domaines croisés
      maxAge: cookieMaxAge,
      path: "/", // Important pour que le cookie soit accessible sur tout le site
    });

    console.log("Cookie JWT défini, durée: 24h");

    return res.status(200).json({
      success: true,
      message: "Authentification réussie",
      firebaseToken,
      email,
      expiresIn: jwtExpiresIn, // Informer le client de la durée de validité
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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

// Route de développement pour réinitialiser un token (uniquement en mode développement)
if (process.env.NODE_ENV !== "production") {
  app.post("/api/auth/reset-token", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: "Token requis" });
      }

      // Cette route n'a de sens qu'en mode émulateur
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        // Vérifier si le token existe
        if (!firebaseMockDb.tokenValues.has(token)) {
          return res
            .status(404)
            .json({ success: false, error: "Token introuvable" });
        }

        // Réinitialiser le token
        const tokenData = firebaseMockDb.tokenValues.get(token);
        tokenData.used = false;
        tokenData.usedAt = null;

        // Mettre à jour la date d'expiration pour 15 minutes à partir de maintenant
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        tokenData.expiresAt = expiresAt;

        // Mettre à jour dans les deux maps
        firebaseMockDb.tokens.set(tokenData.id, tokenData);
        firebaseMockDb.tokenValues.set(token, tokenData);

        console.log("Token réinitialisé:", {
          id: tokenData.id,
          email: tokenData.email,
          expiresAt: tokenData.expiresAt,
          used: tokenData.used,
        });

        return res.status(200).json({
          success: true,
          message: "Token réinitialisé avec succès",
          email: tokenData.email,
        });
      }

      return res.status(400).json({
        success: false,
        error:
          "Cette fonctionnalité n'est disponible qu'en mode développement avec l'émulateur",
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du token:", error);
      res.status(500).json({
        success: false,
        error: "Erreur serveur",
        details: error.message,
      });
    }
  });

  // Route de debug pour voir tous les tokens stockés (uniquement en mode développement)
  app.get("/api/auth/debug/tokens", (req, res) => {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      // Convertir les Maps en objets pour la réponse JSON
      const tokensArray = Array.from(firebaseMockDb.tokens.entries()).map(
        ([id, data]) => ({
          id,
          ...data,
          token: data.token ? data.token.substring(0, 8) + "..." : null,
        })
      );

      const tokenValuesArray = Array.from(
        firebaseMockDb.tokenValues.keys()
      ).map((token) => ({
        token: token.substring(0, 8) + "...",
      }));

      return res.status(200).json({
        success: true,
        tokens: tokensArray,
        tokenValues: tokenValuesArray,
        tokenValuesCount: firebaseMockDb.tokenValues.size,
        tokensCount: firebaseMockDb.tokens.size,
      });
    }

    return res.status(400).json({
      success: false,
      error:
        "Cette fonctionnalité n'est disponible qu'en mode développement avec l'émulateur",
    });
  });

  // Route pour créer un token de test (uniquement en mode développement)
  app.post("/api/auth/debug/create-token", async (req, res) => {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email requis pour créer un token de test",
          });
        }

        // Générer un token aléatoire
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString("hex");

        // Créer une date d'expiration (15 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Créer un ID pour le token
        const tokenId = crypto.randomBytes(16).toString("hex");

        // Stocker le token dans les deux maps
        const tokenData = {
          id: tokenId,
          email,
          token,
          createdAt: new Date(),
          expiresAt,
          used: false,
          usedAt: null,
        };

        // Ajouter aux deux maps
        firebaseMockDb.tokens.set(tokenId, tokenData);
        firebaseMockDb.tokenValues.set(token, tokenData);

        console.log("Token de test créé:", {
          email,
          token: token.substring(0, 8) + "...",
          id: tokenId,
        });

        return res.status(200).json({
          success: true,
          message: "Token de test créé avec succès",
          token,
          email,
          expiresAt,
        });
      } catch (error) {
        console.error("Erreur lors de la création du token de test:", error);
        return res.status(500).json({
          success: false,
          error: "Erreur lors de la création du token de test",
          details: error.message,
        });
      }
    }

    return res.status(400).json({
      success: false,
      error:
        "Cette fonctionnalité n'est disponible qu'en mode développement avec l'émulateur",
    });
  });

  // Route pour tester la création et la validation d'un JWT (uniquement en mode développement)
  app.post("/api/auth/debug/jwt-test", (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(404)
        .json({ error: "Route non disponible en production" });
    }

    try {
      const { email = "test@example.com" } = req.body;

      // Créer un token JWT avec une durée de validité de 1 heure
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 60 * 60; // 1 heure en secondes

      const token = jwt.sign(
        {
          email,
          authenticated: true,
          iat: now, // Issued At - quand le token a été émis
          exp: now + expiresIn, // Expiration - quand le token expire
          jti: crypto.randomBytes(16).toString("hex"), // JWT ID - identifiant unique du token
        },
        JWT_SECRET
      );

      // Décoder le token pour afficher son contenu
      const decoded = jwt.decode(token);

      // Envoyer le token dans un cookie pour tester
      res.cookie("jwt_test", token, {
        httpOnly: true,
        secure: false, // Pour le test en local
        maxAge: expiresIn * 1000,
        path: "/",
      });

      res.status(200).json({
        success: true,
        message: "JWT créé et validé avec succès",
        token,
        decoded,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        cookieSet: true,
      });
    } catch (error) {
      console.error("Erreur lors du test JWT:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors du test JWT",
        details: error.message,
      });
    }
  });

  // Route pour vérifier un JWT de test (uniquement en mode développement)
  app.get("/api/auth/debug/jwt-verify", (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(404)
        .json({ error: "Route non disponible en production" });
    }

    try {
      // Récupérer le token du cookie ou du paramètre token
      const token = req.cookies.jwt_test || req.query.token;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: "Aucun token trouvé",
        });
      }

      try {
        // Vérifier le token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Vérifier l'expiration
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
          return res.status(401).json({
            success: false,
            error: "Token expiré",
            expiresAt: new Date(decoded.exp * 1000).toISOString(),
            now: new Date(now * 1000).toISOString(),
          });
        }

        return res.status(200).json({
          success: true,
          message: "Token valide",
          decoded,
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          remainingTime: Math.floor(decoded.exp - now) + " secondes",
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: "Token invalide",
          details: error.message,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du JWT:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la vérification du JWT",
        details: error.message,
      });
    }
  });
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(
    `Serveur d'authentification par email démarré sur le port ${PORT}`
  );
});

export default app;
