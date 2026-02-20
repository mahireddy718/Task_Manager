import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskStatusTabs from "../../components/layouts/TaskStatusTabs";
import toast from "react-hot-toast";
import { FiCheckCircle, FiClock, FiAlertTriangle } from "react-icons/fi";
import moment from "moment";

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Get All Tasks Assigned to User
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: { status: filterStatus === "All" ? "" : filterStatus },
      });
      setAllTasks(
        response.data?.tasks?.length > 0 ? response.data.tasks : []
      );

      const statusSummary = response.data?.statusSummary || {};
      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In-Progress", count: statusSummary.inProgressTasks || 0 },
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

  // Navigate to Task Details
  const handleViewTask = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  // Update Task Status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId),
        { status: newStatus }
      );
      toast.success("Task status updated");
      getAllTasks();
    } catch (error) {
      console.error("Error updating task status", error);
      toast.error("Failed to update task status");
    }
  };

  useEffect(() => {
    getAllTasks();
  }, [filterStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FiCheckCircle className="text-green-500" />;
      case "In-Progress":
        return <FiClock className="text-blue-500" />;
      case "Pending":
        return <FiAlertTriangle className="text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "In-Progress":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "Pending":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50";
      case "Medium":
        return "text-orange-600 bg-orange-50";
      case "Low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-2xl font-medium mb-4 lg:mb-0">
            My Tasks
          </h2>
          {tabs?.[0]?.count > 0 && (
            <TaskStatusTabs
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : allTasks.length > 0 ? (
        <div className="grid gap-4 my-6">
          {allTasks.map((task) => (
            <div
              key={task._id}
              className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewTask(task._id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="text-base font-medium text-gray-800">
                      {task.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {task.description?.substring(0, 100)}...
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500">
                      Due: {moment(task.dueDate).format("MMM DD, YYYY")}
                    </span>
                  </div>
                </div>

                <div
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                    className="text-xs px-2 py-1 border border-gray-300 rounded bg-white cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In-Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">
            No tasks assigned yet. Check back soon!
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyTasks;