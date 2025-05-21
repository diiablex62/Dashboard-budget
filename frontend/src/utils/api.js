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

// API pour les paiements
export const paymentApi = {
  getPayments: () => api.get("/payments"),
  createPayment: (data) => api.post("/payments", data),
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  getPaymentHistory: () => api.get("/payments/history"),
  getUpcomingPayments: () => api.get("/payments/upcoming"),
  markAsPaid: (id) => api.put(`/payments/${id}/paid`),
};

// API pour les paiements récurrents
export const recurrentPaymentApi = {
  getRecurrentPayments: () => api.get("/recurrent-payments"),
  createRecurrentPayment: (data) => api.post("/recurrent-payments", data),
  updateRecurrentPayment: (id, data) =>
    api.put(`/recurrent-payments/${id}`, data),
  deleteRecurrentPayment: (id) => api.delete(`/recurrent-payments/${id}`),
  pauseRecurrentPayment: (id) => api.put(`/recurrent-payments/${id}/pause`),
  resumeRecurrentPayment: (id) => api.put(`/recurrent-payments/${id}/resume`),
  getRecurrentPaymentHistory: (id) =>
    api.get(`/recurrent-payments/${id}/history`),
};

// API pour les paiements échelonnés
export const installmentPaymentApi = {
  getInstallmentPayments: () => api.get("/installment-payments"),
  createInstallmentPayment: (data) => api.post("/installment-payments", data),
  updateInstallmentPayment: (id, data) =>
    api.put(`/installment-payments/${id}`, data),
  deleteInstallmentPayment: (id) => api.delete(`/installment-payments/${id}`),
  getInstallmentDetails: (id) => api.get(`/installment-payments/${id}/details`),
  payInstallment: (id, installmentId) =>
    api.put(`/installment-payments/${id}/installments/${installmentId}/pay`),
  getInstallmentHistory: (id) => api.get(`/installment-payments/${id}/history`),
  calculateInstallments: (data) =>
    api.post("/installment-payments/calculate", data),
};

export default api;
