import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token if it exists
api.interceptors.request.use((config) => {
    try {
        const authData = localStorage.getItem('pcos_tracker_auth');
        if (authData) {
            const data = JSON.parse(authData);
            if (data && data.token) {
                config.headers.Authorization = `Bearer ${data.token}`;
            }
        }
    } catch (error) {
        console.error('Interceptor error:', error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
