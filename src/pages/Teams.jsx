import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchTeams();
    } catch (error) {
      alert('Failed to create team');
    }
  };

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>👥 Teams</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Back
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            + Create Team
          </button>
        </div>
      </div>

      {showForm && (
        <div className="create-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Team Name *</label>
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
        <div className="loading">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="empty-state">No teams yet. Create your first team! 👥</div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team._id} className="team-card">
              <h3>{team.name}</h3>
              {team.description && <p>{team.description}</p>}
              <div className="team-meta">
                <span>👤 {team.members?.length || 0} members</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;

