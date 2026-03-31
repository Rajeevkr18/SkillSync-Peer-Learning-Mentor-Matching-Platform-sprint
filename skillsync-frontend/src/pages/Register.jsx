import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ROLE_LEARNER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register({ ...form, roles: [form.role] });
      login(res, res.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        <div className="auth-hero">
          <h2>Join SkillSync Today</h2>
          <p>Start your learning journey or share your expertise with our global community.</p>
          <div className="features">
            <div className="feature"><span className="check">✓</span> Free to join</div>
            <div className="feature"><span className="check">✓</span> Learn from the best</div>
            <div className="feature"><span className="check">✓</span> Monetize your expertise</div>
            <div className="feature"><span className="check">✓</span> Grow your network</div>
          </div>
        </div>

        <div className="auth-form-section">
          <h2>Create Account</h2>
          <p className="subtitle">Fill in your details to get started</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" className="form-input" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" className="form-input" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6}
              />
            </div>
            <div className="form-group">
              <label>I want to join as</label>
              <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="ROLE_LEARNER">🎓 Learner</option>
                <option value="ROLE_MENTOR">👨‍🏫 Mentor</option>
                <option value="ROLE_ADMIN">⚙️ Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
