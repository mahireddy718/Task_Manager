const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getTaskActivityLog,
  getUserActivityLog,
  getAllActivityLogs,
} = require("../controllers/activityController");

const router = express.Router();

router.get("/task/:taskId", protect, getTaskActivityLog);
router.get("/user", protect, getUserActivityLog);
router.get("/", protect, adminOnly, getAllActivityLogs);

module.exports = router;
