import axios from "axios";

// Dynamic resolution of backend API URL
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // If running in production (not localhost), dynamically target the current host's backend
    if (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
        return `${window.location.origin}/api/v1/indiafy`;
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
            const authStorage = localStorage.getItem('indiafy-auth-storage');
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                if (state.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
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
            
            // 1. Don't redirect for 'me' calls (handled by authStore)
            const isMeCall = error.config.url.includes('/auth/me');
            if (isMeCall) return Promise.reject(error);

            // 2. Only redirect if NOT on a public page
            const publicPaths = ['/', '/about', '/product/', '/category/', '/search', '/store/', '/cart'];
            const currentPath = window.location.pathname;
            const isPublicPage = publicPaths.some(path => 
                path === '/' ? currentPath === '/' : currentPath.startsWith(path)
            );

            if (!isPublicPage) {
                // Clear any pending purchase if session expired during checkout
                // localStorage.removeItem("pending_purchase");
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
