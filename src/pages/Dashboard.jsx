import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from '../components/DarkModeToggle';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed

  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
      setError('');
    } catch (error) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete task. Please try again.');
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? response.data.task : task
        )
      );
    } catch (error) {
      alert('Failed to update task status. Please try again.');
      console.error('Error updating task:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if deadline is approaching or passed
  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'soon';
    return 'normal';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge status-completed';
      case 'in-progress':
        return 'status-badge status-in-progress';
      default:
        return 'status-badge status-pending';
    }
  };

  const getDeadlineBadgeClass = (deadline) => {
    const status = getDeadlineStatus(deadline);
    switch (status) {
      case 'overdue':
        return 'deadline-badge deadline-overdue';
      case 'today':
        return 'deadline-badge deadline-today';
      case 'soon':
        return 'deadline-badge deadline-soon';
      default:
        return 'deadline-badge deadline-normal';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'priority-badge priority-urgent';
      case 'high':
        return 'priority-badge priority-high';
      case 'medium':
        return 'priority-badge priority-medium';
      default:
        return 'priority-badge priority-low';
    }
  };

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Task Manager</h1>
              <p className="welcome-text">Welcome, {user?.username}!</p>
            </div>
            <div className="header-actions">
              <Link to="/profile" className="btn btn-secondary btn-small">
                👤 Profile
              </Link>
              <Link to="/teams" className="btn btn-secondary btn-small">
                👥 Teams
              </Link>
              <Link to="/boards" className="btn btn-secondary btn-small">
                📋 Boards
              </Link>
              <DarkModeToggle />
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-actions">
            <Link to="/tasks/new" className="btn btn-primary">
              ✨ Create New Task ✨
            </Link>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                🌈 All
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                ⏳ Pending
              </button>
              <button
                className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setFilter('in-progress')}
              >
                🚀 In Progress
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                ✅ Completed
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">✨ Loading your beautiful tasks... ✨</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>
                {filter === 'all'
                  ? "You don't have any tasks yet. Create your first task!"
                  : `No ${filter} tasks found.`}
              </p>
              {filter === 'all' && (
                <Link to="/tasks/new" className="btn btn-primary">
                  ✨ Create Your First Task ✨
                </Link>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <div className="task-actions">
                      <Link
                        to={`/tasks/edit/${task._id}`}
                        className="btn-icon"
                        title="Edit Task"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="btn-icon"
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-meta">
                    <div className="task-priority">
                      <span className="priority-label">Priority:</span>
                      <span className={getPriorityBadgeClass(task.priority || 'medium')}>
                        {getPriorityEmoji(task.priority || 'medium')} {task.priority || 'medium'}
                      </span>
                    </div>
                    <div className="task-deadline">
                      <span className="deadline-label">Deadline:</span>
                      <span className={getDeadlineBadgeClass(task.deadline)}>
                        {formatDate(task.deadline)}
                        {getDeadlineStatus(task.deadline) === 'overdue' && ' ⚠️'}
                        {getDeadlineStatus(task.deadline) === 'today' && ' 🔔'}
                      </span>
                    </div>

                    <div className="task-status-section">
                      <label className="status-label">Status:</label>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className={getStatusBadgeClass(task.status)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

