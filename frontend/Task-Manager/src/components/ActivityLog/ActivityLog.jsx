import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const ActivityLog = ({ taskId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [taskId, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/tasks/${taskId}/activity?page=${page}`);
      setActivities(response.data.activities);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Error fetching activity log');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      created: '✨',
      updated: '✏️',
      deleted: '🗑️',
      status_changed: '🔄',
      assigned: '👤',
      commented: '💬',
      attachment_added: '📎',
      priority_changed: '⚡',
      due_date_changed: '📅',
      description_updated: '📝',
      task_completed: '✅',
      task_reopened: '🔄',
    };
    return icons[action] || '📌';
  };

  const getActionLabel = (action) => {
    const labels = {
      created: 'Created task',
      updated: 'Updated task',
      deleted: 'Deleted task',
      status_changed: 'Changed status',
      assigned: 'Assigned task',
      commented: 'Added comment',
      attachment_added: 'Added attachment',
      priority_changed: 'Changed priority',
      due_date_changed: 'Changed due date',
      description_updated: 'Updated description',
      task_completed: 'Completed task',
      task_reopened: 'Reopened task',
    };
    return labels[action] || action;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Activity Log</h3>

      {loading ? (
        <div className="text-center text-gray-500">Loading activity...</div>
      ) : activities.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No activities yet</div>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity._id}
                className="flex gap-4 pb-3 border-b dark:border-gray-700 last:border-0"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <span className="text-xl">{getActionIcon(activity.action)}</span>
                  {index !== activities.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold dark:text-white">
                        {getActionLabel(activity.action)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by <span className="font-medium">{activity.userId?.name}</span>
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Show changes if available */}
                  {activity.changes && (
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{activity.changes.fieldName}:</span>{' '}
                        <span className="line-through text-red-600">
                          {activity.changes.oldValue}
                        </span>{' '}
                        →{' '}
                        <span className="text-green-600">{activity.changes.newValue}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 dark:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 dark:text-white">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 dark:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLog;
