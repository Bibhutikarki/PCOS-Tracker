import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/User Side/Login';
import { Register } from './pages/User Side/Register';
import { Dashboard } from './pages/User Side/Dashboard';
import { Cycle } from './pages/User Side/Cycle';
import { Symptoms } from './pages/User Side/Symptoms';
import { Nutrition } from './pages/User Side/Nutrition';
import { Workouts } from './pages/User Side/Workouts';
import { Insights } from './pages/User Side/Insights';
import { Analytics } from './pages/User Side/Analytics';
import { AdminDashboard } from './pages/Admin Side/AdminDashboard';
import { PatientDetail } from './pages/Admin Side/PatientDetail';
import { WorkoutManagement } from './pages/Admin Side/WorkoutManagement';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { PatientRoute } from './components/PatientRoute';
import { HomeRedirect } from './components/HomeRedirect';
import { AppLayout } from './layout/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<div className="p-8 text-center">Forgot Password Stub</div>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Patient ONLY Routes */}
            <Route element={<PatientRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cycle" element={<Cycle />} />
              <Route path="/symptoms" element={<Symptoms />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            {/* Admin ONLY Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/workouts" element={<WorkoutManagement />} />
              <Route path="/admin/patient/:id" element={<PatientDetail />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
