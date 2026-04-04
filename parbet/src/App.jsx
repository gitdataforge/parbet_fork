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

// Dynamic module imports
const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

function MainLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col w-full min-h-screen bg-brand-bg text-brand-text relative">
            {/* Dynamic Header Rendering based on Route */}
            {location.pathname === '/explore' ? <ExploreHeader /> : <Header />}
            
            {/* Main scrollable content area wrapper constrained for ultra-wide monitors */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    {routes.map(({ name, Component }) => (
                        name !== 'Home' && <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />
                    ))}
                </Routes>
            </main>
            <Footer />
            
            {/* Global Overlays & Interceptors */}
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
            {/* Onboarding shows first. Once dismissed, the full site is browsable. Auth required for actions. */}
            {!hasOnboarded ? <Onboarding /> : <MainLayout />}
        </BrowserRouter>
    );
}