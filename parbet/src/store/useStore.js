import { create } from 'zustand';
import { fetchRealUpcomingMatches } from '../services/oddsApi';
import { fetchUserCity } from '../services/locationApi';

export const useAppStore = create((set) => ({
    user: null, 
    balance: 0, 
    diamonds: 0,
    hasOnboarded: localStorage.getItem('parbet_onboarded') === 'true',
    isAuthenticated: false,
    isAuthModalOpen: false,
    
    // Real Data States
    liveMatches: [],
    isLoadingMatches: true,
    apiError: null,
    userCity: 'Loading...',

    // New Interactive States
    isLocationDropdownOpen: false,
    locationError: null,
    searchQuery: '',

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
    setLocationError: (errorMsg) => set({ locationError: errorMsg }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Combined Async action for IP Location + Odds (Initial Load)
    fetchLocationAndMatches: async () => {
        set({ isLoadingMatches: true, apiError: null });
        try {
            const [city, matches] = await Promise.all([
                fetchUserCity(),
                fetchRealUpcomingMatches()
            ]);
            set({ userCity: city, liveMatches: matches, isLoadingMatches: false });
        } catch (error) {
            set({ apiError: error.message, isLoadingMatches: false, userCity: "Global" });
        }
    },

    // HTML5 Native Geolocation Request (Triggered by Dropdown)
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
                    // Free reverse geocoding API to convert coordinates to city name
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