// utils/apiPaths.js

export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Register a new user (Admin or Member)
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    UPDATE_PROFILE: "/api/auth/profile", // Update user profile
  },

  USERS: {
    GET_ALL_USERS: "/api/users", // Get all users (Admin only)
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID
    CREATE_USER: "/api/users", // Create a new user (Admin only)
    UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user details
    DELETE_USER: (userId) => `/api/users/${userId}`, // Delete a user
  },

  TASKS: {
    GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get Dashboard Data
    GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get User Dashboard Data
    GET_ALL_TASKS: "/api/tasks", // Get all tasks (Admin: All, User: only assigned)
    GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID
    CREATE_TASK: "/api/tasks", // Create a new task (Admin only)
    UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task details
    DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete a task (Admin only)
    UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update todo checklist
    // Advanced Features
    SEARCH_TASKS: "/api/tasks/search", // Search and filter tasks
    GET_CALENDAR_TASKS: "/api/tasks/calendar", // Get tasks for calendar view
    BULK_UPDATE: "/api/tasks/bulk/update", // Bulk update tasks
    BULK_DELETE: "/api/tasks/bulk/delete", // Bulk delete tasks
    BULK_ASSIGN: "/api/tasks/bulk/assign", // Bulk assign tasks
    EXPORT_CSV: "/api/tasks/export/csv", // Export to CSV
    IMPORT_CSV: "/api/tasks/import/csv", // Import from CSV
    ADD_DEPENDENCY: (taskId) => `/api/tasks/${taskId}/dependencies`, // Add task dependency
    REMOVE_DEPENDENCY: (taskId, depId) => `/api/tasks/${taskId}/dependencies/${depId}`, // Remove dependency
    GET_OVERDUE: "/api/tasks/overdue", // Get overdue tasks
    MARK_VIEWED: (taskId) => `/api/tasks/${taskId}/mark-viewed`, // Mark task as viewed
  },

  COMMENTS: {
    GET_TASK_COMMENTS: (taskId) => `/api/comments/task/${taskId}`, // Get all comments for a task
    CREATE_COMMENT: "/api/comments", // Create a new comment
    UPDATE_COMMENT: (commentId) => `/api/comments/${commentId}`, // Update a comment
    DELETE_COMMENT: (commentId) => `/api/comments/${commentId}`, // Delete a comment
    LIKE_COMMENT: (commentId) => `/api/comments/${commentId}/like`, // Like/unlike a comment
    REPLY_COMMENT: (commentId) => `/api/comments/${commentId}/reply`, // Reply to a comment
  },

  ACTIVITIES: {
    GET_TASK_ACTIVITIES: (taskId) => `/api/activities/task/${taskId}`, // Get all activities for a task
    GET_USER_ACTIVITIES: (userId) => `/api/activities/user/${userId}`, // Get all activities for a user
    GET_ALL_ACTIVITIES: "/api/activities", // Get all activities
  },

  TIME_TRACKING: {
    START_TIMER: "/api/time-tracking/start", // Start a timer
    STOP_TIMER: "/api/time-tracking/stop", // Stop a timer
    PAUSE_TIMER: "/api/time-tracking/pause", // Pause a timer
    RESUME_TIMER: "/api/time-tracking/resume", // Resume a timer
    ADD_MANUAL_TIME: "/api/time-tracking/manual", // Add manual time entry
    GET_TASK_LOGS: (taskId) => `/api/time-tracking/task/${taskId}`, // Get time logs for a task
    GET_USER_LOGS: (userId) => `/api/time-tracking/user/${userId}`, // Get time logs for a user
  },

  TEMPLATES: {
    GET_ALL_TEMPLATES: "/api/templates", // Get all templates
    GET_TEMPLATE_BY_ID: (templateId) => `/api/templates/${templateId}`, // Get template by ID
    CREATE_TEMPLATE: "/api/templates", // Create a new template
    UPDATE_TEMPLATE: (templateId) => `/api/templates/${templateId}`, // Update a template
    DELETE_TEMPLATE: (templateId) => `/api/templates/${templateId}`, // Delete a template
    CREATE_FROM_TEMPLATE: (templateId) => `/api/templates/${templateId}/create-task`, // Create task from template
  },

  NOTIFICATIONS: {
    GET_NOTIFICATIONS: "/api/notifications", // Get all notifications
    MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`, // Mark as read
    MARK_ALL_READ: "/api/notifications/mark-all-read", // Mark all as read
    DELETE_NOTIFICATION: (notificationId) => `/api/notifications/${notificationId}`, // Delete notification
    CLEAR_ALL: "/api/notifications/clear-all", // Clear all notifications
    GET_PREFERENCES: "/api/notifications/preferences", // Get notification preferences
  },

  REPORTS: {
    EXPORT_TASKS: "/api/reports/export/tasks", // Download tasks as an Excel file
    EXPORT_USERS: "/api/reports/export/users", // Download users as an Excel file
  },
  IMAGE:{
    UPLOAD:"/api/auth/upload-image" // Upload profile picture
  }
};
