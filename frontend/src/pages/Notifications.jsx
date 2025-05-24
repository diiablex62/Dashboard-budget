import React, { useState } from "react";
import {
  fakeDepenseRevenu,
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
} from "../utils/fakeData";

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
      createdAt: e.date,
      type: "depense-revenu",
      read: Math.random() > 0.5,
    });
  });
  fakePaiementsRecurrents.forEach((e, i) => {
    notifs.push({
      id: `recurrent-${i}`,
      message: `Paiement récurrent : ${e.nom}`,
      createdAt: e.date,
      type: "recurrent",
      read: Math.random() > 0.5,
    });
  });
  fakePaiementsEchelonnes.forEach((e, i) => {
    notifs.push({
      id: `echelonne-${i}`,
      message: `Paiement échelonné : ${e.nom}`,
      createdAt: e.debutDate,
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
    const key = date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  // Trie les dates du plus récent au plus ancien
  return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

function getDayLabel(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((today - date) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(buildNotifications());
  const [filter, setFilter] = useState("all");
  const [openedId, setOpenedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);
  const grouped = groupByDay(filtered);

  const handleMarkAllUnread = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 dark:bg-black dark:text-white dark:border-gray-800'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Notifications
              </h1>
              <div className='text-gray-500 text-base dark:text-gray-300'>
                Consultez vos dernières notifications
              </div>
            </div>
            <button
              onClick={handleMarkAllUnread}
              className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 font-semibold transition'>
              Tout marquer comme non lu
            </button>
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

          {grouped.length === 0 ? (
            <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
              Aucune notification
            </div>
          ) : (
            grouped.map(([date, notifs]) => (
              <div key={date} className='mb-8'>
                <div className='mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200'>
                  {getDayLabel(date)}
                </div>
                <div className='space-y-2'>
                  {notifs.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative p-4 border rounded-lg flex items-center border-gray-200 dark:border-gray-700 transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                        notification.read
                          ? "opacity-60"
                          : "border-l-4 border-blue-500 dark:border-blue-400"
                      }`}
                      onClick={() => handleToggleRead(notification.id)}
                      onMouseEnter={() => setHoveredId(notification.id)}
                      onMouseLeave={() => setHoveredId(null)}>
                      <span className='flex-1 text-gray-900 dark:text-white'>
                        {notification.message}
                      </span>
                      <span className='ml-4 text-xs text-gray-500 dark:text-gray-400'>
                        {new Date(notification.createdAt).toLocaleTimeString(
                          "fr-FR",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                      {hoveredId === notification.id && (
                        <span className='ml-4 text-xs text-gray-500 dark:text-gray-400 italic select-none'>
                          {notification.read
                            ? "Marquer comme non lu"
                            : "Marquer comme lu"}
                        </span>
                      )}
                      {!notification.read && (
                        <span className='absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400'></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
