import axios from "axios";

// Dynamic resolution of backend API URL
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // If running in production (not localhost), fallback to your Render production backend
    if (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
        return "https://indiafy-1.onrender.com/api/v1/indiafy";
    }
    // Fallback for local development
    return "http://localhost:8000/api/v1/indiafy";
};

// Base instance
const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Important for cookies (JWT)
    headers: {
        "Content-Type": "application/json",
    }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Fallback for mobile/cross-domain cookie issues: use Bearer token from localStorage
        try {
            // 1. Try customer auth storage
            let token = null;
            const authStorage = localStorage.getItem('indiafy-auth-storage');
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                if (state.token) token = state.token;
            }

            // 2. Fallback to seller auth storage if not found
            if (!token) {
                const sellerStorage = localStorage.getItem('indiafy-seller-auth-storage');
                if (sellerStorage) {
                    const { state } = JSON.parse(sellerStorage);
                    if (state.token) token = state.token;
                }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (err) {
            // Silently fail if storage is corrupted or missing
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle global error responses, like 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized! Session expired.");
            
            // 1. Don't redirect for auth/me calls (handled by authStore)
            const isMeCall = error.config.url.includes('/auth/me');
            if (isMeCall) return Promise.reject(error);

            // 2. Only redirect if NOT on a public or auth page
            const publicPaths = [
                '/', '/about', '/product/', '/category/', '/search',
                '/store/', '/cart', '/login', '/signup',
                '/seller-auth', '/admin/login',
            ];
            const currentPath = window.location.pathname;
            const isPublicPage = publicPaths.some(path =>
                path === '/' ? currentPath === '/' : currentPath.startsWith(path)
            );

            if (!isPublicPage) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
