import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, token, isMentor, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '', skills: '' });
  const [applying, setApplying] = useState(false);
  const [applyData, setApplyData] = useState({ bio: '', skills: '', hourlyRate: 50 });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile(user.id, token);
      setProfile(data);
      setFormData({ 
        name: data.name || '', 
        email: data.email || '', 
        bio: data.bio || '', 
        skills: data.skills ? data.skills.join(', ') : '' 
      });

      if (isMentor()) {
        const mentors = await api.getMentors(token);
        const myMentorData = mentors.find(m => m.userId === user.id);
        if (myMentorData) {
          setMentorData(myMentorData);
          const revs = await api.getMentorReviews(myMentorData.id, token);
          setReviews(revs || []);
        }
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile(user.id, {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      }, token);
      setProfile(updated);
      login(updated, token); // Update context
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.applyMentor({
        ...applyData,
        userId: user.id,
        name: user.name,
        skills: applyData.skills.split(',').map(s => s.trim()).filter(s => s)
      }, token);
      setApplying(false);
      setMessage({ type: 'success', text: 'Application submitted! Awaiting admin approval.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  if (loading) return <div className="loading pulse">Loading profile...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>User Profile</h1>
        <p>Manage your account settings and mentor status</p>
      </div>

      {message.text && (
        <div className={`error ${message.type === 'success' ? 'badge-success' : ''}`} 
             style={{ backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : '', 
                      borderColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : '',
                      color: message.type === 'success' ? '#10b981' : '' }}>
          {message.text}
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            {!editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>}
          </div>

          {editing ? (
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-input" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input type="text" className="form-input" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="slide-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user.name?.[0]}
                </div>
                <div>
                  <h3>{profile?.name}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>{profile?.email}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    {user.roles?.map(role => (
                      <span key={role} className="badge badge-primary" style={{ marginRight: '0.5rem' }}>{role}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Bio</h4>
                <p>{profile?.bio || 'No bio provided'}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile?.skills?.map(s => <span key={s} className="badge badge-info">{s}</span>) || 'None'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {isMentor() ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Mentor Dashboard</h2>
                <span className={`badge ${mentorData?.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                  {mentorData?.status || 'PENDING'}
                </span>
              </div>
              {mentorData && (
                <div className="slide-in">
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '1.5rem' }}>
                    <div className="stat-card" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>⭐ {mentorData.rating || 0}</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-card" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>💰 ${mentorData.hourlyRate}/hr</div>
                      <div className="stat-label">Rate</div>
                    </div>
                  </div>
                  
                  <h3>Reviews ({reviews.length})</h3>
                  <div style={{ marginTop: '1rem' }}>
                    {reviews.length === 0 ? <p className="text-muted">No reviews yet</p> : 
                      reviews.map(r => (
                        <div key={r.id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className="stars">
                              {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= r.rating ? 'filled' : ''}`}>★</span>)}
                            </div>
                            <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                          </div>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{r.comment}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Become a Mentor</h2>
              </div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Share your knowledge with others and earn while doing so. Apply to be a mentor today!
              </p>
              
              {applying ? (
                <form onSubmit={handleApply}>
                  <div className="form-group">
                    <label>Professional Bio</label>
                    <textarea className="form-input" value={applyData.bio} onChange={e => setApplyData({...applyData, bio: e.target.value})} required placeholder="Tell us about your experience..." />
                  </div>
                  <div className="form-group">
                    <label>Skills (comma separated)</label>
                    <input type="text" className="form-input" value={applyData.skills} onChange={e => setApplyData({...applyData, skills: e.target.value})} required placeholder="React, Node.js, Java..." />
                  </div>
                  <div className="form-group">
                    <label>Hourly Rate ($)</label>
                    <input type="number" className="form-input" value={applyData.hourlyRate} onChange={e => setApplyData({...applyData, hourlyRate: e.target.value})} required min="1" />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-success btn-block">Submit Application</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setApplying(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button className="btn btn-primary btn-block" onClick={() => setApplying(true)}>Apply Now</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
