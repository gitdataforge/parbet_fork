import { create } from 'zustand';
import { aggregateAllEvents } from '../services/eventAggregator';
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
    return map[countryCode?.toUpperCase()] || 'INR'; 
};

export const useAppStore = create((set, get) => ({
    // User & Authentication
    user: null, 
    balance: 0, 
    diamonds: 0,
    hasOnboarded: localStorage.getItem('parbet_onboarded') === 'true',
    isAuthenticated: false,
    isAuthModalOpen: false,
    
    // Real-Time API Data (Aggregated 2026 Feed)
    liveMatches: [],
    trendingPerformers: [], 
    isLoadingMatches: true,
    apiError: null,
    
    // ------------------------------------------------------------------
    // NEW: Strict Location & Internationalization
    // ------------------------------------------------------------------
    userCity: 'Loading...',
    userCountry: 'IN', // Default country code
    userCurrency: 'INR', 
    userLanguage: 'EN',
    strictLocation: {
        city: '',
        countryCode: '',
        lat: null,
        lon: null
    },

    // ------------------------------------------------------------------
    // NEW: Performer Page Deep Filters (image_f557a3 - image_f55b61)
    // ------------------------------------------------------------------
    performerFilters: {
        dateRange: { from: null, to: null },
        activeOpponent: null, // For image_f55804.png
        priceBuckets: [],    // For image_f55863.png ('$', '$$', etc)
        homeAway: 'All',     // For image_f55b61.png ('All', 'Home', 'Away')
        searchQuery: ''
    },

    // Persisted User Data
    recentSearches: JSON.parse(localStorage.getItem('parbet_recent_searches')) || [],
    favorites: JSON.parse(localStorage.getItem('parbet_favorites')) || [],

    // Multi-Step Checkout & PayU States
    checkoutStep: 1, 
    checkoutExpiration: null,
    payuHash: '',
    payuTransactionId: '',
    
    checkoutFormData: {
        contact: { email: '', firstName: '', lastName: '', phone: '', countryCode: '+91' },
        delivery: { method: 'Mobile Transfer', fullName: '', phone: '' },
        address: { country: 'India', line1: '', line2: '', city: '', state: '', zip: '' }
    },

    // Marketplace Flow States
    activeEvent: null,
    eventListings: [],
    isCheckingOut: false,

    // Ticket Selection States
    isTicketQuantityModalOpen: false,
    selectedTicketQuantity: 2, 

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

    // ------------------------------------------------------------------
    // NEW: Performer Filter Setters
    // ------------------------------------------------------------------
    setPerformerFilter: (filterType, value) => set((state) => ({
        performerFilters: {
            ...state.performerFilters,
            [filterType]: value
        }
    })),

    resetPerformerFilters: () => set({
        performerFilters: {
            dateRange: { from: null, to: null },
            activeOpponent: null,
            priceBuckets: [],
            homeAway: 'All',
            searchQuery: ''
        }
    }),

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

    // Checkout Actions
    setCheckoutStep: (step) => set({ checkoutStep: step }),
    updateCheckoutFormData: (section, data) => set((state) => ({
        checkoutFormData: {
            ...state.checkoutFormData,
            [section]: { ...state.checkoutFormData[section], ...data }
        }
    })),
    setPayuStates: (hash, txnId) => set({ payuHash: hash, payuTransactionId: txnId }),

    startCheckoutTimer: () => {
        const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;
        set({ checkoutExpiration: tenMinutesFromNow });
    },
    resetCheckoutTimer: () => set({ checkoutExpiration: null, checkoutStep: 1 }),

    // Favorites Action
    toggleFavorite: async (eventObj) => {
        const state = get();
        const isFav = state.favorites.some(f => f.id === eventObj.id);
        const newFavorites = isFav 
            ? state.favorites.filter(f => f.id !== eventObj.id)
            : [...state.favorites, eventObj];
        
        localStorage.setItem('parbet_favorites', JSON.stringify(newFavorites));
        set({ favorites: newFavorites });

        if (state.user) {
            try {
                const userRef = doc(db, 'users', state.user.uid);
                await setDoc(userRef, { favorites: newFavorites }, { merge: true });
            } catch (err) {
                console.error('Failed to sync favorites to Firebase', err);
            }
        }
    },

    // ------------------------------------------------------------------
    // CORE LOGIC: Multi-API Orchestration & Strict Location
    // ------------------------------------------------------------------
    fetchLocationAndMatches: async (manualCity = null) => {
        set({ isLoadingMatches: true, apiError: null });
        try {
            // 1. Resolve Location Strictly
            const geo = await fetchUserCity(); // Returns { city, countryCode, lat, lon }
            const city = manualCity || geo.city;
            const country = geo.countryCode || 'IN';

            // 2. Fetch from Aggregator brain (Concurrent fetch from 4+ APIs)
            const matches = await aggregateAllEvents({ city, countryCode: country });
            
            // 3. Extract Performers for Search/Trending
            const performers = Array.from(new Set(matches.flatMap(m => [m.t1, m.t2])))
                .filter(p => p) // Remove nulls
                .map(name => ({ name }));

            set({ 
                userCity: city, 
                userCountry: country,
                strictLocation: { ...geo, city },
                userCurrency: getCurrencyFromCountry(country),
                liveMatches: matches, 
                trendingPerformers: performers,
                isLoadingMatches: false 
            });
        } catch (error) {
            console.error("Critical State Failure:", error);
            set({ apiError: error.message, isLoadingMatches: false, userCity: manualCity || "Global" });
        }
    },

    getSectionAggregates: () => {
        const listings = get().eventListings;
        const aggregates = {};
        listings.forEach(listing => {
            const section = (listing.section || 'General').toUpperCase().trim();
            const price = parseFloat(listing.price);
            const quantity = parseInt(listing.quantity, 10) || 1;
            if (!aggregates[section]) {
                aggregates[section] = { section, minPrice: price, totalQuantity: quantity, listings: [listing] };
            } else {
                if (price < aggregates[section].minPrice) aggregates[section].minPrice = price;
                aggregates[section].totalQuantity += quantity;
                aggregates[section].listings.push(listing);
            }
        });
        return Object.values(aggregates).sort((a, b) => a.section.localeCompare(b.section));
    },

    fetchEventListings: async (eventId) => {
        try {
            const q = query(collection(db, 'listings'), where('eventId', '==', eventId), where('status', '==', 'active'));
            const snapshot = await getDocs(q);
            const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ eventListings: listings });
        } catch (error) {
            console.error("Marketplace fetch error:", error);
        }
    }
}));