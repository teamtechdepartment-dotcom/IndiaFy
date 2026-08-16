import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

export const useRecommendationStore = create((set, get) => ({
    recommendations: [],
    loading: false,
    error: null,
    context: null,
    
    // Internal state for request control (not UI mutable)
    _abortController: null,
    _lastRequestKey: null,
    _lastRequestTime: null,

    getRecommendations: async (searchQuery = '', limit = 20) => {
        // Construct cache key representing current context
        const locationStr = localStorage.getItem('indiafy-location-storage') || '';
        const authStr = localStorage.getItem('indiafy-auth-storage') || '';
        let lat = '', lng = '', token = '';
        try {
            const locState = JSON.parse(locationStr)?.state || {};
            lat = locState.latitude || '';
            lng = locState.longitude || '';
            token = JSON.parse(authStr)?.state?.token || '';
        } catch (e) {
            // ignore parse errors
        }
        
        const currentKey = `${searchQuery}-${limit}-${lat}-${lng}-${!!token}`;
        const now = Date.now();
        
        // Suppress duplicate identical requests within 5 minutes (unless empty)
        const { _lastRequestKey, _lastRequestTime, recommendations } = get();
        if (_lastRequestKey === currentKey && _lastRequestTime && (now - _lastRequestTime < 5 * 60 * 1000) && recommendations.length > 0) {
            return; // Skip duplicate fetch
        }

        // Cancel previous request if exists
        const currentAbortController = get()._abortController;
        if (currentAbortController) {
            currentAbortController.abort();
        }

        const newAbortController = new AbortController();
        set({ 
            loading: true, 
            error: null, 
            _abortController: newAbortController,
            _lastRequestKey: currentKey,
            _lastRequestTime: now
        });

        try {
            const response = await axiosInstance.get('/product/recommendations', {
                params: {
                    searchQuery: searchQuery || undefined,
                    limit
                },
                signal: newAbortController.signal
            });

            // Prevent race conditions: only update state if this is STILL the active controller
            if (get()._abortController !== newAbortController) return;

            if (response && response.success) {
                set({
                    recommendations: response.data || [],
                    context: response.context || null,
                    loading: false,
                    error: null
                });
            } else {
                set({ loading: false, error: 'Failed to fetch recommendations' });
            }
        } catch (error) {
            if (get()._abortController !== newAbortController) return;
            // Ignore abort errors
            if (error.name === 'CanceledError' || error.message === 'canceled') return;
            set({ loading: false, error: error.message || 'An error occurred' });
        } finally {
            // Clear abort controller if it's still the same one
            if (get()._abortController === newAbortController) {
                set({ _abortController: null });
            }
        }
    },

    clearRecommendations: () => {
        const currentAbortController = get()._abortController;
        if (currentAbortController) {
            currentAbortController.abort();
        }
        set({ recommendations: [], context: null, error: null, loading: false, _abortController: null, _lastRequestKey: null });
    }
}));
