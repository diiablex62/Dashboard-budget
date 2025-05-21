require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const routeRoutes = require("./routes/routeRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/routes", routeRoutes);

console.log(
  "Tentative de connexion à MongoDB avec l'URI:",
  process.env.MONGO_URI
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connecté à MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Serveur démarré sur le port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("Erreur de connexion à MongoDB:", error);
  });

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ message: "Erreur serveur interne" });
});
