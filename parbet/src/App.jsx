import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAppStore } from './store/useStore';
import { Search, User, Menu, Heart, Ticket } from 'lucide-react';

import Onboarding from './components/Onboarding';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';

const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

function DesktopNav() {
    const navigate = useNavigate();
    const { isAuthenticated, openAuthModal } = useAppStore();

    return (
        <div className="w-full bg-white border-b border-brand-border sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <h1 onClick={()=>navigate('/')} className="text-2xl font-black tracking-tighter text-brand-text cursor-pointer">parbet</h1>
                    <div className="hidden md:flex items-center bg-white border border-brand-border rounded-full px-4 py-2.5 w-96 shadow-sm">
                        <Search size={18} className="text-brand-muted mr-3"/>
                        <input type="text" placeholder="Search events, teams and more" className="bg-transparent outline-none flex-1 text-sm text-brand-text placeholder-brand-muted"/>
                    </div>
                </div>
                <div className="hidden md:flex items-center space-x-6 text-sm font-bold text-brand-text">
                    <button onClick={()=>navigate('/')} className="hover:text-brand-primary transition-colors">Explore</button>
                    
                    {isAuthenticated ? (
                        <>
                            <button className="hover:text-brand-primary transition-colors">Sell</button>
                            <button className="hover:text-brand-primary transition-colors">Favourites</button>
                            <button className="hover:text-brand-primary transition-colors">My Bets</button>
                            <div className="flex items-center space-x-3 cursor-pointer border-l border-brand-border pl-6">
                                <span>Profile</span>
                                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center"><User size={16} className="text-white"/></div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-6 border-l border-brand-border pl-6">
                            <button onClick={openAuthModal} className="hover:text-brand-primary transition-colors">Sign In</button>
                            <button onClick={openAuthModal} className="bg-brand-primary text-white px-5 py-2 rounded-full hover:bg-brand-primary/90 transition-colors shadow-sm">Register</button>
                        </div>
                    )}
                </div>
                {/* Mobile Hamburger */}
                <div className="md:hidden flex items-center space-x-4">
                    {isAuthenticated ? (
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center"><User size={16} className="text-white"/></div>
                    ) : (
                        <button onClick={openAuthModal} className="text-sm font-bold text-brand-primary">Sign In</button>
                    )}
                    <Menu size={24} className="text-brand-text"/>
                </div>
            </div>
            {/* Mobile Search Bar below header */}
            <div className="md:hidden px-4 pb-4">
                <div className="flex items-center bg-white border border-brand-border rounded-full px-4 py-2.5 w-full shadow-sm">
                    <Search size={18} className="text-brand-muted mr-3"/>
                    <input type="text" placeholder="Search events, teams..." className="bg-transparent outline-none flex-1 text-sm text-brand-text placeholder-brand-muted"/>
                </div>
            </div>
        </div>
    );
}

function MainLayout() {
    return (
        <div className="flex flex-col w-full min-h-screen bg-brand-bg text-brand-text relative">
            <DesktopNav />
            <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    {routes.map(({ name, Component }) => (
                        name !== 'Home' && <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />
                    ))}
                </Routes>
            </main>
            {/* The Authentication Modal overlay for guest interception */}
            <AuthModal />
        </div>
    );
}

export default function App() {
    const { hasOnboarded, setAuth, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const unsubWallet = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) setWallet(docSnap.data().balance, 0);
                });
                setLoading(false);
                return () => unsubWallet();
            } else {
                setAuth(false);
                setLoading(false);
            }
        });
        return () => unsubAuth();
    }, []);

    if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;
    
    return (
        <BrowserRouter>
            {/* Onboarding shows first. Once dismissed, the full site is browsable. Auth required for actions. */}
            {!hasOnboarded ? <Onboarding /> : <MainLayout />}
        </BrowserRouter>
    );
}