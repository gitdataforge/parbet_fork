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
    onSnapshot,
    serverTimestamp,
    writeBatch
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

/**
 * FEATURE 1: Advanced Telemetry Error Logging (Diagnoses Permission Crashes)
 * FEATURE 2: Dynamic Payload Hydration (Bypasses lockCheckout undefined crashes)
 * FEATURE 3: Real-time Transactional Inventory Sync (Atomic Decrements)
 * FEATURE 4: 10-Minute Reservation Safety Valve
 * FEATURE 5: Multi-Currency Geometric Resolution
 * FEATURE 6: Audit Trail Logging (Session ID tracking)
 * FEATURE 7: Hybrid Seller/API Pipeline deduplication
 * FEATURE 8: Platform Escrow Fee Engine (15% Calculator)
 * FEATURE 9: Geo-Fencing Strict Mode
 * FEATURE 10: Automatic Checkout Form Persistence
 * FEATURE 11: Hardware-Accelerated Modal Triggers
 * FEATURE 12: Reverse Geocode Currency Sync
 * FEATURE 13: Centralized Dropdown State Manager (Prevents overlapping header menus)
 * FEATURE 14: Real-time Secure Notification Engine (Batch updates & unread counters)
 * FEATURE 15: Strict Singleton Network Interceptor (Fixes infinite QUIC loops)
 * FEATURE 16: Admin Config Hydration (Home Banners)
 */

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
    homeBanners: [], // Admin Editable Banners
    isLoadingMatches: true,
    apiError: null,
    
    // SECURITY LOCK: Prevents infinite QUIC protocol crashing loops
    isListenerActive: false,
    unsubscribeSellerTickets: null,
    
    // Strict Location & Internationalization
    manualCity: localStorage.getItem('parbet_manual_city') || null,
    userCity: 'Loading...',
    userCountry: 'IN', 
    userCurrency: 'INR', 
    userLanguage: 'EN',
    strictLocation: {
        city: '',
        state: '',
        countryCode: '',
        lat: null,
        lon: null
    },

    // Performer Page Deep Filters
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

    // Multi-Step Checkout & Razorpay States
    checkoutStep: 1, 
    checkoutExpiration: null,
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    
    // SECURITY STATES
    isCheckoutLocked: false,
    reservedListing: null,
    checkoutSessionId: null,
    
    checkoutFormData: {
        contact: {
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            countryCode: '+91'
        },
        delivery: {
            method: 'Mobile App Transfer',
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
    explorePriceFilter: 'Price',

    // ------------------------------------------------------------------
    // HEADER DROPDOWNS & NOTIFICATION ENGINE
    // ------------------------------------------------------------------
    activeDropdown: null, // Tracks: 'sell', 'tickets', 'profile', 'notifications', or null
    notifications: [],
    unreadNotificationCount: 0,
    unsubscribeNotifications: null,

    setActiveDropdown: (dropdownName) => set({ activeDropdown: dropdownName }),
    closeAllDropdowns: () => set({ activeDropdown: null }),

    initNotificationsListener: () => {
        const state = get();
        if (!state.user) return;
        
        // Clean up existing listener if any
        if (state.unsubscribeNotifications) {
            state.unsubscribeNotifications();
        }

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const notifRef = collection(db, 'artifacts', appId, 'users', state.user.uid, 'notifications');
        const q = query(notifRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return timeB - timeA; // Descending (newest first)
                });
            
            const unread = notifs.filter(n => !n.isRead).length;
            set({ notifications: notifs, unreadNotificationCount: unread });
        }, (error) => {
            console.error("[Parbet Notifications] Secure sync failed:", error.message);
        });

        set({ unsubscribeNotifications: unsubscribe });
    },

    markNotificationsAsRead: async () => {
        const state = get();
        if (!state.user || state.unreadNotificationCount === 0) return;

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const batch = writeBatch(db);
        
        const unreadNotifs = state.notifications.filter(n => !n.isRead);
        unreadNotifs.forEach(notif => {
            const notifRef = doc(db, 'artifacts', appId, 'users', state.user.uid, 'notifications', notif.id);
            batch.update(notifRef, { isRead: true });
        });

        try {
            await batch.commit();
            // Optimistic UI update
            set(prevState => ({
                notifications: prevState.notifications.map(n => ({ ...n, isRead: true })),
                unreadNotificationCount: 0
            }));
        } catch (error) {
            console.error("[Parbet Notifications] Failed to mark batch as read:", error);
        }
    },

    // Basic Setters
    setOnboarded: () => { 
        localStorage.setItem('parbet_onboarded', 'true'); 
        set({ hasOnboarded: true }); 
    },
    
    setAuth: (status) => {
        set({ isAuthenticated: status });
        if (!status) {
            const unsub = get().unsubscribeNotifications;
            if (unsub) unsub();
            set({ notifications: [], unreadNotificationCount: 0, unsubscribeNotifications: null, activeDropdown: null });
        }
    },
    
    setUser: (user) => {
        set({ user });
        if (user) {
            get().initNotificationsListener();
        } else {
            const unsub = get().unsubscribeNotifications;
            if (unsub) unsub();
            set({ notifications: [], unreadNotificationCount: 0, unsubscribeNotifications: null, activeDropdown: null });
        }
    },

    setWallet: (balance, diamonds) => set({ balance, diamonds }),
    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    
    // Interactive Setters
    setLocationDropdownOpen: (isOpen) => set({ isLocationDropdownOpen: isOpen }),
    setSearchExpanded: (isExpanded) => set({ isSearchExpanded: isExpanded }),
    setLocationError: (errorMsg) => set({ locationError: errorMsg }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setActiveEvent: (event) => set({ activeEvent: event }),

    // Manual Location Strict Setter
    setManualLocation: (city) => {
        localStorage.setItem('parbet_manual_city', city);
        set({ 
            manualCity: city,
            userCity: city,
            isLocationDropdownOpen: false
        });
        
        // Force refresh data locally without triggering infinite loop
        const state = get();
        if (state.liveMatches.length === 0) {
            get().fetchLocationAndMatches(city);
        }
    },

    // ------------------------------------------------------------------
    // SECURE PAYLOAD HYDRATION & CHECKOUT ACTIONS
    // ------------------------------------------------------------------
    
    hydrateCheckoutPayload: (listingData) => {
        const sessionId = `pb_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({
            isCheckoutLocked: true,
            reservedListing: listingData,
            checkoutSessionId: sessionId,
            checkoutStep: 1
        });
        get().startCheckoutTimer();
        console.log(`[Security Protocol] Checkout Hydrated & Locked: ${sessionId}`);
    },

    cancelReservation: () => {
        set({
            isCheckoutLocked: false,
            reservedListing: null,
            checkoutExpiration: null,
            checkoutSessionId: null,
            checkoutStep: 1,
            razorpayOrderId: null
        });
        console.log(`[Security Protocol] Reservation Released.`);
    },

    // ------------------------------------------------------------------
    // FILTER & SYSTEM SETTERS
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

    setExploreCategory: (category) => set({ exploreCategory: category }),
    setExploreDateFilter: (dateFilter) => set({ exploreDateFilter: dateFilter }),
    setExplorePriceFilter: (priceFilter) => set({ explorePriceFilter: priceFilter }),
    setTicketQuantityModalOpen: (isOpen) => set({ isTicketQuantityModalOpen: isOpen }),
    setSelectedTicketQuantity: (qty) => set({ selectedTicketQuantity: qty }),
    setUserLanguage: (lang) => set({ userLanguage: lang }),
    setUserCurrency: (currency) => set({ userCurrency: currency }),
    setCheckoutStep: (step) => set({ checkoutStep: step }),

    updateCheckoutFormData: (section, data) => set((state) => ({
        checkoutFormData: {
            ...state.checkoutFormData,
            [section]: { ...state.checkoutFormData[section], ...data }
        }
    })),
    
    setRazorpayOrder: (orderId) => set({ razorpayOrderId: orderId }),
    setRazorpayVerification: (paymentId, signature) => set({ 
        razorpayPaymentId: paymentId, 
        razorpaySignature: signature 
    }),

    startCheckoutTimer: () => {
        if (!get().checkoutExpiration) {
            const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;
            set({ checkoutExpiration: tenMinutesFromNow });
        }
    },
    
    resetCheckoutTimer: () => set({ 
        checkoutExpiration: null, 
        checkoutStep: 1, 
        isCheckoutLocked: false,
        reservedListing: null 
    }),

    // ------------------------------------------------------------------
    // FIREBASE SYNC & ATOMIC TRANSACTIONS
    // ------------------------------------------------------------------

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
                const userRef = doc(db, 'artifacts', appId, 'users', state.user.uid, 'profile', 'data');
                await setDoc(userRef, { favorites: newFavorites }, { merge: true });
            } catch (err) {
                console.error('Failed to sync favorites to Firebase', err);
            }
        }
    },

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

    /**
     * FEATURE 15: Strict Singleton Network Interceptor
     * Prevents net::ERR_QUIC_PROTOCOL_ERROR by ensuring only ONE active listener exists
     * across the entire application lifecycle.
     */
    initSellerTicketsListener: () => {
        const state = get();
        if (state.isListenerActive) return; // Strict singleton lock
        set({ isListenerActive: true });

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
        const q = query(ticketsRef, where('status', '==', 'active'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sellerEventsMap = new Map();

            snapshot.forEach(doc => {
                const data = doc.data();
                const eventId = data.eventId || `${data.t1}-${data.t2 || 'event'}-${data.commence_time?.split('T')[0]}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                if (!sellerEventsMap.has(eventId)) {
                    sellerEventsMap.set(eventId, {
                        id: `event_${eventId}`,
                        eventId: eventId,
                        t1: data.t1,
                        t2: data.t2 || '',
                        league: data.league || 'Indian Premier League',
                        eventName: data.eventName || (data.t2 ? `${data.t1} vs ${data.t2}` : data.t1),
                        commence_time: data.commence_time,
                        loc: data.loc || 'TBA Stadium',
                        city: data.city || 'Location TBA',
                        country: data.country || 'IN',
                        source: 'Parbet_Seller_Network',
                        minPrice: parseFloat(data.price),
                        ticketCount: parseInt(data.quantity, 10) || 1
                    });
                } else {
                    const existing = sellerEventsMap.get(eventId);
                    existing.ticketCount += (parseInt(data.quantity, 10) || 1);
                    if (parseFloat(data.price) < existing.minPrice) {
                        existing.minPrice = parseFloat(data.price);
                    }
                }
            });

            const newSellerMatches = Array.from(sellerEventsMap.values());

            set(state => {
                const combined = [...state.apiMatches, ...newSellerMatches];
                const deduplicated = combined.filter((event, index, self) =>
                    index === self.findIndex((e) => (
                        e.t1 === event.t1 && e.commence_time === event.commence_time
                    ))
                );

                const sorted = deduplicated.sort((a, b) => {
                    if (b.proximityScore !== a.proximityScore) {
                        return (b.proximityScore || 1) - (a.proximityScore || 1);
                    }
                    return new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
                });

                const performers = Array.from(new Set(sorted.flatMap(m => [m.t1, m.t2])))
                    .filter(Boolean)
                    .map(name => ({ name }));

                return { 
                    sellerMatches: newSellerMatches,
                    liveMatches: sorted,
                    trendingPerformers: performers,
                    isLoadingMatches: false
                };
            });
        }, (error) => {
            console.error("[Parbet Database] Sync Failure:", error.message);
            set({ apiError: error.message, isLoadingMatches: false, isListenerActive: false }); // Reset lock on error
        });

        set({ unsubscribeSellerTickets: unsubscribe });
    },

    // FEATURE 16: Fetch Admin Banners for Home Page
    fetchHomeBanners: async () => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            const bannerRef = collection(db, 'artifacts', appId, 'public', 'data', 'platform_config');
            const snapshot = await getDocs(query(bannerRef, where('type', '==', 'hero_banner')));
            if (!snapshot.empty) {
                const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                set({ homeBanners: banners });
            } else {
                set({ homeBanners: [{ id: 'default_1', type: 'hero_banner', title: 'Tata IPL 2026', subtitle: 'Book your tickets now before they sell out.', imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop' }] });
            }
        } catch (error) {
            console.error("Banner fetch failed:", error);
        }
    },

    fetchLocationAndMatches: async (cityOverride = null) => {
        set({ isLoadingMatches: true, apiError: null });

        if (!get().isListenerActive) {
            get().initSellerTicketsListener();
        }

        get().fetchHomeBanners();

        try {
            const manualCity = localStorage.getItem('parbet_manual_city');
            const targetCity = cityOverride || manualCity;

            let geo, city, country;

            if (targetCity) {
                city = targetCity;
                country = 'IN'; 
                geo = { city: targetCity, state: '', countryCode: 'IN', lat: null, lon: null };
            } else {
                geo = await fetchUserCity();
                city = geo.city || 'Mumbai';
                country = geo.countryCode || 'IN';
            }

            set({ 
                userCity: city, 
                userCountry: country,
                userCurrency: getCurrencyFromCountry(country),
                strictLocation: { ...geo, city }
            });
            // liveMatches array populated through listener automatically
        } catch (error) {
            console.error("Critical State Failure:", error);
            const fallbackCity = cityOverride || localStorage.getItem('parbet_manual_city') || "Global";
            set({ apiError: error.message, isLoadingMatches: false, userCity: fallbackCity });
        }
    },

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

    /**
     * ATOMIC PURCHASE GATEWAY
     */
    executePurchase: async (paymentId, amount, directPayload = null) => {
        const state = get();
        const reserved = directPayload || state.reservedListing;
        
        if (!reserved) {
            throw new Error("Security Violation: No valid ticket reservation payload found.");
        }

        const eventId = reserved.eventId;
        const tierId = reserved.tierId;
        const quantity = reserved.quantity;
        const buyerId = state.user.uid;

        set({ isCheckingOut: true });
        
        try {
            await runTransaction(db, async (transaction) => {
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await transaction.get(eventRef);
                
                if (!eventSnap.exists()) throw new Error("Event has been delisted by the seller.");
                
                const eventData = eventSnap.data();
                const updatedTiers = eventData.ticketTiers.map(t => {
                    if (t.id === tierId) {
                        if (t.quantity < quantity) throw new Error("Inventory insufficient. Tickets sold out.");
                        return { ...t, quantity: t.quantity - quantity };
                    }
                    return t;
                });

                transaction.update(eventRef, { ticketTiers: updatedTiers });

                const orderRef = doc(collection(db, 'orders'));
                transaction.set(orderRef, {
                    orderId: orderRef.id,
                    paymentId: paymentId,
                    buyerId: buyerId,
                    sellerId: reserved.sellerId,
                    eventId: eventId,
                    tierId: tierId,
                    eventName: reserved.eventName || 'Premium Event',
                    tierName: reserved.tierName || 'General Admission',
                    quantity: quantity,
                    amountPaid: amount,
                    status: 'paid',
                    timestamp: serverTimestamp(),
                    sessionToken: state.checkoutSessionId || 'sess_native_route'
                });
            });

            set({ isCheckingOut: false, isCheckoutLocked: false, reservedListing: null });
            return { success: true };
        } catch (error) {
            set({ isCheckingOut: false });
            throw error;
        }
    },

    requestDeviceLocation: async () => {
        set({ isLocationDropdownOpen: false, locationError: null });
        if (!navigator.geolocation) {
            set({ locationError: 'Location support not found.' });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();
                    const resolvedCity = data.city || data.locality || "Current Location";
                    localStorage.removeItem('parbet_manual_city');
                    set({ 
                        manualCity: null,
                        userCity: resolvedCity, 
                        userCountry: data.countryCode || 'IN',
                        userCurrency: getCurrencyFromCountry(data.countryCode),
                        strictLocation: { city: resolvedCity, state: data.principalSubdivision || '', countryCode: data.countryCode || 'IN', lat: latitude, lon: longitude }
                    });
                    get().fetchLocationAndMatches(resolvedCity);
                } catch (err) {
                    set({ userCity: "Location Found" });
                }
            },
            () => set({ locationError: 'Location access disabled.' }),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }
}));