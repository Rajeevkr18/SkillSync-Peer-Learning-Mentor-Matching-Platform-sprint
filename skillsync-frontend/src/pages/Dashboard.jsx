import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, token, isMentor, refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessData, notifData] = await Promise.allSettled([
        api.getUserSessions(user.id, token),
        api.getNotifications(user.id, token),
      ]);
      if (sessData.status === 'fulfilled') setSessions(sessData.value || []);
      if (notifData.status === 'fulfilled') setNotifications(notifData.value || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const upcomingSessions = sessions.filter(s => s.status === 'ACCEPTED' || s.status === 'REQUESTED');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
  const asMentor = sessions.filter(s => isMentor() && s.mentorId !== null && s.learnerId !== user.id);
  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Welcome back, {user?.name} 👋</h1>
          <p>{isMentor() ? 'Manage your mentoring sessions and availability' : 'Discover mentors and track your learning'}</p>
        </div>
        <button className="btn btn-secondary btn-sm" 
          onClick={async () => {
            const success = await refreshUser();
            if (success) window.alert('Account status refreshed! If you were approved, you should now see Mentor features.');
            else window.alert('Failed to refresh status. Please try again later.');
          }} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔄 Refresh Account Status
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{upcomingSessions.length}</div>
          <div className="stat-label">Upcoming Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completedSessions.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-value">{unreadNotifs.length}</div>
          <div className="stat-label">Notifications</div>
        </div>
        {isMentor() && (
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', color: 'white' }}>
            <div className="stat-icon" style={{ color: 'white' }}>👨‍🏫</div>
            <div className="stat-value">{asMentor.length}</div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Mentoring Sessions</div>
          </div>
        )}
      </div>

      <div className="grid-2">
        {isMentor() && (
          <div className="card">
            <div className="card-header" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3 className="card-title">👨‍🏫 Mentoring Requests</h3>
            </div>
            {asMentor.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📨</div>
                <p>No mentoring requests yet</p>
              </div>
            ) : (
              asMentor.slice(0, 5).map(session => (
                <div key={session.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{session.topic}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Learner ID: {session.learnerId} • {new Date(session.sessionDate).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {session.status === 'ACCEPTED' && session.meetingLink && (
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                          📹 Join
                        </a>
                      )}
                      <span className={`badge ${session.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Upcoming Sessions (as Learner)</h3>
          </div>
          {loading ? (
            <div className="loading pulse">Loading...</div>
          ) : upcomingSessions.filter(s => s.learnerId === user.id).length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>No upcoming learning sessions</p>
            </div>
          ) : (
            upcomingSessions.filter(s => s.learnerId === user.id).slice(0, 5).map(session => (
              <div key={session.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{session.topic || 'Session'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(session.sessionDate).toLocaleDateString()} • {session.duration || 60} min
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {session.status === 'ACCEPTED' && session.meetingLink && (
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                        📹 Join
                      </a>
                    )}
                    <span className={`badge ${session.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔔 Recent Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔕</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 5).map(n => (
              <div key={n.id} style={{
                padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
                opacity: n.isRead ? 0.6 : 1,
              }}>
                <div style={{ fontSize: '0.9rem' }}>{n.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {n.type} • {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Debug Section */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        DEBUG: Current Roles: {JSON.stringify(user?.roles)} | isMentor: {String(isMentor())}
      </div>
    </div>
  );
}
