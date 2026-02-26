const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity } = require("./activityController");
const { createNotification } = require("./notificationController");

// @desc    Get dashboard data (Admin)
// @route   GET /api/tasks/dashboard-data
// @access  Private (Admin)
const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // FIXED status list
    const taskStatuses = ["Pending", "In-Progress", "Completed"];

    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      acc[status.replace(/\s+/g, "")] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];

    const taskPriorityLevelsRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc    Get user dashboard data
// @route   GET /api/tasks/user-dashboard-data
// @access  Private (User)
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
    });

    const pendingTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: "Pending",
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: "Completed",
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In-Progress", "Completed"];

    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: { $in: [userId] } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      acc[status] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];

    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: { $in: [userId] } } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find({ assignedTo: { $in: [userId] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    let tasks;

    // Admin gets all tasks
    if (req.user.role === "admin") {
      tasks = await Task.find(filter)
        .populate("assignedTo", "name email profileImageUrl");
    } 
    // Normal user gets only assigned tasks
    else {
      tasks = await Task.find({
        ...filter,
        assignedTo: { $in: [req.user._id] },
      }).populate("assignedTo", "name email profileImageUrl");
    }

    // ===== Status Summary Counts =====

    const baseFilter =
      req.user.role === "admin"
        ? {}
        : { assignedTo: { $in: [req.user._id] } };

    const allTasks = await Task.countDocuments({
      ...baseFilter,
    });

    const pendingTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...baseFilter,
      status: "In-Progress",
    });

    const completedTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Completed",
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin)
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" })
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy:req.user._id,
            attachments,
            todoChecklist,
        });

        // Notify assigned users about the new task
        try {
          if (Array.isArray(assignedTo) && assignedTo.length > 0) {
            await Promise.all(
              assignedTo.map((userId) =>
                createNotification(
                  userId,
                  "New Task Assigned",
                  `You have been assigned to task: ${title}`,
                  "task",
                  task._id,
                  `/tasks/${task._id}`
                )
              )
            );
          }
        } catch (err) {
          console.error("Error creating assignment notifications:", err?.message || err);
        }

        res.status(201).json({message:"Task created successfully",task});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update basic fields
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    // Update assigned users (must be array)
    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
      }

      // Determine newly assigned users to notify
      const prevAssigned = task.assignedTo.map((id) => id.toString());
      const newAssigned = req.body.assignedTo.filter(
        (id) => !prevAssigned.includes(id.toString())
      );

      task.assignedTo = req.body.assignedTo;

      // Send notifications to newly assigned users
      try {
        if (Array.isArray(newAssigned) && newAssigned.length > 0) {
          await Promise.all(
            newAssigned.map((userId) =>
              createNotification(
                userId,
                "You were assigned a task",
                `You have been assigned to task: ${task.title}`,
                "task",
                task._id,
                `/tasks/${task._id}`
              )
            )
          );
        }
      } catch (err) {
        console.error("Error creating assignment notifications:", err?.message || err);
      }
    }

    const updatedTask = await task.save();

    res.json({
      message: "Task updated successfully",
      updatedTask,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        await task.deleteOne();

        res.json({ message: "Task removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const allowedStatus = ["Pending", "In-Progress", "Completed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    task.status = status;

    if (status === "Completed") {
      task.todoChecklist.forEach((item) => {
        item.completed = true;
      });
      task.progress = 100;
    }

    await task.save();

    res.json({
      message: "Task status updated successfully",
      task,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



// @desc    Update Task Checklist
// @route   PUT /api/tasks/:id/checklist
// @access  Private

const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;

    // Find task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Allow only assigned users or admin
    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to update checklist",
      });
    }

    // Replace checklist
    task.todoChecklist = todoChecklist;

    // Calculate completed items
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;

    const totalItems = task.todoChecklist.length;

    // Update progress percentage
    task.progress =
      totalItems > 0
        ? Math.round((completedCount / totalItems) * 100)
        : 0;

    // Auto-update task status
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In-Progress";
    } else {
      task.status = "Pending";
    }

    // Save changes
    const prevStatus = task.status;
    await task.save();

    // If task just became Completed, notify all admins
    try {
      if (prevStatus !== "Completed" && task.status === "Completed") {
        const admins = await User.find({ role: "admin" }).select("_id");
        if (admins && admins.length > 0) {
          await Promise.all(
            admins.map((admin) =>
              createNotification(
                admin._id,
                "Task Completed",
                `Task '${task.title}' was completed by ${req.user.name || req.user.email}`,
                "task",
                task._id,
                `/tasks/${task._id}`
              )
            )
          );
        }
      }
    } catch (err) {
      console.error("Error creating completion notifications:", err?.message || err);
    }

    // Return updated task
    res.status(200).json({
      message: "Checklist updated successfully",
      task,
    });


  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// @desc    Search and filter tasks with advanced options
// @route   GET /api/tasks/search
// @access  Private
const searchTasks = async (req, res) => {
  try {
    const {
      q,
      priority,
      status,
      assignee,
      dateFrom,
      dateTo,
      tags,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    let filter = {};

    // Base filter: Admin sees all, users see assigned to them
    if (req.user.role !== "admin") {
      filter.assignedTo = { $in: [req.user._id] };
    }

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Priority filter
    if (priority) {
      filter.priority = { $in: priority.split(",") };
    }

    // Status filter
    if (status) {
      filter.status = { $in: status.split(",") };
    }

    // Assignee filter
    if (assignee) {
      filter.assignedTo = { $in: assignee.split(",") };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.dueDate = {};
      if (dateFrom) filter.dueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.dueDate.$lte = new Date(dateTo);
    }

    // Tags filter
    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    const sortObj = {};
    sortObj[sortBy] = parseInt(sortOrder);

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email profileImageUrl")
      .populate("createdBy", "name email")
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      tasks,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching tasks",
      error: error.message,
    });
  }
};

// @desc    Get tasks filtered by date range for calendar view
// @route   GET /api/tasks/calendar
// @access  Private
const getCalendarTasks = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (req.user.role !== "admin") {
      filter.assignedTo = { $in: [req.user._id] };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email profileImageUrl")
      .sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching calendar tasks",
      error: error.message,
    });
  }
};

