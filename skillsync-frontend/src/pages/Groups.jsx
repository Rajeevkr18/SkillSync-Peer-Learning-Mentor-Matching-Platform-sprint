import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Groups() {
  const { user, token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', skills: '' });

  useEffect(() => { loadGroups(); }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getGroups(token);
      setGroups(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createGroup({ ...form, createdBy: user.id }, token);
      setShowCreate(false);
      setForm({ name: '', description: '', skills: '' });
      loadGroups();
    } catch (e) { alert(e.message); }
  };

  const handleJoin = async (groupId) => {
    try {
      await api.joinGroup(groupId, user.id, token);
      loadGroups();
    } catch (e) { alert(e.message); }
  };

  const handleLeave = async (groupId) => {
    try {
      await api.leaveGroup(groupId, user.id, token);
      loadGroups();
    } catch (e) { alert(e.message); }
  };

  const isMember = (group) => group.members?.some(m => m.userId === user.id);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👥 Learning Groups</h1>
        <p>Join communities of learners and grow together</p>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>➕ Create Group</button>
        </div>
      </div>

      {loading ? (
        <div className="loading pulse">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👥</div>
          <p>No groups yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid-3">
          {groups.map(group => (
            <div key={group.id} className="card group-card">
              <h3 style={{ marginBottom: '0.5rem' }}>{group.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {group.description || 'No description'}
              </p>
              <div className="group-skills">
                {group.skills?.split(',').filter(Boolean).map((s, i) => (
                  <span key={i} className="badge badge-primary">{s.trim()}</span>
                ))}
              </div>
              <div className="group-meta">
                <span className="member-count">👤 {group.memberCount || 0} members</span>
                {isMember(group) ? (
                  <button className="btn btn-danger btn-sm" onClick={() => handleLeave(group.id)}>Leave</button>
                ) : (
                  <button className="btn btn-success btn-sm" onClick={() => handleJoin(group.id)}>Join</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2>➕ Create Learning Group</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Group Name</label>
                <input type="text" className="form-input" placeholder="e.g. Spring Boot Beginners"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" placeholder="What will this group focus on?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input type="text" className="form-input" placeholder="Java, DSA, Machine Learning"
                  value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Group</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
