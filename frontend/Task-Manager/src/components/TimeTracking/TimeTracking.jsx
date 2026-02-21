import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const TimeTracking = ({ taskId }) => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [trackingId, setTrackingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimeLogs();
    const interval = setInterval(() => {
      if (isTracking) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [taskId, isTracking]);

  const fetchTimeLogs = async () => {
    try {
      const response = await axiosInstance.get(`/api/tasks/${taskId}/time-logs`);
      setTimeLogs(response.data.timeLogs);
      setTotalTime(response.data.totalTimeInMinutes);
    } catch (error) {
      toast.error('Error fetching time logs');
    }
  };

  const handleStartTracking = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/time-tracking/start', {
        taskId,
      });
      setTrackingId(response.data.timeTracking._id);
      setIsTracking(true);
      setElapsedTime(0);
      toast.success('Time tracking started');
    } catch (error) {
      toast.error('Error starting timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/time-tracking/${trackingId}/stop`);
      setIsTracking(false);
      setTrackingId(null);
      setElapsedTime(0);
      fetchTimeLogs();
      toast.success('Time tracking stopped');
    } catch (error) {
      toast.error('Error stopping timer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualEntry = async () => {
    const duration = prompt('Enter duration in minutes:');
    if (!duration) return;

    try {
      await axiosInstance.post('/api/time-tracking/manual', {
        taskId,
        duration: parseInt(duration),
        description: prompt('Enter description (optional):') || '',
      });
      fetchTimeLogs();
      toast.success('Time entry added');
    } catch (error) {
      toast.error('Error adding time entry');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Time Tracking</h3>

      {/* Timer Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-4 text-center dark:from-gray-700 dark:to-gray-600">
        <p className="text-5xl font-bold text-blue-600 font-mono dark:text-blue-400">
          {formatTime(elapsedTime)}
        </p>
        <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
          Total Time: {Math.floor(totalTime / 60)}h {totalTime % 60}m
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mb-4">
        {!isTracking ? (
          <button
            onClick={handleStartTracking}
            disabled={loading}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            ▶ Start
          </button>
        ) : (
          <button
            onClick={handleStopTracking}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            ⏹ Stop
          </button>
        )}
        <button
          onClick={handleManualEntry}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          + Manual Entry
        </button>
      </div>

      {/* Time Logs */}
      <div>
        <h4 className="font-semibold mb-3 dark:text-white">Recent Logs</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {timeLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No time logs yet</p>
          ) : (
            timeLogs.map(log => (
              <div
                key={log._id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded dark:bg-gray-700"
              >
                <div>
                  <p className="text-sm font-medium dark:text-white">{log.description || 'No description'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {Math.floor(log.duration / 60)}h {log.duration % 60}m
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
