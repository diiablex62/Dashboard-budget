const express = require("express");
const router = express.Router();
const Route = require("../src/models/Route");
const auth = require("../src/middleware/auth");

// Récupérer toutes les routes
router.get("/", async (req, res) => {
  try {
    console.log("Récupération de toutes les routes");
    const routes = await Route.find().sort({ order: 1 });
    res.json(routes);
  } catch (error) {
    console.error("Erreur lors de la récupération des routes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer les routes par catégorie
router.get("/category/:category", async (req, res) => {
  try {
    console.log(
      "Récupération des routes pour la catégorie:",
      req.params.category
    );
    const routes = await Route.find({ category: req.params.category }).sort({
      order: 1,
    });
    res.json(routes);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des routes par catégorie:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Créer une nouvelle route (admin uniquement)
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log("Création d'une nouvelle route:", req.body);
    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    console.error("Erreur lors de la création de la route:", error);
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour une route (admin uniquement)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log("Mise à jour de la route:", req.params.id);
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) {
      return res.status(404).json({ message: "Route non trouvée" });
    }
    res.json(route);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la route:", error);
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une route (admin uniquement)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log("Suppression de la route:", req.params.id);
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route non trouvée" });
    }
    res.json({ message: "Route supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la route:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
