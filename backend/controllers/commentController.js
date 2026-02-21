const Comment = require("../models/Comment");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");

// Create comment
const createComment = async (req, res) => {
  try {
    const { taskId, content, mentions } = req.body;
    const userId = req.user._id;

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await Comment.create({
      taskId,
      author: userId,
      content,
      mentions: mentions || [],
    });

    await comment.populate("author", "name email profileImageUrl");

    // Add comment to task
    await Task.findByIdAndUpdate(taskId, {
      $push: { comments: comment._id },
    });

    // Log activity
    await ActivityLog.create({
      taskId,
      userId,
      action: "commented",
      description: `Added a comment: "${content.substring(0, 50)}..."`,
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating comment",
      error: error.message,
    });
  }
};

// Get task comments
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ taskId })
      .populate("author", "name email profileImageUrl")
      .populate("mentions", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ taskId });

    res.status(200).json({
      comments,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is author
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this comment" });
    }

    comment.content = content;
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();

    await comment.populate("author", "name email profileImageUrl");

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating comment",
      error: error.message,
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is author or admin
    if (
      comment.author.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    await Task.findByIdAndUpdate(comment.taskId, {
      $pull: { comments: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// Like comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { likes: userId },
      });
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $push: { likes: userId },
      });
    }

    const updatedComment = await Comment.findById(commentId)
      .populate("author", "name email profileImageUrl")
      .populate("likes", "name email");

    res.status(200).json({
      message: hasLiked ? "Comment unliked" : "Comment liked",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error liking comment",
      error: error.message,
    });
  }
};

// Add reply to comment
const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: {
          replies: {
            author: userId,
            content,
          },
        },
      },
      { new: true }
    )
      .populate("author", "name email profileImageUrl")
      .populate("replies.author", "name email profileImageUrl");

    res.status(200).json({
      message: "Reply added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding reply",
      error: error.message,
    });
  }
};

module.exports = {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
  likeComment,
  addReply,
};
