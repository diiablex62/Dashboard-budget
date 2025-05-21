const Notification = require("../models/Notification");

// Créer une notification
exports.createNotification = async (req, res) => {
  try {
    console.log("Création notification:", req.body);
    const { type, title, desc, userId } = req.body;

    const notification = new Notification({
      type,
      title,
      desc,
      date: new Date().toLocaleDateString("fr-FR"),
      userId,
      read: false,
    });

    await notification.save();
    console.log("Notification créée:", notification);
    res.status(201).json(notification);
  } catch (error) {
    console.error("Erreur création notification:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les notifications d'un utilisateur
exports.getUserNotifications = async (req, res) => {
  try {
    console.log(
      "Récupération notifications pour utilisateur:",
      req.params.userId
    );
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    console.log(`${notifications.length} notifications trouvées`);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer toutes les notifications d'un utilisateur
exports.deleteAllUserNotifications = async (req, res) => {
  try {
    console.log(
      "Suppression notifications pour utilisateur:",
      req.params.userId
    );
    await Notification.deleteMany({ userId: req.params.userId });

    console.log("Toutes les notifications supprimées");
    res
      .status(200)
      .json({ message: "Toutes les notifications ont été supprimées" });
  } catch (error) {
    console.error("Erreur suppression notifications:", error);
    res.status(500).json({ message: error.message });
  }
};
