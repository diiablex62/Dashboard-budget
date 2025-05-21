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
  getNotifications: () => api.get("/api/notifications"),
  markAsRead: (notificationId) =>
    api.put(`/api/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) =>
    api.delete(`/api/notifications/${notificationId}`),
};

// API pour les utilisateurs
export const userApi = {
  getProfile: () => api.get("/api/users/connected"),
  updateProfile: (data) => api.put("/api/users/connected", data),
};

// API pour les transactions
export const transactionApi = {
  getTransactions: () => api.get("/api/transactions"),
  createTransaction: (data) => api.post("/api/transactions", data),
  updateTransaction: (id, data) => api.put(`/api/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/api/transactions/${id}`),
};

// API pour les catégories
export const categoryApi = {
  getCategories: () => api.get("/api/categories"),
  createCategory: (data) => api.post("/api/categories", data),
  updateCategory: (id, data) => api.put(`/api/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/api/categories/${id}`),
};

// API pour les budgets
export const budgetApi = {
  getBudgets: () => api.get("/api/budgets"),
  createBudget: (data) => api.post("/api/budgets", data),
  updateBudget: (id, data) => api.put(`/api/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/api/budgets/${id}`),
};

// API pour les paiements
export const paymentApi = {
  getPayments: () => api.get("/api/payments"),
  createPayment: (data) => api.post("/api/payments", data),
  updatePayment: (id, data) => api.put(`/api/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/api/payments/${id}`),
  getPaymentHistory: () => api.get("/api/payments/history"),
  getUpcomingPayments: () => api.get("/api/payments/upcoming"),
  markAsPaid: (id) => api.put(`/api/payments/${id}/paid`),
};

// API pour les paiements récurrents
export const recurrentPaymentApi = {
  getRecurrentPayments: () => api.get("/api/recurrent-payments"),
  createRecurrentPayment: (data) => api.post("/api/recurrent-payments", data),
  updateRecurrentPayment: (id, data) =>
    api.put(`/api/recurrent-payments/${id}`, data),
  deleteRecurrentPayment: (id) => api.delete(`/api/recurrent-payments/${id}`),
  pauseRecurrentPayment: (id) => api.put(`/api/recurrent-payments/${id}/pause`),
  resumeRecurrentPayment: (id) =>
    api.put(`/api/recurrent-payments/${id}/resume`),
  getRecurrentPaymentHistory: (id) =>
    api.get(`/api/recurrent-payments/${id}/history`),
};

// API pour les paiements échelonnés
export const installmentPaymentApi = {
  getInstallmentPayments: () => api.get("/api/installment-payments"),
  createInstallmentPayment: (data) =>
    api.post("/api/installment-payments", data),
  updateInstallmentPayment: (id, data) =>
    api.put(`/api/installment-payments/${id}`, data),
  deleteInstallmentPayment: (id) =>
    api.delete(`/api/installment-payments/${id}`),
  getInstallmentDetails: (id) =>
    api.get(`/api/installment-payments/${id}/details`),
  payInstallment: (id, installmentId) =>
    api.put(
      `/api/installment-payments/${id}/installments/${installmentId}/pay`
    ),
  getInstallmentHistory: (id) =>
    api.get(`/api/installment-payments/${id}/history`),
  calculateInstallments: (data) =>
    api.post("/api/installment-payments/calculate", data),
};

export default api;
