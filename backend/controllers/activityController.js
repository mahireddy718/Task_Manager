const ActivityLog = require("../models/ActivityLog");
const Task = require("../models/Task");

// Get activity log for task
const getTaskActivityLog = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const activities = await ActivityLog.find({ taskId })
      .populate("userId", "name email profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments({ taskId });

    res.status(200).json({
      activities,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching activity log",
      error: error.message,
    });
  }
};

// Get user activity log
const getUserActivityLog = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const activities = await ActivityLog.find({ userId })
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments({ userId });

    res.status(200).json({
      activities,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user activity log",
      error: error.message,
    });
  }
};

// Get all activity logs (Admin only)
const getAllActivityLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view all activity logs" });
    }

    const { page = 1, limit = 50, action, userId, taskId } = req.query;
    let filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (taskId) filter.taskId = taskId;

    const activities = await ActivityLog.find(filter)
      .populate("userId", "name email")
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      activities,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching activity logs",
      error: error.message,
    });
  }
};

// Log activity (Internal helper - call this when actions happen)
const logActivity = async (taskId, userId, action, description, changes = null) => {
  try {
    await ActivityLog.create({
      taskId,
      userId,
      action,
      description,
      changes,
    });
  } catch (error) {
    console.error("Error logging activity:", error.message);
  }
};

module.exports = {
  getTaskActivityLog,
  getUserActivityLog,
  getAllActivityLogs,
  logActivity,
};
