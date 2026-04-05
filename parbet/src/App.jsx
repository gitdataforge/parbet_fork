import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAppStore } from './store/useStore';

import Onboarding from './components/Onboarding';
import AuthModal from './components/AuthModal';
import LocationToast from './components/LocationToast';
import Header from './components/Header';
import ExploreHeader from './components/ExploreHeader';
import Footer from './components/Footer';
import Home from './pages/Home';

// Dynamic module imports for all sub-pages
const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

/**
 * MainLayout handles conditional rendering of navigation elements 
 * based on the 2026 strict routing requirements.
 */
function MainLayout() {
    const location = useLocation();
    
    // Logic 1: Strictly hide global header on all Event detail pages (starts with /event)
    const isEventPage = location.pathname.startsWith('/event');
    const isExplorePage = location.pathname === '/explore';
    
    // Logic 2: Determine which header (if any) to render
    let headerToRender = null;
    if (!isEventPage) {
        headerToRender = isExplorePage ? <ExploreHeader /> : <Header />;
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-brand-bg text-brand-text relative">
            {/* Global Header Mounting with Visibility Logic */}
            {headerToRender}
            
            {/* Main Content Container: 
                - Standard max-width & padding for Home/Explore/Performer
                - Edge-to-edge layout for Event view to accommodate the immersive Map UI
            */}
            <main className={`flex-1 w-full mx-auto ${!isEventPage ? 'max-w-[1400px] p-4 md:p-8' : ''}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {routes.map(({ name, Component }) => {
                        if (name === 'Home') return null;
                        
                        // Performer Deep-Dive Route with ID Parameter
                        if (name === 'Performer') {
                            return <Route key={name} path={`/performer/:id`} element={<Component />} />;
                        }
                        
                        // Standard dynamic routing
                        return <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />;
                    })}
                </Routes>
            </main>
            
            {/* Hide footer on Event pages to maximize map focus and performance */}
            {!isEventPage && <Footer />}
            
            {/* Global Context Overlays */}
            <AuthModal />
            <LocationToast />
        </div>
    );
}

export default function App() {
    const { hasOnboarded, setAuth, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuth(true);
                const userRef = doc(db, 'users', user.uid);
                const unsubWallet = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setWallet(docSnap.data().balance || 0, 0);
                    }
                });
                setLoading(false);
                return () => unsubWallet();
            } else {
                setAuth(false);
                setLoading(false);
            }
        });
        return () => unsubAuth();
    }, [setAuth, setWallet]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <BrowserRouter>
            {/* Strict Onboarding Flow -> Main Application Shell */}
            {!hasOnboarded ? <Onboarding /> : <MainLayout />}
        </BrowserRouter>
    );
}