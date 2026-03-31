import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin, isMentor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/mentors', icon: '👨‍🏫', label: 'Mentors' },
    { to: '/sessions', icon: '📅', label: 'Sessions' },
    { to: '/groups', icon: '👥', label: 'Groups' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ];

  if (isAdmin()) {
    navItems.push({ to: '/admin', icon: '⚙️', label: 'Admin Console' });
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const displayRole = isAdmin() ? 'Admin' : isMentor() ? 'Mentor' : 'Learner';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          <h1>SkillSync</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="name">{user?.name}</div>
              <div className="role">{displayRole}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleLogout} style={{ marginTop: '0.75rem' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}
