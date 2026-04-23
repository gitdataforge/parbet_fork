import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    deleteDoc, 
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
    // REAL-TIME LISTENER PIPELINE (CRITICAL FIX - ROOT DB PATHS)
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
                    // 1. Wallet & Profile Listener (Private Data remains in isolated nested path)
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

                    // 2. REAL-TIME LISTINGS (Mapped securely to Root 'events' Collection)
                    const eventsRef = collection(db, 'events');
                    const unsubListings = onSnapshot(query(eventsRef, where('sellerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        set({ listings: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Listings Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubListings);

                    // 3. REAL-TIME SALES (Mapped securely to Root 'orders' Collection)
                    const ordersRef = collection(db, 'orders');
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

                    // 4. REAL-TIME PURCHASES (Mapped securely to Root 'orders' Collection)
                    const unsubOrders = onSnapshot(query(ordersRef, where('buyerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        set({ orders: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Orders Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubOrders);

                    // 5. REAL-TIME TRANSACTIONS/WITHDRAWALS (Mapped securely to Private Path)
                    const withdrawalsRef = collection(db, 'artifacts', appId, 'users', uid, 'withdrawals');
                    const unsubWithdrawals = onSnapshot(withdrawalsRef, (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        set({ transactions: items.sort((a, b) => safeGetTime(b.requestDate) - safeGetTime(a.requestDate)) });
                    }, (err) => {
                        if (err.code !== 'permission-denied') console.error("Withdrawals Sync Error:", err);
                    });
                    newUnsubscribers.push(unsubWithdrawals);

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

            // Ensure legacy writes go to the correct root collection
            const eventsRef = collection(db, 'events');

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

            await addDoc(eventsRef, payload);
            set({ isSubmitting: false });
            return { success: true };
        } catch (error) {
            set({ isSubmitting: false, submitError: error.message });
            throw error;
        }
    },

    // Delete directly from the global events collection
    deleteListing: async (listingId) => {
        await deleteDoc(doc(db, 'events', listingId));
    },

    // FEATURE: Secure Bank/UPI Detail Saving
    saveBankDetails: async (details) => {
        set({ isSubmitting: true, submitError: null });
        try {
            const state = get();
            if (!state.user) throw new Error("Authentication Required");

            const profileRef = doc(db, 'artifacts', appId, 'users', state.user.uid, 'profile', 'data');
            
            // Merging bank details into the highly protected profile user path.
            await setDoc(profileRef, { 
                bankDetails: {
                    ...details,
                    updatedAt: serverTimestamp(),
                    status: 'pending_verification' // Indicates admin needs to review
                }
            }, { merge: true });

            set({ isSubmitting: false });
            return { success: true };
        } catch (error) {
            set({ isSubmitting: false, submitError: error.message });
            throw error;
        }
    },

    // FEATURE: Financial Transaction for Wallet Withdrawal
    requestWithdrawal: async (amount) => {
        set({ isSubmitting: true, submitError: null });
        try {
            const state = get();
            if (!state.user) throw new Error("Authentication Required");

            const uid = state.user.uid;
            const profileRef = doc(db, 'artifacts', appId, 'users', uid, 'profile', 'data');
            const newWithdrawalRef = doc(collection(db, 'artifacts', appId, 'users', uid, 'withdrawals'));

            // Using Firestore Transactions to prevent race conditions during money deduction
            await runTransaction(db, async (transaction) => {
                const profileDoc = await transaction.get(profileRef);
                if (!profileDoc.exists()) {
                    throw new Error("Financial profile not found.");
                }

                const currentBalance = profileDoc.data().balance || 0;
                if (currentBalance < amount) {
                    throw new Error(`Insufficient funds. Available: ${state.currency} ${currentBalance}`);
                }

                const currentPending = profileDoc.data().pendingBalance || 0;
                
                // Deduct from main balance, shift to pending balance
                transaction.update(profileRef, {
                    balance: currentBalance - amount,
                    pendingBalance: currentPending + amount
                });

                // Record the withdrawal request document securely
                transaction.set(newWithdrawalRef, {
                    id: newWithdrawalRef.id,
                    type: 'withdrawal',
                    sellerId: uid,
                    amount: amount,
                    currency: state.currency,
                    status: 'processing',
                    requestDate: serverTimestamp(),
                    bankDetailsSnapshot: profileDoc.data().bankDetails || null,
                    description: `Withdrawal to ${profileDoc.data().bankDetails?.bankName || 'Bank'}`
                });
            });

            set({ isSubmitting: false });
            return { success: true };
        } catch (error) {
            set({ isSubmitting: false, submitError: error.message });
            throw error;
        }
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
    // SECURE ACCOUNT RECOVERY & VERIFICATION
    // ------------------------------------------------------------------
    resetPassword: async (email) => {
        try {
            const sanitizedEmail = email.trim().toLowerCase();
            const VERCEL_API_URL = 'https://parbet-api.vercel.app/api/resetPassword';
            
            const response = await fetch(VERCEL_API_URL, {
                method: 'POST',
                mode: 'cors',
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

    sendVerificationEmail: async (email, name) => {
        try {
            const sanitizedEmail = email.trim().toLowerCase();
            const VERCEL_API_URL = 'https://parbet-api.vercel.app/api/sendVerification';

            const response = await fetch(VERCEL_API_URL, {
                method: 'POST',
                mode: 'cors',
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
        set({ user: null, isAuthenticated: false, listings: [], sales: [], orders: [], transactions: [] });
        auth.signOut(); 
    }
}));