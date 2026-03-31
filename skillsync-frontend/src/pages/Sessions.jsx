import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sessions() {
  const { user, token, isMentor } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getUserSessions(user.id, token);
      setSessions(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAccept = async (id) => {
    try { await api.acceptSession(id, token); loadSessions(); } catch (e) { alert(e.message); }
  };

  const handleReject = async (id) => {
    try { await api.rejectSession(id, token); loadSessions(); } catch (e) { alert(e.message); }
  };

  const handleCancel = async (id) => {
    try { await api.cancelSession(id, token); loadSessions(); } catch (e) { alert(e.message); }
  };

  const statusColor = {
    REQUESTED: 'badge-warning', ACCEPTED: 'badge-success',
    REJECTED: 'badge-danger', COMPLETED: 'badge-info', CANCELLED: 'badge-danger'
  };

  const filtered = filter === 'ALL' ? sessions : sessions.filter(s => s.status === filter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📅 My Sessions</h1>
        <p>Manage your mentoring sessions</p>
      </div>

      <div className="search-bar">
        {['ALL', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading pulse">Loading sessions...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No sessions found</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(session => (
            <div key={session.id} className="card session-card">
              <div className="session-status">
                <span className={`badge ${statusColor[session.status]}`}>{session.status}</span>
              </div>
              <div className="session-info">
                <span><strong>📝 Topic:</strong> {session.topic || 'N/A'}</span>
                <span><strong>📅 Date:</strong> {new Date(session.sessionDate).toLocaleString()}</span>
                <span><strong>⏱ Duration:</strong> {session.duration || 60} minutes</span>
                <span><strong>{isMentor() ? '🎓 Learner' : '👨‍🏫 Mentor'} ID:</strong> {isMentor() ? session.learnerId : session.mentorId}</span>
              </div>
              <div className="session-actions">
                {session.status === 'REQUESTED' && isMentor() && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(session.id)}>✓ Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(session.id)}>✗ Reject</button>
                  </>
                )}
                {(session.status === 'REQUESTED' || session.status === 'ACCEPTED') && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(session.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
