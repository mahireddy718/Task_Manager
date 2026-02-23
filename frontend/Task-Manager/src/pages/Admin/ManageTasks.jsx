import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuFileSpreadsheet, LuPencil, LuTrash2, LuPaperclip } from "react-icons/lu";
import TaskStatusTabs from "../../components/layouts/TaskStatusTabs";
import moment from "moment";
import AdvancedSearch from "../../components/Search/AdvancedSearch";
import { SearchContext } from '../../context/searchContext';
import TaskDetailModal from "../../components/layouts/TaskDetailModal";
// BulkActions removed per UI change request
import TaskTemplates from "../../components/Templates/TaskTemplates";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // selection UI removed
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const navigate = useNavigate();

  // Get All Tasks
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_ALL_TASKS,
        {
          params: {
            status: filterStatus === "All" ? "" : filterStatus === "In Progress" ? "In-Progress" : filterStatus,
            ...searchParams,
          },
        }
      );
      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      //map statusSummary data with fixed labels and order
      const statusSummary = response.data?.statusSummary || {};
      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ];
      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to Update Page
  const handleClick = (taskData) => {
    navigate("/admin/create-task", {
      state: { taskId: taskData._id },
    });
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      toast.success("Task deleted successfully");
      getAllTasks();
    } catch (error) {
      console.error("Error deleting task", error);
      toast.error("Failed to delete task");
    }
  };

  // Download Task Report
  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      // Create a blob from the response (response.data is already a blob when responseType: "blob")
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tasks-report-${moment().format("YYYY-MM-DD")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized - Please login again");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to download reports");
      } else {
        toast.error("Failed to download report");
      }
    } finally {
      setDownloading(false);
    }
  };

  const { searchParams } = useContext(SearchContext);

  useEffect(() => {
    getAllTasks();
  }, [filterStatus, searchParams]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-500 border border-green-200";
      case "Pending":
        return "bg-purple-100 text-purple-500 border border-purple-200";
      case "In-Progress":
        return "bg-cyan-100 text-cyan-500 border border-cyan-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-500 border border-red-200";
      case "Medium":
        return "bg-orange-100 text-orange-500 border border-orange-200";
      case "Low":
        return "bg-green-100 text-green-500 border border-green-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  // selection handlers removed

  // Handle Search
  const handleSearch = (params) => {
    console.log("Search params:", params);
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-medium">Manage Tasks</h2>
          <div className="flex items-center gap-3">
            {tabs?.[0]?.count > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}
            <button
              className="download-btn flex items-center gap-2"
              onClick={handleDownloadReport}
              disabled={downloading}
            >
              <LuFileSpreadsheet className="text-lg" />
              {downloading ? "Downloading..." : "Download Report"}
            </button>
            <button
              className="primary-btn flex items-center gap-2"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              {showTemplates ? "Hide Templates" : "Show Templates"}
            </button>
          </div>
        </div>
      </div>

      {/* Task Templates Modal */}
      {showTemplates && (
        <div className="mb-6">
          <TaskTemplates onTemplateUsed={() => {
            getAllTasks();
            setShowTemplates(false);
          }} />
        </div>
      )}

      {/* Advanced Search moved to header; keep component here if you want local search UI */}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : allTasks.length > 0 ? (
        <div>
          {/* Select all UI removed */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 relative">
          {allTasks.map((task) => (
            <div
              key={task._id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
              }}
              className="card p-5 hover:shadow-lg hover:scale-105 transition-all duration-200 border-l-4 relative cursor-pointer"
              style={{
                borderLeftColor:
                  task.status === "Completed"
                    ? "#22c55e"
                    : task.status === "In-Progress"
                    ? "#06b6d4"
                    : "#a855f7",
              }}
            >
              {/* Per-task selection removed */}

              {/* Header with Status and Priority Badges */}
              <div className="flex items-start justify-between gap-2 mb-3 pr-8">
                <div className="flex gap-2 flex-wrap flex-1">
                  <span
                    className={`px-3 py-1 text-xs rounded font-medium ${getStatusBadgeColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded font-medium ${getPriorityBadgeColor(
                      task.priority
                    )}`}
                  >
                    {task.priority} Priority
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                {task.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {task.description}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="text-xs text-gray-700 font-medium mb-2">
                  Task Done: {task.todoChecklist?.filter(t => t.completed).length || 0}/{task.todoChecklist?.length || 0}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        task.todoChecklist && task.todoChecklist.length > 0
                          ? (task.todoChecklist.filter(t => t.completed).length / task.todoChecklist.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex gap-4 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-700">Start Date</div>
                  <div>{moment(task.createdAt).format("DD MMM YYYY")}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Due Date</div>
                  <div>{moment(task.dueDate).format("DD MMM YYYY")}</div>
                </div>
              </div>

              {/* Assignees and Attachments Footer */}
              <div className="flex items-center justify-between">
                {/* Avatars */}
                <div className="flex items-center">
                  {task.assignedTo && task.assignedTo.length > 0 ? (
                    <div className="flex -space-x-2">
                      {task.assignedTo.slice(0, 3).map((assignee, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                          title={assignee.name || "User"}
                        >
                          {assignee?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      ))}
                      {task.assignedTo.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white">
                          +{task.assignedTo.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No assignees</span>
                  )}
                </div>

                {/* Attachments Count */}
                <div className="flex items-center gap-3">
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <LuPaperclip className="text-sm" />
                      <span className="text-xs font-medium">{task.attachments.length}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClick(task)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <LuPencil className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <LuTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
            {/* BulkActions removed */}
        </div>
      ) : (
        <div className="card p-12 text-center mt-5">
          <p className="text-gray-400 text-lg">
            No tasks found in this status
          </p>
        </div>
      )}


      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={getAllTasks}
        />
      )}
    </DashboardLayout>
  );
};

export default ManageTasks;
