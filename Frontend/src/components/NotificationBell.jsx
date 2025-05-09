import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function NotificationBell() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Utilise onSnapshot pour écouter en temps réel les changements
    const unsubscribe = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        // Affiche le point rouge s'il y a au moins une notification non lue
        const anyUnread = snapshot.docs.some(
          (doc) => doc.data().read === false
        );
        setHasUnread(anyUnread);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className='relative'>
      <FiBell className='text-2xl' />
      {hasUnread && (
        <span className='absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full'></span>
      )}
    </div>
  );
}
