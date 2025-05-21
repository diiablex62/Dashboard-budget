const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  montant: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["depense", "revenu", "recurrent", "echelonne"],
  },
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Pour les dépenses échelonnées
  nombreEcheances: {
    type: Number,
    default: 1,
  },
  echeancesRestantes: {
    type: Number,
    default: 1,
  },
  // Pour les dépenses récurrentes
  frequence: {
    type: String,
    enum: ["mensuel", "trimestriel", "annuel"],
    default: "mensuel",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