// @desc    Bulk update tasks
// @route   PUT /api/tasks/bulk/update
// @access  Private (Admin)
const bulkUpdateTasks = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can perform bulk operations" });
    }

    const { taskIds, updates } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "taskIds must be a non-empty array" });
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: updates }
    );

    // Log activity for each task
    for (const taskId of taskIds) {
      await logActivity(taskId, req.user._id, "updated", "Bulk updated task", null);
    }

    res.status(200).json({
      message: "Tasks updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error bulk updating tasks",
      error: error.message,
    });
  }
};

// @desc    Bulk delete tasks
// @route   DELETE /api/tasks/bulk/delete
// @access  Private (Admin)
const bulkDeleteTasks = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can perform bulk operations" });
    }

    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "taskIds must be a non-empty array" });
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
    });

    res.status(200).json({
      message: "Tasks deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error bulk deleting tasks",
      error: error.message,
    });
  }
};

// @desc    Bulk assign tasks
// @route   PUT /api/tasks/bulk/assign
// @access  Private (Admin)
const bulkAssignTasks = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can perform bulk operations" });
    }

    const { taskIds, assignedTo } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "taskIds must be a non-empty array" });
    }

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: "assignedTo must be a non-empty array" });
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: { assignedTo } }
    );

    // Create notifications for assigned users
    for (const userId of assignedTo) {
      await createNotification(
        userId,
        "Task Assigned",
        `You have been assigned to ${taskIds.length} tasks`,
        "task_assigned"
      );
    }

    res.status(200).json({
      message: "Tasks assigned successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error bulk assigning tasks",
      error: error.message,
    });
  }
};

