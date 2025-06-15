const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token reçu dans authenticateToken:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token d'authentification manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token décodé dans authenticateToken:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = { authenticateToken };
