import { User } from './types';

const STORAGE_KEY = 'pcos_tracker_auth';

export const authStore = {
    login: (user: User, token: string) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user, token }));
    },
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        // remove old/extra keys if they exist
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.clear();

        setTimeout(() => {
            window.dispatchEvent(new Event('authChange'));
        }, 0);
    },
    getAuth: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { isAuthenticated: false, user: null, token: null };
    },
    isAuthenticated: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data).isAuthenticated : false;
    },
    updateUser: (updatedUser: Partial<User>) => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...parsed,
                user: { ...parsed.user, ...updatedUser }
            }));
            // Dispatch a custom event so other components can react if necessary
            window.dispatchEvent(new Event('authChange'));
        }
    }
};
