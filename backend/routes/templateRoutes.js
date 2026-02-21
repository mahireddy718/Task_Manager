const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  createTaskFromTemplate,
} = require("../controllers/templateController");

const router = express.Router();

router.post("/", protect, createTemplate);
router.get("/", protect, getTemplates);
router.get("/:templateId", protect, getTemplateById);
router.put("/:templateId", protect, updateTemplate);
router.delete("/:templateId", protect, deleteTemplate);
router.post("/:templateId/create-task", protect, createTaskFromTemplate);

module.exports = router;
