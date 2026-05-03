import { create } from 'zustand';
import { db } from '../lib/firebase';
import { 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';

// Retrieve global environment variables (Strict Fallback to Parbet Project ID)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

// Safe Date Parser
const safeGetTime = (val) => {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
};

export const useAdminStore = create((set, get) => ({
    // --- GLOBAL LEDGER STATE ---
    allUsers: [],
    allOrders: [],
    allEvents: [],
    allWithdrawals: [],
    allPaymentMethods: [],
    
    // --- PLATFORM METRICS ---
    platformMetrics: {
        totalRevenue: 0,
        totalEscrowHold: 0,
        totalPayouts: 0,
        pendingWithdrawalCount: 0,
        activeEventsCount: 0
    },

    isLoadingAdmin: false,
    activeAdminListeners: [],

    // --- ACTIONS ---

    /**
     * FEATURE 1: Secure God-Mode Initialization
     * Strictly fetches the entire Booknshow ledger in real-time.
     */
    initAdminListeners: () => {
        // Clear any existing ghost listeners
        get().stopAdminListeners();
        
        set({ isLoadingAdmin: true });
        const listeners = [];

        try {
            // 1. GLOBAL ORDERS LISTENER
            const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
            const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
                const ordersList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                ordersList.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt));
                
                // Process Global Metrics
                let revenue = 0;
                let escrow = 0;
                let payouts = 0;

                ordersList.forEach(order => {
                    const amount = Number(order.totalAmount || (order.price * order.quantity) || 0);
                    revenue += amount;
                    if (order.status === 'completed' || order.status === 'Paid') {
                        payouts += amount;
                    } else if (order.status !== 'cancelled' && order.status !== 'refunded') {
                        escrow += amount;
                    }
                });

                set((state) => ({ 
                    allOrders: ordersList,
                    platformMetrics: {
                        ...state.platformMetrics,
                        totalRevenue: revenue,
                        totalEscrowHold: escrow,
                        totalPayouts: payouts
                    }
                }));
            });
            listeners.push(unsubOrders);

            // 2. GLOBAL WITHDRAWALS LISTENER (Payout Queue)
            const withdrawalsRef = collection(db, 'artifacts', appId, 'public', 'data', 'withdrawals');
            const unsubWithdrawals = onSnapshot(withdrawalsRef, (snapshot) => {
                const wList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                wList.sort((a, b) => safeGetTime(b.requestedAt) - safeGetTime(a.requestedAt));
                
                const pendingCount = wList.filter(w => w.status === 'Pending').length;
                
                set((state) => ({ 
                    allWithdrawals: wList,
                    platformMetrics: {
                        ...state.platformMetrics,
                        pendingWithdrawalCount: pendingCount
                    }
                }));
            });
            listeners.push(unsubWithdrawals);

            // 3. GLOBAL PAYMENT METHODS LISTENER (Bank/UPI Vault)
            const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payment_methods');
            const unsubPayments = onSnapshot(paymentsRef, (snapshot) => {
                const pList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                set({ allPaymentMethods: pList });
            });
            listeners.push(unsubPayments);

            // 4. GLOBAL EVENTS LISTENER (Inventory Audit) - CRITICAL FIX
            // Re-routed to the absolute root 'events' collection where seller data lives
            const eventsRef = collection(db, 'events');
            const unsubEvents = onSnapshot(eventsRef, (snapshot) => {
                const eList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                
                const now = new Date().getTime();
                const activeCount = eList.filter(e => {
                    const eventTime = safeGetTime(e.commence_time || e.eventTimestamp);
                    return eventTime >= now;
                }).length;

                set((state) => ({ 
                    allEvents: eList,
                    platformMetrics: {
                        ...state.platformMetrics,
                        activeEventsCount: activeCount
                    }
                }));
            });
            listeners.push(unsubEvents);

            // 5. GLOBAL USERS LISTENER
            const usersRef = collection(db, 'users');
            const unsubUsers = onSnapshot(usersRef, (snapshot) => {
                const uList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                set({ allUsers: uList });
            });
            listeners.push(unsubUsers);

            set({ activeAdminListeners: listeners, isLoadingAdmin: false });

        } catch (error) {
            console.error("Critical Failure in Admin Data Engine:", error);
            set({ isLoadingAdmin: false });
        }
    },

    /**
     * FEATURE 2: Process Payout Lifecycle
     * Allows admin to mark a pending withdrawal as processed after transferring funds.
     */
    processWithdrawal: async (withdrawalId, actionStatus) => {
        try {
            const withdrawalRef = doc(db, 'artifacts', appId, 'public', 'data', 'withdrawals', withdrawalId);
            await updateDoc(withdrawalRef, {
                status: actionStatus, // e.g., 'Processed' or 'Rejected'
                processedAt: serverTimestamp(),
                processedBy: 'ADMIN_SYSTEM'
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to process withdrawal:", error);
            throw error;
        }
    },

    /**
     * FEATURE 3: Cleanup Lifecycle
     */
    stopAdminListeners: () => {
        const { activeAdminListeners } = get();
        activeAdminListeners.forEach(unsub => unsub());
        set({ activeAdminListeners: [] });
    }
}));