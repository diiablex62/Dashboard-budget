const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

// Créer une transaction
exports.createTransaction = async (req, res) => {
  try {
    console.log("Création transaction:", req.body);
    const transaction = new Transaction(req.body);
    await transaction.save();

    // Créer une notification
    const notification = new Notification({
      type: transaction.type,
      title: `${transaction.type === "depense" ? "Dépense" : "Revenu"} ajouté`,
      desc: `${transaction.nom} - ${transaction.montant}€`,
      date: new Date().toLocaleDateString("fr-FR"),
      userId: transaction.userId,
      read: false,
    });
    await notification.save();

    console.log("Transaction créée:", transaction);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Erreur création transaction:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les transactions d'un utilisateur
exports.getUserTransactions = async (req, res) => {
  try {
    console.log(
      "Récupération transactions pour utilisateur:",
      req.params.userId
    );
    const transactions = await Transaction.find({
      userId: req.params.userId,
    }).sort({ date: -1 });

    console.log(`${transactions.length} transactions trouvées`);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Erreur récupération transactions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une transaction
exports.updateTransaction = async (req, res) => {
  try {
    console.log("Mise à jour transaction:", req.params.id);
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée" });
    }

    // Créer une notification
    const notification = new Notification({
      type: transaction.type,
      title: `${transaction.type === "depense" ? "Dépense" : "Revenu"} modifié`,
      desc: `${transaction.nom} - ${transaction.montant}€`,
      date: new Date().toLocaleDateString("fr-FR"),
      userId: transaction.userId,
      read: false,
    });
    await notification.save();

    console.log("Transaction mise à jour:", transaction);
    res.status(200).json(transaction);
  } catch (error) {
    console.error("Erreur mise à jour transaction:", error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une transaction
exports.deleteTransaction = async (req, res) => {
  try {
    console.log("Suppression transaction:", req.params.id);
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée" });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    // Créer une notification
    const notification = new Notification({
      type: transaction.type,
      title: `${
        transaction.type === "depense" ? "Dépense" : "Revenu"
      } supprimé`,
      desc: `${transaction.nom} - ${transaction.montant}€`,
      date: new Date().toLocaleDateString("fr-FR"),
      userId: transaction.userId,
      read: false,
    });
    await notification.save();

    console.log("Transaction supprimée");
    res.status(200).json({ message: "Transaction supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression transaction:", error);
    res.status(500).json({ message: error.message });
  }
};
