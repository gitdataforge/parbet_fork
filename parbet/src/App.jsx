import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from './store/useStore';

// Static Core Pages
import Home from './pages/Home';
import Discovery from './pages/Discovery';
import TeamFocus from './pages/TeamFocus';

// Auto-imported generated pages (Updated to search inside subdirectories for index.jsx)
const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

export default function App() {
    const { setUser, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try { await signInAnonymously(auth); } 
            catch (e) { console.error("Auth failed", e); }
        };
        initAuth();

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userRef = doc(db, 'users', user.uid);
                const unsubWallet = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setWallet(docSnap.data().balance, docSnap.data().diamonds);
                        setLoading(false);
                    } else {
                        setDoc(userRef, { balance: 3221.00, diamonds: 240, createdAt: serverTimestamp() });
                    }
                });
                return () => unsubWallet();
            }
        });
        return () => unsubAuth();
    }, []);

    if (loading) return <div className="min-h-screen bg-brand-dark text-brand-yellow flex items-center justify-center font-bold animate-pulse-slow">Loading Parbet Engine...</div>;

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="relative w-full max-w-[390px] h-[844px] bg-brand-dark rounded-[40px] shadow-2xl overflow-hidden border-8 border-[#1A1A1A]">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/discovery" element={<Discovery />} />
                        <Route path="/team" element={<TeamFocus />} />
                        {routes.map(({ name, Component }) => (
                            name !== 'Home' && name !== 'Discovery' && name !== 'TeamFocus' &&
                            <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />
                        ))}
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}