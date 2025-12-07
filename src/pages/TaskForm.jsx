import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './TaskForm.css';

const TaskForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'pending',
    priority: 'medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  // Fetch task data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setFetching(true);
      const response = await api.get('/tasks');
      const task = response.data.tasks.find((t) => t._id === id);

      if (!task) {
        setError('Task not found');
        return;
      }

      // Format deadline for input (YYYY-MM-DDTHH:mm)
      const deadlineDate = new Date(task.deadline);
      const formattedDeadline = deadlineDate.toISOString().slice(0, 16);

      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: formattedDeadline,
        status: task.status,
        priority: task.priority || 'medium',
      });
    } catch (error) {
      setError('Failed to load task. Please try again.');
      console.error('Error fetching task:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.title.trim()) {
      setError('💔 Title is required');
      setLoading(false);
      return;
    }

    if (!formData.deadline) {
      setError('💔 Deadline is required');
      setLoading(false);
      return;
    }

    // Validate deadline is not in the past (optional but helpful)
    const deadlineDate = new Date(formData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      setError('💔 Invalid deadline date');
      setLoading(false);
      return;
    }

    try {
      // Convert deadline to ISO string for backend
      const taskData = {
        title: formData.title.trim(),
        description: formData.description || '',
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : formData.deadline,
        status: formData.status || 'pending',
        priority: formData.priority || 'medium',
      };

      console.log('Submitting task data:', taskData);

      let response;
      if (isEditMode) {
        response = await api.put(`/tasks/${id}`, taskData);
      } else {
        response = await api.post('/tasks', taskData);
      }

      console.log('Task saved successfully:', response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`;
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(`💔 ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="task-form-container">
        <div className="task-form-card">
          <div className="loading">✨ Loading your task... ✨</div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-form-container">
      <div className="task-form-card">
        <div className="form-header">
          <h1>{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary btn-small"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">📝 Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="✨ Enter your task title..."
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">💭 Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="💖 Add some details about your task (optional)..."
              rows="5"
              maxLength={1000}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">📅 Deadline *</label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">🔥 Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">🎯 Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">⏳ Pending</option>
              <option value="in-progress">🚀 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Task'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

