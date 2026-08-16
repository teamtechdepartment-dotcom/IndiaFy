import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid';

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 10000; // 10 seconds

export const useInteractionStore = create(
    persist(
        (set, get) => ({
            anonymousId: null,
            sessionId: null,
            buffer: [],
            lastFlushed: Date.now(),
            
            // For simple client-side deduplication
            // e.g., don't track VIEW for the same product twice in 5 minutes
            recentEvents: {},

            initSession: () => {
                const { anonymousId } = get();
                if (!anonymousId) {
                    set({ anonymousId: uuidv4() });
                }

                // sessionId is bound to the browser tab session
                let currentSessionId = sessionStorage.getItem('indiafy-session-id');
                if (!currentSessionId) {
                    currentSessionId = uuidv4();
                    sessionStorage.setItem('indiafy-session-id', currentSessionId);
                }
                set({ sessionId: currentSessionId });
            },

            trackInteraction: (event) => {
                const { sessionId, buffer, recentEvents } = get();
                if (!sessionId) return; // Wait for init

                const now = Date.now();
                let normSearch = 'none';
                if (event.searchQuery) {
                    normSearch = event.searchQuery.trim().toLowerCase().replace(/\s+/g, ' ');
                    if (normSearch === '') normSearch = 'none';
                }
                
                const eventSignature = `${event.action}_${event.productId || 'none'}_${event.categoryName || 'none'}_${normSearch}`;

                // Deduplication logic (5 minute cooldown for the exact same event signature)
                if (recentEvents[eventSignature]) {
                    if (now - recentEvents[eventSignature] < 5 * 60 * 1000) {
                        return; // Ignore duplicate
                    }
                }

                const newEvent = {
                    ...event,
                    timestamp: new Date().toISOString()
                };

                const newBuffer = [...buffer, newEvent];
                
                // Keep recent events small (max 50)
                const newRecent = { ...recentEvents, [eventSignature]: now };
                const recentKeys = Object.keys(newRecent);
                if (recentKeys.length > 50) {
                    // Remove oldest
                    let oldestKey = recentKeys[0];
                    let oldestTime = newRecent[oldestKey];
                    for (const k of recentKeys) {
                        if (newRecent[k] < oldestTime) {
                            oldestTime = newRecent[k];
                            oldestKey = k;
                        }
                    }
                    delete newRecent[oldestKey];
                }

                set({ buffer: newBuffer, recentEvents: newRecent });

                if (newBuffer.length >= BATCH_SIZE) {
                    get().flush();
                }
            },

            flush: async () => {
                const { buffer, sessionId, anonymousId } = get();
                if (buffer.length === 0) return;

                // Take snapshot and clear immediately to avoid double sending
                const eventsToSend = [...buffer];
                set({ buffer: [], lastFlushed: Date.now() });

                try {
                    // Non-blocking fire and forget
                    axiosInstance.post('/interactions/batch', {
                        sessionId,
                        anonymousId,
                        events: eventsToSend
                    }).catch(err => {
                        // Restore buffer on network error, up to max capacity
                        const currentBuffer = get().buffer;
                        if (currentBuffer.length < 50) {
                            set({ buffer: [...eventsToSend, ...currentBuffer] });
                        }
                    });
                } catch (e) {
                    // Ignore sync errors
                }
            },
            
            // Interval flush check
            checkFlushInterval: () => {
                const { buffer, lastFlushed } = get();
                if (buffer.length > 0 && Date.now() - lastFlushed > FLUSH_INTERVAL_MS) {
                    get().flush();
                }
            }
        }),
        {
            name: 'indiafy-interaction-storage',
            getStorage: () => localStorage,
            partialize: (state) => ({ 
                anonymousId: state.anonymousId,
                // Do not persist sessionId in localStorage. It's managed via sessionStorage.
                // Do not persist buffer to avoid stale data.
            })
        }
    )
);

// Setup background interval flusher
if (typeof window !== 'undefined') {
    setInterval(() => {
        useInteractionStore.getState().checkFlushInterval();
    }, 5000);
    
    // Attempt to flush on visibility change/unload
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'hidden') {
            useInteractionStore.getState().flush();
        }
    });
}
