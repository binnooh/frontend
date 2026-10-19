import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'parent' | 'driver';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/choose-login" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to="/choose-login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'parent' ? '/parent-dashboard' : '/driver-dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
