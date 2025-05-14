import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const [hasUnread, setHasUnread] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Récupérer toutes les notifications (sans filtre par utilisateur pour l'instant)
    const notificationsQuery = query(collection(db, "notifications"));

    // Utiliser onSnapshot pour écouter en temps réel les changements
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        // Vérifier s'il y a au moins une notification non lue
        const anyUnread = snapshot.docs.some(
          (doc) => doc.data().read === false
        );
        setHasUnread(anyUnread);
      },
      (error) => {
        console.error("Erreur lors de l'écoute des notifications:", error);
      }
    );

    // Se désabonner de l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [user]);

  return (
    <div className='relative'>
      <FiBell className='text-2xl' />
      {hasUnread && (
        <span className='absolute -top-1 -right-1 block w-3 h-3 bg-red-500 rounded-full'></span>
      )}
    </div>
  );
}
