import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuFileSpreadsheet, LuPencil, LuTrash2 } from "react-icons/lu";
import TaskStatusTabs from "../../components/layouts/TaskStatusTabs";
import moment from "moment";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const navigate = useNavigate();

  // Get All Tasks
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_ALL_TASKS,
        {
          params: { status: filterStatus === "All" ? "" : filterStatus === "In Progress" ? "In-Progress" : filterStatus },
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

  useEffect(() => {
    getAllTasks();
  }, [filterStatus]);

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
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : allTasks.length > 0 ? (
        <div className="overflow-x-auto p-0 rounded-lg mt-5 card">
          <table className="min-w-full">
            <thead>
              <tr className="text-left bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-4 text-gray-800 font-medium text-[13px]">
                  Title
                </th>
                <th className="py-4 px-4 text-gray-800 font-medium text-[13px]">
                  Status
                </th>
                <th className="py-4 px-4 text-gray-800 font-medium text-[13px]">
                  Priority
                </th>
                <th className="py-4 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
                  Due Date
                </th>
                <th className="py-4 px-4 text-gray-800 font-medium text-[13px] hidden lg:table-cell">
                  Created On
                </th>
                <th className="py-4 px-4 text-gray-800 font-medium text-[13px] text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {allTasks.map((task) => (
                <tr
                  key={task._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-4 text-gray-700 text-[13px] line-clamp-1">
                    {task.title}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-gray-700 text-[13px] hidden md:table-cell">
                    {moment(task.dueDate).format("MMM DD, YYYY")}
                  </td>

                  <td className="py-4 px-4 text-gray-700 text-[13px] hidden lg:table-cell">
                    {moment(task.createdAt).format("MMM DD, YYYY")}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleClick(task)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit"
                      >
                        <LuPencil className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <LuTrash2 className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-12 text-center mt-5">
          <p className="text-gray-400 text-lg">
            No tasks found in this status
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageTasks;
