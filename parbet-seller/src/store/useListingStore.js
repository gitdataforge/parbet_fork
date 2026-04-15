import { create } from 'zustand';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * FEATURE 1: Global Shared Database Integrator
 * Manages the state and execution of pushing seller payloads to the buyer market.
 */
export const useListingStore = create((set) => ({
    isLoading: false,
    error: null,

    // FEATURE 2: Secure Payload Injection
    createListing: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            // Target the globally shared 'events' collection
            const eventsRef = collection(db, 'events');
            
            // FEATURE 3: Real-Time Database Mutation
            // Injects the verified payload into Firestore. 
            // Because Firestore has real-time listeners, the buyer homepage will update instantly.
            const docRef = await addDoc(eventsRef, {
                ...payload,
                // Failsafe timestamp injection
                createdAt: payload.createdAt || new Date().toISOString(),
            });

            console.log(`[Parbet Ledger] Successfully minted event document: ${docRef.id}`);
            
            set({ isLoading: false });
            return docRef.id;
        } catch (err) {
            console.error("[Parbet Ledger] Transaction failed:", err);
            
            // FEATURE 4: Dynamic Error Trapping
            set({ 
                error: err.message || 'Failed to publish the match to the global marketplace. Verify your connection.',
                isLoading: false 
            });
            throw err;
        }
    },

    // FEATURE 5: UI Error Boundary Reset
    clearError: () => set({ error: null })
}));