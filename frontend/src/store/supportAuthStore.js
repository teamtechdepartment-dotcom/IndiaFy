/* eslint-disable no-unused-vars, no-empty */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

export const useSupportAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axiosInstance.post('/support-workspace/auth/login', {
            email,
            password,
          });
          const payload = res?.data || res;
          const token = payload?.token;
          const user = payload?.user;

          if (token && user) {
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            localStorage.setItem('supportAccessToken', token);
            return { success: true, user };
          }
          throw new Error('Invalid response structure from login');
        } catch (err) {
          const message =
            err?.response?.data?.message || err?.message || 'Login failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      setupPassword: async (token, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axiosInstance.post('/support-workspace/auth/setup-password', {
            token,
            password,
          });
          const payload = res?.data || res;
          const authToken = payload?.token;
          const user = payload?.user;

          if (authToken && user) {
            set({
              user,
              token: authToken,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            localStorage.setItem('supportAccessToken', authToken);
            return { success: true, user };
          }
          return { success: true };
        } catch (err) {
          const message =
            err?.response?.data?.message || err?.message || 'Password setup failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/support-workspace/auth/logout');
        } catch (_) {}
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        try {
          localStorage.removeItem('supportAccessToken');
          localStorage.removeItem('indiafy-support-auth-storage');
        } catch (_) {}
      },

      fetchMe: async () => {
        const state = get();
        if (!state.token && !state.isAuthenticated) return;
        try {
          const res = await axiosInstance.get('/support-workspace/auth/me');
          const userData = res?.data || res;
          if (userData?._id) {
            set({ user: userData, isAuthenticated: true });
          } else {
            get().logout();
          }
        } catch (err) {
          if (err?.response?.status === 401) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'indiafy-support-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
