import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, Lock, Server } from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';

// Dynamic Standalone Page Imports (Page-Level Architecture)
import OverviewPage from './Overview';
import OrdersPage from './Orders';
import ListingsPage from './Listings';
import SalesPage from './Sales';
import SettingsPage from './Settings';
import FaqsPage from './Faqs';
import PaymentsPage from './Payments';
import SupportPage from './Support';
import WalletPage from './Wallet';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 7 Profile Wrapper)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Transparent Page-Level Dynamic Component Hub
 * FEATURE 2: Global Authentication Guard (Failsafe redirection)
 * FEATURE 3: Removed Duplicate UI (Relies entirely on global app layout/sidebar)
 * FEATURE 4: Framer Motion Route Transitions
 * FEATURE 5: Render OverviewPage on Root Route (Fixes redirect bug)
 * FEATURE 6: High-End Hardware-Accelerated Ambient Loading Screen
 * FEATURE 7: Dynamic 10-Section Loading Sequence
 */

// SECTION 1: Illustrative Background Animation
const ProfileAmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#FFFFFF]">
        <motion.div
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#FAD8DC] opacity-30 blur-[100px]"
            animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[#FAD8DC] opacity-20 blur-[120px]"
            animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
    </div>
);

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, authLoading } = useMainStore();
    const [loadingStep, setLoadingStep] = useState(0);

    // Dynamic Loading Text Sequence
    useEffect(() => {
        if (authLoading) {
            const interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % 4);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [authLoading]);

    // Security Failsafe: Kick to home if somehow here unauthenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const loadingMessages = [
        "Verifying Booknshow Credentials...",
        "Establishing Secure Connection...",
        "Syncing Encrypted Ledger...",
        "Decrypting Profile Data..."
    ];

    // Initial load guard with 10 functional sections
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] md:min-h-screen w-full bg-[#FFFFFF] relative overflow-hidden font-sans">
                {/* SECTION 2: Loader Ambient Background */}
                <ProfileAmbientBackground />
                
                {/* SECTION 3: Main Loader Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 flex flex-col items-center bg-[#FFFFFF]/80 backdrop-blur-md p-10 rounded-[24px] shadow-[0_20px_60px_rgba(51,51,51,0.08)] border border-[#A3A3A3]/20 w-[90%] max-w-[400px]"
                >
                    {/* SECTION 4: Brand Logo/Icon */}
                    <div className="w-20 h-20 bg-[#FAD8DC]/30 rounded-full flex items-center justify-center mb-6 border border-[#E7364D]/20 shadow-inner">
                        <Lock size={32} className="text-[#E7364D]" />
                    </div>

                    {/* SECTION 5: Spinner Element */}
                    <Loader2 className="animate-spin text-[#E7364D] mb-6" size={40} />
                    
                    {/* SECTION 6: Primary Status Text */}
                    <h2 className="text-[18px] font-black text-[#333333] mb-2 text-center">
                        Authenticating Session
                    </h2>

                    {/* SECTION 7: Dynamic Subtitle Sequence */}
                    <p className="text-[#626262] font-bold text-[12px] md:text-[13px] uppercase tracking-widest text-center h-5 transition-all">
                        {loadingMessages[loadingStep]}
                    </p>

                    {/* SECTION 8: Simulated Progress Bar */}
                    <div className="w-full h-1.5 bg-[#F5F5F5] rounded-full mt-8 overflow-hidden">
                        <motion.div 
                            className="h-full bg-[#E7364D] rounded-full"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
                        />
                    </div>

                    {/* SECTION 9: Security Badges */}
                    <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-[#A3A3A3]/20 w-full justify-center">
                        <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                            <ShieldCheck size={14} className="text-[#E7364D]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">TLS 256-bit</span>
                        </div>
                        <div className="w-1 h-1 bg-[#A3A3A3]/50 rounded-full"></div>
                        <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                            <Server size={14} className="text-[#E7364D]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Node</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Prevent flash of content before redirect

    // The Profile index is now just a transparent routing wrapper.
    // It assumes your global <App /> or Layout component handles the main navigation sidebar/header.
    return (
        <div className="w-full h-full min-h-[calc(100vh-80px)] bg-[#FFFFFF] relative font-sans">
            <ProfileAmbientBackground />
            
            <AnimatePresence mode="wait">
                {/* SECTION 10: Animated Route Container */}
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full relative z-10"
                >
                    <Routes>
                        {/* Render Overview on the root /profile route instead of redirecting */}
                        <Route path="/" element={<OverviewPage />} />
                        
                        {/* Dynamic Standalone Pages */}
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/listings" element={<ListingsPage />} />
                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/faqs" element={<FaqsPage />} />
                        <Route path="/payments" element={<PaymentsPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        
                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/profile" replace />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}