import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, token, isMentor } = useAuth();
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
  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>{isMentor() ? 'Manage your mentoring sessions and availability' : 'Discover mentors and track your learning'}</p>
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
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Upcoming Sessions</h3>
          </div>
          {loading ? (
            <div className="loading pulse">Loading...</div>
          ) : upcomingSessions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>No upcoming sessions</p>
            </div>
          ) : (
            upcomingSessions.slice(0, 5).map(session => (
              <div key={session.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{session.topic || 'Session'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(session.sessionDate).toLocaleDateString()} • {session.duration || 60} min
                    </div>
                  </div>
                  <span className={`badge ${session.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
                    {session.status}
                  </span>
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
    </div>
  );
}
