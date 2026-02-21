import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const TaskTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Custom',
    defaultPriority: 'Medium',
    defaultDueDays: 7,
    tags: '',
    isPublic: false,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      toast.error('Error fetching templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axiosInstance.put(`/api/templates/${editingId}`, formData);
        toast.success('Template updated');
      } else {
        await axiosInstance.post('/api/templates', formData);
        toast.success('Template created');
      }

      setFormData({
        name: '',
        description: '',
        category: 'Custom',
        defaultPriority: 'Medium',
        defaultDueDays: 7,
        tags: '',
        isPublic: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchTemplates();
    } catch (error) {
      toast.error('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      defaultPriority: template.defaultPriority,
      defaultDueDays: template.defaultDueDays,
      tags: template.tags?.join(', ') || '',
      isPublic: template.isPublic,
    });
    setEditingId(template._id);
    setShowForm(true);
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Delete this template?')) return;

    try {
      await axiosInstance.delete(`/api/templates/${templateId}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      toast.error('Error deleting template');
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    const title = prompt('Enter task title:');
    if (!title) return;

    try {
      const response = await axiosInstance.post(
        `/templates/${templateId}/create-task`,
        { title }
      );
      toast.success('Task created from template');
    } catch (error) {
      toast.error('Error creating task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">
            {editingId ? 'Edit Template' : 'Create New Template'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Custom</option>
                  <option>Default</option>
                  <option>Team</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Default Priority
                </label>
                <select
                  value={formData.defaultPriority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultPriority: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">
                Default Due Days
              </label>
              <input
                type="number"
                value={formData.defaultDueDays}
                onChange={(e) =>
                  setFormData({ ...formData, defaultDueDays: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                Make Public (share with team)
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'} Template
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'Custom',
                    defaultPriority: 'Medium',
                    defaultDueDays: 7,
                    tags: '',
                    isPublic: false,
                  });
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg dark:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Task Templates</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + New Template
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-500">No templates yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <div
                key={template._id}
                className="bg-white rounded-lg shadow-md p-4 dark:bg-gray-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg dark:text-white">
                    {template.name}
                  </h3>
                  {template.isPublic && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900">
                      Public
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-2 dark:text-gray-400">
                  {template.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {template.category}
                  </span>
                  <span>Priority: {template.defaultPriority}</span>
                  <span>Used {template.usageCount || 0} times</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateFromTemplate(template._id)}
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTemplates;
