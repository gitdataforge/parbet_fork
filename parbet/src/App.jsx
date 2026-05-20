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

// FEATURE: The Supreme Application Interceptor
import FirebaseQuotaBlocker from './components/FirebaseQuotaBlocker';

// FEATURE 19: Security Gatekeeper
import ProtectedRoute from './components/ProtectedRoute';

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
import UserTickets from './pages/Profile/Tickets'; 

// PHASE 9: GOD-MODE ADMIN NODES
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminFinancials from './pages/Admin/Financials';
import AdminEvents from './pages/Admin/Events';
import SupportDesk from './pages/Admin/SupportDesk'; 

// PHASE 20: SELLER NODES
import SellerDashboard from './pages/Seller/Dashboard';
import SellerCreateEvent from './pages/Seller/CreateEvent';

// PHASE 10: CHECKOUT NODES
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/Checkout/Success';

// Dynamic module imports for high-performance routing
const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const dynamicRoutes = Object.keys(pages).map((path) => {
    const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
    return { name, Component: pages[path].default };
});

function MainLayout() {
    const location = useLocation();
    
    // FEATURE: Security Gatekeeper Props & Fullscreen State
    const { isAuthenticated, user, isFullscreenModalOpen } = useMainStore();
    
    // FEATURE 21: High-End UI Controllers
    const { isPremiumAnimationActive, activeBackgroundIllustration, uiThemeColors, activeSectionModules } = useAppStore();
    
    // Strict Route Identification
    const isProfilePath = location.pathname.toLowerCase().startsWith('/profile');
    const isAdminPath = location.pathname.toLowerCase().startsWith('/admin');
    const isSellerPath = location.pathname.toLowerCase().startsWith('/seller');
    
    // FEATURE: Isolation Engine (Hides Header/Footer for immersive auth/checkout pages)
    const isIsolatedPage = ['/event', '/login', '/signup', '/checkout', '/checkout/success'].some(path => 
        location.pathname.toLowerCase().startsWith(path)
    );

    // Route-Based Header Injection
    const isExplorePage = location.pathname.toLowerCase() === '/explore' || location.pathname.toLowerCase().startsWith('/explore/');
    
    // Header Separation Logic: Hide header if isolated, in dashboard, OR if a fullscreen modal is actively open
    const hideGlobalHeader = isIsolatedPage || isProfilePath || isAdminPath || isSellerPath || isFullscreenModalOpen;
    const hideGlobalFooter = isIsolatedPage || isAdminPath || isSellerPath || isFullscreenModalOpen;

    return (
        <InactivityTimeout>
            {/* FEATURE 21: High-End Illustrative SVG Background Engine (Strictly Real-Time Store Driven) */}
            {isPremiumAnimationActive && activeBackgroundIllustration === 'dynamic-particles-svg' && (
                <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#FFFFFF]">
                    <svg className="absolute w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="hero-gradient" cx="50%" cy="0%" r="70%">
                                <stop offset="0%" style={{ stopColor: uiThemeColors.primary, stopOpacity: 0.15 }} />
                                <stop offset="50%" style={{ stopColor: uiThemeColors.accent, stopOpacity: 0.05 }} />
                                <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
                            </radialGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hero-gradient)" />
                        <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                            <circle cx="15%" cy="20%" r="3" fill={uiThemeColors.primary} />
                            <circle cx="85%" cy="30%" r="5" fill={uiThemeColors.secondary} />
                            <circle cx="50%" cy="80%" r="4" fill={uiThemeColors.accent} />
                        </g>
                    </svg>
                </div>
            )}

            <div className="flex flex-col w-full min-h-screen text-[#333333] relative bg-transparent">
                
                {/* REAL-TIME FEATURE SECTION: Premium Escrow Guarantee Header Module */}
                {activeSectionModules?.includes('premium-escrow-guarantee') && !hideGlobalHeader && (
                    <div className="w-full bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-bold tracking-widest uppercase py-2 px-4 flex items-center justify-center shadow-md z-50">
                        <svg className="w-4 h-4 mr-2 text-[#00E676] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        Parbet Premium Escrow Active: All transactions are 100% secured in real-time
                    </div>
                )}

                {/* Route-Based Header Swapping */}
                {!hideGlobalHeader && (
                    isExplorePage ? <ExploreHeader /> : <Header />
                )}
                
                <main className={`flex-1 w-full mx-auto relative z-10 ${(isIsolatedPage || isProfilePath || isAdminPath || isSellerPath || isFullscreenModalOpen) ? '' : 'max-w-[1400px] p-0'}`}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        
                        <Route path="/performer/:id" element={<Performer />} />

                        {/* PHASE 10: CHECKOUT PIPELINE */}
                        <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" replace />} />
                        <Route path="/checkout/success" element={isAuthenticated ? <CheckoutSuccess /> : <Navigate to="/login" replace />} />
                        
                        {/* PHASE 20: STRICT SELLER PIPELINE (Wrapped in Gatekeeper) */}
                        <Route path="/seller/*" element={
                            <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                <Routes>
                                    <Route index element={<SellerDashboard />} />
                                    <Route path="create" element={<SellerCreateEvent />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* PHASE 9: STRICT ADMIN SECURITY PIPELINE (Wrapped in Gatekeeper) */}
                        <Route path="/admin/*" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Routes>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="users" element={<AdminUsers />} />
                                    <Route path="financials" element={<AdminFinancials />} />
                                    <Route path="events" element={<AdminEvents />} />
                                    <Route path="support" element={
                                        // EXTRA LAYER: Verify specific email for Support Desk
                                        user?.email === 'testcodecfg@gmail.com' || user?.email === 'krishnamehta.gm@gmail.com' || user?.email === 'jatinseth.op@gmail.com' || user?.email === 'jachinfotech@gmail.com' 
                                            ? <SupportDesk /> 
                                            : <Navigate to="/admin" replace />
                                    } />
                                </Routes>
                            </ProtectedRoute>
                        } />
                        
                        {/* PROFILE PIPELINE: Appended /* to explicitly permit nested routing */}
                        <Route path="/profile/*" element={isAuthenticated ? <ProfileLayout /> : <Navigate to="/login" replace />}>
                            <Route index element={<Profile />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="listings" element={<Listings />} />
                            <Route path="sales" element={<Sales />} />
                            <Route path="payments" element={<Payments />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="wallet" element={<Wallet />} />
                            <Route path="support" element={<Support />} /> 
                            <Route path="faqs" element={<Faqs />} />       
                            <Route path="tickets" element={<UserTickets />} />
                        </Route>

                        {dynamicRoutes.map(({ name, Component }) => {
                            if (['Home', 'Maintenance', 'Profile', 'Dashboard', 'Performer', 'Admin', 'Checkout', 'Seller', 'Auth'].includes(name)) return null;

                            if (name === 'Dashboard') {
                                return <Route key={name} path={`/dashboard`} element={isAuthenticated ? <Component /> : <Navigate to="/login" replace />} />;
                            }
                            
                            return <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />;
                        })}

                        {/* Fallback to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                
                {!hideGlobalFooter && <Footer />}
                
                {/* Suppress Toast alerts if a fullscreen receipt/ticket is open */}
                {!isFullscreenModalOpen && <LocationToast />}
            </div>
        </InactivityTimeout>
    );
}

export default function App() {
    const isMaintenance = false; 
    
    // FEATURE: The Absolute Interceptor States
    const { hasOnboarded, apiError } = useAppStore();
    const { initAuth, authLoading, isPlatformLocked } = useMainStore(); 

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
                    console.log("Booknshow Fleet Command: New deployment detected. Initiating instant cache-busted reload.");
                    window.location.reload(true);
                }
            }
        }, (error) => {
            if (error.code !== 'permission-denied') {
                console.warn("Booknshow Fleet Command Listener Status:", error.message);
            }
        });

        return () => unsubscribe();
    }, []);

    // FEATURE: THE ABSOLUTE INTERCEPTOR. 
    // Elevated to the absolute root to completely bypass nested trees if a quota breach occurs.
    if (isPlatformLocked || apiError === 'quota-exceeded') {
        return <FirebaseQuotaBlocker />;
    }

    if (isMaintenance) return <Maintenance />;

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#E7364D] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(231,54,77,0.3)]"></div>
                <p className="text-[#626262] font-black text-[12px] uppercase tracking-widest animate-pulse">Securing Booknshow Connection...</p>
            </div>
        );
    }
    
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {!hasOnboarded ? <Onboarding /> : <MainLayout />}
        </BrowserRouter>
    );
}