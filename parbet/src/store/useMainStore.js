import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
    collection, 
    onSnapshot, 
    doc, 
    setDoc, 
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { 
    signInAnonymously, 
    onAuthStateChanged, 
    signInWithCustomToken
} from 'firebase/auth';

// Retrieve global environment variables (Strict Fallback to Parbet Project ID)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

// Safe Date Parser to prevent sorting crashes on varying Timestamp formats
const safeGetTime = (val) => {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
};

export const useMainStore = create((set, get) => ({
    // --- STATE ---
    user: null,
    isAuthenticated: false,
    authLoading: true, // Gatekeeper starts in locked mode

    // Real-time Data
    orders: [],
    isLoadingOrders: false,
    
    wallet: { balance: 0, currency: 'INR' },
    isLoadingWallet: false,

    // Internal listener cleanup registry
    activeListeners: [],

    // --- ACTIONS ---

    /**
     * FEATURE 1: Secure Authentication Initialization (Gatekeeper)
     * This is the master lock. It prevents any data sync until a valid UID is granted.
     */
    initAuth: async () => {
        set({ authLoading: true });
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // LOCK RELEASED: Valid identity confirmed
                set({ user, isAuthenticated: true, authLoading: false });
                
                // TRIGGER: Start data pipeline now that permissions are granted
                get().startDataListeners(user.uid);
            } else {
                // If no user, perform auto-login to get a UID
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                    // onAuthStateChanged will fire again with the new user
                } catch (error) {
                    console.error("Critical Auth Handshake Error:", error);
                    set({ authLoading: false });
                }
            }
        });
    },

    /**
     * FEATURE 2 & 3: Real-Time Data Synchronization (Guarded)
     * RULE: Strictly returns immediately if userId is missing.
     */
    startDataListeners: (userId) => {
        // SECURITY GATEKEEPER: Prevent premature Firestore access
        if (!userId) {
            console.warn("Gatekeeper: Blocked Firestore access - User ID missing.");
            return;
        }

        // Stop any existing listeners to prevent memory leaks or duplicate streams
        get().stopListeners();

        const listeners = [];

        // 1. ORDERS LISTENER (Strict Path: /artifacts/appId/public/data/orders)
        set({ isLoadingOrders: true });
        const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const ordersQuery = query(ordersRef, where('buyerId', '==', userId));
        
        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            const ordersList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            ordersList.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt));
            set({ orders: ordersList, isLoadingOrders: false });
        }, (error) => {
            // Silently handle auth-transition errors during re-auth
            if (error.code !== 'permission-denied') {
                console.error("Orders sync failed:", error);
            } else {
                console.warn("Orders sync permission denied. Awaiting auth stabilization.");
            }
            set({ isLoadingOrders: false });
        });
        listeners.push(unsubOrders);

        // 2. WALLET LISTENER (Private Doc: /artifacts/appId/users/userId/wallet/main)
        set({ isLoadingWallet: true });
        const walletDocRef = doc(db, 'artifacts', appId, 'users', userId, 'wallet', 'main');
        
        const unsubWallet = onSnapshot(walletDocRef, (snap) => {
            if (snap.exists()) {
                set({ wallet: snap.data(), isLoadingWallet: false });
            } else {
                // Feature: Auto-provision wallet for new users securely
                setDoc(walletDocRef, { 
                    balance: 0, 
                    currency: 'INR', 
                    lastUpdated: serverTimestamp() 
                });
                set({ isLoadingWallet: false });
            }
        }, (error) => {
            if (error.code !== 'permission-denied') {
                console.error("Wallet sync failed:", error);
            }
            set({ isLoadingWallet: false });
        });
        listeners.push(unsubWallet);

        set({ activeListeners: listeners });
    },

    /**
     * FEATURE 4: Lifecycle Cleanup
     */
    stopListeners: () => {
        const { activeListeners } = get();
        activeListeners.forEach(unsub => unsub());
        set({ activeListeners: [] });
    },

    /**
     * FEATURE 5: Secure Password Recovery via Vercel Micro-Backend
     */
    resetPassword: async (email) => {
        try {
            // Update this URL if your Vercel production domain differs
            const VERCEL_API_URL = 'https://parbet-api.vercel.app/api/resetPassword';
            
            const response = await fetch(VERCEL_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to dispatch secure password reset email.');
            }

            return { success: true };
        } catch (error) {
            console.error("Password recovery failed:", error);
            throw error;
        }
    },

    /**
     * FEATURE 6: Secure Sign Out
     */
    logout: async () => {
        get().stopListeners();
        await auth.signOut();
        set({ 
            user: null, 
            isAuthenticated: false, 
            orders: [], 
            wallet: { balance: 0, currency: 'INR' },
            authLoading: true // Re-lock the gatekeeper
        });
    }
}));