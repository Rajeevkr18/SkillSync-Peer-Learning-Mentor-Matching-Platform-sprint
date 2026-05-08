import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sessions() {
  const { user, token, isMentor, isLearner } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showRating, setShowRating] = useState(null); // stores session object
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session record?')) return;
    try { await api.deleteSession(id, token); loadSessions(); } catch (e) { alert(e.message); }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.submitReview({
        mentorId: showRating.mentorId,
        reviewerId: user.id,
        sessionId: showRating.id,
        rating: ratingData.rating,
        comment: ratingData.comment
      }, token);
      alert('Thank you for your rating!');
      setShowRating(null);
      setRatingData({ rating: 5, comment: '' });
      loadSessions();
    } catch (e) { alert(e.message); }
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
              <div className="session-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {session.status === 'REQUESTED' && isMentor() && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(session.id)}>✓ Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(session.id)}>✗ Reject</button>
                  </>
                )}
                {session.status === 'ACCEPTED' && session.meetingLink && (
                  <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    📹 Join Meeting
                  </a>
                )}
                
                {/* Rating button for Learner on Completed/Accepted sessions */}
                {isLearner() && (session.status === 'COMPLETED' || session.status === 'ACCEPTED') && (
                  <button className="btn btn-warning btn-sm" onClick={() => setShowRating(session)}>⭐ Rate Mentor</button>
                )}

                {(session.status === 'REQUESTED' || session.status === 'ACCEPTED') && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(session.id)}>Cancel</button>
                )}
                
                {(isMentor() || session.status === 'CANCELLED' || session.status === 'REJECTED') && (
                   <button className="btn btn-danger btn-sm" onClick={() => handleDelete(session.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="modal-overlay" onClick={() => setShowRating(null)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2>⭐ Rate your Session</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>How was your experience learning about <strong>{showRating.topic}</strong>?</p>
            <form onSubmit={handleRateSubmit}>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '2rem', justifyContent: 'center', margin: '1rem 0' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <span 
                      key={num} 
                      style={{ cursor: 'pointer', color: num <= ratingData.rating ? '#fbbf24' : '#4b5563' }}
                      onClick={() => setRatingData({ ...ratingData, rating: num })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea 
                  className="form-input" 
                  placeholder="Share your thoughts on the mentor..."
                  value={ratingData.comment} 
                  onChange={e => setRatingData({ ...ratingData, comment: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary btn-block">Submit Review</button>
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowRating(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
