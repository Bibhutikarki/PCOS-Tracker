import { User } from './types';

const STORAGE_KEY = 'pcos_tracker_auth';

export const authStore = {
    login: (user: User, token: string) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user, token }));
    },
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
    },
    getAuth: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { isAuthenticated: false, user: null, token: null };
    },
    isAuthenticated: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data).isAuthenticated : false;
    }
};
