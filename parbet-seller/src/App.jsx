import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSellerStore } from './store/useSellerStore';

// Structural Layout Components
import MainLayout from './layouts/MainLayout'; // FEATURE 1: Imported Main Wrapper
import ProfileLayout from './layouts/ProfileLayout'; 

// Authentication Funnel & Security Guard (FEATURE 2)
import AuthGuard from './components/AuthGuard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import VerifyCode from './pages/Auth/VerifyCode';
import SetPassword from './pages/Auth/SetPassword';

// Core Real-Time Pages
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import IPLHub from './pages/seller/IPLHub'; // The standalone 1:1 Viagogo IPL catalog page
import PerformerEvents from './pages/seller/PerformerEvents'; // FEATURE 3: Dynamic Performer Catalog

// Mobile Standalone Menu Pages
import MobileMenu from './pages/MobileMenu';
import SellMenu from './pages/MobileMenu/SellMenu';

// Profile Architecture
import ProfileOverview from './pages/Profile/index';
import Orders from './pages/Profile/Orders';
import Listings from './pages/Profile/Listings';
import Sales from './pages/Profile/Sales';
import Payments from './pages/Profile/Payments';
import Settings from './pages/Profile/Settings';
import Wallet from './pages/Profile/Wallet';
import Support from './pages/Profile/Support';
import Faqs from './pages/Profile/Faqs';

export default function App() {
    const { initAuth } = useSellerStore();

    // CRITICAL PATH: Securely initialize real Firebase Authentication the millisecond the app loads
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                
                {/* FEATURE 4: Standalone Authentication Funnel */}
                {/* Placed OUTSIDE the MainLayout so Header/Footer do not render */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/verify" element={<VerifyCode />} />
                <Route path="/auth/set-password" element={<SetPassword />} />

                {/* FEATURE 8: Standalone Distraction-Free Listing Flow */}
                {/* Placed OUTSIDE the MainLayout to hide Header/Footer, but protected by AuthGuard */}
                <Route element={<AuthGuard />}>
                    <Route path="/sell" element={<CreateListing />} />
                    <Route path="/create-listing" element={<CreateListing />} />
                </Route>

                {/* FEATURE 5: Primary Application Shell */}
                {/* Placed INSIDE the MainLayout to inherit global Header/Footer */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    
                    {/* Standalone Mobile Navigation Routes */}
                    <Route path="/menu" element={<MobileMenu />} />
                    <Route path="/menu/sell" element={<SellMenu />} />
                    
                    {/* Standalone IPL Hub Page */}
                    <Route path="/ipl" element={<IPLHub />} />

                    {/* FEATURE 6: Dynamic Performer Catalog Route */}
                    <Route path="/sell/performer/:performerName" element={<PerformerEvents />} />

                    {/* Legacy Dashboard Fallback Guard */}
                    <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
                    
                    {/* FEATURE 7: IMPENETRABLE SELLER DASHBOARD (Wrapped in AuthGuard) */}
                    <Route element={<AuthGuard />}>
                        {/* 1:1 Viagogo Zero-Modal Nested Profile Architecture */}
                        <Route path="/profile" element={<ProfileLayout />}>
                            <Route index element={<ProfileOverview />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="listings" element={<Listings />} />
                            <Route path="sales" element={<Sales />} />
                            <Route path="payments" element={<Payments />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="wallet" element={<Wallet />} />
                            <Route path="support" element={<Support />} />
                            <Route path="faqs" element={<Faqs />} />
                        </Route>
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}