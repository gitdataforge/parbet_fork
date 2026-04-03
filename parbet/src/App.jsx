import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from './store/useStore';
import { Home as IconHome, Calendar as IconCalendar, Settings as IconSettings } from 'lucide-react';

import Home from './pages/Home';
import Discovery from './pages/Discovery';
import TeamFocus from './pages/TeamFocus';

const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="relative w-full h-full md:w-[390px] md:h-[844px] bg-brand-light md:rounded-[40px] shadow-2xl overflow-hidden md:border-[12px] md:border-[#1A1A1A]">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/team" element={<TeamFocus />} />
                {routes.map(({ name, Component }) => (
                    name !== 'Home' && name !== 'Discovery' && name !== 'TeamFocus' &&
                    <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />
                ))}
            </Routes>
            
            {/* Floating Black Bottom Nav */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#111] rounded-full p-2 flex items-center space-x-2 z-50 shadow-2xl">
                <button onClick={() => navigate('/')} className={`p-3 rounded-full flex items-center space-x-2 transition-all ${location.pathname === '/' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'}`}>
                    <IconHome size={20} />
                    {location.pathname === '/' && <span className="text-xs font-bold pr-2">Schedule</span>}
                </button>
                <button onClick={() => navigate('/discovery')} className={`p-3 rounded-full flex items-center space-x-2 transition-all ${location.pathname === '/discovery' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'}`}>
                    <IconCalendar size={20} />
                    {location.pathname === '/discovery' && <span className="text-xs font-bold pr-2">Calendar</span>}
                </button>
                <button onClick={() => navigate('/settings')} className={`p-3 rounded-full flex items-center space-x-2 transition-all ${location.pathname.startsWith('/settings') ? 'bg-white text-black' : 'text-white hover:bg-gray-800'}`}>
                    <IconSettings size={20} />
                    {location.pathname.startsWith('/settings') && <span className="text-xs font-bold pr-2">Settings</span>}
                </button>
            </div>
        </div>
    );
}

export default function App() {
    const { setUser, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try { await signInAnonymously(auth); } catch (e) { console.error("Auth failed", e); }
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

    if (loading) return <div className="min-h-screen bg-brand-light text-brand-primary flex items-center justify-center font-bold animate-pulse-slow">Loading Environment...</div>;

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center md:p-8">
                <MainLayout />
            </div>
        </BrowserRouter>
    );
}