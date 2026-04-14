import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

/**
 * FEATURE: Enterprise Authentication State Manager
 * Handles strict session verification, error parsing, and IAM role assignment.
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,

  // FEATURE: Secure Login Pipeline
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // IAM Validation Boundary
      if (email !== 'testcodecfg@gmail.com') {
        throw new Error('Access Denied: Unrecognized administrative credentials.');
      }
      
      // Firebase Execution
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // State Resolution & UI Unlock
      set({ user: res.user, isAdmin: true, loading: false });
      return res.user;
    } catch (err) {
      // FEATURE: Enterprise Error Parsing
      let errorMessage = 'Authentication failed. Please verify your connection.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Security Firewall: Invalid administrative credentials provided.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Error Trapping
      set({ error: errorMessage, loading: false });
      throw err; // Rethrow to trigger Login.jsx UI interceptor
    }
  },

  // FEATURE: Secure Session Termination
  logout: async () => {
    set({ loading: true });
    await signOut(auth);
    set({ user: null, isAdmin: false, loading: false, error: null });
  },

  // FEATURE: Error State Cleanup
  clearError: () => set({ error: null }),

  // FEATURE: Persistent Session Listener
  init: () => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'testcodecfg@gmail.com') {
        set({ user, isAdmin: true, loading: false });
      } else {
        set({ user: null, isAdmin: false, loading: false });
      }
    });
  }
}));