import React, { useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { SearchContext } from '../../context/searchContext';

const AdvancedSearch = ({ onResults }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    priority: [],
    status: [],
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: '-1',
  });
  const [loading, setLoading] = useState(false);

  const { setSearchParams } = useContext(SearchContext);

  const handleSearch = async (e) => {
    e.preventDefault();
    // If a caller provided `onResults`, keep the previous behavior
    if (typeof onResults === 'function') {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (filters.q) params.append('q', filters.q);
        if (filters.priority.length > 0) params.append('priority', filters.priority.join(','));
        if (filters.status.length > 0) params.append('status', filters.status.join(','));
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        params.append('sortBy', filters.sortBy);
        params.append('sortOrder', filters.sortOrder);

        const response = await axiosInstance.get(`/api/tasks/search?${params}`);
        onResults(response.data.tasks);
        toast.success(`Found ${response.data.tasks.length} tasks`);
      } catch (error) {
        toast.error('Error searching tasks');
      } finally {
        setLoading(false);
      }
    } else {
      // Otherwise, publish the search filters to the global SearchContext
      const paramsObj = {
        q: filters.q || '',
        priority: filters.priority || [],
        status: filters.status || [],
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      setSearchParams(paramsObj);
      toast.success('Search applied');
    }
  };

  const handlePriorityChange = (priority) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleReset = () => {
    setFilters({
      q: '',
      priority: [],
      status: [],
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: '-1',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search tasks by title or description..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            🔽 Filters
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-600">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Priority</label>
              <div className="space-y-2">
                {['Low', 'Medium', 'High'].map(priority => (
                  <label key={priority} className="flex items-center gap-2 cursor-pointer dark:text-white">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority)}
                      onChange={() => handlePriorityChange(priority)}
                      className="w-4 h-4"
                    />
                    {priority}
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Status</label>
              <div className="space-y-2">
                {['Pending', 'In-Progress', 'Completed'].map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer dark:text-white">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleStatusChange(status)}
                      className="w-4 h-4"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="-1">Descending</option>
                <option value="1">Ascending</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            🔍 Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSearch;
