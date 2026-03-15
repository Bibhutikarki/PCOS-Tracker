import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../lib/auth';

export const ProtectedRoute = () => {
    const isAuthenticated = authStore.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
