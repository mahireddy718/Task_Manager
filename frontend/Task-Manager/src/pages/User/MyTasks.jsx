import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskStatusTabs from "../../components/layouts/TaskStatusTabs";
import toast from "react-hot-toast";
import { FiCheckCircle, FiClock, FiAlertTriangle } from "react-icons/fi";
import { LuList, LuCalendarDays } from "react-icons/lu";
import moment from "moment";
import { SearchContext } from "../../context/searchContext";
import { UserContext } from "../../context/userContext";
import CalendarView from "../../components/Calendar/CalendarView";
import TaskDetailModal from "../../components/layouts/TaskDetailModal";
// BulkActions removed per UI change request

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [selectedTask, setSelectedTask] = useState(null);
  const { searchParams } = useContext(SearchContext);
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  // Fetch Tasks
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_ALL_TASKS,
        {
          params: {
            status: filterStatus === "All" ? "" : filterStatus,
            ...searchParams,
          },
        }
      );

      let tasks = response.data?.tasks || [];
      // If current user is not admin, show only tasks assigned to them
      if (user && user.role !== "admin") {
        tasks = tasks.filter((task) =>
          Array.isArray(task.assignedTo) &&
          task.assignedTo.some((assignee) => {
            if (!assignee) return false;
            if (typeof assignee === "string") return assignee === user._id || assignee === user.id || assignee === user.email;
            return (
              assignee._id === user._id ||
              assignee.id === user._id ||
              assignee.email === user.email
            );
          })
        );
      }

      setAllTasks(tasks);

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

  useEffect(() => {
    getAllTasks();
  }, [filterStatus, searchParams]);

  // Navigation
  const handleViewTask = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  // Search handled via global SearchContext

  // Selection UI removed — tasks are view-only for members

  // Status Change
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

  // Status Icon
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

          <div className="flex items-center gap-4">
            {tabs?.[0]?.count > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}

            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "text-gray-600"
                }`}
              >
                <LuList size={20} />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded ${
                  viewMode === "calendar"
                    ? "bg-primary text-white"
                    : "text-gray-600"
                }`}
              >
                <LuCalendarDays size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search moved to navbar - uses global SearchContext */}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : allTasks.length > 0 ? (
        <>
          {viewMode === "list" ? (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {allTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                    className="card p-5 hover:shadow-lg hover:scale-105 transition-all duration-200 border-l-4 cursor-pointer"
                    style={{
                      borderLeftColor:
                        task.status === "Completed"
                          ? "#22c55e"
                          : task.status === "In-Progress"
                          ? "#06b6d4"
                          : "#a855f7",
                    }}
                  >
                    {/* Status and Priority Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex gap-2 flex-wrap flex-1">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
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
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          Task Done: {task.todoChecklist?.filter((t) => t.completed)?.length || 0}/{task.todoChecklist?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              task.todoChecklist?.length > 0
                                ? Math.round(
                                    (task.todoChecklist.filter((t) => t.completed).length /
                                      task.todoChecklist.length) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex justify-between items-center text-xs mb-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-[10px] font-medium">Start Date</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {moment(task.createdAt).format("D MMM YYYY")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-[10px] font-medium">Due Date</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {moment(task.dueDate).format("D MMM YYYY")}
                        </p>
                      </div>
                    </div>

                    {/* Assigned Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {task.assignedTo?.slice(0, 3).map((assignee, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800 tooltip"
                            title={assignee.name}
                          >
                            {assignee.name?.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {task.assignedTo?.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-semibold border-2 border-white dark:border-gray-800">
                            +{task.assignedTo.length - 3}
                          </div>
                        )}
                      </div>
                      {task.todoChecklist && task.todoChecklist.length > 0 && (
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200\">
                          📎 {task.todoChecklist.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* BulkActions removed */}
            </div>
          ) : (
            <CalendarView tasks={allTasks} onTaskClick={handleViewTask} />
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">
            No tasks assigned yet. Check back soon!
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

export default MyTasks;