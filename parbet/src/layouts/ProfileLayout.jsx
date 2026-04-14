import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import FeedbackTab from '../components/FeedbackTab';
import ProfileHeader from '../components/ProfileHeader'; // FEATURE 1: Imported the 1:1 Viagogo UI Clone Header

export default function ProfileLayout() {
    const location = useLocation();
    
    // Real Identity State Management
    const [userInitials, setUserInitials] = useState('GU');
    const [userDisplayName, setUserDisplayName] = useState('Guest User');

    // FEATURE 2 & 3: Real-time Firebase Identity Extraction & Parsing
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Extract real email or display name
                const identifier = user.displayName || user.email || 'Anonymous Seller';
                
                // Format the display name (e.g., breaking it into the stacked look from the screenshot)
                setUserDisplayName(identifier.split('@')[0]);

                // Generate initials mathematically (e.g., "Test User" -> "TU", "email@test.com" -> "EM")
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

    // FEATURE 4-12: Strict Multi-Page Navigation Configuration
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
        <div className="flex flex-col w-full min-h-screen bg-white font-sans relative">
            
            {/* INJECTED 1:1 VIAGOGO PROFILE HEADER */}
            <ProfileHeader />

            {/* Container for Sidebar and Main Content */}
            <div className="flex w-full flex-1">
                
                {/* 1:1 REPLICA: Desktop Grey Sidebar (Hidden on Mobile in favor of MobileMenu inside ProfileHeader) */}
                <aside className="hidden md:flex flex-col w-[220px] bg-[#f8f9fa] border-r border-[#e2e2e2] shrink-0">
                    
                    {/* User Identity Block */}
                    <div className="py-10 flex flex-col items-center justify-center border-b border-[#e2e2e2]">
                        <div className="w-[72px] h-[72px] rounded-full bg-[#f0f2f5] flex items-center justify-center text-[22px] font-black text-[#1a1a1a] mb-5 tracking-tight">
                            {userInitials}
                        </div>
                        <div className="text-[15px] font-bold text-[#1a1a1a] text-center px-4 break-words w-full leading-tight">
                            {userDisplayName}
                        </div>
                    </div>

                    {/* Profile Navigation Links */}
                    <nav className="flex flex-col py-4 w-full">
                        {navLinks.map((link) => {
                            // Strict Active State Matching (Exact match for base profile, startsWith for others)
                            const isActive = link.path === '/profile' 
                                ? location.pathname === '/profile' || location.pathname === '/profile/'
                                : location.pathname.startsWith(link.path);

                            return (
                                <Link 
                                    key={link.path}
                                    to={link.path}
                                    className={`w-full py-3.5 px-6 text-[15px] transition-colors ${
                                        isActive 
                                        ? 'bg-[#6fb52c] text-white font-bold' 
                                        : 'text-[#1a1a1a] font-normal hover:bg-[#e2e2e2]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* RESPONSIVE MAIN CONTENT AREA */}
                <main className="flex-1 w-full bg-white relative">
                    <div className="w-full max-w-[1000px] p-5 md:p-8">
                        {/* The specific page content (Orders, Listings, etc.) renders here dynamically */}
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* GLOBAL INJECTION: Persistent Real-Time Feedback Tab */}
            <FeedbackTab />
            
        </div>
    );
}