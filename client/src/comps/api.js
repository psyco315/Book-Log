import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor (for adding auth tokens, etc.)
// api.interceptors.request.use(
//     (config) => {
//         // Add auth token if exists
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Response interceptor (for handling errors globally)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Redirect to login or refresh token
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;