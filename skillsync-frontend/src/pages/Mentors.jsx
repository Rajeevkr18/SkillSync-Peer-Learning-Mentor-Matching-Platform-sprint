import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Mentors() {
  const { user, token, isLearner } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBooking, setShowBooking] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [bookForm, setBookForm] = useState({ sessionDate: '', duration: 60, topic: '' });
  const [applyForm, setApplyForm] = useState({ bio: '', experience: '', hourlyRate: '', skills: '' });

  useEffect(() => { loadMentors(); }, []);

  const loadMentors = async () => {
    try {
      const data = await api.getMentors(token);
      setMentors(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = search ? `?skill=${search}` : '';
      const data = await api.getMentors(token, params);
      setMentors(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    try {
      await api.bookSession({
        mentorId: showBooking.id,
        learnerId: user.id,
        sessionDate: bookForm.sessionDate,
        duration: parseInt(bookForm.duration),
        topic: bookForm.topic,
      }, token);
      alert('Session booked successfully!');
      setShowBooking(null);
      setBookForm({ sessionDate: '', duration: 60, topic: '' });
    } catch (e) { alert(e.message); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.applyMentor({
        userId: user.id,
        name: user.name,
        bio: applyForm.bio,
        experience: parseInt(applyForm.experience),
        hourlyRate: parseFloat(applyForm.hourlyRate),
        skills: applyForm.skills,
      }, token);
      alert('Mentor application submitted!');
      setShowApply(false);
    } catch (e) { alert(e.message); }
  };

  const filtered = search
    ? mentors.filter(m => m.skills?.toLowerCase().includes(search.toLowerCase()) || m.name?.toLowerCase().includes(search.toLowerCase()))
    : mentors;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔍 Discover Mentors</h1>
        <p>Find the perfect mentor to guide your learning journey</p>
        {isLearner() && (
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setShowApply(true)}>🎓 Apply as Mentor</button>
          </div>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text" className="form-input" placeholder="Search by skill or name..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <div className="loading pulse">Loading mentors...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👨‍🏫</div>
          <p>No mentors found</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(mentor => (
            <div key={mentor.id} className="card mentor-card">
              <div className="mentor-header">
                <div className="mentor-avatar">{mentor.name?.[0]?.toUpperCase() || 'M'}</div>
                <div>
                  <div className="mentor-name">{mentor.name}</div>
                  <div className="mentor-exp">{mentor.experience || 0} years experience</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {mentor.bio?.substring(0, 120) || 'No bio available'}
              </p>
              <div className="mentor-skills">
                {mentor.skills?.split(',').map((s, i) => (
                  <span key={i} className="badge badge-primary">{s.trim()}</span>
                ))}
              </div>
              <div className="mentor-meta">
                <span className="mentor-rating">⭐ {mentor.rating?.toFixed(1) || '0.0'}</span>
                <span className="mentor-price">${mentor.hourlyRate || 0}/hr</span>
              </div>
              {isLearner() && (
                <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '1rem' }}
                  onClick={() => setShowBooking(mentor)}>
                  📅 Book Session
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="modal-overlay" onClick={() => setShowBooking(null)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2>📅 Book Session with {showBooking.name}</h2>
            <form onSubmit={handleBookSession}>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" className="form-input" required
                  value={bookForm.sessionDate} onChange={e => setBookForm({ ...bookForm, sessionDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <select className="form-input" value={bookForm.duration} onChange={e => setBookForm({ ...bookForm, duration: e.target.value })}>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
              <div className="form-group">
                <label>Topic</label>
                <input type="text" className="form-input" placeholder="What would you like to learn?"
                  value={bookForm.topic} onChange={e => setBookForm({ ...bookForm, topic: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Book Session</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBooking(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2>🎓 Apply as Mentor</h2>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-input" placeholder="Tell learners about your expertise"
                  value={applyForm.bio} onChange={e => setApplyForm({ ...applyForm, bio: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" className="form-input" min="0"
                  value={applyForm.experience} onChange={e => setApplyForm({ ...applyForm, experience: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" className="form-input" min="0" step="0.01"
                  value={applyForm.hourlyRate} onChange={e => setApplyForm({ ...applyForm, hourlyRate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input type="text" className="form-input" placeholder="Java, Spring Boot, React"
                  value={applyForm.skills} onChange={e => setApplyForm({ ...applyForm, skills: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Application</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
