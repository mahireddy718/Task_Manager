const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  startTimeTracking,
  stopTimeTracking,
  pauseTimeTracking,
  resumeTimeTracking,
  getTaskTimeLogs,
  getUserTimeLogs,
  addManualTimeEntry,
} = require("../controllers/timeTrackingController");

const router = express.Router();

router.post("/start", protect, startTimeTracking);
router.put("/:timeTrackingId/stop", protect, stopTimeTracking);
router.put("/:timeTrackingId/pause", protect, pauseTimeTracking);
router.put("/:timeTrackingId/resume", protect, resumeTimeTracking);
router.post("/manual", protect, addManualTimeEntry);
router.get("/task/:taskId", protect, getTaskTimeLogs);
router.get("/user", protect, getUserTimeLogs);

module.exports = router;
