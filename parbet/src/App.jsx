import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Store Imports
import { useAppStore } from './store/useStore';
import { useMainStore } from './store/useMainStore'; 

// FEATURE: Fleet Command Real-Time Imports
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Structural & Layout Components
import Onboarding from './components/Onboarding';
import LocationToast from './components/LocationToast';
import Header from './components/Header';
import ExploreHeader from './components/ExploreHeader';
import Footer from './components/Footer';
import ProfileLayout from './layouts/ProfileLayout'; 
import InactivityTimeout from './components/InactivityTimeout'; 

// Page Components
import Home from './pages/Home';
import Maintenance from './pages/Maintenance';
import Performer from './pages/Performer'; 

// Profile Standalone Nodes
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
    const { isAuthenticated } = useMainStore();
    
    // FEATURE 1: Strict Route Identification
    const isProfilePath = location.pathname.toLowerCase().startsWith('/profile');
    
    // Detect immersive/standalone pages that require complete global Header/Footer suppression
    const isIsolatedPage = ['/event', '/login', '/signup'].some(path => 
        location.pathname.toLowerCase().startsWith(path)
    );

    // FEATURE 2: Route-Based Header Injection (Mega-Header for Explore)
    const isExplorePage = location.pathname.toLowerCase() === '/explore' || location.pathname.toLowerCase().startsWith('/explore/');
    
    // FEATURE 3: Header Separation Logic
    const hideGlobalHeader = isIsolatedPage || isProfilePath;

    return (
        <InactivityTimeout>
            {/* GLOBAL REBRAND: Changed base background to Wild Sand (#F5F5F5) and text to Ebony Clay (#1F2533) */}
            <div className="flex flex-col w-full min-h-screen bg-[#F5F5F5] text-[#1F2533] relative">
                
                {/* Route-Based Header Swapping */}
                {!hideGlobalHeader && (
                    isExplorePage ? <ExploreHeader /> : <Header />
                )}
                
                <main className={`flex-1 w-full mx-auto ${(isIsolatedPage || isProfilePath) ? '' : 'max-w-[1400px] p-0'}`}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        
                        <Route path="/performer/:id" element={<Performer />} />
                        
                        {/* 1:1 REPLICA: Nested Profile Architecture */}
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

                            // Protect Legacy Dashboard
                            if (name === 'Dashboard') {
                                return <Route key={name} path={`/dashboard`} element={isAuthenticated ? <Component /> : <Navigate to="/login" replace />} />;
                            }
                            
                            return <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />;
                        })}

                        {/* Fallback to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                
                {!isIsolatedPage && <Footer />}
                <LocationToast />
            </div>
        </InactivityTimeout>
    );
}

export default function App() {
    const isMaintenance = false; 
    const { hasOnboarded } = useAppStore();
    const { initAuth, authLoading } = useMainStore(); // Real-time gatekeeper state

    useEffect(() => {
        if (!isMaintenance) {
            initAuth();
        }
    }, [isMaintenance, initAuth]);

    useEffect(() => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
        
        // CRITICAL FIX: Explicitly appending the 6th segment ('latest') to create a valid Document Reference
        const versionRef = doc(db, 'artifacts', appId, 'public', 'data', 'system_version', 'latest');
        
        let currentVersion = null;
        
        const unsubscribe = onSnapshot(versionRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (currentVersion === null) {
                    currentVersion = data.v || '1.0';
                } else if (data.v && data.v !== currentVersion) {
                    // GLOBAL REBRAND: Log update
                    console.log("Booknshow Fleet Command: New deployment detected. Initiating instant cache-busted reload.");
                    window.location.reload(true);
                }
            }
        }, (error) => {
            if (error.code !== 'permission-denied') {
                // GLOBAL REBRAND: Log update
                console.warn("Booknshow Fleet Command Listener Status:", error.message);
            }
        });

        return () => unsubscribe();
    }, []);

    if (isMaintenance) return <Maintenance />;

    if (authLoading) {
        return (
            /* GLOBAL REBRAND: Loader styling changed to Wild Sand / Carnation */
            <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#1F2533] font-bold text-[12px] uppercase tracking-widest">Securing Booknshow Connection...</p>
            </div>
        );
    }
    
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {!hasOnboarded ? <Onboarding /> : <MainLayout />}
        </BrowserRouter>
    );
}