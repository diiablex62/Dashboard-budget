import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  fakeDepenseRevenu,
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
} from "../utils/fakeData";

// Fonction utilitaire pour garantir une date valide
function safeDate(d) {
  if (!d) return new Date();
  // Correction automatique : ajoute un zéro si mois ou jour sur un chiffre
  if (/^\d{4}-\d{1}-\d{2}$/.test(d)) d = d.replace(/-(\d{1})-/, "-0$1-");
  if (/^\d{4}-\d{2}-\d{1}$/.test(d)) d = d.replace(/-(\d{1})$/, "-0$1");
  // Si la date est au format YYYY-MM-DD, on ajoute T00:00:00 pour forcer l'ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const date = new Date(d + "T00:00:00");
    return date;
  }
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Génération dynamique des notifications à partir des fakedata
function buildNotifications() {
  const notifs = [];
  fakeDepenseRevenu.forEach((e, i) => {
    notifs.push({
      id: `depense-revenu-${i}`,
      message:
        e.type === "depense"
          ? `Nouvelle dépense : ${e.categorie || e.nom}`
          : `Nouveau revenu : ${e.categorie || e.nom}`,
      createdAt: safeDate(e.date).toISOString(),
      type: "depense-revenu",
      read: Math.random() > 0.5,
    });
  });
  fakePaiementsRecurrents.forEach((e, i) => {
    notifs.push({
      id: `recurrent-${i}`,
      message: `Paiement récurrent : ${e.nom}`,
      createdAt: safeDate(e.date).toISOString(),
      type: "recurrent",
      read: Math.random() > 0.5,
    });
  });
  fakePaiementsEchelonnes.forEach((e, i) => {
    notifs.push({
      id: `echelonne-${i}`,
      message: `Paiement échelonné : ${e.nom}`,
      createdAt: safeDate(e.debutDate).toISOString(),
      type: "echelonne",
      read: Math.random() > 0.5,
    });
  });
  // Trie du plus récent au plus ancien
  return notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "recurrent", label: "Récurrent" },
  { key: "echelonne", label: "Échelonné" },
  { key: "depense-revenu", label: "Dépense-Revenu" },
];

function groupByDay(notifications) {
  const groups = {};
  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    // Clé de groupement standardisée : YYYY-MM-DD
    const key = date.toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  // Trie les dates du plus récent au plus ancien
  return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

function getDayLabelFromKey(key) {
  const today = new Date();
  const date = new Date(key);
  const diff = Math.floor((today - date) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  const label = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    const initial = buildNotifications();
    localStorage.setItem("notifications", JSON.stringify(initial));
    return initial;
  });
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = isAuthenticated
    ? filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter)
    : [];
  const grouped = groupByDay(filtered);

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(updated));
      // Déclencher l'événement personnalisé
      window.dispatchEvent(new Event("notificationsUpdated"));
      return updated;
    });
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      );
      localStorage.setItem("notifications", JSON.stringify(updated));
      // Déclencher l'événement personnalisé
      window.dispatchEvent(new Event("notificationsUpdated"));
      return updated;
    });
  };

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        <div className='mb-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Notifications
              </h1>
              <div className='text-gray-500 text-base dark:text-gray-300'>
                Consultez vos dernières notifications
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={handleMarkAllRead}
                className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 font-semibold transition'>
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className='flex gap-2 mb-6'>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-lg border text-sm font-medium transition
                  ${
                    filter === f.key
                      ? "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      : "bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className='text-center text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-[#18181b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800'>
            <p>Aucune notification</p>
          </div>
        ) : (
          grouped.map(([date, notifs]) => (
            <div key={date} className='mb-6'>
              <div className='mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200'>
                {getDayLabelFromKey(date)}
              </div>
              <div className='bg-white dark:bg-[#18181b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden'>
                {notifs.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative py-3 px-4 flex items-center border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition hover:bg-gray-50 dark:hover:bg-[#232329] cursor-pointer ${
                      notification.read
                        ? "opacity-60"
                        : "bg-blue-50 dark:bg-blue-900/20"
                    }`}
                    onClick={() => handleToggleRead(notification.id)}
                    onMouseEnter={() => setHoveredId(notification.id)}
                    onMouseLeave={() => setHoveredId(null)}>
                    {!notification.read && (
                      <div className='w-1 h-6 bg-blue-500 dark:bg-blue-400 rounded-full mr-3'></div>
                    )}
                    <span className='flex-1 text-gray-900 dark:text-white'>
                      {notification.message}
                    </span>
                    <span className='ml-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>
                      {safeDate(notification.createdAt).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                    {hoveredId === notification.id && (
                      <span className='ml-4 text-xs text-gray-500 dark:text-gray-400 italic select-none whitespace-nowrap'>
                        {notification.read
                          ? "Marquer comme non lu"
                          : "Marquer comme lu"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
