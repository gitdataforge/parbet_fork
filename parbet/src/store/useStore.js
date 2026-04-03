import { create } from 'zustand';
export const useAppStore = create((set) => ({
    user: null, balance: 0, diamonds: 0, matches: [],
    setUser: (user) => set({ user }),
    setWallet: (balance, diamonds) => set({ balance, diamonds }),
    setMatches: (matches) => set({ matches }),
}));