const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  searchTasks,
  getCalendarTasks,
  bulkUpdateTasks,
  bulkDeleteTasks,
  bulkAssignTasks,
  exportToCSV,
  importFromCSV,
  addDependency,
  removeDependency,
  getOverdueTasks,
  markTaskViewed,
} = require("../controllers/taskController");

const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
  likeComment,
  addReply,
} = require("../controllers/commentController");

const {
  getTaskActivityLog,
  getUserActivityLog,
  getAllActivityLogs,
} = require("../controllers/activityController");

const {
  startTimeTracking,
  stopTimeTracking,
  pauseTimeTracking,
  resumeTimeTracking,
  getTaskTimeLogs,
  getUserTimeLogs,
  addManualTimeEntry,
} = require("../controllers/timeTrackingController");

const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  createTaskFromTemplate,
} = require("../controllers/templateController");

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

// ===== Dashboard Routes (must come first) =====
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);

// ===== Specific Filter Routes (before /:id) =====
router.get("/search", protect, searchTasks);
router.get("/calendar", protect, getCalendarTasks);
router.get("/overdue", protect, getOverdueTasks);

// ===== Bulk Operations (before /:id) =====
router.put("/bulk/update", protect, adminOnly, bulkUpdateTasks);
router.delete("/bulk/delete", protect, adminOnly, bulkDeleteTasks);
router.put("/bulk/assign", protect, adminOnly, bulkAssignTasks);

// ===== Import/Export Routes (before /:id) =====
router.post("/export/csv", protect, exportToCSV);
router.post("/import/csv", protect, adminOnly, importFromCSV);

// ===== Templates Routes (before /:id) =====
router.post("/templates", protect, createTemplate);
router.get("/templates", protect, getTemplates);
router.get("/templates/:templateId", protect, getTemplateById);
router.put("/templates/:templateId", protect, updateTemplate);
router.delete("/templates/:templateId", protect, deleteTemplate);
router.post("/templates/:templateId/create-task", protect, createTaskFromTemplate);

// ===== Time Tracking Routes (before /:id) =====
router.post("/time-tracking/start", protect, startTimeTracking);
router.put("/time-tracking/:timeTrackingId/stop", protect, stopTimeTracking);
router.put("/time-tracking/:timeTrackingId/pause", protect, pauseTimeTracking);
router.put("/time-tracking/:timeTrackingId/resume", protect, resumeTimeTracking);
router.post("/time-tracking/manual", protect, addManualTimeEntry);
router.get("/time-tracking/task/:taskId", protect, getTaskTimeLogs);
router.get("/time-tracking/user", protect, getUserTimeLogs);

// ===== Notification Routes (before /:id) =====
router.get("/notifications", protect, getUserNotifications);
router.put("/notifications/:notificationId/read", protect, markAsRead);
router.put("/notifications/mark-all-read", protect, markAllAsRead);
router.delete("/notifications/:notificationId", protect, deleteNotification);
router.delete("/notifications/clear-all", protect, clearAllNotifications);
router.get("/notifications/preferences", protect, getNotificationPreferences);
router.put("/notifications/preferences", protect, updateNotificationPreferences);

// ===== Generic Task Routes (MUST be last) =====
router.get("/", protect, getTasks);
router.post("/", protect, adminOnly, createTask);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskChecklist);
router.put("/:id/view", protect, markTaskViewed);

// ===== Task Dependencies =====
router.put("/:id/dependencies", protect, addDependency);
router.delete("/:id/dependencies/:depTaskId", protect, removeDependency);

// ===== Comments Routes =====
router.post("/:taskId/comments", protect, createComment);
router.get("/:taskId/comments", protect, getTaskComments);
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);
router.put("/comments/:commentId/like", protect, likeComment);
router.post("/comments/:commentId/reply", protect, addReply);

// ===== Activity Log Routes =====
router.get("/:taskId/activity", protect, getTaskActivityLog);
router.get("/activity/user", protect, getUserActivityLog);
router.get("/activity/all", protect, getAllActivityLogs);

module.exports = router;
