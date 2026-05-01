import axios from "axios";

// Base instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1/indiafy",
    withCredentials: true, // Important for cookies (JWT)
    headers: {
        "Content-Type": "application/json",
    }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You can attach tokens from localStorage here if needed,
        // but since withCredentials is true, httpOnly cookies will be sent automatically.
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Backend already wraps response in ApiResponse/ApiError
        // Just return the full response data
        return response.data;
    },
    (error) => {
        // Handle global error responses, like 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized! Session expired.");
            // Clear auth and redirect if needed
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
