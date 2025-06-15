const express = require("express");
const router = express.Router();
const User = require("../models/user.schema");
const OAuth = require("../models/oauth.schema");
const jwt = require("jsonwebtoken");
const axios = require("axios");

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
    } else {
      // Vérifier si un utilisateur existe déjà avec cet email
      user = await User.findOne({ email });
      console.log("Utilisateur trouvé par email:", user);

      if (!user) {
        // Créer un nouvel utilisateur avec les informations supplémentaires
        user = new User({
          username: name,
          email: email,
          password: id, // Utiliser l'ID Google comme mot de passe
          isEmailVerified: true, // Google vérifie déjà l'email
          firstName: firstName,
          lastName: lastName,
          preferences: preferences || {
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
          console.log("Compte Google lié à l'utilisateur existant");
        }
      }

      // Créer une nouvelle connexion OAuth
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
      console.log("Nouvelle connexion OAuth créée:", oauthConnection);
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "votre_secret_jwt",
      { expiresIn: "7d" }
    );

    // Mettre à jour le token de l'utilisateur
    user.token = token;
    await user.save();

    const responseData = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: oauthConnection.picture,
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

// Route pour supprimer le compte utilisateur
router.delete("/delete-account", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur requis" });
    }

    // Supprimer toutes les connexions OAuth associées
    await OAuth.deleteMany({ userId });

    // Supprimer l'utilisateur
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du compte" });
  }
});

module.exports = router;
