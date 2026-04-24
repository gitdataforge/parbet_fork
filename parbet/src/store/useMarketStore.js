import { create } from 'zustand';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * FEATURE 1: Global Read-Only State Manager
 * Actively synchronizes the Buyer's frontend with the Seller's Firestore payloads.
 * Re-engineered to process complex sorting and filtering securely in memory to prevent index crashes.
 */
export const useMarketStore = create((set, get) => ({
    activeListings: [],
    categories: ['All', 'Cricket', 'Football', 'Tennis', 'Esports', 'Other'],
    activeCategory: 'All',
    isLoading: true,
    error: null,

    // FEATURE 2: Schema-Agnostic Real-Time Market Synchronization
    initMarketListener: () => {
        set({ isLoading: true, error: null });
        try {
            // Simplified Query: Only fetch events that are marked active.
            // Complex date filtering and sorting are moved to memory to bypass index constraints.
            const marketQuery = query(
                collection(db, 'events'),
                where('status', '==', 'active')
            );

            // Establish the real-time WebSocket connection
            const unsubscribe = onSnapshot(marketQuery, 
                (snapshot) => {
                    const now = new Date().getTime();

                    // Process, normalize, filter, and sort data in memory
                    const listings = snapshot.docs.map(doc => {
                        const data = doc.data();
                        
                        // FEATURE 3: Universal Timestamp Normalization
                        // Intelligently maps either the old schema (eventTimestamp) or the seeded schema (commence_time)
                        const rawDate = data.commence_time || data.eventTimestamp || data.date || data.createdAt?.seconds * 1000 || new Date().toISOString();
                        const eventDateObj = new Date(rawDate);
                        
                        // FEATURE 4: Universal Price Calculator
                        // Scans nested ticket tiers (old schema) OR grabs direct root prices (new seeded schema)
                        let minPrice = Infinity;
                        if (data.ticketTiers && Array.isArray(data.ticketTiers)) {
                            data.ticketTiers.forEach(tier => {
                                if (tier.quantity > 0 && tier.price < minPrice) {
                                    minPrice = tier.price;
                                }
                            });
                        } else if (data.price && typeof data.price === 'number') {
                            minPrice = data.price;
                        }
                        
                        return {
                            id: doc.id,
                            ...data,
                            // Inject normalized tracking fields
                            normalizedDate: eventDateObj.getTime(),
                            displayDate: eventDateObj.toISOString(),
                            startingPrice: minPrice === Infinity ? null : minPrice 
                        };
                    })
                    // FEATURE 5: In-Memory Expiration Filter (Strips past events)
                    .filter(listing => listing.normalizedDate >= now)
                    // FEATURE 6: In-Memory Chronological Sorter (Nearest upcoming events first)
                    .sort((a, b) => a.normalizedDate - b.normalizedDate);

                    // Update global state instantly
                    set({ activeListings: listings, isLoading: false, error: null });
                    console.log(`[Parbet Market Sync] Successfully loaded and mapped ${listings.length} active global listings.`);
                },
                (error) => {
                    console.error("[Parbet Market Sync] Listener failed:", error);
                    set({ 
                        error: "Market synchronization interrupted. Please check your connection.", 
                        isLoading: false 
                    });
                }
            );

            // Return the cleanup function to prevent memory leaks when unmounting
            return unsubscribe;
        } catch (err) {
            console.error("[Parbet Market Sync] Critical initialization failure:", err);
            set({ 
                error: "Failed to initialize global market feed. Ensure database index exists.", 
                isLoading: false 
            });
        }
    },

    // FEATURE 7: Category Filtering Engine (Client-Side)
    // Allows instant, zero-latency filtering without hitting the database again
    setActiveCategory: (category) => {
        set({ activeCategory: category });
    },

    // FEATURE 8: Derived State Selector for the UI
    getFilteredListings: () => {
        const { activeListings, activeCategory } = get();
        if (activeCategory === 'All') return activeListings;
        // Fallback mapping: If the event doesn't explicitly have sportCategory, map IPL events to Cricket automatically
        return activeListings.filter(listing => {
            const cat = listing.sportCategory || (listing.league === 'Indian Premier League' ? 'Cricket' : 'Other');
            return cat === activeCategory;
        });
    }
}));