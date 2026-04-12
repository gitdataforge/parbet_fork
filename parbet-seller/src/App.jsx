import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSellerStore } from './store/useSellerStore';

// Structural Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Core Real-Time Pages
import Home from './pages/Home';
import Dashboard from './pages/seller/Dashboard';
import CreateListing from './pages/CreateListing';
import IPLHub from './pages/seller/IPLHub'; // The new standalone 1:1 Viagogo IPL catalog page

export default function App() {
    const { initAuth } = useSellerStore();

    // CRITICAL PATH: Securely initialize real Firebase Authentication the millisecond the app loads
    // This permanently resolves the infinite "Processing..." hang by granting the app a real UID
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {/* Base shell matching the pristine white aesthetic of the Viagogo seller portal */}
            <div className="min-h-screen bg-white flex flex-col font-sans text-[#1a1a1a]">
                
                {/* 1:1 Replica Seller Header */}
                <Header />
                
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        
                        {/* Standalone IPL Hub Page (Strictly Zero Modals) */}
                        <Route path="/ipl" element={<IPLHub />} />
                        
                        {/* Route to the real-time tracking dashboard */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Map both legacy and new routing pathways directly to the real-time API listing flow */}
                        <Route path="/sell" element={<CreateListing />} />
                        <Route path="/create-listing" element={<CreateListing />} />
                    </Routes>
                </main>
                
                {/* 1:1 Replica 4-Column Footer */}
                <Footer />
                
            </div>
        </BrowserRouter>
    );
}