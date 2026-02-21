const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.put("/:notificationId/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);
router.delete("/:notificationId", protect, deleteNotification);
router.delete("/clear-all", protect, clearAllNotifications);
router.get("/preferences", protect, getNotificationPreferences);
router.put("/preferences", protect, updateNotificationPreferences);

module.exports = router;
