import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const [hasUnread, setHasUnread] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Créer une requête pour filtrer les notifications par utilisateur
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    // Utilise onSnapshot pour écouter en temps réel les changements
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        // Affiche le point rouge s'il y a au moins une notification non lue
        const anyUnread = snapshot.docs.some(
          (doc) => doc.data().read === false
        );
        setHasUnread(anyUnread);
      },
      (error) => {
        console.error("Erreur lors de l'écoute des notifications:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className='relative'>
      <FiBell className='text-2xl' />
      {hasUnread && (
        <span className='absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full'></span>
      )}
    </div>
  );
}
