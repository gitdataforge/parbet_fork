import { create } from 'zustand';
import { fetchRealUpcomingMatches } from '../services/oddsApi';
import { fetchUserCity } from '../services/locationApi';
import { db } from '../lib/firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    runTransaction, 
    doc, 
    addDoc 
} from 'firebase/firestore';

export const useAppStore = create((set, get) => ({
    // User & Authentication
    user: null, 
    balance: 0, 
    diamonds: 0,
    hasOnboarded: localStorage.getItem('parbet_onboarded') === 'true',
    isAuthenticated: false,
    isAuthModalOpen: false,
    
    // Real-Time API Data
    liveMatches: [],
    trendingPerformers: [], // Derived from liveMatches
    isLoadingMatches: true,
    apiError: null,
    userCity: 'Loading...',

    // Marketplace Flow States
    activeEvent: null,
    eventListings: [],
    isCheckingOut: false,

    // UI & Interactive States
    isLocationDropdownOpen: false,
    isSearchExpanded: false,
    locationError: null,
    searchQuery: '',

    // Explore Page Filter States
    exploreCategory: 'All Events',
    exploreDateFilter: 'All dates',
    explorePriceFilter: 'All',

    // Basic Setters
    setOnboarded: () => { 
        localStorage.setItem('parbet_onboarded', 'true'); 
        set({ hasOnboarded: true }); 
    },
    setAuth: (status) => set({ isAuthenticated: status }),
    setUser: (user) => set({ user }),
    setWallet: (balance, diamonds) => set({ balance, diamonds }),
    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    
    // Interactive Setters
    setLocationDropdownOpen: (isOpen) => set({ isLocationDropdownOpen: isOpen }),
    setSearchExpanded: (isExpanded) => set({ isSearchExpanded: isExpanded }),
    setLocationError: (errorMsg) => set({ locationError: errorMsg }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setActiveEvent: (event) => set({ activeEvent: event }),

    // Explore Filter Setters
    setExploreCategory: (category) => set({ exploreCategory: category }),
    setExploreDateFilter: (dateFilter) => set({ exploreDateFilter: dateFilter }),
    setExplorePriceFilter: (priceFilter) => set({ explorePriceFilter: priceFilter }),

    // Logic to extract unique performers from real API data
    updateTrendingPerformers: (matches) => {
        const performers = Array.from(new Set(matches.flatMap(m => [m.t1, m.t2])))
            .map(name => ({ name }));
        set({ trendingPerformers: performers });
    },

    // Combined Async action for IP Location + Odds (Initial Load)
    fetchLocationAndMatches: async () => {
        set({ isLoadingMatches: true, apiError: null });
        try {
            const [city, matches] = await Promise.all([
                fetchUserCity(),
                fetchRealUpcomingMatches()
            ]);
            
            // Calculate unique performers from real results
            const performers = Array.from(new Set(matches.flatMap(m => [m.t1, m.t2])))
                .map(name => ({ name }));

            set({ 
                userCity: city, 
                liveMatches: matches, 
                trendingPerformers: performers,
                isLoadingMatches: false 
            });
        } catch (error) {
            set({ apiError: error.message, isLoadingMatches: false, userCity: "Global" });
        }
    },

    // Fetch P2P Listings for a specific event
    fetchEventListings: async (eventId) => {
        try {
            const q = query(
                collection(db, 'listings'), 
                where('eventId', '==', eventId), 
                where('status', '==', 'active')
            );
            const snapshot = await getDocs(q);
            const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ eventListings: listings });
        } catch (error) {
            console.error("Marketplace fetch error:", error);
        }
    },

    // Secure Atomic Transaction: Execute purchase and update balances
    executePurchase: async (listingId, buyerId, amount) => {
        set({ isCheckingOut: true });
        try {
            await runTransaction(db, async (transaction) => {
                const listingRef = doc(db, 'listings', listingId);
                const buyerRef = doc(db, 'users', buyerId);
                
                const listingSnap = await transaction.get(listingRef);
                const buyerSnap = await transaction.get(buyerRef);

                if (!listingSnap.exists() || listingSnap.data().status !== 'active') {
                    throw new Error("Listing is no longer available.");
                }

                if (!buyerSnap.exists() || buyerSnap.data().balance < amount) {
                    throw new Error("Insufficient wallet balance.");
                }

                const sellerId = listingSnap.data().sellerId;
                const sellerRef = doc(db, 'users', sellerId);
                const sellerSnap = await transaction.get(sellerRef);

                // 1. Deduct from Buyer
                transaction.update(buyerRef, { balance: buyerSnap.data().balance - amount });
                
                // 2. Credit Seller
                const currentSellerBalance = sellerSnap.exists() ? (sellerSnap.data().balance || 0) : 0;
                transaction.update(sellerRef, { balance: currentSellerBalance + amount });

                // 3. Mark Listing as Sold
                transaction.update(listingRef, { status: 'sold' });

                // 4. Create Order Record
                const orderRef = doc(collection(db, 'orders'));
                transaction.set(orderRef, {
                    listingId,
                    buyerId,
                    sellerId,
                    amount,
                    eventName: listingSnap.data().eventName,
                    createdAt: new Date().toISOString()
                });
            });
            set({ isCheckingOut: false });
            return { success: true };
        } catch (error) {
            set({ isCheckingOut: false });
            throw error;
        }
    },

    // HTML5 Native Geolocation Request
    requestDeviceLocation: async () => {
        set({ isLocationDropdownOpen: false, locationError: null });
        
        if (!navigator.geolocation) {
            set({ locationError: 'There is no location support on this device or it is disabled. Please check your settings.' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();
                    set({ userCity: data.city || data.locality || "Current Location" });
                } catch (err) {
                    console.error("Reverse geocode failed:", err);
                    set({ userCity: "Precise Location Found" });
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                set({ locationError: 'There is no location support on this device or it is disabled. Please check your settings.' });
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }
}));