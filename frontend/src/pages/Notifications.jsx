import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../utils/api";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationApi.getNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications:",
          error
        );
        setError("Erreur lors de la récupération des notifications");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
      setError("Erreur lors du marquage de la notification");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(
        notifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      setError("Erreur lors de la suppression de la notification");
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-20 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Notifications</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className='text-center text-gray-500 py-8'>
          Aucune notification
        </div>
      ) : (
        <div className='space-y-4'>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white shadow rounded-lg p-4 ${
                !notification.read ? "border-l-4 border-blue-500" : ""
              }`}>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='font-semibold'>{notification.title}</h3>
                  <p className='text-gray-600'>{notification.message}</p>
                  <p className='text-sm text-gray-500 mt-2'>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex space-x-2'>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className='text-blue-500 hover:text-blue-700'>
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className='text-red-500 hover:text-red-700'>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
