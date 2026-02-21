const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    attachments: [{
      type: String,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
