import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAppStore } from './store/useStore';

import Onboarding from './components/Onboarding';
import LocationToast from './components/LocationToast';
import Header from './components/Header';
import ExploreHeader from './components/ExploreHeader';
import Footer from './components/Footer';
import Home from './pages/Home';
import Maintenance from './pages/Maintenance';

// Dynamic module imports
const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
    const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
    return { name, Component: pages[path].default };
});

function MainLayout() {
    const location = useLocation();
    const { isAuthenticated } = useAppStore();
    
    // Strict route-matching to detect immersive/standalone pages (Event, Login, Signup)
    const isIsolatedPage = ['/event', '/login', '/signup'].some(path => location.pathname.toLowerCase().startsWith(path));

    return (
        <div className="flex flex-col w-full min-h-screen bg-white text-brand-text relative">
            {/* Dynamic Header Rendering based on Route. Forcefully unmounted on isolated pages. */}
            {!isIsolatedPage && (
                location.pathname === '/explore' ? <ExploreHeader /> : <Header />
            )}
            
            {/* Main scrollable content area. Removes constraints on isolated pages for edge-to-edge layouts. */}
            <main className={`flex-1 w-full mx-auto ${isIsolatedPage ? '' : 'max-w-[1400px] p-4 md:p-8'}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {routes.map(({ name, Component }) => {
                        if (name === 'Home') return null;
                        if (name === 'Maintenance') return null; // Strictly block from dynamic routing
                        
                        // Inject dynamic route parameter strictly for the Performer/League grouping page
                        if (name === 'Performer') {
                            return <Route key={name} path={`/performer/:id`} element={<Component />} />;
                        }

                        // STRICT DASHBOARD ACCESS GATING
                        if (name === 'Dashboard') {
                            return <Route key={name} path={`/dashboard`} element={isAuthenticated ? <Component /> : <Navigate to="/login" replace />} />;
                        }
                        
                        return <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />;
                    })}
                </Routes>
            </main>
            
            {/* Forcefully unmount Footer on isolated pages to maximize immersive height */}
            {!isIsolatedPage && <Footer />}
            
            {/* Global Overlays & Interceptors */}
            <LocationToast />
        </div>
    );
}

export default function App() {
    // MASTER MAINTENANCE TOGGLE
    // Strictly change this to `true` to block the entire application and show the Maintenance page.
    const isMaintenance = false; 

    const { hasOnboarded, setAuth, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        // Strict short-circuit to save Firebase read costs during maintenance
        if (isMaintenance) return;

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // FIXED: 6-segment path (Collection/Doc/Collection/Doc/Collection/Doc)
                const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
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
    }, [setAuth, setWallet, isMaintenance, appId]);

    // STRICT GATING: Immediately return Maintenance mode if active, bypassing all routers and layouts.
    if (isMaintenance) {
        return <Maintenance />;
    }

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