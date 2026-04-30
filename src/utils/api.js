import axios from 'axios';

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const api = axios.create({
    baseURL: apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`, // Use /api to match the explicit namespace backend uses
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('canteen_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
