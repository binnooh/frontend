import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Screen1_SelectSchool from './pages/Screen1_SelectSchool';
import Screen2_ChooseLogin from './pages/Screen2_ChooseLogin';
import Screen3_ParentLogin from './pages/Screen3_ParentLogin';
import Screen3_DriverLogin from './pages/Screen3_DriverLogin';
import Screen4_ParentDashboard from './pages/Screen4_ParentDashboard';
import Screen4_DriverDashboard from './pages/Screen4_DriverDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/select-school" replace />} />
          <Route path="/select-school" element={<Screen1_SelectSchool />} />
          <Route path="/choose-login" element={<Screen2_ChooseLogin />} />
          <Route path="/parent-login" element={<Screen3_ParentLogin />} />
          <Route path="/driver-login" element={<Screen3_DriverLogin />} />

          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute role="parent">
                <Screen4_ParentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute role="driver">
                <Screen4_DriverDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
