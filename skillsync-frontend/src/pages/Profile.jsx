import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, token, isMentor, login, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingMentor, setEditingMentor] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '', skills: '' });
  const [mentorFormData, setMentorFormData] = useState({ bio: '', skills: '', hourlyRate: 0, experience: 0 });
  const [applying, setApplying] = useState(false);
  const [applyData, setApplyData] = useState({ bio: '', skills: '', hourlyRate: 50, experience: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      loadProfile();
    };
    init();
  }, []);

  const parseSkills = (rawSkills) => {
    if (!rawSkills) return [];
    if (Array.isArray(rawSkills)) return rawSkills.map(s => String(s).trim()).filter(Boolean);
    if (typeof rawSkills === 'string') return rawSkills.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      let data;
      try {
        data = await api.getProfile(user.id, token);
      } catch (_notFound) {
        data = await api.createProfile({
          userId: user.id,
          name: user.name,
          email: user.email,
          bio: '',
          skills: '',
        }, token);
      }

      const skillsArray = parseSkills(data.skills);
      setProfile({ ...data, skills: skillsArray });
      setFormData({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        skills: skillsArray.join(', '),
      });

      if (isMentor()) {
        const mentors = await api.getMentors(token);
        const myMentorData = mentors.find(m => m.userId === user.id);
        if (myMentorData) {
          setMentorData(myMentorData);
          setMentorFormData({
            bio: myMentorData.bio || '',
            skills: Array.isArray(myMentorData.skills) ? myMentorData.skills.join(', ') : (myMentorData.skills || ''),
            hourlyRate: myMentorData.hourlyRate || 0,
            experience: myMentorData.experience || 0
          });
          const revs = await api.getMentorReviews(myMentorData.id, token);
          setReviews(revs && Array.isArray(revs.reviews) ? revs.reviews : []);
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
        skills: formData.skills,
      }, token);
      const skillsArray = parseSkills(updated.skills);
      setProfile({ ...updated, skills: skillsArray });
      login({ ...user, name: updated.name, email: updated.email }, token);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleMentorUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateMentor(mentorData.id, {
        ...mentorFormData,
        userId: user.id,
        name: user.name,
        skills: mentorFormData.skills.split(',').map(s => s.trim()).filter(s => s)
      }, token);
      setMentorData(updated);
      setEditingMentor(false);
      setMessage({ type: 'success', text: 'Mentor profile updated successfully' });
      loadProfile();
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
      setMessage({ type: 'error', text: e.message || 'Failed to submit application' });
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
        <div className={`badge ${message.type === 'success' ? 'badge-success' : 'badge-danger'}`} 
             style={{ marginBottom: '1.5rem', padding: '0.75rem', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          {message.text}
          <span style={{ cursor: 'pointer' }} onClick={() => setMessage({ type: '', text: '' })}>×</span>
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
                    {Array.isArray(user?.roles) && user.roles.map(role => (
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
                  {Array.isArray(profile?.skills) ? profile.skills.map(s => <span key={s} className="badge badge-info">{s}</span>) : 'None'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {isMentor() ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Mentor Profile</h2>
                {!editingMentor && <button className="btn btn-secondary btn-sm" onClick={() => setEditingMentor(true)}>Edit Mentor Info</button>}
              </div>
              
              {editingMentor ? (
                <form onSubmit={handleMentorUpdate}>
                  <div className="form-group">
                    <label>Professional Bio</label>
                    <textarea className="form-input" value={mentorFormData.bio} onChange={e => setMentorFormData({...mentorFormData, bio: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Experience (Years)</label>
                    <input type="number" className="form-input" value={mentorFormData.experience} onChange={e => setMentorFormData({...mentorFormData, experience: e.target.value})} required min="0" />
                  </div>
                  <div className="form-group">
                    <label>Hourly Rate ($)</label>
                    <input type="number" className="form-input" value={mentorFormData.hourlyRate} onChange={e => setMentorFormData({...mentorFormData, hourlyRate: e.target.value})} required min="1" />
                  </div>
                  <div className="form-group">
                    <label>Mentor Skills (comma separated)</label>
                    <input type="text" className="form-input" value={mentorFormData.skills} onChange={e => setMentorFormData({...mentorFormData, skills: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary">Update Mentor Info</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingMentor(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="slide-in">
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
                    <div className="stat-card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '1.25rem' }}>⭐ {mentorData?.rating?.toFixed(1) || 0}</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '1.25rem' }}>⏳ {mentorData?.experience || 0} yrs</div>
                      <div className="stat-label">Experience</div>
                    </div>
                    <div className="stat-card" style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '1.25rem' }}>💰 ${mentorData?.hourlyRate}/hr</div>
                      <div className="stat-label">Rate</div>
                    </div>
                  </div>
                  
                  <h3>Recent Reviews ({Array.isArray(reviews) ? reviews.length : 0})</h3>
                  <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {!Array.isArray(reviews) || reviews.length === 0 ? <p className="text-muted">No reviews yet</p> : 
                      reviews.map(r => (
                        <div key={r.id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ color: '#fbbf24' }}>
                              {[1,2,3,4,5].map(s => <span key={s}>{s <= r.rating ? '★' : '☆'}</span>)}
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                          </div>
                          <p style={{ fontSize: '0.85rem' }}>{r.comment}</p>
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
                    <textarea className="form-input" value={applyData.bio} onChange={e => setApplyData({...applyData, bio: e.target.value})} required placeholder="Tell us about your expertise..." />
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input type="number" className="form-input" value={applyData.experience} onChange={e => setApplyData({...applyData, experience: e.target.value})} required min="0" />
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
