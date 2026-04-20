import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    onSnapshot, 
    getDocs, 
    doc, 
    deleteDoc, 
    updateDoc, 
    runTransaction,
    setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { aggregateAllEvents } from '../services/eventAggregator';

// Retrieve global environment variables (Strict Fallback to Parbet Project ID)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

// FEATURE 1: Bulletproof Date Parser for Firebase Timestamps
const safeGetTime = (val) => {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
};

export const useSellerStore = create((set, get) => ({
    // ------------------------------------------------------------------
    // 1. AUTH & GLOBAL STATE
    // ------------------------------------------------------------------
    user: null, 
    isAuthenticated: false, 
    authStatus: 'unverified',
    isSubmitting: false,
    submitError: null,
    isLoading: true, 

    // FEATURE 2: Multi-Currency Engine State
    currency: 'INR',
    setCurrency: (newCurrency) => set({ currency: newCurrency }),

    // ------------------------------------------------------------------
    // 2. REAL-TIME DATA BUCKETS (Consumable by Profile UI)
    // ------------------------------------------------------------------
    walletBalance: 0,
    pendingBalance: 0,
    bankDetails: null,
    listings: [],
    sales: [],
    orders: [],
    payments: [],
    transactions: [],
    unsubscribers: [],

    // ------------------------------------------------------------------
    // 3. LIVE API & DISCOVERY
    // ------------------------------------------------------------------
    liveMatches: [],
    searchQuery: '',
    isLoadingEvents: false,
    iplEvents: [],
    isLoadingIPLEvents: false,

    // ------------------------------------------------------------------
    // REAL-TIME LISTENER PIPELINE (CRITICAL FIX - STRICT PATHS)
    // ------------------------------------------------------------------
    initAuth: () => {
        onAuthStateChanged(auth, async (currentUser) => {
            // Clean up old listeners to prevent state pollution
            get().unsubscribers.forEach(unsub => unsub());
            set({ unsubscribers: [], isLoading: true });

            if (currentUser) {
                set({ user: currentUser, isAuthenticated: true, authStatus: 'password_set' });
                
                const uid = currentUser.uid;
                const newUnsubscribers = [];

                try {
                    // 1. Wallet & Profile Listener (Private Data)
                    const profileRef = doc(db, 'artifacts', appId, 'users', uid, 'profile', 'data');
                    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            set({ 
                                walletBalance: data.balance || 0,
                                pendingBalance: data.pendingBalance || 0,
                                bankDetails: data.bankDetails || { verified: false, bankName: 'Pending Setup', accountLastFour: '----' }
                            });
                        } else {
                            setDoc(profileRef, { balance: 0, pendingBalance: 0, kycVerified: false, role: 'seller' }, { merge: true });
                        }
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Profile Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubProfile);

                    // 2. REAL-TIME LISTINGS (My Active Tickets - Public Ledger filtered by Seller)
                    const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
                    const unsubListings = onSnapshot(query(ticketsRef, where('sellerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        set({ listings: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Listings Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubListings);

                    // 3. REAL-TIME SALES (Sold Tickets - Public Ledger filtered by Seller)
                    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
                    const unsubSales = onSnapshot(query(ordersRef, where('sellerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ 
                            id: d.id, 
                            type: 'sale', 
                            description: `Sold: ${d.data().eventName || 'Tickets'}`, 
                            date: d.data().createdAt, 
                            ...d.data() 
                        }));
                        set({ sales: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Sales Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubSales);

                    // 4. REAL-TIME PURCHASES (If seller also buys tickets)
                    const unsubOrders = onSnapshot(query(ordersRef, where('buyerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        set({ orders: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Orders Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubOrders);

                    set({ unsubscribers: newUnsubscribers, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                }
            } else {
                set({ user: null, isAuthenticated: false, authStatus: 'unverified', isLoading: false });
            }
        });
    },

    // ------------------------------------------------------------------
    // MUTATION PIPELINE (Secure Firestore Writing)
    // ------------------------------------------------------------------
    addEventListing: async (listingData) => {
        set({ isSubmitting: true, submitError: null });
        try {
            const state = get();
            if (!state.user) throw new Error("Authentication Required");

            const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

            const commenceTimeStr = new Date(`${listingData.date}T${listingData.time}`).toISOString();
            
            // Deterministic ID for Cross-App Sync
            const rawEventId = `${listingData.t1}-${listingData.t2 || 'event'}-${commenceTimeStr.split('T')[0]}`;
            const deterministicEventId = rawEventId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const payload = {
                eventId: deterministicEventId,
                sellerId: state.user.uid,
                t1: listingData.t1,
                t2: listingData.t2 || '',
                league: listingData.league || 'Indian Premier League',
                eventName: listingData.t2 ? `${listingData.t1} vs ${listingData.t2}` : listingData.t1,
                commence_time: commenceTimeStr,
                loc: listingData.venue || 'Wankhede Stadium',
                city: listingData.city || 'Mumbai',
                country: 'IN', 
                price: parseFloat(listingData.price) || 0,
                quantity: parseInt(listingData.quantity, 10) || 1,
                section: listingData.section || 'General Admission',
                row: listingData.row || 'N/A',
                status: 'active', 
                createdAt: serverTimestamp(),
            };

            await addDoc(ticketsRef, payload);
            set({ isSubmitting: false });
            return { success: true };
        } catch (error) {
            set({ isSubmitting: false, submitError: error.message });
            throw error;
        }
    },

    deleteListing: async (listingId) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', listingId));
    },

    fetchLiveEvents: async () => {
        set({ isLoadingEvents: true });
        try {
            const events = await aggregateAllEvents({ city: '', state: '', countryCode: 'IN' });
            set({ liveMatches: events, isLoadingEvents: false });
        } catch (error) {
            set({ isLoadingEvents: false });
        }
    },

    fetchIPLEvents: async () => {
        set({ isLoadingIPLEvents: true });
        try {
            const events = await aggregateAllEvents({ city: '', state: '', countryCode: 'IN' });
            set({ iplEvents: events, isLoadingIPLEvents: false });
        } catch (error) {
            set({ isLoadingIPLEvents: false });
        }
    },

    // ------------------------------------------------------------------
    // SECURE ACCOUNT RECOVERY & VERIFICATION (Strict Vercel API Override)
    // ------------------------------------------------------------------
    resetPassword: async (email) => {
        try {
            // STRICT SANITIZATION: Prevent invisible whitespace errors
            const sanitizedEmail = email.trim().toLowerCase();

            // VERCEL API TARGET: Bypasses Firebase Default Templates completely
            const VERCEL_API_URL = 'https://parbet-api.vercel.app/api/resetPassword';
            
            const response = await fetch(VERCEL_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: sanitizedEmail })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to dispatch secure password reset email via Resend API.');
            }

            return { success: true };
        } catch (error) {
            console.error("Vercel Password Recovery Pipeline Failed:", error);
            throw error;
        }
    },

    // FEATURE: New Vercel Account Verification Pipeline
    sendVerificationEmail: async (email, name) => {
        try {
            const sanitizedEmail = email.trim().toLowerCase();
            const VERCEL_API_URL = 'https://parbet-api.vercel.app/api/sendVerification';

            const response = await fetch(VERCEL_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: sanitizedEmail, name })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to dispatch account verification email via Resend API.');
            }

            return { success: true };
        } catch (error) {
            console.error("Vercel Account Verification Pipeline Failed:", error);
            throw error;
        }
    },

    logout: () => {
        get().unsubscribers.forEach(unsub => unsub());
        set({ user: null, isAuthenticated: false, listings: [], sales: [], orders: [] });
        auth.signOut();
    }
}));