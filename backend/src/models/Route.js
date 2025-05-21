const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    component: {
      type: String,
      required: true,
      trim: true,
    },
    isAuth: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["auth", "legal", "main", "other"],
      default: "main",
    },
    icon: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les recherches
routeSchema.index({ category: 1 });
routeSchema.index({ order: 1 });

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;
