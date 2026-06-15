import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useSellerAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isBackendAvailable: true,
      expiresAt: null,

      /**
       * Called after a successful login.
       * userData: the seller object from the API
       * token: optional JWT (used as Bearer fallback for mobile)
       */
      login: (userData, token, refreshToken) => {
        if (!userData) return;
        set({
          user: {
            ...userData,
            role: userData?.role?.toLowerCase() || 'seller',
          },
          token: token || null,
          refreshToken: refreshToken || userData?.refreshToken || null,
          isAuthenticated: true,
          isBackendAvailable: true,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      },

      clearSession: () => set({ 
        user: null, 
        token: null, 
        refreshToken: null,
        isAuthenticated: false, 
        expiresAt: null 
      }),

      logout: async () => {
        try {
          await axiosInstance.post('/seller/auth/logout');
        } catch (_err) {
          console.error('Seller logout failed on backend:', _err);
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, expiresAt: null });
      },

      /**
       * Validates the current session on app startup.
       * axiosInstance returns response.data directly
       * Backend ApiResponse shape:
       * { statusCode: 200, data: { _id, email, role, ...sellerFields }, message, success }
       * So res = { statusCode, data: sellerObject, message, success }
       */
      fetchMe: async (role, retries = 2) => {
        const state = get();
        if (state.expiresAt && Date.now() > state.expiresAt) {
          state.clearSession();
          return;
        }

        try {
          // axiosInstance returns response.data directly
          // Backend ApiResponse shape:
          // { statusCode: 200, data: { _id, email, role, ...sellerFields }, message, success }
          // So res = { statusCode, data: sellerObject, message, success }
          const res = await axiosInstance.get(`/${role.toLowerCase()}/auth/me`);

          // The seller object is in res.data
          const userData = res?.data;

          if (userData?._id) {
            set({
              user: {
                ...userData,
                role: userData?.role?.toLowerCase() || 'seller',
              },
              isAuthenticated: true,
              isBackendAvailable: true,
            });
          } else {
            // Response came back but no valid user object — clear auth
            set({ user: null, isAuthenticated: false, isBackendAvailable: true });
          }
        } catch (_err) {
          if ((_err).code === "ERR_NETWORK") {
            if (retries > 0) {
              console.log(`Retrying seller fetchMe... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return get().fetchMe(role, retries - 1);
            }
            set({ user: null, isAuthenticated: false, isBackendAvailable: false });
            return;
          }
          
          if (_err?.response?.status === 401) {
            get().clearSession();
            set({ isBackendAvailable: true });
            return;
          }

          throw _err;
        }
      },
    }),
    {
      name: 'indiafy-seller-auth-storage',
      // Only persist critical auth fields — avoids stale isAuthenticated=true
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isBackendAvailable: state.isBackendAvailable,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
