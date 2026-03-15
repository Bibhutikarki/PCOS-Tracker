import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Cycle } from './pages/Cycle';
import { Symptoms } from './pages/Symptoms';
import { Nutrition } from './pages/Nutrition';
import { Workouts } from './pages/Workouts';
import { Insights } from './pages/Insights';
import { Analytics } from './pages/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cycle" element={<Cycle />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
