/**
 * @file keyboardShortcuts.js
 * @description Gestion centralisée des raccourcis clavier de l'application
 * Utilisé dans MainLayout.jsx pour gérer les raccourcis globaux
 */

import React, { useEffect } from "react";

// Types de raccourcis
const SHORTCUT_TYPES = {
  NAVIGATION: "NAVIGATION",
  THEME: "THEME",
  QUICK_ACTIONS: "QUICK_ACTIONS",
};

// Liste des raccourcis disponibles
export const SHORTCUTS = {
  [SHORTCUT_TYPES.NAVIGATION]: {
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
  [SHORTCUT_TYPES.THEME]: {
    LIGHT: { key: "L", description: "Passer en mode clair" },
    DARK: { key: "D", description: "Passer en mode sombre" },
  },
  [SHORTCUT_TYPES.QUICK_ACTIONS]: {
    ACTUEL: { key: "A", description: "Aller à la vue Actuelle" },
    PREVISIONNEL: { key: "P", description: "Aller à la vue Prévisionnelle" },
    HELP: { key: "?", description: "Afficher l'aide" },
  },
};

// Vérifications d'état
const isInSidebar = () => {
  const result = document.activeElement.closest(".sidebar") !== null;
  if (result) console.log("Raccourcis désactivés : élément dans la sidebar");
  return result;
};

const isInputField = () => {
  const { tagName, isContentEditable } = document.activeElement;
  const result =
    tagName === "INPUT" || tagName === "TEXTAREA" || isContentEditable;
  if (result)
    console.log("Raccourcis désactivés : élément est un champ de saisie");
  return result;
};

const isModalOpen = () => {
  const result =
    document.querySelector('.modal, .dialog, [role="dialog"]') !== null;
  if (result) console.log("Raccourcis désactivés : une modal est ouverte");
  return result;
};

// Gestionnaires de raccourcis
const handleNavigationShortcuts = (key, callbacks) => {
  const navigationCallbacks = {
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].DASHBOARD.key]: callbacks.onDashboard,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].DEPENSES_REVENUS.key]:
      callbacks.onDepensesRevenus,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].PAIEMENTS_RECURRENTS.key]:
      callbacks.onPaiementsRecurrents,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].PAIEMENTS_ECHELONNES.key]:
      callbacks.onPaiementsEchelonnes,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].PREVISIONNEL.key]:
      callbacks.onPrevisionnel,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].AGENDA.key]: callbacks.onAgenda,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].NOTIFICATIONS.key]:
      callbacks.onNotifications,
    [SHORTCUTS[SHORTCUT_TYPES.NAVIGATION].PROFIL.key]: callbacks.onProfil,
  };

  const callback = navigationCallbacks[key];
  if (callback) {
    callback();
    return true;
  }
  return false;
};

const handleThemeShortcuts = (key, callbacks) => {
  const themeCallbacks = {
    [SHORTCUTS[SHORTCUT_TYPES.THEME].LIGHT.key]: callbacks.onLightMode,
    [SHORTCUTS[SHORTCUT_TYPES.THEME].DARK.key]: callbacks.onDarkMode,
  };

  const callback = themeCallbacks[key];
  if (callback) {
    callback();
    return true;
  }
  return false;
};

const handleQuickActionShortcuts = (key, callbacks) => {
  const quickActionCallbacks = {
    [SHORTCUTS[SHORTCUT_TYPES.QUICK_ACTIONS].ACTUEL.key]: callbacks.onActuel,
    [SHORTCUTS[SHORTCUT_TYPES.QUICK_ACTIONS].PREVISIONNEL.key]:
      callbacks.onPrevisionnel,
    [SHORTCUTS[SHORTCUT_TYPES.QUICK_ACTIONS].HELP.key]: callbacks.onHelp,
  };

  const callback = quickActionCallbacks[key];
  if (callback) {
    callback();
    return true;
  }
  return false;
};

// Fonction principale de gestion des raccourcis
const handleKeyboardShortcut = (e, callbacks) => {
  // Ignorer les raccourcis dans la sidebar, les champs de saisie ou les modals
  if (isInSidebar() || isInputField() || isModalOpen()) return;

  const key = e.key.toUpperCase();
  e.preventDefault();

  // Essayer chaque type de raccourci
  if (handleNavigationShortcuts(key, callbacks)) return;
  if (handleThemeShortcuts(key, callbacks)) return;
  if (handleQuickActionShortcuts(key, callbacks)) return;
};

// Hook personnalisé pour utiliser les raccourcis clavier
export const useKeyboardShortcuts = (callbacks) => {
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyboardShortcut(e, callbacks);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks]);
};
