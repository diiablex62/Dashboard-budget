import React, { useEffect, useState } from "react";
import {
  AiOutlineCreditCard,
  AiOutlineCalendar,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { FiBell } from "react-icons/fi";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const snapshot = await getDocs(collection(db, "notifications"));
      setNotifications(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };
    fetchNotifications();
  }, []);

  // Marquer comme lu (optionnel, à appeler lors de l'ouverture)
  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Marquer une notification comme lue au clic
  const markAsRead = async (notifId) => {
    await updateDoc(doc(db, "notifications", notifId), { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  // Supprimer toutes les notifications
  const handleDeleteAll = async () => {
    const snapshot = await getDocs(collection(db, "notifications"));
    const batchDeletes = snapshot.docs.map((d) =>
      deleteDoc(doc(db, "notifications", d.id))
    );
    await Promise.all(batchDeletes);
    setNotifications([]);
  };

  // Choix de l'icône selon le type de notification
  const getNotifIcon = (notif) => {
    if (notif.type === "recurrent") {
      return <AiOutlineCalendar className='text-2xl text-[#a259e6]' />;
    }
    // Ajoute d'autres types si besoin
    return <FiBell className='text-2xl text-[#5b8efc]' />;
  };

  // Fonction utilitaire pour formater la date
  const formatNotifDate = (dateStr) => {
    if (!dateStr) return "";
    const today = new Date();
    const notifDate = new Date(dateStr.split("/").reverse().join("-"));
    const diffTime =
      today.setHours(0, 0, 0, 0) - notifDate.setHours(0, 0, 0, 0);
    if (diffTime === 0) return "Aujourd'hui";
    if (diffTime === 86400000) return "Hier";
    return dateStr;
  };

  return (
    <div className='min-h-screen bg-[#f5f6fa] dark:bg-black flex items-start justify-center p-8'>
      <div className='w-full max-w-3xl'>
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800'>
          {notifications.length === 0 && (
            <div className='text-gray-400 dark:text-gray-500 text-center text-sm italic py-8'>
              Aucune notification
            </div>
          )}
          {notifications.map((notif, idx) => (
            <div
              key={notif.id || idx}
              className={`flex items-start gap-4 px-6 py-6 ${
                idx !== notifications.length - 1
                  ? "border-b border-[#e6eaf1] dark:border-gray-800"
                  : ""
              }`}
              onMouseEnter={() => setHoveredId(notif.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (!notif.read) markAsRead(notif.id);
              }}
              style={{ cursor: !notif.read ? "pointer" : "default" }}>
              <div
                className={`flex-shrink-0 bg-[#eaf1ff] dark:bg-gray-900 rounded-full w-12 h-12 flex items-center justify-center`}>
                {getNotifIcon(notif)}
              </div>
              <div className='flex-1'>
                <div className='font-semibold text-[#222] dark:text-white mb-1'>
                  {notif.title}
                </div>
                <div className='text-[#7b849b] dark:text-gray-400 text-base'>
                  {notif.desc}
                </div>
              </div>
              <div className='flex flex-col items-end mt-1'>
                <div className='text-[#b0b8c9] dark:text-gray-500 text-sm whitespace-nowrap'>
                  {formatNotifDate(notif.date)}
                </div>
                {!notif.read && hoveredId === notif.id && (
                  <span className='text-xs text-blue-600 mt-1'>
                    Marquer comme lu
                  </span>
                )}
                {!notif.read && (
                  <span className='ml-2 mt-2 inline-block w-3 h-3 rounded-full bg-red-500'></span>
                )}
              </div>
            </div>
          ))}
          {notifications.length > 0 && (
            <div className='flex justify-center py-4'>
              <button
                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-700 transition'
                onClick={handleDeleteAll}>
                Tout supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
