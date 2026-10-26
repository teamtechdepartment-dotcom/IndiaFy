/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import axios from "axios";


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
            const isAdminRoute = url.includes("/admin");
            const isCustomerRoute = !isAdminRoute && url.includes("/customer");
            const isSupportRoute = !isAdminRoute && (url.includes("/support-workspace") || url.includes("/support"));
            const isSellerRoute = !isAdminRoute && !isCustomerRoute && !isSupportRoute && (
                url.includes("/seller") || 
                url.includes("/wholesale") || 
                url.includes("/local") || 
                url.includes("/products") || 
                url.includes("/orders")
            );
            
            let token = null;

            const getSellerToken = () => {
                const sellerStorage = localStorage.getItem('indiafy-seller-auth-storage');
                if (sellerStorage) {
                    try {
                        const { state } = JSON.parse(sellerStorage);
                        if (state?.token) return state.token;
                    } catch (_) {}
                }
                return localStorage.getItem('sellerAccessToken') || null;
            };

            const getCustomerToken = () => {
                const authStorage = localStorage.getItem('indiafy-auth-storage');
                if (authStorage) {
                    try {
                        const { state } = JSON.parse(authStorage);
                        if (state?.token) return state.token;
                    } catch (_) {}
                }
                return localStorage.getItem('customerAccessToken') || null;
            };

            const getAdminToken = () => {
                const adminStorage = localStorage.getItem('indiafy-admin-auth-storage');
                if (adminStorage) {
                    try {
                        const { state } = JSON.parse(adminStorage);
                        if (state?.token) return state.token;
                    } catch (_) {}
                }
                return localStorage.getItem('adminAccessToken') || null;
            };

            const getSupportToken = () => {
                const supportStorage = localStorage.getItem('indiafy-support-auth-storage');
                if (supportStorage) {
                    try {
                        const { state } = JSON.parse(supportStorage);
                        if (state?.token) return state.token;
                    } catch (_) {}
                }
                return localStorage.getItem('supportAccessToken') || null;
            };

            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const isSupportContext = currentPath.startsWith('/support-workspace') || url.includes('/support-workspace');
            const isAdminContext = currentPath.startsWith('/admin') || url.includes('/admin');
            const isSellerContext = currentPath.startsWith('/seller') || currentPath === '/seller-hub';

            if (!config.headers?.Authorization) {
                if (isAdminRoute || (isAdminContext && getAdminToken())) {
                    token = getAdminToken();
                } else if (isCustomerRoute) {
                    token = getCustomerToken();
                } else if (isSellerRoute || isSellerContext) {
                    token = getSellerToken() || getCustomerToken();
                } else if (isSupportRoute) {
                    if (isSellerContext) token = getSellerToken();
                    else token = (isAdminContext && getAdminToken()) ? getAdminToken() : (getSupportToken() || getAdminToken());
                } else if (isSupportContext && (getSupportToken() || getAdminToken())) {
                    token = getSupportToken() || getAdminToken();
                } else {
                    // Shared endpoint or fallback
                    token = getCustomerToken() || getSellerToken() || getAdminToken();
                }

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            // Inject location headers if available
            const locationStorage = localStorage.getItem('indiafy-location-storage');
            if (locationStorage) {
                const { state } = JSON.parse(locationStorage);
                if (state && state.latitude && state.longitude) {
                    config.headers['x-user-lat'] = state.latitude.toString();
                    config.headers['x-user-lng'] = state.longitude.toString();
                }
            }

            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }

        } catch (_errStorage) {
            // ignore storage read errors
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
                
                // Determine context helper
                const currentWindowPath = typeof window !== "undefined" ? window.location.pathname : "";
                const isSupportContext = currentWindowPath.startsWith("/support-workspace");
                const isAdminContext = currentWindowPath.startsWith("/admin");
                const isSellerContext = currentWindowPath.startsWith("/seller") || currentWindowPath === "/seller-hub";

                const reqUrl = originalRequest.url || "";
                const isAdminUrl = reqUrl.includes("/admin");
                const isCustomerUrl = !isAdminUrl && reqUrl.includes("/customer");
                const isSupportUrl = !isAdminUrl && (reqUrl.includes("/support-workspace") || reqUrl.includes("/support"));
                const isSellerUrl = !isAdminUrl && !isCustomerUrl && !isSupportUrl && (
                    reqUrl.includes("/seller") || 
                    reqUrl.includes("/wholesale") || 
                    reqUrl.includes("/local") || 
                    reqUrl.includes("/products") || 
                    reqUrl.includes("/orders")
                );

                let isAdminReq = isAdminUrl || (!isCustomerUrl && !isSellerUrl && !isSupportUrl && isAdminContext);
                let isSellerReq = !isAdminReq && (isSellerUrl || (!isCustomerUrl && !isSupportUrl && isSellerContext));
                let isSupportReq = !isAdminReq && (isSupportUrl || (!isCustomerUrl && !isSellerUrl && isSupportContext));
                let isCustomerReq = !isAdminReq && !isSellerReq && !isSupportReq;

                // Check if user was previously authenticated
                let wasAuthenticated = false;
                try {
                    let storageKey = 'indiafy-auth-storage';
                    if (isAdminReq) storageKey = 'indiafy-admin-auth-storage';
                    else if (isSellerReq) storageKey = 'indiafy-seller-auth-storage';

                    const storageData = localStorage.getItem(storageKey);
                    if (storageData) {
                        const parsed = JSON.parse(storageData);
                        wasAuthenticated = !!parsed?.state?.isAuthenticated;
                    }
                    if (!wasAuthenticated && isAdminReq) {
                        wasAuthenticated = !!localStorage.getItem('adminAccessToken');
                    }
                } catch (_e) {
                    wasAuthenticated = false;
                }

                // If not authenticated, do not attempt to refresh or redirect. Just reject.
                if (!wasAuthenticated) {
                    return Promise.reject(error);
                }

                const isAuthCall = originalRequest.url.includes('/login') || originalRequest.url.includes('/signup') || originalRequest.url.includes('/logout') || originalRequest.url.includes('/refresh');
                
                if (isAuthCall && !originalRequest.url.includes('/refresh')) return Promise.reject(error);

                if (originalRequest.url.includes('/refresh')) {
                    // Refresh token itself failed. Clear corresponding storage.
                    try {
                        if (isAdminReq) {
                            localStorage.removeItem('indiafy-admin-auth-storage');
                            localStorage.removeItem('adminAccessToken');
                            localStorage.removeItem('adminRefreshToken');
                        } else if (isSellerReq) {
                            localStorage.removeItem('indiafy-seller-auth-storage');
                            localStorage.removeItem('sellerAccessToken');
                            localStorage.removeItem('sellerRefreshToken');
                        } else {
                            localStorage.removeItem('indiafy-auth-storage');
                            localStorage.removeItem('customerAccessToken');
                            localStorage.removeItem('customerRefreshToken');
                        }
                    } catch (_e) { /* ignore */ }

                    // Redirect only if the user is on a protected route
                    const currentPath = window.location.pathname;
                    const currentSearch = window.location.search;
                    const publicPrefixes = [
                        '/', '/login', '/signup', '/seller/login', '/seller/signup', '/admin/login',
                        '/about', '/wholesale', '/cart', '/order-success', 
                        '/search', '/local-sellers', '/product/', '/category/', '/store/', '/blog', 
                        '/contact', '/privacy-policy', '/terms-and-conditions', '/refund-policy', 
                        '/seller-guidelines', '/community-standards', '/trust-safety', '/become-seller-info', 
                        '/faq', '/best-shopping-platform-gurugram', '/quick-commerce-gurugram', 
                        '/wholesale-suppliers-gurugram', '/verified-sellers-gurugram', '/hyperlocal-marketplace-gurugram',
                        '/stores', '/quick-commerce'
                    ];
                    // /checkout and /payment are protected — NOT in publicPrefixes
                    const isPublicPath = currentPath === '/' || publicPrefixes.some(prefix => currentPath.startsWith(prefix) && (prefix !== '/' || currentPath === '/'));

                    if (!isPublicPath) {
                        const returnParam = encodeURIComponent(currentPath + currentSearch);
                        if (isAdminReq) {
                            window.location.href = '/admin/login?expired=true';
                        } else if (isSellerReq) {
                            window.location.href = '/seller/login?expired=true';
                        } else {
                            window.location.href = `/login?expired=true&redirect=${returnParam}`;
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

                    let refreshUrl = '/customer/auth/refresh'; // default
                    let currentRefreshToken = null;
                    
                    if (isAdminReq) {
                        refreshUrl = '/admin/auth/refresh';
                        try {
                            const storage = localStorage.getItem('indiafy-admin-auth-storage');
                            if (storage) currentRefreshToken = JSON.parse(storage).state?.refreshToken;
                        } catch(_e){ /* ignore */ }
                        if (!currentRefreshToken) currentRefreshToken = localStorage.getItem('adminRefreshToken');
                    } else if (isSellerReq) {
                        refreshUrl = '/seller/auth/refresh';
                        try {
                            const storage = localStorage.getItem('indiafy-seller-auth-storage');
                            if (storage) currentRefreshToken = JSON.parse(storage).state?.refreshToken;
                        } catch(_e){ /* ignore */ }
                        if (!currentRefreshToken) currentRefreshToken = localStorage.getItem('sellerRefreshToken');
                    } else {
                        try {
                            const storage = localStorage.getItem('indiafy-auth-storage');
                            if (storage) currentRefreshToken = JSON.parse(storage).state?.refreshToken;
                        } catch(_e){ /* ignore */ }
                        if (!currentRefreshToken) currentRefreshToken = localStorage.getItem('customerRefreshToken');
                    }

                    return new Promise(function (resolve, reject) {
                        axiosInstance.post(refreshUrl, { refreshToken: currentRefreshToken }, { withCredentials: true })
                            .then((resData) => {
                                const payload = resData?.data || resData;
                                const newAccessToken = payload?.accessToken || resData?.accessToken;
                                const newRefreshToken = payload?.refreshToken || resData?.refreshToken;
                                if (newAccessToken) {
                                    // Update local storage explicitly
                                    try {
                                        let storageKey = 'indiafy-auth-storage';
                                        if (isAdminReq) storageKey = 'indiafy-admin-auth-storage';
                                        else if (isSellerReq) storageKey = 'indiafy-seller-auth-storage';
                                        
                                        const storageData = localStorage.getItem(storageKey);
                                        if (storageData) {
                                            const parsed = JSON.parse(storageData);
                                            if (parsed.state) {
                                                parsed.state.token = newAccessToken;
                                                if (newRefreshToken) parsed.state.refreshToken = newRefreshToken;
                                                parsed.state.isAuthenticated = true;
                                                parsed.state.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
                                                localStorage.setItem(storageKey, JSON.stringify(parsed));
                                            }
                                        }
                                    } catch (_e) {
                                        // Ignore storage parsing error
                                    }
                                    
                                    if (isAdminReq) {
                                        localStorage.setItem('adminAccessToken', newAccessToken);
                                        if (newRefreshToken) localStorage.setItem('adminRefreshToken', newRefreshToken);
                                        try {
                                            if (typeof window !== 'undefined' && window.__adminAuthStore) {
                                                window.__adminAuthStore.getState().login(
                                                    window.__adminAuthStore.getState().user,
                                                    newAccessToken,
                                                    newRefreshToken
                                                );
                                            }
                                        } catch (_) {}
                                    } else if (isSellerReq) {
                                        localStorage.setItem('sellerAccessToken', newAccessToken);
                                        if (newRefreshToken) localStorage.setItem('sellerRefreshToken', newRefreshToken);
                                        try {
                                            if (typeof window !== 'undefined' && window.__sellerAuthStore) {
                                                window.__sellerAuthStore.getState().login(
                                                    window.__sellerAuthStore.getState().user,
                                                    newAccessToken,
                                                    newRefreshToken
                                                );
                                            }
                                        } catch (_) {}
                                    }

                                    processQueue(null, newAccessToken);
                                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                                    resolve(axiosInstance(originalRequest));
                                } else {
                                    processQueue(new Error("No access token returned"));
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
                // Let the error propagate to caller try/catch so components can display inline error toast without destroying the view
                console.warn("[axiosInstance] 403 Forbidden on:", error.config?.url);
            }
            
            // Handle 429 Too Many Requests
            else if (status === 429) {
                // We don't want to redirect, just show a warning toast
                // toast.error("Too many requests. Please slow down and try again later.", { id: 'rate-limit' });
            }
            
            // Handle 500 Internal Server Error
            // Skip the redirect for auth routes so signup/login forms are not destroyed
            else if (status >= 500) {
                const isAuthRoute =
                    error.config?.url?.includes('/signup') ||
                    error.config?.url?.includes('/login') ||
                    error.config?.url?.includes('/auth/otp') ||
                    error.config?.url?.includes('/forget-password');
                const isCheckoutRoute =
                    error.config?.url?.includes('/orders') ||
                    error.config?.url?.includes('/payments') ||
                    error.config?.url?.includes('/checkout');
                const isSellerRoute =
                    error.config?.url?.includes('/seller') ||
                    error.config?.url?.includes('/applications') ||
                    error.config?.url?.includes('/products') ||
                    window.location.pathname.includes('/seller') ||
                    window.location.pathname === '/seller-hub';
                if (!isAuthRoute && !isCheckoutRoute && !isSellerRoute && window.location.pathname !== '/500') {
                    window.location.href = '/500';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
