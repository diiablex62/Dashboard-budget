import express from "express";
import cors from "cors";
import {
  createToken,
  verifyToken,
  createUser,
  getUserByEmail,
} from "./emailAuth";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

    res.json({ success: true, token });
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
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(401).json({ error: "Token invalide" });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
