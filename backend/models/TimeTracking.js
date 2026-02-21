const mongoose = require("mongoose");

const TimeTrackingSchema = new mongoose.Schema(
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
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    duration: {
      type: Number, // in minutes
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ["Development", "Testing", "Documentation", "Review", "Other"],
      default: "Development",
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
    billable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeTracking", TimeTrackingSchema);
