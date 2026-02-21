const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
  likeComment,
  addReply,
} = require("../controllers/commentController");

const router = express.Router();

router.post("/:taskId", protect, createComment);
router.get("/:taskId", protect, getTaskComments);
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);
router.put("/:commentId/like", protect, likeComment);
router.post("/:commentId/reply", protect, addReply);

module.exports = router;
