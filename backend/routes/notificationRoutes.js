const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Créer une notification
router.post("/", notificationController.createNotification);

// Obtenir toutes les notifications d'un utilisateur
router.get("/user/:userId", notificationController.getUserNotifications);

// Supprimer toutes les notifications d'un utilisateur
router.delete(
  "/user/:userId",
  notificationController.deleteAllUserNotifications
);

module.exports = router;