// @desc    Export tasks to CSV
// @route   POST /api/tasks/export/csv
// @access  Private
const exportToCSV = async (req, res) => {
  try {
    const { taskIds, format = "csv" } = req.body;

    let filter = {};

    if (taskIds && Array.isArray(taskIds)) {
      filter._id = { $in: taskIds };
    } else if (req.user.role !== "admin") {
      filter.assignedTo = { $in: [req.user._id] };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (format === "csv") {
      let csv =
        "Title,Description,Priority,Status,Due Date,Assigned To,Created By,Created At\n";

      tasks.forEach((task) => {
        const assignedNames = task.assignedTo.map((u) => u.name).join("; ");
        const createdByName = task.createdBy?.name || "N/A";

        csv += `"${task.title}","${task.description || ""}","${task.priority}","${task.status}","${
          task.dueDate.toISOString().split("T")[0]
        }","${assignedNames}","${createdByName}","${task.createdAt
          .toISOString()
          .split("T")[0]}"\n`;
      });

      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", "attachment; filename=tasks.csv");
      res.send(csv);
    } else if (format === "json") {
      res.header("Content-Type", "application/json");
      res.header("Content-Disposition", "attachment; filename=tasks.json");
      res.json(tasks);
    }
  } catch (error) {
    res.status(500).json({
      message: "Error exporting tasks",
      error: error.message,
    });
  }
};

// @desc    Import tasks from CSV
// @route   POST /api/tasks/import/csv
// @access  Private (Admin)
const importFromCSV = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can import tasks" });
    }

    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "tasks must be an array" });
    }

    const createdTasks = [];

    for (const taskData of tasks) {
      try {
        const newTask = await Task.create({
          title: taskData.title,
          description: taskData.description || "",
          priority: taskData.priority || "Medium",
          status: taskData.status || "Pending",
          dueDate: new Date(taskData.dueDate),
          assignedTo: taskData.assignedTo || [],
          createdBy: req.user._id,
        });

        createdTasks.push(newTask);
      } catch (err) {
        console.error("Error importing task:", err);
      }
    }

    res.status(201).json({
      message: `${createdTasks.length} tasks imported successfully`,
      importedCount: createdTasks.length,
      tasks: createdTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error importing tasks",
      error: error.message,
    });
  }
};

// @desc    Add task dependency
// @route   PUT /api/tasks/:id/dependencies
// @access  Private
const addDependency = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { dependsOnTaskId, type = "blockedBy" } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if dependency already exists
    const depExists = task.dependencies.some(
      (dep) => dep.taskId.toString() === dependsOnTaskId
    );

    if (depExists) {
      return res.status(400).json({ message: "Dependency already exists" });
    }

    task.dependencies.push({
      taskId: dependsOnTaskId,
      type,
    });

    await task.save();
    await task.populate("dependencies.taskId", "title status");

    res.status(200).json({
      message: "Dependency added",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding dependency",
      error: error.message,
    });
  }
};

// @desc    Remove task dependency
// @route   DELETE /api/tasks/:id/dependencies/:depTaskId
// @access  Private
const removeDependency = async (req, res) => {
  try {
    const { taskId, depTaskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.dependencies = task.dependencies.filter(
      (dep) => dep.taskId.toString() !== depTaskId
    );

    await task.save();

    res.status(200).json({
      message: "Dependency removed",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing dependency",
      error: error.message,
    });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
const getOverdueTasks = async (req, res) => {
  try {
    let filter = {
      dueDate: { $lt: new Date() },
      status: { $ne: "Completed" },
    };

    if (req.user.role !== "admin") {
      filter.assignedTo = { $in: [req.user._id] };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email profileImageUrl")
      .sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching overdue tasks",
      error: error.message,
    });
  }
};

// @desc    Mark task as viewed
// @route   PUT /api/tasks/:id/view
// @access  Private
const markTaskViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.viewedBy.includes(userId)) {
      task.viewedBy.push(userId);
    }

    task.lastViewedAt = new Date();
    await task.save();

    res.status(200).json({ message: "Task marked as viewed" });
  } catch (error) {
    res.status(500).json({
      message: "Error marking task as viewed",
      error: error.message,
    });
  }
};

module.exports = {
    getDashboardData,
    getUserDashboardData,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    searchTasks,
    getCalendarTasks,
    bulkUpdateTasks,
    bulkDeleteTasks,
    bulkAssignTasks,
    exportToCSV,
    importFromCSV,
    addDependency,
    removeDependency,
    getOverdueTasks,
    markTaskViewed,
};
