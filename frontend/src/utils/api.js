// Données locales pour simuler la base de données
const localData = {
  transactions: [],
  recurrentPayments: [],
  installmentPayments: [],
  categories: [],
  settings: {
    primaryColor: "#3B82F6",
    language: "fr",
    notifications: true,
  },
  user: {
    id: 1,
    email: "user@example.com",
    name: "Utilisateur Test",
    isAuthenticated: true,
  },
  notifications: [
    {
      id: 1,
      type: "info",
      message: "Bienvenue sur votre tableau de bord !",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

// Fonctions de simulation d'API
const api = {
  // Notifications
  getNotifications: () => Promise.resolve(localData.notifications),
  markNotificationAsRead: (id) => {
    const notification = localData.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return Promise.resolve(notification);
  },
  markAllNotificationsAsRead: () => {
    localData.notifications.forEach((n) => (n.read = true));
    return Promise.resolve(localData.notifications);
  },
  deleteNotification: (id) => {
    localData.notifications = localData.notifications.filter(
      (n) => n.id !== id
    );
    return Promise.resolve({ success: true });
  },
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    localData.notifications.push(newNotification);
    return Promise.resolve(newNotification);
  },

  // Authentification
  login: (credentials) => {
    // Simuler une connexion réussie
    return Promise.resolve({
      user: localData.user,
      token: "fake-jwt-token",
    });
  },
  register: (userData) => {
    // Simuler une inscription réussie
    return Promise.resolve({
      user: { ...userData, id: Date.now() },
      token: "fake-jwt-token",
    });
  },
  logout: () => {
    // Simuler une déconnexion
    return Promise.resolve({ success: true });
  },
  getCurrentUser: () => {
    // Retourner l'utilisateur actuel
    return Promise.resolve(localData.user);
  },

  // Transactions
  getTransactions: () => Promise.resolve(localData.transactions),
  addTransaction: (transaction) => {
    localData.transactions.push({ ...transaction, id: Date.now() });
    return Promise.resolve(transaction);
  },
  updateTransaction: (id, transaction) => {
    const index = localData.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      localData.transactions[index] = { ...transaction, id };
    }
    return Promise.resolve(transaction);
  },
  deleteTransaction: (id) => {
    localData.transactions = localData.transactions.filter((t) => t.id !== id);
    return Promise.resolve({ success: true });
  },

  // Paiements récurrents
  getRecurrentPayments: () => Promise.resolve(localData.recurrentPayments),
  addRecurrentPayment: (payment) => {
    localData.recurrentPayments.push({ ...payment, id: Date.now() });
    return Promise.resolve(payment);
  },
  updateRecurrentPayment: (id, payment) => {
    const index = localData.recurrentPayments.findIndex((p) => p.id === id);
    if (index !== -1) {
      localData.recurrentPayments[index] = { ...payment, id };
    }
    return Promise.resolve(payment);
  },
  deleteRecurrentPayment: (id) => {
    localData.recurrentPayments = localData.recurrentPayments.filter(
      (p) => p.id !== id
    );
    return Promise.resolve({ success: true });
  },

  // Paiements échelonnés
  getInstallmentPayments: () => Promise.resolve(localData.installmentPayments),
  addInstallmentPayment: (payment) => {
    localData.installmentPayments.push({ ...payment, id: Date.now() });
    return Promise.resolve(payment);
  },
  updateInstallmentPayment: (id, payment) => {
    const index = localData.installmentPayments.findIndex((p) => p.id === id);
    if (index !== -1) {
      localData.installmentPayments[index] = { ...payment, id };
    }
    return Promise.resolve(payment);
  },
  deleteInstallmentPayment: (id) => {
    localData.installmentPayments = localData.installmentPayments.filter(
      (p) => p.id !== id
    );
    return Promise.resolve({ success: true });
  },

  // Catégories
  getCategories: () => Promise.resolve(localData.categories),
  addCategory: (category) => {
    localData.categories.push({ ...category, id: Date.now() });
    return Promise.resolve(category);
  },
  updateCategory: (id, category) => {
    const index = localData.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      localData.categories[index] = { ...category, id };
    }
    return Promise.resolve(category);
  },
  deleteCategory: (id) => {
    localData.categories = localData.categories.filter((c) => c.id !== id);
    return Promise.resolve({ success: true });
  },

  // Paramètres
  getSettings: () => Promise.resolve(localData.settings),
  updateSettings: (settings) => {
    localData.settings = { ...localData.settings, ...settings };
    return Promise.resolve(localData.settings);
  },
};

// Exporter l'API utilisateur séparément pour la compatibilité
export const userApi = {
  login: api.login,
  register: api.register,
  logout: api.logout,
  getCurrentUser: api.getCurrentUser,
};

// Exporter l'API de notification séparément pour la compatibilité
export const notificationApi = {
  getNotifications: api.getNotifications,
  markNotificationAsRead: api.markNotificationAsRead,
  markAllNotificationsAsRead: api.markAllNotificationsAsRead,
  deleteNotification: api.deleteNotification,
  addNotification: api.addNotification,
};

// Exporter l'API de paiement échelonné séparément pour la compatibilité
export const installmentPaymentApi = {
  getInstallmentPayments: api.getInstallmentPayments,
  addInstallmentPayment: api.addInstallmentPayment,
  updateInstallmentPayment: api.updateInstallmentPayment,
  deleteInstallmentPayment: api.deleteInstallmentPayment,
};

// Exporter l'API de paiement récurrent séparément pour la compatibilité
export const recurrentPaymentApi = {
  getRecurrentPayments: api.getRecurrentPayments,
  addRecurrentPayment: api.addRecurrentPayment,
  updateRecurrentPayment: api.updateRecurrentPayment,
  deleteRecurrentPayment: api.deleteRecurrentPayment,
};

// Exporter l'API de transaction séparément pour la compatibilité
export const transactionApi = {
  getTransactions: api.getTransactions,
  addTransaction: api.addTransaction,
  updateTransaction: api.updateTransaction,
  deleteTransaction: api.deleteTransaction,
};

// Exporter l'API de paiement combinée pour la compatibilité
export const paymentApi = {
  // Paiements récurrents
  getRecurrentPayments: api.getRecurrentPayments,
  addRecurrentPayment: api.addRecurrentPayment,
  updateRecurrentPayment: api.updateRecurrentPayment,
  deleteRecurrentPayment: api.deleteRecurrentPayment,

  // Paiements échelonnés
  getInstallmentPayments: api.getInstallmentPayments,
  addInstallmentPayment: api.addInstallmentPayment,
  updateInstallmentPayment: api.updateInstallmentPayment,
  deleteInstallmentPayment: api.deleteInstallmentPayment,
};

export default api;
