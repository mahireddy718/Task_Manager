const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");


// desc    Export all tasks as an Excel file
// route   GET /api/reports/export/tasks
// access  Private (Admin)

const exportTasksReport = async (req, res) => {
  try {
    // create workbook
    const workbook = new excelJS.Workbook();

    // create worksheet
    const worksheet = workbook.addWorksheet("Tasks Report");

    // define columns
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 30 },
    ];

    // fetch tasks from database
    const tasks = await Task.find().populate("assignedTo", "name email");

    // add rows
    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        ?.map((user) => `${user.name} (${user.email})`)
        .join(", ");

      worksheet.addRow({
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate
          ? task.dueDate.toISOString().split("T")[0]
          : "",
        assignedTo: assignedTo || "Unassigned",
      });
    });

    // set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tasks_report.xlsx"
    );

    // write file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      message: "Error exporting tasks",
      error: error.message,
    });
  }
};


// desc    Export user-task report as an Excel file
// route   GET /api/reports/export/users
// access  Private (Admin)
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find();

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users Report");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Total Tasks", key: "totalTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    for (const user of users) {
      const totalTasks = await Task.countDocuments({
        assignedTo: user._id,
      });

      const completedTasks = await Task.countDocuments({
        assignedTo: user._id,
        status: "Completed",
      });

      worksheet.addRow({
        name: user.name,
        email: user.email,
        totalTasks,
        completedTasks,
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error exporting users report", error: error.message });
  }
};


module.exports = {
  exportTasksReport,
  exportUsersReport,
};
