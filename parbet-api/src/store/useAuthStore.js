import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';

/**
 * FEATURE: Strict Admin Auth Store
 * This store manages the global identity state for the Parbet API Gateway.
 * It enforces a hardcoded whitelist: Only testcodecfg@gmail.com is granted access.
 */
export const useAuthStore = create((set) => ({
    // ------------------------------------------------------------------
    // CORE STATE
    // ------------------------------------------------------------------
    user: null,
    isAdmin: false,
    loading: true,
    error: null,

    // ------------------------------------------------------------------
    // INITIALIZATION LOGIC
    // ------------------------------------------------------------------
    /**
     * init: Establishes a real-time listener with Firebase Auth.
     * Logic: If a user exists, it strictly validates the email against the admin whitelist.
     */
    init: () => {
        set({ loading: true });
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // STRICT SECURITY GATE: Only the specific admin email is allowed
                const isAuthorized = currentUser.email === 'testcodecfg@gmail.com';
                
                set({ 
                    user: currentUser, 
                    isAdmin: isAuthorized,
                    loading: false,
                    error: isAuthorized ? null : 'Unauthorized Access: Admin privileges required.'
                });

                // Auto-evict unauthorized users
                if (!isAuthorized) {
                    signOut(auth);
                }
            } else {
                set({ user: null, isAdmin: false, loading: false });
            }
        });
        return unsubscribe;
    },

    // ------------------------------------------------------------------
    // AUTHENTICATION ACTIONS
    // ------------------------------------------------------------------
    /**
     * login: Executes secure Firebase authentication.
     * Colors: Logic designed to support the #8cc63f brand green UI states.
     */
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Immediate validation after successful login
            if (user.email !== 'testcodecfg@gmail.com') {
                await signOut(auth);
                throw new Error('Unauthorized Access: This gateway is restricted to administrative accounts.');
            }

            return { success: true };
        } catch (err) {
            let userFriendlyError = 'Failed to authenticate.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                userFriendlyError = 'Invalid administrative credentials.';
            } else {
                userFriendlyError = err.message;
            }
            set({ error: userFriendlyError, loading: false });
            throw new Error(userFriendlyError);
        }
    },

    /**
     * logout: Destroys the session and clears the global state.
     */
    logout: async () => {
        set({ loading: true });
        try {
            await signOut(auth);
            set({ user: null, isAdmin: false, loading: false, error: null });
        } catch (err) {
            set({ error: 'Logout failed.', loading: false });
        }
    },

    /**
     * clearError: Resets the UI error state for fresh login attempts.
     */
    clearError: () => set({ error: null })
}));