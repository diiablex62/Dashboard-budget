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
    console.log("----------------------------------------------------");
    console.log("Début de l'authentification Google");
    console.log("Données reçues du frontend (Google):", req.body);
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

    let oauthConnection = await OAuth.findOne({
      provider: "google",
      providerId: id,
    });
    let user;
    let isNewUser = false;

    console.log("Connexion OAuth existante trouvée:", !!oauthConnection);

    if (oauthConnection) {
      user = await User.findById(oauthConnection.userId);
      console.log("Utilisateur trouvé par OAuth (avant MAJ):", user.picture);
      console.log("OAuth Connection (avant MAJ):", oauthConnection.picture);

      oauthConnection.lastLoginAt = new Date();
      oauthConnection.accessToken = accessToken;
      oauthConnection.name = name;
      oauthConnection.picture = picture;
      await oauthConnection.save();
      console.log(
        "OAuth Connection mise à jour. Photo OAuth:",
        oauthConnection.picture
      );

      // La photo de profil est mise à jour UNIQUEMENT si l'utilisateur n'en a pas encore.
      if (!user.picture && picture) {
        user.picture = picture;
        console.log(
          "Photo utilisateur mise à jour via Google (car vide auparavant)."
        );
      } else if (user.picture && picture && user.picture === picture) {
        console.log(
          "Photo utilisateur inchangée (identique à Google). C'est déjà la photo Google."
        );
      } else if (user.picture && picture && user.picture !== picture) {
        console.log(
          "Photo utilisateur personnalisée existante détectée. PAS de mise à jour par Google."
        );
      } else {
        console.log("Pas de photo Google ou pas de mise à jour nécessaire.");
      }

      if (!user.username) user.username = name;
      if (!user.firstName) user.firstName = firstName;
      if (!user.lastName) user.lastName = lastName;
      await user.save();
      console.log(
        "Utilisateur après save (picture finale dans User Model):",
        user.picture
      );
    } else {
      user = await User.findOne({ email });
      console.log(
        "Utilisateur trouvé par email (avant création/liaison):",
        user ? user.picture : "(nouvel utilisateur ou pas de photo)"
      );

      if (!user) {
        isNewUser = true;
        user = new User({
          username: name,
          email: email,
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
        console.log(
          "Nouvel utilisateur créé. Photo initiale (User Model):",
          user.picture
        );
      } else {
        // Utilisateur existant trouvé par email, lier le compte Google
        console.log(
          "Utilisateur existant par email (avant liaison/MAJ):",
          user.picture
        );

        // La photo de profil est mise à jour UNIQUEMENT si l'utilisateur n'en a pas encore.
        if (!user.picture && picture) {
          user.picture = picture;
          console.log(
            "Photo utilisateur mise à jour via Google (car vide auparavant) lors de la liaison."
          );
        } else if (user.picture && picture && user.picture === picture) {
          console.log(
            "Photo utilisateur inchangée (identique à Google) lors de la liaison."
          );
        } else if (user.picture && picture && user.picture !== picture) {
          console.log(
            "Photo utilisateur personnalisée existante détectée. PAS de mise à jour par Google lors de la liaison."
          );
        } else {
          console.log(
            "Pas de photo Google ou pas de mise à jour nécessaire lors de la liaison."
          );
        }

        if (!user.username) user.username = name;
        if (!user.firstName) user.firstName = firstName;
        if (!user.lastName) user.lastName = lastName;
        await user.save();
        console.log(
          "Utilisateur après save (picture finale dans User Model) lors de la liaison:",
          user.picture
        );

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

        oauthConnection = new OAuth({
          userId: user._id,
          provider: "google",
          providerId: id,
          email: email,
          name: name,
          picture: picture,
          accessToken: accessToken,
          lastLoginAt: new Date(),
        });
        await oauthConnection.save();
        console.log(
          "Nouvelle connexion OAuth créée/mise à jour pour l'utilisateur existant. Photo OAuth:",
          oauthConnection.picture
        );
      }
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "votre_secret_jwt",
      { expiresIn: "7d" }
    );

    user.token = token;
    await user.save();

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
      isNewUser: isNewUser,
    };
    console.log(
      "Photo envoyée au frontend dans responseData:",
      responseData.user.picture
    );
    console.log("Fin de l'authentification Google");
    console.log("----------------------------------------------------");
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

// Route pour la mise à jour du profil
router.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { username, firstName, lastName, picture } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mise à jour des champs
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // Gestion de la photo de profil
    if (picture) {
      // Si c'est une image en base64, on la stocke directement
      if (picture.startsWith("data:image")) {
        user.picture = picture;
      }
      // Si c'est une URL Google proxifiée, on la stocke telle quelle
      else if (picture.includes("/api/auth/proxy-google-image")) {
        user.picture = picture;
      }
      // Sinon, on proxifie l'URL Google
      else if (picture.includes("googleusercontent.com")) {
        user.picture = `${
          process.env.FRONTEND_URL
        }/api/auth/proxy-google-image?url=${encodeURIComponent(picture)}`;
      }
    }

    await user.save();

    res.json({
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
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil" });
  }
});

module.exports = router;
