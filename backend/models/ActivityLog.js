const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "deleted",
        "status_changed",
        "assigned",
        "commented",
        "attachment_added",
        "priority_changed",
        "due_date_changed",
        "description_updated",
        "task_completed",
        "task_reopened",
      ],
      required: true,
    },
    description: String,
    changes: {
      fieldName: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Index for quick lookup
ActivityLogSchema.index({ taskId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
