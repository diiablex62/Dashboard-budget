const mongoose = require("mongoose");

const oauthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["google", "github"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: String,
    picture: String,
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour s'assurer qu'un utilisateur ne peut pas avoir plusieurs connexions du même provider
oauthSchema.index({ userId: 1, provider: 1 }, { unique: true });

// Index pour rechercher rapidement par providerId
oauthSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model("OAuth", oauthSchema);
