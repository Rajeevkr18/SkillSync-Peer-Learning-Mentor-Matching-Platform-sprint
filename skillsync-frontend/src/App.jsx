import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
const Mentors = lazy(() => import('./pages/Mentors'));
const Sessions = lazy(() => import('./pages/Sessions'));
const Groups = lazy(() => import('./pages/Groups'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

const Availability = lazy(() => import('./pages/Availability'));
const Chat = lazy(() => import('./pages/Chat'));

import './index.css';

const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="pulse">Loading SkillSync...</div>
  </div>
);

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
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="mentors" element={<ErrorBoundary><Mentors /></ErrorBoundary>} />
          <Route path="sessions" element={<ErrorBoundary><Sessions /></ErrorBoundary>} />
          <Route path="groups" element={<ErrorBoundary><Groups /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
          <Route path="admin" element={<ProtectedRoute roles={['ROLE_ADMIN']}><ErrorBoundary><Admin /></ErrorBoundary></ProtectedRoute>} />
          <Route path="availability" element={<ErrorBoundary><Availability /></ErrorBoundary>} />
          <Route path="chat" element={<ErrorBoundary><Chat /></ErrorBoundary>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Suspense>
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
