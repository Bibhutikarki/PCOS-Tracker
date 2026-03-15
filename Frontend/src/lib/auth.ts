import axios from 'axios';
import { User } from './types';

const API_URL = 'http://localhost:5001/api/auth';
const STORAGE_KEY = 'pcos_tracker_auth';

export const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use((config) => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const { token } = JSON.parse(data);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const authStore = {
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                isAuthenticated: true,
                token: response.data.token
                // Note: User details might need to be decoded from token or fetched separately if not returned
            }));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
    },
    getAuth: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { isAuthenticated: false, token: null };
    },
    isAuthenticated: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data).isAuthenticated : false;
    }
};
