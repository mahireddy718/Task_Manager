const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
    exportTasksReport,
    exportUsersReport,
} = require("../controllers/reportController");

const router = express.Router();

/*
  Route: GET /api/reports/export/tasks

  Description:
  Exports all tasks in the system.
  This can be used to generate Excel or PDF reports.

  Access:
  Only admin users can access this route.
*/
router.get(
    "/export/tasks",
    protect,
    adminOnly,
    exportTasksReport
);

/*
  Route: GET /api/reports/export/users

  Description:
  Exports user-task report.
  This can include user details along with
  how many tasks they have, completed tasks, etc.

  Access:
  Only admin users can access this route.
*/
router.get("/export/users", protect, adminOnly, exportUsersReport);

module.exports = router;
