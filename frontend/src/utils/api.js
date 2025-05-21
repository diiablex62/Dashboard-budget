import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Configuration de base d'axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API pour les notifications
export const notificationApi = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};

// API pour les utilisateurs
export const userApi = {
  deleteAccount: () => api.delete("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  getProfile: () => api.get("/users/me"),
};

// API pour les transactions
export const transactionApi = {
  getTransactions: () => api.get("/transactions"),
  createTransaction: (data) => api.post("/transactions", data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
};

// API pour les catégories
export const categoryApi = {
  getCategories: () => api.get("/categories"),
  createCategory: (data) => api.post("/categories", data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// API pour les budgets
export const budgetApi = {
  getBudgets: () => api.get("/budgets"),
  createBudget: (data) => api.post("/budgets", data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
};

export default api;
