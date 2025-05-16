import nodemailer from "nodemailer";
import admin from "firebase-admin";
import crypto from "crypto";

// Log des variables d'environnement pour le debugging
console.log(
  "Configuration Firebase avec PROJECT_ID:",
  process.env.FIREBASE_PROJECT_ID || "budget-e4f90"
);
console.log(
  "Configuration Email avec USER:",
  process.env.EMAIL_USER || "alexandre.janacek@gmail.com"
);

// Solution temporaire pour le développement - utilisation d'un émulateur Firebase
// En production, utilisez vos propres identifiants Firebase Admin
const firebaseMockDb = {
  tokens: new Map(),
  users: new Map(),
  // Stockage spécial pour les tokens par valeur pour une recherche plus facile
  tokenValues: new Map(),
};

let firebaseApp;
// Configuration pour Firebase Admin (à ajuster selon votre projet)
try {
  if (!admin.apps.length) {
    // En mode développement, si les clés ne sont pas définies, utiliser une configuration simplifiée
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.log(
        "Mode développement: utilisation d'une configuration Firebase Admin simplifiée"
      );
      firebaseApp = {
        // Simuler Firestore avec un Map en mémoire
        firestore: () => ({
          collection: (name) => ({
            add: async (data) => {
              const id = crypto.randomBytes(16).toString("hex");
              firebaseMockDb.tokens.set(id, { id, ...data });
              console.log(`Token ajouté: ${id}`, data);
              return { id };
            },
            where: (field, op, value) => ({
              limit: (num) => ({
                get: async () => {
                  // Simuler une recherche dans la collection
                  console.log(
                    `Recherche de tokens avec ${field} ${op} ${value}`
                  );
                  // Debug: afficher tous les tokens en base
                  console.log(
                    "Tous les tokens disponibles:",
                    Array.from(firebaseMockDb.tokens.values())
                  );

                  let matchingDocs = [];
                  try {
                    matchingDocs = Array.from(firebaseMockDb.tokens.values())
                      .filter((item) => {
                        console.log(
                          `Comparaison: ${item[field]} ${op} ${value} => ${
                            item[field] === value
                          }`
                        );
                        return item[field] === value;
                      })
                      .slice(0, num)
                      .map((item) => ({
                        id: item.id,
                        ref: {
                          update: async (updateData) => {
                            const currentData = firebaseMockDb.tokens.get(
                              item.id
                            );
                            firebaseMockDb.tokens.set(item.id, {
                              ...currentData,
                              ...updateData,
                            });
                            console.log(
                              `Token mis à jour: ${item.id}`,
                              updateData
                            );
                          },
                        },
                        data: () => item,
                      }));
                  } catch (error) {
                    console.error(
                      "Erreur lors de la recherche de tokens:",
                      error
                    );
                  }

                  console.log(`${matchingDocs.length} résultats trouvés`);
                  return {
                    empty: matchingDocs.length === 0,
                    docs: matchingDocs,
                  };
                },
              }),
            }),
          }),
          batch: () => {
            const deletes = [];
            return {
              delete: (ref) => deletes.push(ref),
              commit: async () => {
                deletes.forEach((ref) => firebaseMockDb.tokens.delete(ref.id));
                console.log(`${deletes.length} tokens supprimés`);
                return true;
              },
            };
          },
        }),
        // Simuler Auth
        auth: () => ({
          getUserByEmail: async (email) => {
            const user = Array.from(firebaseMockDb.users.values()).find(
              (u) => u.email === email
            );
            if (!user) throw { code: "auth/user-not-found" };
            return user;
          },
          createUser: async (userData) => {
            const uid = crypto.randomBytes(16).toString("hex");
            const user = { uid, ...userData };
            firebaseMockDb.users.set(uid, user);
            console.log(`Utilisateur créé: ${uid}`, userData);
            return user;
          },
          createCustomToken: async (uid) => {
            // Simuler la création d'un token JWT
            const token = `mock_firebase_token_${uid}_${Date.now()}`;
            console.log(`Token Firebase créé pour ${uid}: ${token}`);
            return token;
          },
        }),
      };
    } else {
      // En production, utiliser la configuration Firebase Admin normale
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "budget-e4f90",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        databaseURL: `https://${
          process.env.FIREBASE_PROJECT_ID || "budget-e4f90"
        }.firebaseio.com`,
      });
      firebaseApp = admin;
    }
  } else {
    firebaseApp = admin;
  }
} catch (error) {
  console.error("Erreur d'initialisation Firebase Admin:", error);
  // Utiliser la configuration simplifiée en cas d'erreur
  console.log("Utilisation du mode développement après erreur");
  firebaseApp = {
    // Simuler Firestore avec un Map en mémoire (même configuration que ci-dessus)
    // ... (copie du code ci-dessus)
  };
}

// Configuration de Nodemailer (utiliser un service SMTP réel en production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "alexandre.janacek@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "rmye cowi tafj opbi",
  },
});

// Collection Firestore pour stocker les tokens de connexion
const db = firebaseApp.firestore();
const tokensCollection = db.collection("emailAuthTokens");

