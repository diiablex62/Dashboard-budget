const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("Aucun token fourni");
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Vérifier le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token décodé:", decodedToken);

    // Ajouter les informations de l'utilisateur à la requête
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    res.status(401).json({ message: "Token invalide" });
  }
};
