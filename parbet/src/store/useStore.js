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
    addDoc,
    setDoc
} from 'firebase/firestore';

// Helper to resolve real-world currency from reverse-geocode country codes
const getCurrencyFromCountry = (countryCode) => {
    const map = {
        'IN': 'INR',
        'US': 'USD',
        'GB': 'GBP',
        'AU': 'AUD',
        'CA': 'CAD',
        'EU': 'EUR'
    };
    return map[countryCode?.toUpperCase()] || 'INR'; // Defaulting to INR for Indian market focus
};

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
    
    // Location, Language & Currency
    userCity: 'Loading...',
    userCurrency: 'INR', // Dynamic global currency state
    userLanguage: 'EN', // Default Language

    // Persisted User Data
    recentSearches: JSON.parse(localStorage.getItem('parbet_recent_searches')) || [],
    favorites: JSON.parse(localStorage.getItem('parbet_favorites')) || [],

    // Marketplace Flow States
    activeEvent: null,
    eventListings: [],
    isCheckingOut: false,
    checkoutExpiration: null, // 10-minute timer lock

    // Ticket Selection States
    isTicketQuantityModalOpen: false,
    selectedTicketQuantity: 2, // Defaults to 2 mimicking the Viagogo standard

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

    // Ticket Selection Setters
    setTicketQuantityModalOpen: (isOpen) => set({ isTicketQuantityModalOpen: isOpen }),
    setSelectedTicketQuantity: (qty) => set({ selectedTicketQuantity: qty }),

    // Language & Currency Setters
    setUserLanguage: (lang) => set({ userLanguage: lang }),
    setUserCurrency: (currency) => set({ userCurrency: currency }),

    // Checkout Timer Actions
    startCheckoutTimer: () => {
        const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;
        set({ checkoutExpiration: tenMinutesFromNow });
    },
    resetCheckoutTimer: () => set({ checkoutExpiration: null }),

    // Favorites Action (Local Storage + Firebase Sync)
    toggleFavorite: async (eventObj) => {
        const state = get();
        const isFav = state.favorites.some(f => f.id === eventObj.id);
        const newFavorites = isFav 
            ? state.favorites.filter(f => f.id !== eventObj.id)
            : [...state.favorites, eventObj];
        
        // Persist locally for immediate UI feedback
        localStorage.setItem('parbet_favorites', JSON.stringify(newFavorites));
        set({ favorites: newFavorites });

        // Securely sync to Firebase if user is authenticated
        if (state.user) {
            try {
                const userRef = doc(db, 'users', state.user.uid);
                await setDoc(userRef, { favorites: newFavorites }, { merge: true });
            } catch (err) {
                console.error('Failed to sync favorites to Firebase', err);
            }
        }
    },

    // Recent Searches Actions
    addRecentSearch: (searchQuery) => set((state) => {
        if (!searchQuery || !searchQuery.trim()) return state;
        const updatedSearches = [searchQuery, ...state.recentSearches.filter(q => q.toLowerCase() !== searchQuery.toLowerCase())].slice(0, 5);
        localStorage.setItem('parbet_recent_searches', JSON.stringify(updatedSearches));
        return { recentSearches: updatedSearches };
    }),
    clearRecentSearches: () => set(() => {
        localStorage.removeItem('parbet_recent_searches');
        return { recentSearches: [] };
    }),

    // Logic to extract unique performers from real API data
    updateTrendingPerformers: (matches) => {
        const performers = Array.from(new Set(matches.flatMap(m => [m.t1, m.t2])))
            .map(name => ({ name }));
        set({ trendingPerformers: performers });
    },

    // ------------------------------------------------------------------
    // Core Utility: Aggregate P2P Listings by Stadium Section
    // ------------------------------------------------------------------
    getSectionAggregates: () => {
        const listings = get().eventListings;
        const aggregates = {};

        listings.forEach(listing => {
            const section = (listing.section || 'General').toUpperCase().trim();
            const price = parseFloat(listing.price);
            const quantity = parseInt(listing.quantity, 10) || 1;

            if (!aggregates[section]) {
                aggregates[section] = {
                    section: section,
                    minPrice: price,
                    totalQuantity: quantity,
                    listings: [listing]
                };
            } else {
                if (price < aggregates[section].minPrice) {
                    aggregates[section].minPrice = price; // Update Best Price
                }
                aggregates[section].totalQuantity += quantity; // Sum up tickets left
                aggregates[section].listings.push(listing);
            }
        });

        // Return array of aggregated sections sorted alphabetically
        return Object.values(aggregates).sort((a, b) => a.section.localeCompare(b.section));
    },

    // Combined Async action for IP/Manual Location + Odds (Initial Load & Updates)
    fetchLocationAndMatches: async (manualCity = null) => {
        set({ isLoadingMatches: true, apiError: null });
        try {
            // Resolve city: use manual input if provided, else auto-detect via IP
            const city = manualCity || await fetchUserCity();

            // Pass the resolved location directly into the Odds API fetcher
            const matches = await fetchRealUpcomingMatches(city);
            
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
            set({ apiError: error.message, isLoadingMatches: false, userCity: manualCity || "Global" });
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

    // HTML5 Native Geolocation Request (with Currency Binding)
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
                    
                    const resolvedCity = data.city || data.locality || "Current Location";
                    const resolvedCurrency = getCurrencyFromCountry(data.countryCode); // Set currency based on country code
                    
                    set({ userCity: resolvedCity, userCurrency: resolvedCurrency });
                    
                    // Trigger the global fetch to update API data with the new GPS-based city
                    get().fetchLocationAndMatches(resolvedCity);
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