import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // { _id, email, firstName, lastName, role, etc. }
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isBackendAvailable: true,
      expiresAt: null,

      login: (userData, token, refreshToken) => set({
        user: {
          ...userData,
          role: userData?.role?.toUpperCase() || 'ADMIN'
        },
        token: token,
        refreshToken: refreshToken || userData?.refreshToken,
        isAuthenticated: true,
        isBackendAvailable: true,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days expiration
      }),

      clearSession: () => set({ 
        user: null, 
        token: null, 
        refreshToken: null,
        isAuthenticated: false,
        expiresAt: null 
      }),

      logout: async () => {
        try {
          await axiosInstance.post('/admin/auth/logout');
        } catch (_err) {
          console.error("Admin logout failed on backend:", _err);
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          expiresAt: null
        });
        try {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('indiafy-admin-auth-storage');
          sessionStorage.clear();
        } catch (storageErr) {
          console.error("Storage cleanup failed:", storageErr);
        }
      },

      fetchMe: async (retries = 2) => {
        const state = get();
        if (state.expiresAt && Date.now() > state.expiresAt) {
          state.clearSession();
          return;
        }

        try {
          const res = await axiosInstance.get('/admin/auth/me');
          const userData = res.data || res;
          if (userData?._id) {
            set({
              user: {
                ...userData,
                role: userData?.role?.toUpperCase() || 'ADMIN'
              },
              isAuthenticated: true,
              isBackendAvailable: true
            });
          } else {
            set({ user: null, isAuthenticated: false, isBackendAvailable: true });
          }
        } catch (_err) {
          if ((_err).code === "ERR_NETWORK") {
            if (retries > 0) {
              console.log(`Retrying admin fetchMe... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return get().fetchMe(retries - 1);
            }
            set({ user: null, isAuthenticated: false, isBackendAvailable: false });
            return;
          }
          
          if (_err?.response?.status === 401 || _err?.response?.status === 404) {
            get().clearSession();
            set({ isBackendAvailable: true });
            return;
          }

          throw _err;
        }
      }
    }),
    {
      name: 'indiafy-admin-auth-storage',
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
