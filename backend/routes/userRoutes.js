const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Créer ou mettre à jour un utilisateur
router.post("/", userController.createOrUpdateUser);

// Obtenir un utilisateur par email
router.get("/email/:email", userController.getUserByEmail);

module.exports = router;
