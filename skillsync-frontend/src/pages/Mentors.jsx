import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Helper: always returns an array of skill strings regardless of backend type
const getSkillsArray = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map(s => String(s).trim()).filter(Boolean);
  if (typeof skills === 'string') return skills.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

export default function Mentors() {
  const { user, token, isLearner, isMentor, refreshUser } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ minExp: '', maxPrice: '', minRating: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showBooking, setShowBooking] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApprovedStatus, setIsApprovedStatus] = useState(false);
  const [bookForm, setBookForm] = useState({ sessionDate: '', duration: 60, topic: '' });
  const [applyForm, setApplyForm] = useState({ bio: '', experience: '', hourlyRate: '', skills: '' });

  useEffect(() => { 
    loadMentors(); 
    if (user) {
      checkMentorStatus();
      refreshUser(); // Refresh user roles on page load
    }
  }, []);

  const checkMentorStatus = async () => {
    try {
      const mentorData = await api.getMentorByUserId(user.id, token);
      if (mentorData) {
        setHasApplied(true);
        setIsApprovedStatus(mentorData.approved);
      }
    } catch (e) {
      setHasApplied(false);
    }
  };

  const loadMentors = async (params = '') => {
    setLoading(true);
    try {
      const data = await api.getMentors(token, params);
      setMentors(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSearch = async () => {
    let queryParams = [];
    if (search) queryParams.push(`skill=${encodeURIComponent(search)}`);
    if (filters.minExp) queryParams.push(`minExperience=${filters.minExp}`);
    if (filters.maxPrice) queryParams.push(`maxPrice=${filters.maxPrice}`);
    if (filters.minRating) queryParams.push(`minRating=${filters.minRating}`);
    
    const params = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    loadMentors(params);
  };

  const resetFilters = () => {
    setFilters({ minExp: '', maxPrice: '', minRating: '' });
    setSearch('');
    loadMentors();
  };

  const handleBookingClick = async (mentor) => {
    setShowBooking(mentor);
    try {
      const slots = await api.getAvailableSlots(mentor.id, token);
      setMentors(prev => prev.map(m => m.id === mentor.id ? { ...m, slots: Array.isArray(slots) ? slots : [] } : m));
      setShowBooking(prev => ({ ...prev, slots: Array.isArray(slots) ? slots : [] }));
    } catch (e) {
      console.error('Failed to fetch slots:', e);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    try {
      await api.bookSession({
        mentorId: showBooking.id,
        learnerId: user.id,
        sessionDate: bookForm.sessionDate,
        duration: 60, 
        topic: bookForm.topic,
        availabilityId: bookForm.availabilityId,
      }, token);
      
      alert('Session booked successfully! You can view it in your dashboard.');
      setShowBooking(null);
      setBookForm({ sessionDate: '', duration: 60, topic: '', availabilityId: null });
      loadMentors(); 
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
      setHasApplied(true);
      setIsApprovedStatus(false);
    } catch (e) { alert(e.message); }
  };

  const handleDeleteMentor = async (mentorId) => {
    if (!window.confirm('Are you sure you want to remove this mentor?')) return;
    try {
      await api.deleteMentor(mentorId, token);
      loadMentors();
    } catch (e) { alert(e.message); }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔍 Discover Mentors</h1>
        <p>Find the perfect mentor to guide your learning journey</p>
        {isLearner() && !isMentor() && !hasApplied && (
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setShowApply(true)}>🎓 Apply as Mentor</button>
          </div>
        )}
        {hasApplied && !isApprovedStatus && (
          <div className="badge badge-info" style={{ marginTop: '1rem', padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}>
            ⏳ Your mentor application is pending admin approval
          </div>
        )}
        {isMentor() && (
          <div className="badge badge-success" style={{ marginTop: '1rem', padding: '0.75rem 1.25rem', fontSize: '0.9rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            ✅ You are a verified Mentor
          </div>
        )}
      </div>

      <div className="search-section card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text" className="form-input" placeholder="Search by skill (e.g. Java, React)..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          <button className="btn btn-primary" onClick={handleSearch} style={{ minWidth: '120px' }}>Search</button>
        </div>

        {showFilters && (
          <div className="grid-3 slide-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div className="form-group">
              <label>Min Experience (Years)</label>
              <input type="number" className="form-input" value={filters.minExp} onChange={e => setFilters({...filters, minExp: e.target.value})} placeholder="e.g. 5" />
            </div>
            <div className="form-group">
              <label>Max Hourly Rate ($)</label>
              <input type="number" className="form-input" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} placeholder="e.g. 100" />
            </div>
            <div className="form-group">
              <label>Min Rating (Stars)</label>
              <input type="number" step="0.1" max="5" className="form-input" value={filters.minRating} onChange={e => setFilters({...filters, minRating: e.target.value})} placeholder="e.g. 4.5" />
            </div>
            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={resetFilters}>Reset All</button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading pulse">Loading mentors...</div>
      ) : mentors.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👨‍🏫</div>
          <p>No mentors found matching your criteria</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={resetFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="grid-3">
          {mentors.map(mentor => (
            <div key={mentor.id} className="card mentor-card">
              <div className="mentor-header">
                <div className="mentor-avatar">{mentor.name?.[0]?.toUpperCase() || 'M'}</div>
                <div>
                  <div className="mentor-name">{mentor.name}</div>
                  <div className="mentor-exp">{mentor.experience || 0} years experience</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', minHeight: '3rem' }}>
                {mentor.bio?.substring(0, 120) || 'No bio available'}...
              </p>
              <div className="mentor-skills">
                {getSkillsArray(mentor.skills).map((s, i) => (
                  <span key={i} className="badge badge-primary">{s}</span>
                ))}
              </div>
              <div className="mentor-meta">
                <span className="mentor-rating">⭐ {mentor.rating?.toFixed(1) || '0.0'}</span>
                <span className="mentor-price">${mentor.hourlyRate || 0}/hr</span>
              </div>
              {isLearner() && (
                <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '1rem' }}
                  onClick={() => handleBookingClick(mentor)}>
                  📅 Book Session
                </button>
              )}
              {isAdmin && (
                <button className="btn btn-danger btn-block btn-sm" style={{ marginTop: '0.5rem' }}
                  onClick={() => handleDeleteMentor(mentor.id)}>
                  🗑️ Remove Mentor
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
                <label>Available Slots</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                  {Array.isArray(showBooking?.slots) && showBooking.slots.filter(s => !s.booked && !s.isBooked).length > 0 ? (
                    showBooking.slots.filter(s => !s.booked && !s.isBooked).map(slot => (
                      <button 
                        key={slot.id} 
                        type="button"
                        className={`btn btn-sm ${bookForm.availabilityId === slot.id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setBookForm({ ...bookForm, availabilityId: slot.id, sessionDate: slot.startTime })}
                      >
                        {new Date(slot.startTime).toLocaleDateString()} {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))
                  ) : (
                    <p style={{ gridColumn: 'span 2', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No available slots found. Please check back later.</p>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Topic</label>
                <input type="text" className="form-input" placeholder="What would you like to learn?"
                  value={bookForm.topic} onChange={e => setBookForm({ ...bookForm, topic: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!bookForm.availabilityId}>Book Session</button>
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
