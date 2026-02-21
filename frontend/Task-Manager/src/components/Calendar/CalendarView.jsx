import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const CalendarView = ({ onTaskSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendarTasks();
  }, [currentDate]);

  const fetchCalendarTasks = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await axiosInstance.get('/api/tasks/calendar', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setTasks(response.data);
    } catch (error) {
      toast.error('Error fetching calendar tasks');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return tasks.filter(
      t => new Date(t.dueDate).toISOString().split('T')[0] === dateStr
    );
  };

  const days = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
            }
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            ← Prev
          </button>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
            }
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayTasks = day ? getTasksForDate(day) : [];
          return (
            <div
              key={index}
              className={`min-h-24 p-2 rounded border ${
                day
                  ? 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {day && (
                <>
                  <p className="font-semibold text-sm dark:text-white">{day}</p>
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task._id}
                        onClick={() => onTaskSelect?.(task._id)}
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          task.priority === 'High'
                            ? 'bg-red-200 text-red-800 dark:bg-red-900'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900'
                            : 'bg-green-200 text-green-800 dark:bg-green-900'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayTasks.length - 3} more
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
