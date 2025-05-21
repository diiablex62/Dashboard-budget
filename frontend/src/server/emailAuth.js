import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Configuration de la base de données en mémoire pour le développement
const mockDb = {
  tokens: new Map(),
  tokenValues: new Map(),
  users: new Map(),
};

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt";
const JWT_EXPIRATION = "24h";

// Fonctions d'authentification
const createToken = async (email) => {
  console.log("Création d'un token pour:", email);

  const tokenId = uuidv4();
  const token = jwt.sign({ email, tokenId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  const tokenData = {
    id: tokenId,
    email,
    token,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
    used: false,
  };

  mockDb.tokens.set(tokenId, tokenData);
  mockDb.tokenValues.set(token, tokenData);

  console.log("Token créé avec succès");
  return token;
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const tokenData = mockDb.tokenValues.get(token);

    if (!tokenData || tokenData.used) {
      throw new Error("Token invalide ou déjà utilisé");
    }

    return decoded;
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    throw error;
  }
};

const createUser = async (email) => {
  const uid = uuidv4();
  const user = {
    uid,
    email,
    createdAt: new Date(),
  };

  mockDb.users.set(uid, user);
  return user;
};

const getUserByEmail = async (email) => {
  return Array.from(mockDb.users.values()).find((user) => user.email === email);
};

// Nettoyage des tokens expirés
const cleanupExpiredTokens = () => {
  const now = new Date();

  for (const [tokenId, tokenData] of mockDb.tokens.entries()) {
    if (tokenData.expiresAt < now) {
      mockDb.tokens.delete(tokenId);
      mockDb.tokenValues.delete(tokenData.token);
    }
  }
};

// Exécuter le nettoyage toutes les heures
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  createToken,
  verifyToken,
  createUser,
  getUserByEmail,
  mockDb,
};
