/**
 * @file keyboardShortcuts.js
 * @description Gestion centralisée des raccourcis clavier de l'application
 * Utilisé dans MainLayout.jsx pour gérer les raccourcis globaux
 */

import React, { useEffect } from "react";

// Liste des raccourcis disponibles
export const SHORTCUTS = {
  // Navigation (ordre de la sidebar)
  NAVIGATION: {
    DASHBOARD: { key: "1", description: "Aller au Dashboard" },
    DEPENSES_REVENUS: { key: "2", description: "Aller à Dépenses & Revenus" },
    PAIEMENTS_RECURRENTS: {
      key: "3",
      description: "Aller à Paiements récurrents",
    },
    PAIEMENTS_ECHELONNES: {
      key: "4",
      description: "Aller à Paiements échelonnés",
    },
    PREVISIONNEL: { key: "5", description: "Aller au Prévisionnel" },
    AGENDA: { key: "6", description: "Aller à l'Agenda" },
    NOTIFICATIONS: { key: "7", description: "Aller aux Notifications" },
    PROFIL: { key: "8", description: "Aller au Profil" },
  },
  // Thème
  THEME: {
    LIGHT: { key: "l", description: "Passer en mode clair" },
    DARK: { key: "d", description: "Passer en mode sombre" },
  },
  // Actions rapides
  QUICK_ACTIONS: {
    ADD_EXPENSE: { key: "+", description: "Ajouter une dépense" },
    ADD_REVENUE: { key: "*", description: "Ajouter un revenu" },
    ADD_RECURRENT: { key: "r", description: "Ajouter un paiement récurrent" },
    ADD_INSTALLMENT: { key: "e", description: "Ajouter un paiement échelonné" },
    SEARCH: {
      key: "r",
      description: "Rechercher (focus sur la barre de recherche)",
    },
    HELP: { key: "?", description: "Afficher l'aide" },
  },
};

// Fonction pour vérifier si l'élément actif est un champ de saisie
const isInputField = () => {
  const activeElement = document.activeElement;
  return (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  );
};

// Fonction pour gérer les raccourcis clavier
const handleKeyboardShortcut = (e, callbacks) => {
  // Ne pas activer les raccourcis si on est dans un champ de saisie
  if (isInputField()) return;

  const key = e.key.toLowerCase();

  // Navigation (ordre sidebar)
  if (key === SHORTCUTS.NAVIGATION.DASHBOARD.key && callbacks.onDashboard) {
    e.preventDefault();
    callbacks.onDashboard();
  } else if (
    key === SHORTCUTS.NAVIGATION.DEPENSES_REVENUS.key &&
    callbacks.onDepensesRevenus
  ) {
    e.preventDefault();
    callbacks.onDepensesRevenus();
  } else if (
    key === SHORTCUTS.NAVIGATION.PAIEMENTS_RECURRENTS.key &&
    callbacks.onPaiementsRecurrents
  ) {
    e.preventDefault();
    callbacks.onPaiementsRecurrents();
  } else if (
    key === SHORTCUTS.NAVIGATION.PAIEMENTS_ECHELONNES.key &&
    callbacks.onPaiementsEchelonnes
  ) {
    e.preventDefault();
    callbacks.onPaiementsEchelonnes();
  } else if (
    key === SHORTCUTS.NAVIGATION.PREVISIONNEL.key &&
    callbacks.onPrevisionnel
  ) {
    e.preventDefault();
    callbacks.onPrevisionnel();
  } else if (key === SHORTCUTS.NAVIGATION.AGENDA.key && callbacks.onAgenda) {
    e.preventDefault();
    callbacks.onAgenda();
  } else if (
    key === SHORTCUTS.NAVIGATION.NOTIFICATIONS.key &&
    callbacks.onNotifications
  ) {
    e.preventDefault();
    callbacks.onNotifications();
  } else if (key === SHORTCUTS.NAVIGATION.PROFIL.key && callbacks.onProfil) {
    e.preventDefault();
    callbacks.onProfil();
  }

  // Thème
  else if (key === SHORTCUTS.THEME.LIGHT.key && callbacks.onLightMode) {
    e.preventDefault();
    callbacks.onLightMode();
  } else if (key === SHORTCUTS.THEME.DARK.key && callbacks.onDarkMode) {
    e.preventDefault();
    callbacks.onDarkMode();
  }

  // Actions rapides
  else if (
    key === SHORTCUTS.QUICK_ACTIONS.ADD_EXPENSE.key &&
    callbacks.onAddExpense
  ) {
    e.preventDefault();
    callbacks.onAddExpense();
  } else if (
    key === SHORTCUTS.QUICK_ACTIONS.ADD_REVENUE.key &&
    callbacks.onAddRevenue
  ) {
    e.preventDefault();
    callbacks.onAddRevenue();
  } else if (
    key === SHORTCUTS.QUICK_ACTIONS.ADD_RECURRENT.key &&
    callbacks.onAddRecurrent
  ) {
    e.preventDefault();
    callbacks.onAddRecurrent();
  } else if (
    key === SHORTCUTS.QUICK_ACTIONS.ADD_INSTALLMENT.key &&
    callbacks.onAddInstallment
  ) {
    e.preventDefault();
    callbacks.onAddInstallment();
  } else if (key === SHORTCUTS.QUICK_ACTIONS.HELP.key && callbacks.onHelp) {
    e.preventDefault();
    callbacks.onHelp();
  } else if (key === SHORTCUTS.QUICK_ACTIONS.SEARCH.key && callbacks.onSearch) {
    e.preventDefault();
    callbacks.onSearch();
  }
};

// Hook personnalisé pour utiliser les raccourcis clavier
export const useKeyboardShortcuts = (callbacks) => {
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyboardShortcut(e, callbacks);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks]);
};
