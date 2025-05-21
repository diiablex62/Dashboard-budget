const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Créer une transaction
router.post("/", transactionController.createTransaction);

// Obtenir toutes les transactions d'un utilisateur
router.get("/user/:userId", transactionController.getUserTransactions);

// Mettre à jour une transaction
router.put("/:id", transactionController.updateTransaction);

// Supprimer une transaction
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
