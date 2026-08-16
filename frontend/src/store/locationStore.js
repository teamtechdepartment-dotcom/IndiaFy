import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
    persist(
        (set, get) => ({
            latitude: null,
            longitude: null,
            permissionState: 'prompt', // 'granted', 'denied', 'prompt'
            lastUpdated: null,

            setLocation: (lat, lng) => set({
                latitude: lat,
                longitude: lng,
                lastUpdated: Date.now(),
                permissionState: 'granted'
            }),

            setPermissionState: (state) => set({ permissionState: state }),

            requestLocation: () => {
                if (!navigator.geolocation) {
                    set({ permissionState: 'denied' });
                    return;
                }
                
                // Only request if we haven't recently requested (e.g. cache for 1 hour)
                const now = Date.now();
                const { lastUpdated, permissionState } = get();
                
                if (permissionState === 'denied') return;
                
                if (lastUpdated && (now - lastUpdated < 60 * 60 * 1000) && permissionState === 'granted') {
                    return; // Use cached
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        set({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            lastUpdated: Date.now(),
                            permissionState: 'granted'
                        });
                    },
                    (error) => {
                        console.warn('Geolocation error:', error.message);
                        set({ permissionState: 'denied' });
                    },
                    {
                        enableHighAccuracy: false, // Save battery, approximate is fine for 5km
                        timeout: 5000,
                        maximumAge: 60 * 60 * 1000
                    }
                );
            }
        }),
        {
            name: 'indiafy-location-storage',
            getStorage: () => localStorage,
        }
    )
);
