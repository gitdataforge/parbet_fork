import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Ticket, List, IndianRupee, Settings, ChevronRight, UserCircle2 } from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';

// Dynamic Sub-Components (We will create these in the next steps)
import OrdersTab from '../../components/Profile/OrdersTab';
import ListingsTab from '../../components/Profile/ListingsTab';
import SalesTab from '../../components/Profile/SalesTab';
import SettingsTab from '../../components/Profile/SettingsTab';

/**
 * FEATURE 1: Dynamic Component Hub (Routes requests to specific tabs)
 * FEATURE 2: Animated Sidebar Navigation (1:1 Viagogo active states)
 * FEATURE 3: Global Authentication Guard (Failsafe redirection)
 * FEATURE 4: Progressive Tab Hydration
 */

export default function Profile() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { 
        user, 
        isAuthenticated,
        authLoading 
    } = useMainStore();

    // Security Failsafe: Kick to home if somehow here unauthenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Initial load guard
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <Loader2 className="animate-spin text-[#427A1A] mb-4" size={32} />
                <p className="text-[#54626c] font-medium uppercase tracking-widest text-[12px]">Verifying Parbet Credentials</p>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Prevent flash of content before redirect

    // Navigation Menu Configuration
    const navItems = [
        { path: '/profile', label: 'Overview', icon: <UserCircle2 size={18} /> },
        { path: '/profile/orders', label: 'My Orders', icon: <Ticket size={18} /> },
        { path: '/profile/listings', label: 'My Listings', icon: <List size={18} /> },
        { path: '/profile/sales', label: 'My Sales', icon: <IndianRupee size={18} /> },
        { path: '/profile/settings', label: 'Settings', icon: <Settings size={18} /> },
    ];

    // Determine exact path for exact highlighting (handles nested routes)
    const currentPath = location.pathname === '/profile' ? '/profile' : location.pathname;

    return (
        <div className="w-full bg-[#f8f9fa] min-h-[calc(100vh-80px)] flex justify-center pb-20">
            <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 mt-8 flex flex-col md:flex-row gap-8 items-start">
                
                {/* LEFT COLUMN: Sidebar Navigation */}
                <aside className="w-full md:w-[280px] shrink-0 bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm overflow-hidden sticky top-24">
                    
                    {/* User Identity Header */}
                    <div className="p-6 border-b border-[#e2e2e2] bg-[#1a1a1a] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#427A1A] rounded-full flex items-center justify-center text-white text-[24px] font-black shadow-lg mb-3">
                            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2 className="text-white font-bold text-[16px] truncate w-full px-2">
                            {user?.email || 'Anonymous User'}
                        </h2>
                        <span className="bg-white/20 text-white px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest mt-2 border border-white/30">
                            Verified Buyer
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col py-2">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center justify-between px-6 py-4 text-left transition-all ${
                                        isActive 
                                            ? 'bg-[#eaf4d9] border-l-[4px] border-[#427A1A] text-[#114C2A] font-bold' 
                                            : 'bg-transparent border-l-[4px] border-transparent text-[#1a1a1a] font-medium hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`${isActive ? 'text-[#427A1A]' : 'text-[#54626c]'}`}>
                                            {item.icon}
                                        </span>
                                        <span className="text-[14px]">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`${isActive ? 'text-[#427A1A]' : 'text-gray-300'}`} />
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* RIGHT COLUMN: Dynamic Content Router */}
                <main className="flex-1 w-full bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full"
                        >
                            <Routes>
                                {/* Default Overview Tab */}
                                <Route path="/" element={<OverviewTab navigate={navigate} />} />
                                
                                {/* Dynamic Functional Tabs */}
                                <Route path="/orders" element={<OrdersTab />} />
                                <Route path="/listings" element={<ListingsTab />} />
                                <Route path="/sales" element={<SalesTab />} />
                                <Route path="/settings" element={<SettingsTab />} />
                                
                                {/* Catch-all */}
                                <Route path="*" element={<Navigate to="/profile" replace />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>

            </div>
        </div>
    );
}

// Temporary internal component for the root "/profile" overview screen
function OverviewTab({ navigate }) {
    const { orders, wallet } = useMainStore();

    return (
        <div className="p-8">
            <h1 className="text-[24px] font-black text-[#1a1a1a] mb-6 tracking-tight">Account Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Summary Card: Orders */}
                <div className="border border-[#e2e2e2] rounded-[12px] p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Ticket size={20} className="text-blue-600" />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-1">Active Tickets</h3>
                        <p className="text-[28px] font-black text-[#1a1a1a] mb-4">{orders.length}</p>
                    </div>
                    <button onClick={() => navigate('/profile/orders')} className="w-full py-2.5 bg-gray-100 text-[#1a1a1a] text-[13px] font-bold rounded-[8px] hover:bg-gray-200 transition-colors">
                        View Order Details
                    </button>
                </div>

                {/* Summary Card: Wallet */}
                <div className="border border-[#e2e2e2] rounded-[12px] p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <IndianRupee size={20} className="text-green-600" />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-1">Escrow Balance</h3>
                        <p className="text-[28px] font-black text-[#1a1a1a] mb-4">{wallet.currency} {wallet.balance.toLocaleString()}</p>
                    </div>
                    <button onClick={() => navigate('/profile/sales')} className="w-full py-2.5 bg-[#eaf4d9] text-[#427A1A] text-[13px] font-bold rounded-[8px] hover:bg-[#d5edba] transition-colors border border-[#d5edba]">
                        Withdraw Funds
                    </button>
                </div>

            </div>
        </div>
    );
}