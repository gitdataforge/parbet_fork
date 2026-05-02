import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck } from 'lucide-react';
import FeedbackTab from '../components/FeedbackTab';
import ProfileHeader from '../components/ProfileHeader'; 

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 7 Profile Layout)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: 1:1 Booknshow UI Clone Header Injection
 * FEATURE 2: Real-time Firebase Identity Extraction & Parsing
 * FEATURE 3: Strict Active State Sidebar Highlighting
 * FEATURE 4: 9-Section Layout Modularity
 */

// Ambient illustrative background specifically for the desktop sidebar
const SidebarAmbientBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[0%] left-[-20%] w-[150%] h-[200px] rounded-full bg-[#FAD8DC] opacity-30 blur-[60px]"
            animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
    </div>
);

export default function ProfileLayout() {
    const location = useLocation();
    
    // Real Identity State Management
    const [userInitials, setUserInitials] = useState('GU');
    const [userDisplayName, setUserDisplayName] = useState('Guest User');

    // FEATURE 2: Real-time Firebase Identity Extraction & Parsing
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Extract real email or display name
                const identifier = user.displayName || user.email || 'Anonymous Seller';
                
                // Format the display name (breaking it into the stacked look)
                setUserDisplayName(identifier.split('@')[0]);

                // Generate initials mathematically
                const nameParts = identifier.replace(/[^a-zA-Z ]/g, " ").trim().split(' ');
                let initials = 'GU';
                if (nameParts.length >= 2) {
                    initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
                } else if (nameParts[0].length >= 2) {
                    initials = (nameParts[0].substring(0, 2)).toUpperCase();
                }
                setUserInitials(initials);
            } else {
                setUserInitials('GU');
                setUserDisplayName('Guest User');
            }
        });

        return () => unsubscribe();
    }, []);

    // Strict Multi-Page Navigation Configuration
    const navLinks = [
        { path: '/profile', label: 'Profile' },
        { path: '/profile/orders', label: 'My Orders' },
        { path: '/profile/listings', label: 'My Listings' },
        { path: '/profile/sales', label: 'My Sales' },
        { path: '/profile/payments', label: 'Payments' },
        { path: '/profile/settings', label: 'Settings' },
        { path: '/profile/wallet', label: 'Wallet' },
        { path: '/profile/support', label: 'Customer Support' },
        { path: '/profile/faqs', label: 'View FAQs' }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#FFFFFF] font-sans relative">
            
            {/* INJECTED PROFILE HEADER */}
            <ProfileHeader />

            {/* Container for Sidebar and Main Content */}
            <div className="flex w-full flex-1 mt-[72px]">
                
                {/* SECTION 1: Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-[260px] bg-[#F5F5F5] border-r border-[#A3A3A3]/20 shrink-0 relative overflow-hidden shadow-[inset_-10px_0_20px_rgba(51,51,51,0.02)]">
                    
                    <SidebarAmbientBackground />
                    
                    {/* SECTION 2: User Identity Block */}
                    <div className="py-12 flex flex-col items-center justify-center border-b border-[#A3A3A3]/20 relative z-10 bg-[#FFFFFF]/60 backdrop-blur-md">
                        <div className="w-[84px] h-[84px] rounded-full bg-[#FFFFFF] border-2 border-[#E7364D]/30 flex items-center justify-center text-[24px] font-black text-[#E7364D] mb-4 tracking-tight shadow-sm">
                            {userInitials}
                        </div>
                        <div className="text-[16px] font-black text-[#333333] text-center px-4 break-words w-full leading-tight">
                            {userDisplayName}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[#A3A3A3]">
                            <ShieldCheck size={14} className="text-[#E7364D]" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Verified Buyer</span>
                        </div>
                    </div>

                    {/* SECTION 3: Profile Navigation Links */}
                    <nav className="flex flex-col py-4 w-full relative z-10 flex-1 bg-transparent">
                        {navLinks.map((link) => {
                            // Strict Active State Matching
                            const isActive = link.path === '/profile' 
                                ? location.pathname === '/profile' || location.pathname === '/profile/'
                                : location.pathname.startsWith(link.path);

                            return (
                                <Link 
                                    key={link.path}
                                    to={link.path}
                                    className={`w-full py-3.5 px-8 text-[15px] transition-all flex items-center justify-between group ${
                                        isActive 
                                        ? 'bg-[#FFFFFF] text-[#E7364D] font-black shadow-[inset_4px_0_0_#E7364D] border-y border-[#A3A3A3]/10' 
                                        : 'text-[#626262] font-medium hover:bg-[#FAD8DC]/20 hover:text-[#333333]'
                                    }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-[#E7364D]"></motion.div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    
                    {/* SECTION 4: Sidebar Footer (Bottom padding) */}
                    <div className="p-6 border-t border-[#A3A3A3]/20 text-center relative z-10">
                        <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Booknshow Secure</span>
                    </div>
                </aside>

                {/* SECTION 5: RESPONSIVE MAIN CONTENT AREA */}
                <main className="flex-1 w-full bg-[#FFFFFF] relative flex flex-col min-h-full overflow-x-hidden">
                    <div className="w-full max-w-[1200px] p-5 md:p-10 mx-auto">
                        
                        {/* FEATURE 4: Framer Motion AnimatePresence for Child Routes */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* The specific page content (Orders, Listings, etc.) renders here dynamically */}
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                        
                    </div>
                </main>
            </div>

            {/* GLOBAL INJECTION: Persistent Real-Time Feedback Tab */}
            <FeedbackTab />
            
        </div>
    );
}