import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications', {
        params: { limit: 10 },
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put('/api/notifications/mark-all-read');
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Error marking notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Error deleting notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return '📌';
      case 'task_due_soon':
        return '⏰';
      case 'task_overdue':
        return '🚨';
      case 'comment_mention':
        return '💬';
      case 'task_completed':
        return '✅';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-hidden dark:bg-gray-800">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center border-b dark:border-gray-600">
            <h3 className="font-semibold dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b dark:border-gray-600 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
                  } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition`}
                  onClick={() =>
                    !notification.read && handleMarkAsRead(notification._id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 flex-1">
                      <span className="text-xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification._id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  {!notification.read && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center border-t dark:border-gray-600">
            <a href="/notifications" className="text-blue-500 hover:text-blue-700 text-sm">
              View All Notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
