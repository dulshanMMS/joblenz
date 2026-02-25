import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If token is expired or invalid, clear storage and redirect to login
// Skip redirect for auth routes — let the page handle those errors itself
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url: string = error.config?.url ?? '';
        const isAuthRoute = url.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
