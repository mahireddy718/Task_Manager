import React, { useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import { LuX, LuCircleCheck, LuClock } from "react-icons/lu";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const TaskDetailModal = ({ task, onClose, onTaskUpdate }) => {
  const { user } = useContext(UserContext);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localTodos, setLocalTodos] = useState(task.todoChecklist || []);
  const [updatingTodo, setUpdatingTodo] = useState(false);
  
  if (!task) return null;

  const completedTodos = localTodos?.filter(t => t.completed).length || 0;
  const totalTodos = localTodos?.length || 0;
  const completionPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === task.status) return;
    
    setUpdatingStatus(true);
    try {
      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK_STATUS(task._id),
        { status: newStatus }
      );
      toast.success("Task status updated successfully");
      
      // Notify parent component to refresh tasks
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error(error.response?.data?.message || "Failed to update task status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTodoToggle = async (todoIndex) => {
    setUpdatingTodo(true);
    try {
      const updatedTodos = [...localTodos];
      updatedTodos[todoIndex].completed = !updatedTodos[todoIndex].completed;
      setLocalTodos(updatedTodos);
      
      // Send update to backend
      await axiosInstance.put(
        `${API_PATHS.TASKS.GET_ALL_TASKS}/${task._id}`,
        { todoChecklist: updatedTodos }
      );
      
      toast.success("Todo updated successfully");
      
      // Refresh tasks to get latest data
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      // Revert the local change on error
      setLocalTodos(task.todoChecklist || []);
      toast.error("Failed to update todo");
    } finally {
      setUpdatingTodo(false);
    }
  };

  const getAssigneeColor = (name) => {
    const colors = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-cyan-500",
      "from-pink-400 to-red-500",
      "from-yellow-400 to-orange-500",
      "from-indigo-400 to-blue-500",
      "from-emerald-400 to-green-500",
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-purple-600 text-white p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
            <p className="text-gray-100 text-sm">{task.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition ml-4"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <LuCircleCheck className="text-blue-600" />
                Overall Progress
              </h3>
              <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-500 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {completedTodos} of {totalTodos} tasks completed
            </p>
          </div>

          {/* Task Info */}
          <div className={`grid gap-4 ${user?.role === "Admin" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {user?.role === "Admin" && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">Status</p>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updatingStatus}
                  className={`w-full px-3 py-2 border rounded-lg font-medium text-sm cursor-pointer transition ${
                    updatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    task.status === "Completed" ? "bg-green-50 border-green-300 text-green-700" :
                    task.status === "In-Progress" ? "bg-cyan-50 border-cyan-300 text-cyan-700" :
                    "bg-purple-50 border-purple-300 text-purple-700"
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                {updatingStatus && <p className="text-xs text-gray-500 mt-1">Updating...</p>}
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Priority</p>
              <p className={`text-sm font-semibold mt-1 ${
                task.priority === "High" ? "text-red-600" :
                task.priority === "Medium" ? "text-orange-600" :
                "text-green-600"
              }`}>
                {task.priority}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Start Date</p>
              <p className="text-sm font-semibold mt-1 text-gray-800 dark:text-gray-200">
                {moment(task.createdAt).format("DD MMM YYYY")}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Due Date</p>
              <p className="text-sm font-semibold mt-1 text-gray-800 dark:text-gray-200">
                {moment(task.dueDate).format("DD MMM YYYY")}
              </p>
            </div>
          </div>

          {/* Assigned Members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded"></span>
              Assigned Members
            </h3>

            {task.assignedTo && task.assignedTo.length > 0 ? (
              <div className="space-y-3">
                {task.assignedTo.map((assignee, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-primary hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAssigneeColor(assignee.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                        {assignee?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{assignee.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{assignee.email}</p>
                      </div>
                    </div>

                    {/* Member Task Progress */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Completion: <span className="font-semibold text-primary">{completionPercentage}%</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <LuClock size={14} />
                        <span>
                          {completedTodos > 0 && `${completedTodos} task${completedTodos !== 1 ? 's' : ''} completed`}
                          {completedTodos === 0 && "No tasks completed yet"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">No members assigned to this task</p>
              </div>
            )}
          </div>

          {/* Todo Checklist */}
          {task.todoChecklist && task.todoChecklist.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-600 rounded"></span>
                Task Checklist
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {localTodos.map((todo, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTodoToggle(idx)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:shadow-md transition ${
                      todo.completed
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                        : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    } ${updatingTodo ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      todo.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 dark:border-gray-500"
                    }`}>
                      {todo.completed && <LuCircleCheck size={16} className="text-white" />}
                    </div>
                    <span className={`text-sm ${
                      todo.completed
                        ? "line-through text-green-700 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {todo.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
          {updatingTodo && <p className="text-xs text-gray-500 mr-auto">Updating...</p>}
          <button
            onClick={onClose}
            disabled={updatingTodo}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
