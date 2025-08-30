import axios from 'axios';

// Create base axios instance
const baseConfig = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

// Public API instance (no authentication required)
const publicApi = axios.create(baseConfig);

// Secured API instance (requires authentication)
const securedApi = axios.create(baseConfig);

// Utility function to check if token is expired
const isTokenExpired = (token) => {
    try {
        // Decode JWT payload (base64)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000; // Convert to seconds

        // Check if token has expired
        return payload.exp < currentTime;
    } catch (error) {
        // If token is malformed or can't be decoded, consider it expired
        console.error('Error decoding token:', error);
        return true;
    }
};

// Function to clear auth data and trigger logout
const clearAuthAndLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Dispatch logout event for auth context to pick up
    window.dispatchEvent(new CustomEvent('logout'));

    // Only redirect if not already on login/signup page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
    }
};

// Request interceptor for secured API (adds auth token and checks expiration)
securedApi.interceptors.request.use(
    (config) => {
        // Get auth token
        const token = localStorage.getItem('authToken');

        if (!token) {
            // No token found
            return Promise.reject(new Error('No authentication token found'));
        }

        // Check if token is expired before making the request
        if (isTokenExpired(token)) {
            // Token has expired, clear auth data and reject request
            clearAuthAndLogout();
            return Promise.reject(new Error('Token has expired'));
        }

        // Token is valid, add to headers
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for both APIs (handle errors globally)
const responseInterceptor = (response) => response;

const errorInterceptor = (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
        // Token expired or invalid - clear storage and redirect
        clearAuthAndLogout();
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
    }

    return Promise.reject(error);
};

// Apply response interceptors to both instances
publicApi.interceptors.response.use(responseInterceptor, errorInterceptor);
securedApi.interceptors.response.use(responseInterceptor, errorInterceptor);



// Default export for backward compatibility
export default publicApi;

// Named exports for specific use cases
export { publicApi, securedApi, isTokenExpired };