import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../lib/auth';

export const AdminRoute = () => {
    const { isAuthenticated, user } = authStore.getAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    // Patients should not access admin pages
    return <Navigate to="/dashboard" replace />;
};
