import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Store Imports
import { useAppStore } from './store/useStore';
import { useMainStore } from './store/useMainStore'; // CRITICAL: Real-time buyer data engine

// FEATURE: Fleet Command Real-Time Imports
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Structural & Layout Components
import Onboarding from './components/Onboarding';
import LocationToast from './components/LocationToast';
import Header from './components/Header';
import ExploreHeader from './components/ExploreHeader';
import Footer from './components/Footer';
import ProfileLayout from './layouts/ProfileLayout'; // Master Profile Wrapper

// Page Components
import Home from './pages/Home';
import Maintenance from './pages/Maintenance';
import Performer from './pages/Performer'; // FEATURE: Explicitly imported to guarantee route registration

// Profile Standalone Nodes (Real-Time Functional Components)
import Profile from './pages/Profile';
import Orders from './pages/Profile/Orders';
import Listings from './pages/Profile/Listings';
import Sales from './pages/Profile/Sales';
import Payments from './pages/Profile/Payments';
import Settings from './pages/Profile/Settings';
import Wallet from './pages/Profile/Wallet';
import Support from './pages/Profile/Support'; 
import Faqs from './pages/Profile/Faqs';       

// Dynamic module imports for high-performance routing
const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const dynamicRoutes = Object.keys(pages).map((path) => {
    const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
    return { name, Component: pages[path].default };
});

function MainLayout() {
    const location = useLocation();
    // FEATURE: Switched to useMainStore for accurate global auth state evaluation
    const { isAuthenticated } = useMainStore();
    
    // FEATURE 1: Strict Route Identification
    // Isolate the profile path to ensure the Global Header doesn't stack on top of the ProfileHeader
    const isProfilePath = location.pathname.toLowerCase().startsWith('/profile');
    
    // Detect immersive/standalone pages that require complete global Header/Footer suppression
    const isIsolatedPage = ['/event', '/login', '/signup'].some(path => 
        location.pathname.toLowerCase().startsWith(path)
    );

    // FEATURE 2: Route-Based Header Injection (Mega-Header for Explore)
    // Strictly isolate the explore path to mount the specialized Viagogo Explore Header
    const isExplorePage = location.pathname.toLowerCase() === '/explore' || location.pathname.toLowerCase().startsWith('/explore/');
    
    // FEATURE 3: Header Separation Logic
    const hideGlobalHeader = isIsolatedPage || isProfilePath;

    return (
        <div className="flex flex-col w-full min-h-screen bg-white text-[#1a1a1a] relative">
            
            {/* The global header is suppressed on /profile, allowing ProfileLayout's ProfileHeader to take over */}
            {/* Route-Based Header Swapping: Explore gets the Mega-Header, standard pages get the normal Header */}
            {!hideGlobalHeader && (
                isExplorePage ? <ExploreHeader /> : <Header />
            )}
            
            {/* ProfileLayout needs full width to render its edge-to-edge replica header */}
            <main className={`flex-1 w-full mx-auto ${(isIsolatedPage || isProfilePath) ? '' : 'max-w-[1400px] p-0'}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    
                    {/* CRITICAL: Formally registered dynamic Performer route for Viagogo Catalog replica */}
                    <Route path="/performer/:id" element={<Performer />} />
                    
                    {/* 1:1 REPLICA: Nested Profile Architecture (Strictly Zero Modals) */}
                    <Route path="/profile" element={isAuthenticated ? <ProfileLayout /> : <Navigate to="/login" replace />}>
                        <Route index element={<Profile />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="listings" element={<Listings />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="wallet" element={<Wallet />} />
                        <Route path="support" element={<Support />} /> 
                        <Route path="faqs" element={<Faqs />} />       
                    </Route>

                    {dynamicRoutes.map(({ name, Component }) => {
                        // Skip pages already handled by static routes or excluded
                        if (['Home', 'Maintenance', 'Profile', 'Dashboard', 'Performer'].includes(name)) return null;

                        // Protect Legacy Dashboard: Redirect to standalone login if unauthorized
                        if (name === 'Dashboard') {
                            return <Route key={name} path={`/dashboard`} element={isAuthenticated ? <Component /> : <Navigate to="/login" replace />} />;
                        }
                        
                        return <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />;
                    })}

                    {/* Fallback to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            
            {/* Profile keeps the global footer like the real Viagogo site */}
            {!isIsolatedPage && <Footer />}
            <LocationToast />
        </div>
    );
}

export default function App() {
    const isMaintenance = false; 
    const { hasOnboarded } = useAppStore();
    const { initAuth, authLoading } = useMainStore(); // Real-time gatekeeper state

    /**
     * FEATURE 1: Master Authentication & Data Link (Unified Gatekeeper)
     * Triggers the useMainStore engine to establish secure websocket listeners.
     */
    useEffect(() => {
        if (!isMaintenance) {
            initAuth();
        }
    }, [isMaintenance, initAuth]);

    /**
     * FEATURE 2: Fleet Command Real-Time Deployment Listener
     * Forces all active buyer browsers to hard-reload and fetch cache-busted files instantly on new deployments.
     */
    useEffect(() => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
        
        // CRITICAL FIX: Explicitly appending the 6th segment ('latest') to create a valid Document Reference
        const versionRef = doc(db, 'artifacts', appId, 'public', 'data', 'system_version', 'latest');
        
        let currentVersion = null;
        
        const unsubscribe = onSnapshot(versionRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (currentVersion === null) {
                    // Initialize baseline version on first load
                    currentVersion = data.v || '1.0';
                } else if (data.v && data.v !== currentVersion) {
                    // Fleet Command Received: Instant global refresh triggered
                    console.log("Fleet Command: New deployment detected. Initiating instant cache-busted reload.");
                    window.location.reload(true);
                }
            }
        }, (error) => {
            // Silently ignore permission transitions during auth handshakes
            if (error.code !== 'permission-denied') {
                console.warn("Fleet Command Listener Status:", error.message);
            }
        });

        return () => unsubscribe();
    }, []);

    if (isMaintenance) return <Maintenance />;

    // Single source of truth loading state from useMainStore gatekeeper
    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#54626c] font-bold text-[12px] uppercase tracking-widest">Securing Connection...</p>
            </div>
        );
    }
    
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {!hasOnboarded ? <Onboarding /> : <MainLayout />}
        </BrowserRouter>
    );
}