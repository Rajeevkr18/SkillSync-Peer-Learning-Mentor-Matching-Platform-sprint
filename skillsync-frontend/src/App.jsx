import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Mentors from './pages/Mentors';
import Sessions from './pages/Sessions';
import Groups from './pages/Groups';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './index.css';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.some(r => user.roles?.includes(r) || Array.from(user.roles || []).includes(r))) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mentors" element={<Mentors />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="groups" element={<Groups />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<ProtectedRoute roles={['ROLE_ADMIN']}><Admin /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
