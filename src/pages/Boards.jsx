import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Boards.css';

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', isShared: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data.boards);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/boards', formData);
      setFormData({ name: '', description: '', isShared: false });
      setShowForm(false);
      fetchBoards();
    } catch (error) {
      alert('Failed to create board');
    }
  };

  return (
    <div className="boards-container">
      <div className="boards-header">
        <h1>📋 Boards</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Back
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            + Create Board
          </button>
        </div>
      </div>

      {showForm && (
        <div className="create-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Board Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isShared}
                  onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                />
                <span>Share this board</span>
              </label>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading boards...</div>
      ) : boards.length === 0 ? (
        <div className="empty-state">No boards yet. Create your first board! 📋</div>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <div key={board._id} className="board-card">
              <h3>{board.name}</h3>
              {board.description && <p>{board.description}</p>}
              <div className="board-meta">
                <span>{board.isShared ? '🔓 Shared' : '🔒 Private'}</span>
                <span>👤 {board.members?.length || 0} members</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Boards;

