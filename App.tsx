import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AsyncComponent from './components/common/AsyncComponent';
import LoadingSpinner from './components/common/LoadingSpinner';
import { authService } from './services/authService';
import { adminService } from './services/adminService';
import LandingPage from './components/landing/LandingPage';

// Import critical components directly
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLogin from './components/admin/AdminLogin';

// Lazy load non-critical components
const AdminPanel = React.lazy(() => import('./components/admin/AdminPanel'));
const MainApp = React.lazy(() => import('./components/MainApp'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = authService.isLoggedIn();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminAuthenticated = adminService.isAdminLoggedIn();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isLoggedIn();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AsyncComponent>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AsyncComponent>
                <AdminPanel />
              </AsyncComponent>
            </AdminRoute>
          } 
        />

        {/* Protected routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <PrivateRoute>
              <AsyncComponent>
                <MainApp />
              </AsyncComponent>
            </PrivateRoute>
          } 
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AsyncComponent>
  );
}

export default App;