const User = require("../models/User");

// Créer ou mettre à jour un utilisateur
exports.createOrUpdateUser = async (req, res) => {
  try {
    console.log("Création/mise à jour utilisateur:", req.body);
    const { displayName, emails, authMethods, photoURL, lastProvider } =
      req.body;

    const user = await User.findOneAndUpdate(
      { emails: { $in: emails } },
      {
        displayName,
        emails,
        authMethods,
        photoURL,
        lastLogin: new Date(),
        lastProvider,
      },
      { upsert: true, new: true }
    );

    console.log("Utilisateur créé/mis à jour:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur création/mise à jour utilisateur:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un utilisateur par email
exports.getUserByEmail = async (req, res) => {
  try {
    console.log("Recherche utilisateur par email:", req.params.email);
    const user = await User.findOne({ emails: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur trouvé:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur recherche utilisateur:", error);
    res.status(500).json({ message: error.message });
  }
};
