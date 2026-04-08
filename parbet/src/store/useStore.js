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
    setDoc,
    onSnapshot
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
    apiMatches: [],
    sellerMatches: [],
    liveMatches: [],
    trendingPerformers: [], 
    isLoadingMatches: true,
    apiError: null,
    unsubscribeSellerTickets: null,
    
    // ------------------------------------------------------------------
    // Strict Location & Internationalization
    // ------------------------------------------------------------------
    manualCity: localStorage.getItem('parbet_manual_city') || null,
    userCity: 'Loading...',
    userCountry: 'IN', // Default country code
    userCurrency: 'INR', 
    userLanguage: 'EN',
    strictLocation: {
        city: '',
        state: '',
        countryCode: '',
        lat: null,
        lon: null
    },

    // ------------------------------------------------------------------
    // Performer Page Deep Filters
    // ------------------------------------------------------------------
    performerFilters: {
        dateRange: { from: null, to: null },
        activeOpponent: null,
        priceBuckets: [],
        homeAway: 'All games',
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
        contact: {
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            countryCode: '+91'
        },
        delivery: {
            method: 'Mobile Transfer',
            fullName: '',
            phone: ''
        },
        address: {
            country: 'India',
            line1: '',
            line2: '',
            city: '',
            state: '',
            zip: ''
        }
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
    // Manual Location Strict Setter
    // ------------------------------------------------------------------
    setManualLocation: (city) => {
        localStorage.setItem('parbet_manual_city', city);
        set({ 
            manualCity: city,
            userCity: city,
            liveMatches: [], // Instantly purge old data to prevent UI bleed
            apiMatches: [],
            trendingPerformers: [],
            isLocationDropdownOpen: false,
            isLoadingMatches: true
        });
        get().fetchLocationAndMatches(city);
    },

    // ------------------------------------------------------------------
    // Performer Filter Setters
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
            homeAway: 'All games',
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

    // Checkout Step & Form Setters
    setCheckoutStep: (step) => set({ checkoutStep: step }),
    updateCheckoutFormData: (section, data) => set((state) => ({
        checkoutFormData: {
            ...state.checkoutFormData,
            [section]: { ...state.checkoutFormData[section], ...data }
        }
    })),
    setPayuStates: (hash, txnId) => set({ payuHash: hash, payuTransactionId: txnId }),

    // Checkout Timer Actions
    startCheckoutTimer: () => {
        const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;
        set({ checkoutExpiration: tenMinutesFromNow });
    },
    resetCheckoutTimer: () => set({ checkoutExpiration: null, checkoutStep: 1 }),

    // Favorites Action (Strict Artifact Path Security)
    toggleFavorite: async (eventObj) => {
        const state = get();
        const isFav = state.favorites.some(f => f.id === eventObj.id);
        const newFavorites = isFav 
            ? state.favorites.filter(f => f.id !== eventObj.id)
            : [...state.favorites, eventObj];
        
        localStorage.setItem('parbet_favorites', JSON.stringify(newFavorites));
        set({ favorites: newFavorites });

        if (state.user) {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            try {
                // STRICT RULE 1: Mandated 6-segment path for private data
                const userRef = doc(db, 'artifacts', appId, 'users', state.user.uid, 'profile', 'data');
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

    // ------------------------------------------------------------------
    // LIVE SELLER TICKET LISTENER & MULTI-API MERGER
    // ------------------------------------------------------------------
    initSellerTicketsListener: () => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        // STRICT RULE 1: Mandated path for public shared application data
        const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

        const unsub = onSnapshot(ticketsRef, (snapshot) => {
            const sellerEvents = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.status !== 'active' && data.status !== undefined) return;
                
                const eventDate = new Date(data.date || data.commence_time || Date.now());
                const teams = (data.eventName || data.t1 || '').split(' vs ');
                
                sellerEvents.push({
                    id: docSnap.id,
                    t1: teams[0] || data.t1 || data.eventName || 'TBA',
                    t2: teams[1] || data.t2 || '',
                    league: data.league || 'Indian Premier League',
                    commence_time: data.date || data.commence_time || eventDate.toISOString(),
                    dow: eventDate.toLocaleDateString('en-US', { weekday: 'short' }),
                    day: eventDate.getDate(),
                    month: eventDate.toLocaleDateString('en-US', { month: 'short' }),
                    time: data.time || eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    loc: data.venue || data.loc || `${data.city || 'Local Stadium'}, India`,
                    country: data.country || 'IN',
                    source: 'ParbetSeller',
                    proximityScore: 4, // Heavily weight local seller tickets over API generics
                    ...data
                });
            });

            set(state => {
                const combined = [...state.apiMatches, ...sellerEvents];
                // Mathematical sorting to enforce relevancy and chronology
                const sorted = combined.sort((a, b) => {
                    if (b.proximityScore !== a.proximityScore) {
                        return (b.proximityScore || 1) - (a.proximityScore || 1);
                    }
                    return new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
                });
                
                const performers = Array.from(new Set(sorted.flatMap(m => [m.t1, m.t2])))
                    .filter(Boolean)
                    .map(name => ({ name }));

                return {
                    sellerMatches: sellerEvents,
                    liveMatches: sorted,
                    trendingPerformers: performers
                };
            });
        }, (error) => {
            console.error("Failed to sync live seller tickets:", error);
        });

        set({ unsubscribeSellerTickets: unsub });
    },

    // ------------------------------------------------------------------
    // CORE LOGIC: Multi-API Orchestration & Strict Location Fetch
    // ------------------------------------------------------------------
    fetchLocationAndMatches: async (cityOverride = null) => {
        set({ isLoadingMatches: true, apiError: null });

        // Spin up the real-time seller ticket connection if not active
        if (!get().unsubscribeSellerTickets) {
            get().initSellerTicketsListener();
        }

        try {
            const manualCity = localStorage.getItem('parbet_manual_city');
            const targetCity = cityOverride || manualCity;

            let geo, city, country;

            if (targetCity) {
                const cityToStateMap = {
                    'mumbai': 'Maharashtra', 'pune': 'Maharashtra', 'nagpur': 'Maharashtra', 'thane': 'Maharashtra',
                    'delhi': 'Delhi', 'new delhi': 'Delhi',
                    'bangalore': 'Karnataka', 'bengaluru': 'Karnataka',
                    'hyderabad': 'Telangana',
                    'chennai': 'Tamil Nadu',
                    'kolkata': 'West Bengal',
                    'ahmedabad': 'Gujarat', 'surat': 'Gujarat',
                    'jaipur': 'Rajasthan',
                    'lucknow': 'Uttar Pradesh', 'noida': 'Uttar Pradesh',
                    'bhopal': 'Madhya Pradesh', 'indore': 'Madhya Pradesh',
                    'patna': 'Bihar',
                    'bhubaneswar': 'Odisha',
                    'kochi': 'Kerala', 'trivandrum': 'Kerala',
                    'guwahati': 'Assam',
                    'goa': 'Goa', 'panaji': 'Goa'
                };
                
                const mappedState = cityToStateMap[targetCity.toLowerCase()] || '';

                city = targetCity;
                country = 'IN'; 
                geo = { city: targetCity, state: mappedState, countryCode: 'IN', lat: null, lon: null };
            } else {
                geo = await fetchUserCity();
                city = geo.city || 'Mumbai';
                country = geo.countryCode || 'IN';
            }

            const matches = await aggregateAllEvents({ 
                city: city, 
                state: geo.state || geo.region || '', 
                countryCode: country 
            });
            
            // Mathematically merge freshly fetched API feeds with the live seller state
            set(state => {
                const combined = [...matches, ...state.sellerMatches];
                const sorted = combined.sort((a, b) => {
                    if (b.proximityScore !== a.proximityScore) {
                        return (b.proximityScore || 1) - (a.proximityScore || 1);
                    }
                    return new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
                });

                const performers = Array.from(new Set(sorted.flatMap(m => [m.t1, m.t2])))
                    .filter(Boolean)
                    .map(name => ({ name }));
                
                return { 
                    userCity: city, 
                    userCountry: country,
                    userCurrency: getCurrencyFromCountry(country),
                    strictLocation: { ...geo, city },
                    apiMatches: matches,
                    liveMatches: sorted, 
                    trendingPerformers: performers, 
                    isLoadingMatches: false 
                };
            });
        } catch (error) {
            console.error("Critical State Failure:", error);
            const fallbackCity = cityOverride || localStorage.getItem('parbet_manual_city') || "Global";
            set({ apiError: error.message, isLoadingMatches: false, userCity: fallbackCity });
        }
    },

    // STRICT PATH FIX: Use correct 6-segment public artifact path
    fetchEventListings: async (eventId) => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), where('eventId', '==', eventId), where('status', '==', 'active'));
            const snapshot = await getDocs(q);
            const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ eventListings: listings });
        } catch (error) {
            console.error("Marketplace fetch error:", error);
        }
    },

    // STRICT PATH FIX: Secure multi-tier transaction processing with correct pathing
    executePurchase: async (listingId, buyerId, amount) => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        set({ isCheckingOut: true });
        try {
            await runTransaction(db, async (transaction) => {
                const listingRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', listingId);
                const buyerRef = doc(db, 'artifacts', appId, 'users', buyerId, 'profile', 'data');
                
                const listingSnap = await transaction.get(listingRef);
                const buyerSnap = await transaction.get(buyerRef);
                
                if (!listingSnap.exists() || listingSnap.data().status !== 'active') throw new Error("Listing is no longer available.");
                if (!buyerSnap.exists() || buyerSnap.data().balance < amount) throw new Error("Insufficient wallet balance.");
                
                const sellerId = listingSnap.data().sellerId;
                const sellerRef = doc(db, 'artifacts', appId, 'users', sellerId, 'profile', 'data');
                const sellerSnap = await transaction.get(sellerRef);
                
                transaction.update(buyerRef, { balance: buyerSnap.data().balance - amount });
                const currentSellerBalance = sellerSnap.exists() ? (sellerSnap.data().balance || 0) : 0;
                transaction.update(sellerRef, { balance: currentSellerBalance + amount });
                transaction.update(listingRef, { status: 'sold' });
                
                const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
                transaction.set(orderRef, { listingId, buyerId, sellerId, amount, eventName: listingSnap.data().eventName, createdAt: new Date().toISOString() });
            });
            set({ isCheckingOut: false });
            return { success: true };
        } catch (error) {
            set({ isCheckingOut: false });
            throw error;
        }
    },

    requestDeviceLocation: async () => {
        set({ isLocationDropdownOpen: false, locationError: null });
        if (!navigator.geolocation) {
            set({ locationError: 'There is no location support on this device or it is disabled.' });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();
                    
                    const resolvedCity = data.city || data.locality || "Current Location";
                    const resolvedState = data.principalSubdivision || '';
                    const resolvedCountry = data.countryCode || 'IN';
                    const resolvedCurrency = getCurrencyFromCountry(data.countryCode); 
                    
                    localStorage.removeItem('parbet_manual_city');

                    set({ 
                        manualCity: null,
                        userCity: resolvedCity, 
                        userCountry: resolvedCountry,
                        userCurrency: resolvedCurrency,
                        strictLocation: { 
                            city: resolvedCity, 
                            state: resolvedState, 
                            countryCode: resolvedCountry, 
                            lat: latitude, 
                            lon: longitude 
                        }
                    });
                    
                    get().fetchLocationAndMatches(resolvedCity);
                } catch (err) {
                    console.error("Reverse geocode failed:", err);
                    set({ userCity: "Precise Location Found" });
                }
            },
            (error) => {
                set({ locationError: 'Location access disabled.' });
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }
}));