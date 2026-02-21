const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ["Custom", "Default", "Team", "Standard"],
      default: "Custom",
    },
    defaultPriority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    defaultDueDays: {
      type: Number,
      default: 7,
    },
    todoChecklist: [todoSchema],
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    attachmentTemplate: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskTemplate", TaskTemplateSchema);
