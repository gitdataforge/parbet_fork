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

// FEATURE 1: Bulletproof Date Parser for Firebase Timestamps
// Prevents the silent sorting crash that breaks the dashboard UI when Firestore returns Timestamp objects or null
const safeGetTime = (val) => {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    return new Date(val).getTime();
};

export const useSellerStore = create((set, get) => ({
    // ------------------------------------------------------------------
    // 1. COMPLEX AUTH STATE MACHINE & SECURITY
    // ------------------------------------------------------------------
    user: null, 
    isAuthenticated: false, 
    authStatus: 'unverified', // unverified -> code_sent -> verified -> password_set
    isSubmitting: false,
    submitError: null,
    isLoading: true, // Master loading state for profile architecture

    // ------------------------------------------------------------------
    // 2. REAL-TIME SELLER LEDGER & INVENTORY (Zero Mock Data)
    // ------------------------------------------------------------------
    walletBalance: 0,
    pendingBalance: 0,
    bankDetails: null,
    listings: [],
    sales: [],
    orders: [],
    payments: [], // Withdrawals/Remittances
    transactions: [], // Combined Sales + Withdrawals ledger
    
    // Listener Cleanup References
    unsubscribers: [],

    // ------------------------------------------------------------------
    // 3. LIVE API STATE (For Global Search & Listing Creation)
    // ------------------------------------------------------------------
    liveMatches: [],
    searchQuery: '',
    isLoadingEvents: false,
    iplEvents: [],
    isLoadingIPLEvents: false,

    // ------------------------------------------------------------------
    // SECURE FIREBASE AUTHENTICATION & LISTENER PIPELINE
    // ------------------------------------------------------------------
    initAuth: () => {
        onAuthStateChanged(auth, async (currentUser) => {
            // Clear previous listeners to prevent memory leaks on user switch
            get().unsubscribers.forEach(unsub => unsub());
            set({ unsubscribers: [], isLoading: true });

            if (currentUser) {
                set({ user: currentUser, isAuthenticated: true, authStatus: 'password_set' });
                
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';
                const uid = currentUser.uid;
                const newUnsubscribers = [];

                try {
                    // 1. Profile & Wallet Listener (Razorpay KYC Status)
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
                            // Failsafe initialization if profile document is missing
                            setDoc(profileRef, { balance: 0, pendingBalance: 0, kycVerified: false, role: 'seller' }, { merge: true });
                        }
                    }, (err) => console.error("Profile Listener Error:", err));
                    newUnsubscribers.push(unsubProfile);

                    // 2. Active Inventory Listener (Listings)
                    const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
                    const unsubListings = onSnapshot(query(ticketsRef, where('sellerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        // FIX: Applied safeGetTime to prevent date-parsing crashes
                        set({ listings: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => console.error("Listings Listener Error:", err));
                    newUnsubscribers.push(unsubListings);

                    // 3. Sales Pipeline Listener
                    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
                    const unsubSales = onSnapshot(query(ordersRef, where('sellerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, type: 'sale', description: `Sold: ${d.data().eventName}`, date: d.data().createdAt || new Date().toISOString(), ...d.data() }));
                        set(state => {
                            // FIX: Applied safeGetTime for robust cross-browser chronological sorting
                            const mergedTx = [...items, ...state.payments].sort((a, b) => safeGetTime(b.date) - safeGetTime(a.date));
                            return { sales: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)), transactions: mergedTx };
                        });
                    }, (err) => console.error("Sales Listener Error:", err));
                    newUnsubscribers.push(unsubSales);

                    // 4. Purchases/Orders Listener
                    const unsubOrders = onSnapshot(query(ordersRef, where('buyerId', '==', uid)), (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        // FIX: Applied safeGetTime
                        set({ orders: items.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt)) });
                    }, (err) => console.error("Orders Listener Error:", err));
                    newUnsubscribers.push(unsubOrders);

                    // 5. Razorpay Payouts/Remittance Listener
                    const payoutsRef = collection(db, 'artifacts', appId, 'users', uid, 'payouts');
                    const unsubPayouts = onSnapshot(payoutsRef, (snapshot) => {
                        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        set(state => {
                            // FIX: Applied safeGetTime
                            const mergedTx = [...state.sales, ...items].sort((a, b) => safeGetTime(b.date) - safeGetTime(a.date));
                            return { payments: items.sort((a, b) => safeGetTime(b.date) - safeGetTime(a.date)), transactions: mergedTx };
                        });
                    }, (err) => console.error("Payouts Listener Error:", err));
                    newUnsubscribers.push(unsubPayouts);

                    set({ unsubscribers: newUnsubscribers, isLoading: false });
                } catch (error) {
                    console.error("Initialization pipeline failed:", error);
                    set({ isLoading: false });
                }
            } else {
                set({ user: null, isAuthenticated: false, authStatus: 'unverified', isLoading: false });
            }
        });
    },

    // ------------------------------------------------------------------
    // MUTATION PIPELINE: Settings, Inventory, and Withdrawals
    // ------------------------------------------------------------------
    
    updateProfileData: async (formData) => {
        const { user } = get();
        if (!user) throw new Error("Unauthorized");
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        
        await updateDoc(userRef, {
            firstName: formData.displayName.split(' ')[0] || '',
            lastName: formData.displayName.split(' ').slice(1).join(' ') || '',
            phone: formData.phone,
            companyName: formData.company,
            gstin: formData.gstin,
            notifications: {
                email: formData.emailNotifications,
                sms: formData.smsNotifications
            },
            updatedAt: serverTimestamp()
        });
    },

    deleteListing: async (listingId) => {
        const { user } = get();
        if (!user) throw new Error("Unauthorized");
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', listingId));
    },

    requestWithdrawal: async (amount) => {
        const { user, walletBalance } = get();
        if (!user) throw new Error("Unauthorized");
        if (amount > walletBalance || amount <= 0) throw new Error("Invalid withdrawal amount");

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        
        const payoutRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'payouts'));

        // Secure Atomic Transaction
        await runTransaction(db, async (transaction) => {
            const profileSnap = await transaction.get(userRef);
            if (!profileSnap.exists()) throw new Error("Profile not found");
            const currentBal = profileSnap.data().balance || 0;
            
            if (currentBal < amount) throw new Error("Insufficient funds");

            transaction.update(userRef, { balance: currentBal - amount });
            transaction.set(payoutRef, {
                amount: amount,
                date: new Date().toISOString(),
                referenceId: 'RZP_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                orderId: 'WD_' + Date.now(),
                status: 'processing',
                type: 'withdrawal',
                description: 'Razorpay IMPS Transfer',
                method: 'bank_transfer'
            });
        });
    },

    // Auth Setters
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => {
        get().unsubscribers.forEach(unsub => unsub());
        set({ 
            user: null, isAuthenticated: false, authStatus: 'unverified',
            listings: [], sales: [], orders: [], payments: [], transactions: [], 
            walletBalance: 0, pendingBalance: 0, unsubscribers: [] 
        });
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
            const events = await aggregateAllEvents({ city: '', state: '', countryCode: 'IN' });
            set({ liveMatches: events, isLoadingEvents: false });
        } catch (error) {
            console.error("Failed to fetch live events:", error);
            set({ isLoadingEvents: false });
        }
    },

    // ------------------------------------------------------------------
    // DEDICATED IPL HYBRID DATA MERGE PIPELINE
    // ------------------------------------------------------------------
    fetchIPLEvents: async () => {
        set({ isLoadingIPLEvents: true });
        try {
            const espnEvents = await aggregateAllEvents({ city: '', state: '', countryCode: 'IN' });
            const espnIPLEvents = espnEvents.filter(event => 
                event.league?.toLowerCase().includes('premier league') ||
                event.league?.toLowerCase().includes('ipl') ||
                event.t1?.toLowerCase().includes('super') || 
                event.t1?.toLowerCase().includes('indians') ||
                event.t1?.toLowerCase().includes('challengers') ||
                event.country === 'IN'
            );

            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
            const customQuery = query(ticketsRef, where('league', '==', 'Indian Premier League'));
            
            const querySnapshot = await getDocs(customQuery);
            const customSellerEvents = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
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

            const combinedEvents = [...espnIPLEvents, ...customSellerEvents];
            const deduplicatedEvents = combinedEvents.filter((event, index, self) =>
                index === self.findIndex((e) => (
                    e.t1 === event.t1 && e.commence_time === event.commence_time
                ))
            );

            deduplicatedEvents.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());

            set({ iplEvents: deduplicatedEvents, isLoadingIPLEvents: false });
        } catch (error) {
            console.error("Failed to fetch merged IPL hybrid data:", error);
            set({ isLoadingIPLEvents: false });
        }
    },

    // ------------------------------------------------------------------
    // SECURE CROSS-APP DATA BRIDGE (Creates Public Listing)
    // ------------------------------------------------------------------
    addEventListing: async (listingData) => {
        set({ isSubmitting: true, submitError: null });
        
        try {
            const state = get();
            if (!state.user) throw new Error("You must be securely authenticated to list tickets on the marketplace.");

            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

            let commenceTimeStr = new Date().toISOString();
            if (listingData.date && listingData.time) {
                commenceTimeStr = new Date(`${listingData.date}T${listingData.time}`).toISOString();
            }

            // FEATURE 2: Deterministic Event ID Generator
            // Automatically generates the unique slug the Main Site expects so your custom tickets link to real event pages
            const rawEventId = `${listingData.t1}-${listingData.t2 || 'event'}-${commenceTimeStr.split('T')[0]}`;
            const deterministicEventId = rawEventId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const payload = {
                eventId: deterministicEventId, // INJECTED FIX: Maps exactly to the public Main Site dynamic router
                sellerId: state.user.uid,
                t1: listingData.t1,
                t2: listingData.t2 || '',
                league: listingData.league || 'Indian Premier League',
                eventName: listingData.t2 ? `${listingData.t1} vs ${listingData.t2}` : listingData.t1,
                commence_time: commenceTimeStr,
                loc: listingData.venue || 'TBA Stadium',
                city: listingData.city || 'Pune',
                country: 'IN', 
                price: parseFloat(listingData.price) || 0,
                quantity: parseInt(listingData.quantity, 10) || 1,
                section: listingData.section || 'General Admission',
                row: listingData.row || 'N/A',
                status: 'active', 
                createdAt: serverTimestamp(),
            };

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