// Validation de format d'email
const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Générer un token unique pour l'authentification
const generateAuthToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Envoyer un email avec le lien magique de connexion
const sendAuthEmail = async (email, token, origin) => {
  console.log(`Envoi d'un email d'authentification à ${email}`);

  const magicLink = `${origin}/auth/confirm?token=${token}`;
  const currentYear = new Date().getFullYear();

  const mailOptions = {
    from: {
      name: "Budget Dashboard",
      address: process.env.EMAIL_USER || "alexandre.janacek@gmail.com",
    },
    to: email,
    subject: "Connexion à votre compte Budget",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connexion à votre compte Budget</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eaeaea;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4285f4;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #4285f4;
          color: white !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 500;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background-color: #3367d6;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          color: #6c757d;
          font-size: 12px;
          border-top: 1px solid #eaeaea;
        }
        .expiration {
          background-color: #fff8e1;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
          font-size: 14px;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Budget Dashboard</div>
        </div>
        <div class="content">
          <h2>Bonjour,</h2>
          <p>Vous avez demandé à vous connecter à votre compte Budget Dashboard. Cliquez sur le bouton ci-dessous pour vous connecter :</p>
          
          <div style="text-align: center;">
            <a href="${magicLink}" class="button">Se connecter</a>
          </div>
          
          <div class="expiration">
            <strong>Note :</strong> Ce lien est valable pendant 15 minutes et ne peut être utilisé qu'une seule fois.
          </div>
          
          <p>Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.</p>
          
          <p>Cordialement,<br>L'équipe Budget Dashboard</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Budget Dashboard. Tous droits réservés.</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
    `,
    text: `
    Bonjour,
    
    Vous avez demandé à vous connecter à votre compte Budget Dashboard. Copiez et collez le lien ci-dessous dans votre navigateur pour vous connecter :
    
    ${magicLink}
    
    Note : Ce lien est valable pendant 15 minutes et ne peut être utilisé qu'une seule fois.
    
    Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.
    
    Cordialement,
    L'équipe Budget Dashboard
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé avec succès à ${email}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return false;
  }
};

// Créer un token d'authentification et envoyer l'email
const createAuthSession = async (email, origin) => {
  try {
    console.log("Création d'une session d'authentification pour:", email);

    // Génération d'un token unique
    const token = generateAuthToken();
    console.log("Token généré:", token);

    // Définir la date d'expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // En mode développement, gérer différemment selon si on utilise l'émulateur ou Firebase réel
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.log("Mode développement: gestion simplifiée des tokens");

      // Nettoyage des anciens tokens pour cet email
      // Parcourir tous les tokens et supprimer ceux associés à cet email
      for (const [tokenId, tokenData] of firebaseMockDb.tokens.entries()) {
        if (tokenData.email === email) {
          console.log(`Suppression du token ancien: ${tokenId}`);
          firebaseMockDb.tokens.delete(tokenId);
          // Si le token est également dans tokenValues, le supprimer
          if (
            tokenData.token &&
            firebaseMockDb.tokenValues.has(tokenData.token)
          ) {
            firebaseMockDb.tokenValues.delete(tokenData.token);
          }
        }
      }

      // Créer un nouveau token - stockage simplifié
      const tokenId = crypto.randomBytes(16).toString("hex");
      const tokenData = {
        id: tokenId,
        email,
        token,
        createdAt: new Date(),
        expiresAt,
        used: false,
      };

      // Stocker dans les deux maps pour faciliter l'accès
      firebaseMockDb.tokens.set(tokenId, tokenData);
      // Important: stocker également par valeur du token pour une recherche rapide
      firebaseMockDb.tokenValues.set(token, tokenData);

      console.log("Token ajouté:", {
        id: tokenId,
        email,
        token: token.substring(0, 8) + "...",
        expiresAt,
      });
    } else {
      // En production, utiliser Firestore normalement
      console.log("Mode production: utilisation de Firestore");

      // Suppression des anciens tokens pour cet email
      const snapshot = await tokensCollection.where("email", "==", email).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      // Stockage du nouveau token
      await tokensCollection.add({
        email,
        token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt,
        used: false,
      });
    }

    // Envoi de l'email avec le lien magique
    return await sendAuthEmail(email, token, origin);
  } catch (error) {
    console.error("Erreur lors de la création de la session:", error);
    throw error;
  }
};

