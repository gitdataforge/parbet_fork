import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (email !== 'testcodecfg@gmail.com') throw new Error('Unauthorized Access');
      const res = await signInWithEmailAndPassword(auth, email, password);
      set({ user: res.user, isAdmin: true, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null, isAdmin: false });
  },
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