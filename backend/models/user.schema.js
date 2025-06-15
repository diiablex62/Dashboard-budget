const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        enum: ["fr", "en"],
        default: "fr",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    token: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    linkedAccounts: [
      {
        provider: {
          type: String,
          enum: ["google", "github", "email"],
        },
        providerId: String,
        linkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour mettre à jour updatedAt
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index pour optimiser les recherches
userSchema.index({ email: 1 });
userSchema.index({ "linkedAccounts.providerId": 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
