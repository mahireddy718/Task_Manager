const TaskTemplate = require("../models/TaskTemplate");
const Task = require("../models/Task");

// Create task template
const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      defaultPriority,
      defaultDueDays,
      todoChecklist,
      tags,
      isPublic,
      attachmentTemplate,
    } = req.body;
    const userId = req.user._id;

    const template = await TaskTemplate.create({
      name,
      description,
      category: category || "Custom",
      defaultPriority: defaultPriority || "Medium",
      defaultDueDays: defaultDueDays || 7,
      todoChecklist: todoChecklist || [],
      tags: tags || [],
      createdBy: userId,
      isPublic: isPublic || false,
      attachmentTemplate: attachmentTemplate || [],
    });

    await template.populate("createdBy", "name email");

    res.status(201).json({
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating template",
      error: error.message,
    });
  }
};

// Get all templates (user's and public)
const getTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, category } = req.query;

    let filter = {
      $or: [{ createdBy: userId }, { isPublic: true }],
    };

    if (category) {
      filter.category = category;
    }

    const templates = await TaskTemplate.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TaskTemplate.countDocuments(filter);

    res.status(200).json({
      templates,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching templates",
      error: error.message,
    });
  }
};

// Get template by ID
const getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await TaskTemplate.findById(templateId).populate(
      "createdBy",
      "name email"
    );

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching template",
      error: error.message,
    });
  }
};

// Update template
const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const template = await TaskTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check ownership
    if (
      template.createdBy.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to update this template" });
    }

    Object.assign(template, updateData);
    await template.save();

    await template.populate("createdBy", "name email");

    res.status(200).json({
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating template",
      error: error.message,
    });
  }
};

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;

    const template = await TaskTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check ownership
    if (
      template.createdBy.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to delete this template" });
    }

    await TaskTemplate.findByIdAndDelete(templateId);

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting template",
      error: error.message,
    });
  }
};

// Create task from template
const createTaskFromTemplate = async (req, res) => {
  try {
    const { templateId, assignedTo, title, dueDate } = req.body;
    const userId = req.user._id;

    const template = await TaskTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const dueDate_calc = dueDate || new Date(Date.now() + template.defaultDueDays * 24 * 60 * 60 * 1000);

    const newTask = await Task.create({
      title: title || template.name,
      description: template.description,
      priority: template.defaultPriority,
      dueDate: dueDate_calc,
      assignedTo: assignedTo || [],
      createdBy: userId,
      todoChecklist: template.todoChecklist,
      attachments: template.attachmentTemplate,
      templateId,
      status: "Pending",
    });

    // Increment template usage count
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();

    await newTask.populate("assignedTo", "name email profileImageUrl");

    res.status(201).json({
      message: "Task created from template successfully",
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating task from template",
      error: error.message,
    });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  createTaskFromTemplate,
};
