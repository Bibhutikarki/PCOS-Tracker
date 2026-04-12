import { Navigate } from 'react-router-dom';
import { authStore } from '../lib/auth';

export const HomeRedirect = () => {
    const { isAuthenticated, user } = authStore.getAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
};
