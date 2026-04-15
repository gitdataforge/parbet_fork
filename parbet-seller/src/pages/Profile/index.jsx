import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Wallet, 
    Ticket, 
    TrendingUp, 
    ArrowRight, 
    Clock, 
    CheckCircle2, 
    PlusCircle,
    Banknote,
    ChevronRight,
    Loader2,
    ShieldAlert
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';

export default function ProfileOverview() {
    const navigate = useNavigate();
    
    // FEATURE 1: Production-Grade Data Extraction
    // Connects directly to the live Firebase-backed Zustand store
    const { user, walletBalance, listings = [], sales = [], isLoading } = useSellerStore();

    // FEATURE 2: Strict Auth Guard Interceptor
    // Prevents permission-denied crashes by halting execution and redirecting unauthorized users
    useEffect(() => {
        if (!isLoading && !user) {
            console.warn("[Parbet Security] Unauthenticated dashboard access blocked. Redirecting.");
            navigate('/login', { replace: true });
        }
    }, [user, isLoading, navigate]);

    // FEATURE 3: Time-Aware Personalized Greeting
    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // FEATURE 4: Mathematical Inventory & Revenue Engine
    const activeListingsCount = useMemo(() => {
        return listings.filter(l => l.status === 'active').length;
    }, [listings]);

    const lifetimeRevenue = useMemo(() => {
        // Calculates gross revenue from the live orders collection
        return sales.reduce((total, sale) => total + (Number(sale.price * (sale.quantity || 1)) || 0), 0);
    }, [sales]);

    const recentSales = useMemo(() => {
        // Orders the feed by creation timestamp (newest first)
        return [...sales].slice(0, 3);
    }, [sales]);

    // Currency Formatter Utility (INR)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Staggered Animation Definitions
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
    };

    // FEATURE 5: Protected Render Gate
    // Completely blocks UI compilation until Firebase session is fully minted
    if (isLoading || !user) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#1a1a1a] mb-5" size={36} />
                <div className="flex items-center gap-2 text-[13px] font-black text-[#54626c] tracking-widest uppercase bg-[#f8f9fa] px-4 py-2 rounded-full border border-[#e2e2e2]">
                    <ShieldAlert size={14} className="text-[#8cc63f]" />
                    {isLoading ? 'Syncing Secure Ledger...' : 'Authenticating Session...'}
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={container}
            className="w-full font-sans max-w-[1000px] pb-20"
        >
            {/* FEATURE 6: Dynamic Greeting & Quick-List Action */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-[28px] md:text-[36px] font-black text-[#1a1a1a] tracking-tight leading-tight">
                        {greeting}, {user?.displayName || user?.email?.split('@')[0] || 'Seller'}.
                    </h1>
                    <p className="text-[#54626c] text-[15px] mt-1 font-medium">
                        Your marketplace activity is updated in real-time.
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/sell')}
                    className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-black text-white px-6 py-3.5 rounded-[8px] font-bold text-[14px] transition-all shadow-md active:scale-95 shrink-0"
                >
                    <PlusCircle size={18} /> List New Tickets
                </button>
            </motion.div>

            {/* FEATURE 7: Real-Time Performance Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                
                {/* Metric 1: Wallet Balance */}
                <motion.div variants={item} className="bg-white border border-[#e2e2e2] rounded-[12px] p-6 shadow-sm flex flex-col justify-between group hover:border-[#458731] transition-colors">
                    <div>
                        <div className="w-10 h-10 bg-[#eaf4d9] rounded-[8px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Wallet size={20} className="text-[#458731]" />
                        </div>
                        <p className="text-[12px] font-bold text-[#54626c] uppercase tracking-widest mb-1">Available Funds</p>
                        <h2 className="text-[32px] font-black text-[#1a1a1a] tracking-tight">
                            {formatCurrency(walletBalance)}
                        </h2>
                    </div>
                    <button 
                        onClick={() => navigate('/profile/wallet')}
                        className="mt-6 text-[#0064d2] text-[14px] font-bold hover:underline flex items-center"
                    >
                        Manage Wallet <ArrowRight size={16} className="ml-1" />
                    </button>
                </motion.div>

                {/* Metric 2: Live Inventory */}
                <motion.div variants={item} className="bg-white border border-[#e2e2e2] rounded-[12px] p-6 shadow-sm flex flex-col justify-between group hover:border-[#0064d2] transition-colors">
                    <div>
                        <div className="w-10 h-10 bg-[#ebf3fb] rounded-[8px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Ticket size={20} className="text-[#0064d2]" />
                        </div>
                        <p className="text-[12px] font-bold text-[#54626c] uppercase tracking-widest mb-1">Active Listings</p>
                        <h2 className="text-[32px] font-black text-[#1a1a1a] tracking-tight">
                            {activeListingsCount}
                        </h2>
                    </div>
                    <button 
                        onClick={() => navigate('/profile/listings')}
                        className="mt-6 text-[#0064d2] text-[14px] font-bold hover:underline flex items-center"
                    >
                        View Inventory <ArrowRight size={16} className="ml-1" />
                    </button>
                </motion.div>

                {/* Metric 3: Gross Revenue */}
                <motion.div variants={item} className="bg-white border border-[#e2e2e2] rounded-[12px] p-6 shadow-sm flex flex-col justify-between group hover:border-black transition-colors">
                    <div>
                        <div className="w-10 h-10 bg-[#f8f9fa] border border-gray-200 rounded-[8px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} className="text-[#1a1a1a]" />
                        </div>
                        <p className="text-[12px] font-bold text-[#54626c] uppercase tracking-widest mb-1">Lifetime Revenue</p>
                        <h2 className="text-[32px] font-black text-[#1a1a1a] tracking-tight">
                            {formatCurrency(lifetimeRevenue)}
                        </h2>
                    </div>
                    <button 
                        onClick={() => navigate('/profile/sales')}
                        className="mt-6 text-[#0064d2] text-[14px] font-bold hover:underline flex items-center"
                    >
                        View All Sales <ArrowRight size={16} className="ml-1" />
                    </button>
                </motion.div>
            </div>

            {/* FEATURE 8: Live Activity Ledger & Production Empty States */}
            <motion.div variants={item} className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm overflow-hidden">
                <div className="border-b border-[#e2e2e2] px-6 py-5 flex items-center justify-between bg-[#fcfcfc]">
                    <h3 className="text-[15px] font-black text-[#1a1a1a] flex items-center gap-2">
                        <Clock size={18} className="text-[#54626c]" /> Recent Sales Feed
                    </h3>
                    {recentSales.length > 0 && (
                        <button onClick={() => navigate('/profile/sales')} className="text-[13px] font-bold text-[#0064d2] hover:underline">
                            View Historical Records
                        </button>
                    )}
                </div>

                <div className="p-0">
                    {recentSales.length > 0 ? (
                        <div className="divide-y divide-[#e2e2e2]">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f9fdf7]/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#eaf4d9] flex items-center justify-center shrink-0 mt-0.5">
                                            <Banknote size={20} className="text-[#458731]" />
                                        </div>
                                        <div>
                                            <h4 className="text-[16px] font-bold text-[#1a1a1a] mb-0.5">{sale.eventName || 'Sold Event Tickets'}</h4>
                                            <div className="flex items-center gap-2.5 text-[13px] text-[#54626c]">
                                                <span className="font-medium">Order #{sale.id.substring(0, 8).toUpperCase()}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#cccccc]"></span>
                                                <span>{sale.quantity} ticket{sale.quantity > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t border-gray-100 md:border-0 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <div className="text-[17px] font-black text-[#1a1a1a]">+{formatCurrency(sale.price * sale.quantity)}</div>
                                            <div className="text-[11px] font-black text-[#458731] flex items-center justify-end mt-0.5 uppercase tracking-widest">
                                                <CheckCircle2 size={12} className="mr-1" /> Paid to Wallet
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-5 border border-dashed border-gray-300">
                                <TrendingUp size={32} className="text-gray-300" />
                            </div>
                            <h4 className="text-[18px] font-black text-[#1a1a1a] mb-2 tracking-tight">No Market Activity Detected</h4>
                            <p className="text-[15px] text-[#54626c] max-w-sm mb-8 leading-relaxed font-medium">
                                Once your tickets are purchased on the Parbet buyer platform, your real-time earnings will appear here instantly.
                            </p>
                            <button 
                                onClick={() => navigate('/sell')}
                                className="bg-white border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] px-8 py-3 rounded-[8px] font-bold text-[14px] transition-all active:scale-95 shadow-sm"
                            >
                                Start Selling
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}