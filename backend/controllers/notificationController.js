const Notification = require("../models/Notification");

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, read } = req.query;

    let filter = { userId };

    if (read !== undefined) {
      filter.read = read === "true";
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("taskId", "title");

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      notifications,
      total,
      unreadCount,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Error marking notifications as read",
      error: error.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ userId });

    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({
      message: "Error clearing notifications",
      error: error.message,
    });
  }
};

// Create notification (internal helper)
const createNotification = async (
  userId,
  title,
  message,
  type = "general",
  taskId = null,
  actionUrl = null,
  sendEmail = false
) => {
  try {
    const notification = await Notification.create({
      userId,
      taskId,
      title,
      message,
      type,
      actionUrl,
      sendEmail,
      read: false,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await require("../models/User").findById(userId).select("notificationPreferences");

    res.status(200).json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notification preferences",
      error: error.message,
    });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    const user = await require("../models/User").findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select("notificationPreferences");

    res.status(200).json({
      message: "Preferences updated",
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating preferences",
      error: error.message,
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
};
