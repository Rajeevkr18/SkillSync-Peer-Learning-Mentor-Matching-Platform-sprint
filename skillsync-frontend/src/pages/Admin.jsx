import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, pData, sData] = await Promise.all([
        api.getAllUsers(token),
        api.getPendingMentors(token),
        api.getSkills(token)
      ]);
      setUsers(uData || []);
      setPendingMentors(pData || []);
      setSkills(sData || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to load admin data' });
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await api.approveMentor(id, token);
      setPendingMentors(pendingMentors.filter(m => m.id !== id));
      setMessage({ type: 'success', text: 'Mentor approved successfully' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.createSkill(newSkill, token);
      setNewSkill({ name: '', category: '' });
      setMessage({ type: 'success', text: 'Skill created successfully' });
      const sData = await api.getSkills(token);
      setSkills(sData || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  if (loading) return <div className="loading pulse">Loading admin panel...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Admin Control Center</h1>
        <p>Manage users, mentor applications, and platform skills</p>
      </div>

      {message.text && (
        <div className={`error ${message.type === 'success' ? 'badge-success' : ''}`} 
             style={{ backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : '', 
                      borderColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : '',
                      color: message.type === 'success' ? '#10b981' : '' }}>
          {message.text}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer', borderColor: activeTab === 'users' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('mentors')} style={{ cursor: 'pointer', borderColor: activeTab === 'mentors' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{pendingMentors.length}</div>
          <div className="stat-label">Pending Mentors</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('skills')} style={{ cursor: 'pointer', borderColor: activeTab === 'skills' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">🛠️</div>
          <div className="stat-value">{skills.length}</div>
          <div className="stat-label">Total Skills</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'mentors' && 'Mentor Applications'}
            {activeTab === 'skills' && 'Skill Directory'}
          </h2>
        </div>

        {activeTab === 'users' && (
          <div className="table-container fade-in">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      {u.roles?.map(r => <span key={r} className="badge badge-primary" style={{ marginRight: '0.25rem' }}>{r}</span>)}
                    </td>
                    <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="fade-in">
            {pendingMentors.length === 0 ? (
              <div className="empty-state">
                <div className="icon">✅</div>
                <p>No pending applications</p>
              </div>
            ) : (
              <div className="grid-2">
                {pendingMentors.map(m => (
                  <div key={m.id} className="card mentor-card">
                    <div className="mentor-header">
                      <div className="mentor-avatar">{m.name?.[0]}</div>
                      <div>
                        <div className="mentor-name">{m.name || 'Unknown User'}</div>
                        <div className="mentor-exp">${m.hourlyRate}/hour rate requested</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{m.bio}</p>
                    <div className="mentor-skills">
                      {m.skills?.map(s => <span key={s} className="badge badge-info">{s}</span>)}
                    </div>
                    <div className="mentor-meta">
                      <button className="btn btn-success btn-sm" onClick={() => handleApprove(m.id)}>Approve Mentor</button>
                      <button className="btn btn-secondary btn-sm">Review Profile</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="fade-in">
            <form onSubmit={handleCreateSkill} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input type="text" className="form-input" placeholder="Skill Name (e.g. React)" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} required />
              <input type="text" className="form-input" placeholder="Category (e.g. Frontend)" value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})} required />
              <button type="submit" className="btn btn-primary">Add Skill</button>
            </form>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="badge badge-info">{s.category}</span></td>
                      <td>{new Date(s.createdAt || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
