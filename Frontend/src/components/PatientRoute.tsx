import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../lib/auth';

export const PatientRoute = () => {
    const { isAuthenticated, user } = authStore.getAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role === 'admin') {
        // Admins should not access patient pages
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};
