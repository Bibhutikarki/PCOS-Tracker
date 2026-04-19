import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../lib/auth';
import { OnboardingModal } from './OnboardingModal';

export const PatientRoute = () => {
    const [authData, setAuthData] = useState(authStore.getAuth());
    
    useEffect(() => {
        const handleAuthChange = () => {
            setAuthData(authStore.getAuth());
        };
        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const { isAuthenticated, user } = authData;
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.role === 'admin') {
        // Admins should not access patient pages
        return <Navigate to="/admin" replace />;
    }

    const needsOnboarding = user && (!user.weight || !user.height);

    return (
        <>
            <Outlet />
            {needsOnboarding && <OnboardingModal onComplete={() => window.dispatchEvent(new Event('authChange'))} />}
        </>
    );
};
