import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const [hasUnread, setHasUnread] = useState(false);
  const { user, mainAccountId } = useAuth();

  useEffect(() => {
    if (!mainAccountId) {
      setHasUnread(false);
      return;
    }

    console.log(
      `Configuration de l'écouteur de notifications pour: ${mainAccountId}`
    );

    // Filtrer les notifications par ID utilisateur principal
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", mainAccountId),
      where("read", "==", false)
    );

    // Utiliser onSnapshot pour écouter en temps réel les changements
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        // S'il y a des documents dans le résultat, on a des notifications non lues
        setHasUnread(!snapshot.empty);
        console.log(
          `Notifications non lues pour ${mainAccountId}: ${
            !snapshot.empty ? snapshot.size : 0
          }`
        );
      },
      (error) => {
        console.error("Erreur lors de l'écoute des notifications:", error);
        setHasUnread(false);
      }
    );

    // Se désabonner de l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [mainAccountId]);

  return (
    <div className='relative'>
      <FiBell className='text-2xl' />
      {hasUnread && (
        <span className='absolute -top-1 -right-1 block w-3 h-3 bg-red-500 rounded-full'></span>
      )}
    </div>
  );
}
