const express = require("express");
const router = express.Router();
const User = require("../models/user.schema");
const OAuth = require("../models/oauth.schema");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Route pour l'authentification Google
router.post("/google", async (req, res) => {
  try {
    console.log("Données reçues du frontend:", req.body);
    const {
      accessToken,
      id,
      email,
      name,
      picture,
      firstName,
      lastName,
      preferences,
    } = req.body;

    // Vérifier si une connexion OAuth existe déjà pour cet ID Google
    let oauthConnection = await OAuth.findOne({
      provider: "google",
      providerId: id,
    });

    console.log("Connexion OAuth existante:", oauthConnection);

    let user;

    if (oauthConnection) {
      // Récupérer l'utilisateur associé
      user = await User.findById(oauthConnection.userId);
      console.log("Utilisateur existant trouvé:", user);

      // Mettre à jour la connexion OAuth
      oauthConnection.lastLoginAt = new Date();
      oauthConnection.accessToken = accessToken;
      oauthConnection.name = name;
      oauthConnection.picture = picture;
      await oauthConnection.save();

      // Mettre à jour les champs de l'utilisateur principal uniquement s'ils ne sont pas déjà définis
      if (!user.username) {
        user.username = name;
      }
      if (!user.firstName) {
        user.firstName = firstName;
      }
      if (!user.lastName) {
        user.lastName = lastName;
      }
      // La photo de profil est toujours mise à jour pour s'assurer qu'elle est à jour
      if (picture && user.picture !== picture) {
        user.picture = picture;
      }
      // L'email n'est pas mis à jour ici car il est la clé de liaison principale

      await user.save();
      console.log(
        "Informations utilisateur mises à jour depuis Google (existant)."
      );
    } else {
      // Vérifier si un utilisateur existe déjà avec cet email
      user = await User.findOne({ email });

      if (!user) {
        // Créer un nouvel utilisateur avec les informations Google
        user = new User({
          username: name,
          email: email,
          password: id, // TODO: Sécuriser davantage si l'utilisateur n'a pas de mot de passe
          isEmailVerified: true,
          firstName: firstName,
          lastName: lastName,
          picture: picture,
          preferences: {
            theme: "light",
            language: "fr",
            notifications: true,
          },
          linkedAccounts: [
            {
              provider: "google",
              providerId: id,
            },
          ],
        });
        await user.save();
        console.log("Nouvel utilisateur créé:", user);
      } else {
        // Utilisateur existant trouvé par email, lier le compte Google
        // Mettre à jour les champs de l'utilisateur principal uniquement s'ils ne sont pas déjà définis
        if (!user.username) {
          user.username = name;
        }
        if (!user.firstName) {
          user.firstName = firstName;
        }
        if (!user.lastName) {
          user.lastName = lastName;
        }
        // La photo de profil est toujours mise à jour pour s'assurer qu'elle est à jour
        if (picture && user.picture !== picture) {
          user.picture = picture;
        }
        // L'email n'est pas mis à jour ici car il est la clé de liaison principale

        await user.save();
        console.log(
          "Informations utilisateur existantes mises à jour lors de la liaison Google."
        );

        // Ajouter Google comme compte lié s'il n'existe pas déjà
        const hasGoogleAccount = user.linkedAccounts.some(
          (account) =>
            account.provider === "google" && account.providerId === id
        );

        if (!hasGoogleAccount) {
          user.linkedAccounts.push({
            provider: "google",
            providerId: id,
          });
          await user.save();
          console.log("Compte Google lié à l'utilisateur existant.");
        }

        // Créer/Mettre à jour la connexion OAuth pour cet utilisateur existant
        oauthConnection = new OAuth({
          userId: user._id,
          provider: "google",
          providerId: id,
          email: email, // L'email dans OAuth est celui de Google
          name: name,
          picture: picture,
          accessToken: accessToken,
          lastLoginAt: new Date(),
        });
        await oauthConnection.save();
        console.log(
          "Nouvelle connexion OAuth créée pour l'utilisateur existant:",
          oauthConnection
        );
      }
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "votre_secret_jwt",
      { expiresIn: "7d" }
    );

    // Mettre à jour le token de l'utilisateur dans la base de données
    user.token = token;
    await user.save();

    console.log(
      "Photo de profil de l'utilisateur avant envoi au frontend:",
      user.picture
    );

    const responseData = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        preferences: user.preferences,
        token: user.token,
        linkedAccounts: user.linkedAccounts,
      },
    };

    console.log("Réponse envoyée au frontend:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Erreur lors de l'authentification Google:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'authentification Google" });
  }
});

// Route pour proxyfier les images de Google
router.get("/proxy-google-image", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl || !imageUrl.startsWith("https://lh3.googleusercontent.com/")) {
    return res
      .status(400)
      .json({ message: "URL d'image Google invalide ou manquante." });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    res.set("Content-Type", response.headers["content-type"]);
    res.set("Access-Control-Allow-Origin", "*");
    res.send(response.data);
  } catch (error) {
    console.error("Erreur lors de la proxyfication de l'image Google:", error);
    res.status(500).json({ message: "Impossible de charger l'image." });
  }
});

// Route pour supprimer le compte utilisateur
router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Correction ici : utiliser userId au lieu de id
    console.log("ID utilisateur extrait du token pour suppression:", userId);

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer toutes les connexions OAuth associées
    await OAuth.deleteMany({ userId });

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression du compte",
      error: error.message,
    });
  }
});

// Nouvelle route pour la mise à jour du profil utilisateur
router.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body; // Les données à mettre à jour envoyées par le frontend

    console.log(
      "Requête de mise à jour de profil reçue pour l'utilisateur:",
      userId
    );
    console.log("Données de mise à jour (req.body):".updates);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur trouvé avant mise à jour:", user);

    // Mettre à jour les champs autorisés (par exemple, username, firstName, lastName, email)
    // Assurez-vous de ne pas permettre la mise à jour de champs sensibles comme le mot de passe ici
    if (updates.username !== undefined) {
      user.username = updates.username;
    }
    if (updates.firstName !== undefined) {
      user.firstName = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      user.lastName = updates.lastName;
    }
    if (updates.email !== undefined) {
      user.email = updates.email;
    }
    if (updates.picture !== undefined) {
      user.picture = updates.picture;
    }
    // Ajoutez d'autres champs si nécessaire

    await user.save();
    console.log("Utilisateur après sauvegarde:", user);

    // Retourner les informations utilisateur mises à jour (sans le token si non nécessaire)
    const updatedUserResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      preferences: user.preferences,
      linkedAccounts: user.linkedAccounts,
    };

    res.json({
      message: "Profil mis à jour avec succès",
      user: updatedUserResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du profil",
      error: error.message,
    });
  }
});

module.exports = router;
