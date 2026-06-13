import axios from "axios";
import { toast } from "react-hot-toast";

// Dynamic resolution of backend API URL
const getBaseURL = () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    // If running in production (not localhost) and no env var, fallback to Render backend
    if (!import.meta.env.VITE_API_URL && typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
        return "https://indiafy-1.onrender.com/api/v1/indiafy";
    }
    if (API_URL.endsWith('/api/v1/indiafy')) {
        return API_URL;
    }
    return `${API_URL}/api/v1/indiafy`;
};

// Base instance
const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Important for cookies (JWT)
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Fallback for mobile/cross-domain cookie issues: use Bearer token from localStorage
        try {
            const url = config.url || "";
            const isCustomerRoute = url.includes("/customer");
            const isAdminRoute = url.includes("/admin");
            
            let token = null;

            const getSellerToken = () => {
                const sellerStorage = localStorage.getItem('indiafy-seller-auth-storage');
                if (sellerStorage) {
                    const { state } = JSON.parse(sellerStorage);
                    return state?.token || null;
                }
                return null;
            };

            const getCustomerToken = () => {
                const authStorage = localStorage.getItem('indiafy-auth-storage');
                if (authStorage) {
                    const { state } = JSON.parse(authStorage);
                    return state?.token || null;
                }
                return null;
            };

            const getAdminToken = () => {
                const adminStorage = localStorage.getItem('indiafy-admin-auth-storage');
                if (adminStorage) {
                    const { state } = JSON.parse(adminStorage);
                    return state?.token || null;
                }
                return null;
            };

            if (isAdminRoute) {
                token = getAdminToken();
            } else if (isCustomerRoute) {
                token = getCustomerToken();
            } else {
                // Shared endpoint or seller endpoint: use seller token if present, otherwise fallback to customer
                const sellerToken = getSellerToken();
                if (sellerToken) {
                    token = sellerToken;
                } else {
                    token = getCustomerToken();
                }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (errStorage) {
            // console.warn("Storage error reading token:", errStorage);
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
        // Handle Network Errors (Offline, CORS, Timeout)
        if (error.message === 'Network Error' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            // Ensure error code is standardized to ERR_NETWORK for stores to catch
            error.code = "ERR_NETWORK";
            return Promise.reject(error);
        }

        if (error.response) {
            const status = error.response.status;

            // Handle 401 Unauthorized
            if (status === 401) {
                const originalRequest = error.config;
                
                // Determine context
                const isSellerReq = originalRequest.url.includes("/seller") || originalRequest.url.includes("/wholesale") || originalRequest.url.includes("/local");
                const isAdminReq = originalRequest.url.includes("/admin");

                // Check if user was previously authenticated
                let wasAuthenticated = false;
                try {
                    let storageKey = 'indiafy-auth-storage';
                    if (isSellerReq) storageKey = 'indiafy-seller-auth-storage';
                    if (isAdminReq) storageKey = 'indiafy-auth-storage';

                    const storageData = localStorage.getItem(storageKey);
                    if (storageData) {
                        const parsed = JSON.parse(storageData);
                        wasAuthenticated = !!parsed?.state?.isAuthenticated;
                    }
                } catch (e) {
                    wasAuthenticated = false;
                }

                // If not authenticated, do not attempt to refresh or redirect. Just reject.
                if (!wasAuthenticated) {
                    return Promise.reject(error);
                }

                const isAuthCall = originalRequest.url.includes('/login') || originalRequest.url.includes('/signup') || originalRequest.url.includes('/logout') || originalRequest.url.includes('/refresh');
                
                if (isAuthCall && !originalRequest.url.includes('/refresh')) return Promise.reject(error);

                if (originalRequest.url.includes('/refresh')) {
                    // Refresh token itself failed. Logout user by clearing all storages.
                    try {
                        localStorage.removeItem('indiafy-auth-storage');
                        localStorage.removeItem('indiafy-seller-auth-storage');
                        localStorage.removeItem('indiafy-admin-auth-storage');
                    } catch (e) {}

                    // Redirect only if the user is on a protected route
                    const currentPath = window.location.pathname;
                    const publicPrefixes = [
                        '/', '/login', '/signup', '/seller/login', '/seller/signup', '/admin/login',
                        '/about', '/wholesale', '/cart', '/checkout', '/payment', '/order-success', 
                        '/search', '/local-sellers', '/product/', '/category/', '/store/', '/blog', 
                        '/contact', '/privacy-policy', '/terms-and-conditions', '/refund-policy', 
                        '/seller-guidelines', '/community-standards', '/trust-safety', '/become-seller-info', 
                        '/help-center', '/faq', '/best-shopping-platform-gurugram', '/quick-commerce-gurugram', 
                        '/wholesale-suppliers-gurugram', '/verified-sellers-gurugram', '/hyperlocal-marketplace-gurugram',
                        '/stores', '/quick-commerce'
                    ];
                    const isPublicPath = currentPath === '/' || publicPrefixes.some(prefix => currentPath.startsWith(prefix) && (prefix !== '/' || currentPath === '/'));

                    if (!isPublicPath) {
                        if (isSellerReq) {
                            window.location.href = '/seller/login?expired=true';
                        } else if (isAdminReq) {
                            window.location.href = '/admin/login?expired=true';
                        } else {
                            window.location.href = '/login?expired=true';
                        }
                    }
                    return Promise.reject(error);
                }

                if (!originalRequest._retry) {
                    originalRequest._retry = true;

                    if (isRefreshing) {
                        return new Promise(function(resolve, reject) {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            return axiosInstance(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    isRefreshing = true;

                    const isSellerReq = originalRequest.url.includes("/seller") || originalRequest.url.includes("/wholesale") || originalRequest.url.includes("/local");
                    const isAdminReq = originalRequest.url.includes("/admin");
                    
                    let refreshUrl = '/customer/auth/refresh'; // default
                    let currentRefreshToken = null;
                    
                    if (isSellerReq) {
                        refreshUrl = '/seller/auth/refresh';
                        try {
                            const storage = localStorage.getItem('indiafy-seller-auth-storage');
                            if (storage) currentRefreshToken = JSON.parse(storage).state?.refreshToken;
                        } catch(e){}
                    } else if (isAdminReq) {
                        refreshUrl = '/admin/auth/refresh';
                        try {
                            const storage = localStorage.getItem('indiafy-admin-auth-storage');
                            if (storage) currentRefreshToken = JSON.parse(storage).state?.refreshToken;
                        } catch(e){}
                    } else {
                        try {
                            const storage = localStorage.getItem('indiafy-auth-storage');
                            if (storage) currentRefreshToken = JSON.parse(storage).state?.refreshToken;
                        } catch(e){}
                    }

                    return new Promise(function (resolve, reject) {
                        axiosInstance.post(refreshUrl, { refreshToken: currentRefreshToken }, { withCredentials: true })
                            .then(({ data }) => {
                                const newAccessToken = data?.accessToken;
                                const newRefreshToken = data?.refreshToken;
                                if (newAccessToken) {
                                    // Update local storage explicitly
                                    try {
                                        let storageKey = 'indiafy-auth-storage';
                                        if (isSellerReq) storageKey = 'indiafy-seller-auth-storage';
                                        if (isAdminReq) storageKey = 'indiafy-admin-auth-storage';
                                        
                                        const storageData = localStorage.getItem(storageKey);
                                        if (storageData) {
                                            const parsed = JSON.parse(storageData);
                                            if (parsed.state) {
                                                parsed.state.token = newAccessToken;
                                                if (newRefreshToken) parsed.state.refreshToken = newRefreshToken;
                                                localStorage.setItem(storageKey, JSON.stringify(parsed));
                                            }
                                        }
                                    } catch (e) {
                                        // Ignore storage parsing error
                                    }
                                    
                                    processQueue(null, newAccessToken);
                                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                                    resolve(axiosInstance(originalRequest));
                                } else {
                                    processQueue(new Error("No access token"));
                                    reject(error);
                                }
                            })
                            .catch((err) => {
                                processQueue(err, null);
                                reject(err);
                            })
                            .finally(() => {
                                isRefreshing = false;
                            });
                    });
                }
            }
            
            // Handle 403 Forbidden
            else if (status === 403) {
                const isProtectedRoute = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/seller') || window.location.pathname.startsWith('/seller-hub');
                if (isProtectedRoute && window.location.pathname !== '/403') {
                    window.location.href = '/403';
                }
            }
            
            // Handle 429 Too Many Requests
            else if (status === 429) {
                // We don't want to redirect, just show a warning toast
                // toast.error("Too many requests. Please slow down and try again later.", { id: 'rate-limit' });
            }
            
            // Handle 500 Internal Server Error
            else if (status >= 500) {
                if (window.location.pathname !== '/500') {
                    window.location.href = '/500';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
