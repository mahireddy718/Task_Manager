const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_due_soon",
        "task_overdue",
        "task_completed",
        "comment_mention",
        "task_status_changed",
        "task_reminder",
        "team_assignment",
        "general",
      ],
      default: "general",
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    actionUrl: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    sendEmail: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailError: String,
  },
  { timestamps: true }
);

// Index for quick lookups
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
