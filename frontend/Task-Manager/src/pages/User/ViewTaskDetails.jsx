import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import moment from "moment";
import { FiCheckCircle, FiClock, FiAlertTriangle } from "react-icons/fi";
import { LuArrowLeft, LuFileText, LuFileCheck } from "react-icons/lu";
import TaskComments from "../../components/Comments/TaskComments";
import TimeTracking from "../../components/TimeTracking/TimeTracking";
import ActivityLog from "../../components/ActivityLog/ActivityLog";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch Task Details
  const getTaskDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
      if (response.data) {
        setTask(response.data);
        setChecklist(response.data?.todoChecklist || []);
      }
    } catch (error) {
      console.error("Error fetching task details", error);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  // Update Task Status
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK_STATUS(id),
        { status: newStatus }
      );
      toast.success("Task status updated");
      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error("Error updating task status", error);
      toast.error("Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  // Update Todo Checklist
  const handleTodoToggle = async (todoIndex) => {
    try {
      const updatedChecklist = [...checklist];
      updatedChecklist[todoIndex].completed = !updatedChecklist[todoIndex].completed;

      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
        { todoChecklist: updatedChecklist }
      );

      setChecklist(updatedChecklist);
      toast.success("Todo updated");
    } catch (error) {
      console.error("Error updating todo", error);
      toast.error("Failed to update todo");
    }
  };

  useEffect(() => {
    getTaskDetails();
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FiCheckCircle className="text-green-500 text-2xl" />;
      case "In-Progress":
        return <FiClock className="text-blue-500 text-2xl" />;
      case "Pending":
        return <FiAlertTriangle className="text-orange-500 text-2xl" />;
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
        return "text-red-600 bg-red-50 border border-red-200";
      case "Medium":
        return "text-orange-600 bg-orange-50 border border-orange-200";
      case "Low":
        return "text-green-600 bg-green-50 border border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  const completedTodos = checklist.filter((todo) => todo.completed).length;
  const totalTodos = checklist.length;

  if (loading) {
    return (
      <DashboardLayout activeMenu="">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading task details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout activeMenu="">
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">Task not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="">
      <div className="my-5">
        <button
          onClick={() => navigate("/user/my-tasks")}
          className="flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <LuArrowLeft /> Back to Tasks
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                {getStatusIcon(task.status)}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {task.title}
                  </h1>
                  <p className="text-gray-600 mb-4">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`text-sm px-4 py-2 rounded-full font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`text-sm px-4 py-2 rounded-full font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Metadata */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      DUE DATE
                    </p>
                    <p className="text-base font-medium text-gray-800">
                      {moment(task.dueDate).format("MMM DD, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      CREATED ON
                    </p>
                    <p className="text-base font-medium text-gray-800">
                      {moment(task.createdAt).format("MMM DD, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      CREATED BY
                    </p>
                    <p className="text-base font-medium text-gray-800">
                      {task.createdBy?.name || "Admin"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      STATUS
                    </p>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updating}
                      className="text-base px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In-Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Todo Checklist */}
              {totalTodos > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <LuFileCheck className="text-lg" />
                    <h3 className="text-lg font-medium">
                      Todo Checklist ({completedTodos}/{totalTodos})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {checklist.map((todo, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleTodoToggle(index)}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <span
                          className={`flex-1 ${
                            todo.completed
                              ? "line-through text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <LuFileText className="text-lg" />
                    <h3 className="text-lg font-medium">Attachments</h3>
                  </div>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-primary hover:text-white transition text-primary dark:bg-gray-800"
                      >
                        📎 Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs for Comments, Time Tracking, Activity */}
              <div className="border-t border-gray-200 pt-6 mt-6 dark:border-gray-700">
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-3 px-4 font-medium whitespace-nowrap ${
                      activeTab === "details"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`pb-3 px-4 font-medium whitespace-nowrap ${
                      activeTab === "comments"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveTab("timeTracking")}
                    className={`pb-3 px-4 font-medium whitespace-nowrap ${
                      activeTab === "timeTracking"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    Time Tracking
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`pb-3 px-4 font-medium whitespace-nowrap ${
                      activeTab === "activity"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    Activity Log
                  </button>
                </div>

                {activeTab === "comments" && <TaskComments taskId={id} onCommentAdded={getTaskDetails} />}
                {activeTab === "timeTracking" && <TimeTracking taskId={id} />}
                {activeTab === "activity" && <ActivityLog taskId={id} />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4">Assigned To</h3>
              <div className="space-y-2">
                {task.assignedTo && task.assignedTo.length > 0 ? (
                  task.assignedTo.map((user) => (
                    <div
                      key={user._id}
                      className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800"
                    >
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No assignments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;
