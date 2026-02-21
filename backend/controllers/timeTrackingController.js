const TimeTracking = require("../models/TimeTracking");
const Task = require("../models/Task");

// Start time tracking
const startTimeTracking = async (req, res) => {
  try {
    const { taskId, description, category } = req.body;
    const userId = req.user._id;

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Stop any running timers for this user
    await TimeTracking.updateMany(
      { userId, isRunning: true },
      { isRunning: false, endTime: new Date() }
    );

    const timeTracking = await TimeTracking.create({
      taskId,
      userId,
      startTime: new Date(),
      duration: 0,
      description: description || "",
      category: category || "Development",
      isRunning: true,
    });

    res.status(201).json({
      message: "Time tracking started",
      timeTracking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error starting time tracking",
      error: error.message,
    });
  }
};

// Stop time tracking
const stopTimeTracking = async (req, res) => {
  try {
    const { timeTrackingId } = req.params;
    const userId = req.user._id;

    const timeTracking = await TimeTracking.findById(timeTrackingId);

    if (!timeTracking) {
      return res.status(404).json({ message: "Time tracking record not found" });
    }

    if (timeTracking.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    timeTracking.endTime = new Date();
    timeTracking.duration = Math.round(
      (timeTracking.endTime - timeTracking.startTime) / 60000
    ); // Convert to minutes
    timeTracking.isRunning = false;

    await timeTracking.save();

    // Update task total time tracked
    await Task.findByIdAndUpdate(timeTracking.taskId, {
      $inc: { timeTracked: timeTracking.duration },
    });

    res.status(200).json({
      message: "Time tracking stopped",
      timeTracking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error stopping time tracking",
      error: error.message,
    });
  }
};

// Pause time tracking (stop without saving)
const pauseTimeTracking = async (req, res) => {
  try {
    const { timeTrackingId } = req.params;
    const userId = req.user._id;

    const timeTracking = await TimeTracking.findById(timeTrackingId);

    if (!timeTracking) {
      return res.status(404).json({ message: "Time tracking record not found" });
    }

    if (timeTracking.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    timeTracking.isRunning = false;

    await timeTracking.save();

    res.status(200).json({
      message: "Time tracking paused",
      timeTracking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error pausing time tracking",
      error: error.message,
    });
  }
};

// Resume time tracking
const resumeTimeTracking = async (req, res) => {
  try {
    const { timeTrackingId } = req.params;
    const userId = req.user._id;

    const timeTracking = await TimeTracking.findById(timeTrackingId);

    if (!timeTracking) {
      return res.status(404).json({ message: "Time tracking record not found" });
    }

    if (timeTracking.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Resume tracking
    timeTracking.startTime = new Date();
    timeTracking.isRunning = true;
    await timeTracking.save();

    res.status(200).json({
      message: "Time tracking resumed",
      timeTracking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resuming time tracking",
      error: error.message,
    });
  }
};

// Get task time logs
const getTaskTimeLogs = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const timeLogs = await TimeTracking.find({ taskId })
      .populate("userId", "name email profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TimeTracking.countDocuments({ taskId });
    const totalTime = await TimeTracking.aggregate([
      { $match: { taskId: require("mongoose").Types.ObjectId(taskId) } },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]);

    res.status(200).json({
      timeLogs,
      total,
      totalTimeInMinutes: totalTime[0]?.total || 0,
      totalTimeInHours: ((totalTime[0]?.total || 0) / 60).toFixed(2),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching time logs",
      error: error.message,
    });
  }
};

// Get user time logs
const getUserTimeLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    let filter = { userId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const timeLogs = await TimeTracking.find(filter)
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TimeTracking.countDocuments(filter);
    const totalTime = await TimeTracking.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]);

    res.status(200).json({
      timeLogs,
      total,
      totalTimeInMinutes: totalTime[0]?.total || 0,
      totalTimeInHours: ((totalTime[0]?.total || 0) / 60).toFixed(2),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user time logs",
      error: error.message,
    });
  }
};

// Manual time entry
const addManualTimeEntry = async (req, res) => {
  try {
    const { taskId, duration, description, category, startTime } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const timeEntry = await TimeTracking.create({
      taskId,
      userId,
      startTime: startTime || new Date(Date.now() - duration * 60 * 1000),
      endTime: new Date(),
      duration,
      description,
      category: category || "Development",
      isRunning: false,
    });

    await Task.findByIdAndUpdate(taskId, {
      $inc: { timeTracked: duration },
    });

    res.status(201).json({
      message: "Time entry added",
      timeEntry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding time entry",
      error: error.message,
    });
  }
};

module.exports = {
  startTimeTracking,
  stopTimeTracking,
  pauseTimeTracking,
  resumeTimeTracking,
  getTaskTimeLogs,
  getUserTimeLogs,
  addManualTimeEntry,
};
