// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',             // Vite proxy → https://mazedakhale.in/api
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