// Vérifier et valider un token d'authentification
const verifyAuthToken = async (token) => {
  try {
    if (!token) {
      console.error("Token non fourni");
      return { valid: false, email: null };
    }

    console.log("Vérification du token:", token.substring(0, 8) + "...");

    // Vérification directe dans la collection de tokens (émulateur)
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.log("Mode émulateur: vérification simplifiée du token");

      // Vérification directe par la valeur du token (plus fiable)
      if (!firebaseMockDb.tokenValues.has(token)) {
        console.log("Token introuvable dans l'émulateur (méthode directe)");
        return { valid: false, email: null };
      }

      // Récupérer les données du token
      const tokenData = firebaseMockDb.tokenValues.get(token);
      console.log("Token trouvé dans l'émulateur:", {
        id: tokenData.id,
        email: tokenData.email,
        createdAt: tokenData.createdAt,
        expiresAt: tokenData.expiresAt,
        used: tokenData.used,
      });

      // En mode développement, permettre la réutilisation du token si utilisé récemment
      if (tokenData.used) {
        const now = new Date();
        // Si le token a été utilisé et qu'une date d'utilisation existe
        if (tokenData.usedAt) {
          // Autoriser la réutilisation dans les 30 minutes qui suivent
          const minutesSinceUsed = (now - tokenData.usedAt) / (1000 * 60);
          console.log(
            `Minutes écoulées depuis utilisation: ${minutesSinceUsed}`
          );

          // Si utilisé il y a moins de 30 minutes, autoriser en développement
          if (minutesSinceUsed < 30) {
            console.log(
              "Token réutilisé en mode développement (utilisé récemment)"
            );
            return { valid: true, email: tokenData.email };
          }
        }
        console.log("Token déjà utilisé et trop ancien pour être réutilisé");
        return { valid: false, email: null };
      }

      // Vérification de l'expiration
      const now = new Date();
      const expiresAt = tokenData.expiresAt;

      if (now > expiresAt) {
        console.log("Token expiré");
        return { valid: false, email: null };
      }

      // Marquer comme utilisé
      tokenData.used = true;
      tokenData.usedAt = new Date();

      // Mettre à jour dans les deux maps
      firebaseMockDb.tokens.set(tokenData.id, tokenData);
      firebaseMockDb.tokenValues.set(token, tokenData);

      console.log("Token validé pour:", tokenData.email);
      return { valid: true, email: tokenData.email };
    }

    // Méthode normale pour Firestore réel
    const snapshot = await tokensCollection
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log("Token inconnu");
      return { valid: false, email: null };
    }

    const doc = snapshot.docs[0];
    const tokenData = doc.data();
    console.log("Données du token:", tokenData);

    // Vérification de la validité du token
    if (tokenData.used) {
      console.log("Token déjà utilisé");
      return { valid: false, email: null };
    }

    const now = new Date();
    const expiresAt =
      tokenData.expiresAt instanceof Date
        ? tokenData.expiresAt
        : tokenData.expiresAt.toDate();

    if (now > expiresAt) {
      console.log("Token expiré");
      return { valid: false, email: null };
    }

    // Marquer le token comme utilisé
    await doc.ref.update({
      used: true,
      usedAt: !process.env.FIREBASE_PRIVATE_KEY
        ? new Date()
        : admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Token validé pour:", tokenData.email);
    return { valid: true, email: tokenData.email };
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    throw error;
  }
};

// Créer un compte utilisateur Firebase si nécessaire
const ensureUserExists = async (email) => {
  try {
    console.log("Vérification de l'existence de l'utilisateur:", email);

    // Vérifier si l'utilisateur existe déjà
    const userRecord = await firebaseApp.auth().getUserByEmail(email);
    console.log("Utilisateur existant:", userRecord.uid);
    return userRecord.uid;
  } catch (error) {
    // Si l'utilisateur n'existe pas, le créer
    if (error.code === "auth/user-not-found") {
      console.log("Création d'un nouvel utilisateur pour:", email);
      const userRecord = await firebaseApp.auth().createUser({
        email,
        emailVerified: true, // L'utilisateur a prouvé qu'il possède l'email
      });
      console.log("Nouvel utilisateur créé:", userRecord.uid);
      return userRecord.uid;
    }
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
    throw error;
  }
};

// Générer un token Firebase pour l'authentification du client
const createFirebaseToken = async (email) => {
  try {
    console.log("Création d'un token Firebase pour:", email);
    const uid = await ensureUserExists(email);

    if (!process.env.FIREBASE_PRIVATE_KEY) {
      // En mode développement, créer un JWT valide au lieu d'une chaîne simple
      console.log("Mode développement: création d'un JWT simulé pour Firebase");

      // Structure d'un JWT: header.payload.signature
      const header = Buffer.from(
        JSON.stringify({
          alg: "HS256",
          typ: "JWT",
        })
      )
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const now = Math.floor(Date.now() / 1000);
      const payload = Buffer.from(
        JSON.stringify({
          iss: "firebase-admin-sdk",
          sub: uid,
          aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
          iat: now,
          exp: now + 3600, // 1 heure
          uid: uid,
          claims: {
            email: email,
            email_verified: true,
          },
        })
      )
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      // Signature simulée (en environnement de dev, nous ne nous soucions pas de la signature réelle)
      const signature = Buffer.from("signature-simulee-pour-dev-seulement")
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const customToken = `${header}.${payload}.${signature}`;
      console.log("Token Firebase format JWT créé pour développement");
      return customToken;
    }

    // Créer un token personnalisé Firebase
    const token = await firebaseApp.auth().createCustomToken(uid);
    console.log("Token Firebase créé avec succès");
    return token;
  } catch (error) {
    console.error("Erreur lors de la création du token Firebase:", error);
    throw error;
  }
};

export {
  createAuthSession,
  verifyAuthToken,
  createFirebaseToken,
  validateEmail,
  firebaseMockDb,
};
