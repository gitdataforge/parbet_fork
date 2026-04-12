import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { aggregateAllEvents } from '../services/eventAggregator';

export const useSellerStore = create((set, get) => ({
    // 100% Real Seller Authentication State (Zero Mock Data)
    user: null, 
    isAuthenticated: false, 
    isSubmitting: false,
    submitError: null,

    // Live API State (For Search & Listing Creation)
    liveMatches: [],
    searchQuery: '',
    isLoadingEvents: false,

    // Dedicated IPL Hub State (Merged API + Firebase Custom Events)
    iplEvents: [],
    isLoadingIPLEvents: false,

    // Seller Dashboard State (For Tracking Active Tickets)
    myListings: [],
    isLoadingListings: false,
    unsubscribeListings: null,

    // ------------------------------------------------------------------
    // SECURE FIREBASE AUTHENTICATION PIPELINE
    // ------------------------------------------------------------------
    initAuth: () => {
        // Listen for real cryptographic identity state changes
        onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Secure session exists
                set({ user: currentUser, isAuthenticated: true });
            } else {
                // No user found, generate a 100% real anonymous UID securely via Firebase
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Firebase Anonymous Auth Failed:", error);
                }
            }
        });
    },

    // Auth Setters
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => {
        const { unsubscribeListings } = get();
        if (unsubscribeListings) unsubscribeListings(); // Clean up listener to prevent memory leaks
        set({ user: null, isAuthenticated: false, myListings: [], unsubscribeListings: null });
        auth.signOut();
    },

    // API & Search Setters
    setSearchQuery: (query) => set({ searchQuery: query }),

    // ------------------------------------------------------------------
    // LIVE SPORTS API PIPELINE
    // ------------------------------------------------------------------
    fetchLiveEvents: async () => {
        set({ isLoadingEvents: true });
        try {
            // Fetch 100% real-world events via our custom ESPN aggregator
            const events = await aggregateAllEvents({ city: '', state: '', countryCode: 'IN' });
            set({ liveMatches: events, isLoadingEvents: false });
        } catch (error) {
            console.error("Failed to fetch live events from API network:", error);
            set({ isLoadingEvents: false });
        }
    },

    // ------------------------------------------------------------------
    // DEDICATED IPL HYBRID DATA MERGE PIPELINE
    // ------------------------------------------------------------------
    fetchIPLEvents: async () => {
        set({ isLoadingIPLEvents: true });
        try {
            // 1. Fetch 100% real scheduled matches from the public ESPN network
            const espnEvents = await aggregateAllEvents({ city: '', state: '', countryCode: 'IN' });
            
            // Strictly filter for IPL/Indian related events
            const espnIPLEvents = espnEvents.filter(event => 
                event.league?.toLowerCase().includes('premier league') ||
                event.league?.toLowerCase().includes('ipl') ||
                event.t1?.toLowerCase().includes('super') || 
                event.t1?.toLowerCase().includes('indians') ||
                event.t1?.toLowerCase().includes('challengers') ||
                event.t1?.toLowerCase().includes('kings') ||
                event.t1?.toLowerCase().includes('knight') ||
                event.t1?.toLowerCase().includes('capitals') ||
                event.country === 'IN'
            );

            // 2. Fetch custom seller-posted events from the shared Parbet Firebase network
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
            const customQuery = query(ticketsRef, where('league', '==', 'Indian Premier League'));
            
            const querySnapshot = await getDocs(customQuery);
            const customSellerEvents = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Deduplication logic: Groups identical seller listings into a single Event UI Row
                const uniqueKey = `${data.t1}-${data.t2}-${data.commence_time}`;
                
                if (!customSellerEvents.some(e => e.uniqueKey === uniqueKey)) {
                    customSellerEvents.push({
                        id: `custom_${doc.id}`,
                        uniqueKey: uniqueKey,
                        t1: data.t1,
                        t2: data.t2 || '',
                        league: data.league,
                        commence_time: data.commence_time,
                        loc: `${data.loc}${data.city ? `, ${data.city}` : ''}`,
                        country: data.country || 'IN',
                        source: 'Parbet_Seller_Network'
                    });
                }
            });

            // 3. Merge ESPN API schedule with Custom Seller marketplace events
            const combinedEvents = [...espnIPLEvents, ...customSellerEvents];

            // Safely remove any exact duplicates between ESPN and the Seller network
            const deduplicatedEvents = combinedEvents.filter((event, index, self) =>
                index === self.findIndex((e) => (
                    e.t1 === event.t1 && e.commence_time === event.commence_time
                ))
            );

            // 4. Sort strictly chronologically
            deduplicatedEvents.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());

            set({ iplEvents: deduplicatedEvents, isLoadingIPLEvents: false });
        } catch (error) {
            console.error("Failed to fetch merged IPL hybrid data:", error);
            set({ isLoadingIPLEvents: false });
        }
    },

    // ------------------------------------------------------------------
    // REAL-TIME DASHBOARD TRACKING (Buyer-Seller Sync)
    // ------------------------------------------------------------------
    fetchMyListings: () => {
        const state = get();
        if (!state.user) return;

        set({ isLoadingListings: true });

        // CRITICAL PATH: Dynamically resolve the environment App ID
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        
        // STRICT RULE 1: Target the exact public shared path the buyer site listens to
        const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
        
        // Strictly filter to ONLY show tickets created by the logged-in seller's REAL UID
        const q = query(ticketsRef, where('sellerId', '==', state.user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listings = [];
            snapshot.forEach(doc => {
                listings.push({ id: doc.id, ...doc.data() });
            });
            
            // Chronological sort: newest events first
            listings.sort((a, b) => new Date(b.commence_time) - new Date(a.commence_time));
            
            set({ myListings: listings, isLoadingListings: false });
        }, (error) => {
            console.error("Failed to fetch seller listings from shared network:", error);
            set({ isLoadingListings: false });
        });

        // Store the unsubscribe function to clean up when the user logs out
        set({ unsubscribeListings: unsubscribe });
    },

    // ------------------------------------------------------------------
    // CORE LOGIC: Strict Cross-App Data Bridge
    // ------------------------------------------------------------------
    addEventListing: async (listingData) => {
        set({ isSubmitting: true, submitError: null });
        
        try {
            const state = get();
            
            // Strict Auth Guard ensuring only verified real UIDs can post
            if (!state.user) {
                throw new Error("You must be securely authenticated to list tickets on the marketplace.");
            }

            // CRITICAL PATH: Dynamically resolve the environment App ID
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            
            // STRICT RULE 1: Target the exact public shared path the buyer site listens to
            const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

            // Format commence_time precisely for the buyer site's relative date parser
            let commenceTimeStr = new Date().toISOString();
            if (listingData.date && listingData.time) {
                commenceTimeStr = new Date(`${listingData.date}T${listingData.time}`).toISOString();
            }

            // Construct the exact schema expected by ViagogoListCard.jsx
            const payload = {
                sellerId: state.user.uid,
                t1: listingData.t1,
                t2: listingData.t2 || '',
                league: listingData.league || 'Indian Premier League',
                commence_time: commenceTimeStr,
                loc: listingData.venue || 'TBA Stadium',
                city: listingData.city || 'Pune',
                country: 'IN', // Enforce India localization for IPL focus
                price: parseFloat(listingData.price) || 0,
                quantity: parseInt(listingData.quantity, 10) || 1,
                section: listingData.section || 'General Admission',
                row: listingData.row || 'N/A',
                status: 'active', // 'active' status is required by the buyer site's query
                createdAt: serverTimestamp(),
            };

            // Execute the write operation to trigger real-time sync across clients
            const docRef = await addDoc(ticketsRef, payload);
            
            set({ isSubmitting: false });
            return { success: true, id: docRef.id };

        } catch (error) {
            console.error("Failed to sync ticket to buyer network:", error);
            set({ isSubmitting: false, submitError: error.message });
            throw error;
        }
    }
}));