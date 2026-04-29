import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IndianRupee, TrendingUp, Calendar, Search, 
    CheckCircle2, Clock, AlertCircle, ArrowUpRight, 
    FileText, Landmark, ChevronDown, DollarSign
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useMainStore } from '../../store/useMainStore';

/**
 * FEATURE 1: Real-Time Firestore Sales Ledger Sync
 * FEATURE 2: Dynamic Escrow & Payout Auto-Calculator
 * FEATURE 3: Missing Payout Method Warning Banner
 * FEATURE 4: 1:1 Viagogo Enterprise Empty State & Typography
 * FEATURE 5: Advanced Search Indexing (Event Name & Order ID)
 * FEATURE 6: Multi-Dimensional Sort Engine
 * FEATURE 7: Status Badging (Pending Escrow vs Paid Out)
 * FEATURE 8: Cryptographic Order ID Truncation
 * FEATURE 9: Hardware-Accelerated Layout Transitions
 * FEATURE 10: Financial Analytics Sub-Grid
 * FEATURE 11: Failsafe Loading States
 */

const formatDate = (timestamp) => {
    if (!timestamp) return 'Date TBA';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(d)) return 'Date TBA';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const generateShortHash = (id) => {
    if (!id) return '00000000';
    return id.substring(0, 8).toUpperCase();
};

export default function Sales() {
    const navigate = useNavigate();
    const { user, wallet } = useMainStore();
    
    // Core States
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All sales');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // FEATURE 3: Payout Validation Logic
    const hasPayoutMethod = wallet?.payoutMethodLinked || false;

    // FEATURE 1: Real-Time Live Sales Query
    useEffect(() => {
        if (!user || !user.uid) {
            setIsLoading(false);
            return;
        }

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        
        // Query orders where the current user is the seller
        const q = query(ordersRef, where('sellerId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSales = [];
            snapshot.forEach((doc) => {
                fetchedSales.push({ id: doc.id, ...doc.data() });
            });
            setSales(fetchedSales);
            setIsLoading(false);
        }, (error) => {
            console.error("Secure Sales Sync Error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // FEATURE 2, 5, 6: Analytics, Searching, and Filtering Engine
    const { processedSales, metrics } = useMemo(() => {
        let totalRevenue = 0;
        let pendingEscrow = 0;
        let completedPayouts = 0;

        // Base filter by tab & calculate global metrics
        let filtered = sales.filter(sale => {
            const amount = Number(sale.totalAmount || sale.price * sale.quantity || 0);
            totalRevenue += amount;
            
            const isCompleted = sale.status === 'completed' || sale.payoutStatus === 'paid' || sale.status === 'Paid';

            if (isCompleted) {
                completedPayouts += amount;
            } else {
                pendingEscrow += amount;
            }

            if (activeTab === 'Open') return !isCompleted;
            if (activeTab === 'Closed') return isCompleted;
            return true; // 'All sales'
        });

        // Search Filter
        if (searchQuery) {
            const term = searchQuery.toLowerCase();
            filtered = filtered.filter(sale => 
                (sale.eventName || '').toLowerCase().includes(term) ||
                (sale.paymentId || sale.id || '').toLowerCase().includes(term)
            );
        }

        // Sort Engine
        filtered.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (new Date(a.createdAt || 0).getTime());
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (new Date(b.createdAt || 0).getTime());
            
            if (sortBy === 'newest') return dateB - dateA;
            if (sortBy === 'oldest') return dateA - dateB;
            
            const valA = Number(a.totalAmount || a.price * a.quantity || 0);
            const valB = Number(b.totalAmount || b.price * b.quantity || 0);
            if (sortBy === 'highest') return valB - valA;
            
            return 0;
        });

        return { 
            processedSales: filtered, 
            metrics: { totalRevenue, pendingEscrow, completedPayouts } 
        };
    }, [sales, activeTab, searchQuery, sortBy]);

    // Animation Configurations
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1000px] pb-20 pt-2"
        >
            {/* Header */}
            <motion.h1 
                variants={itemVariants}
                className="text-[32px] font-black text-[#1a1a1a] mb-6 tracking-tighter leading-tight px-6 md:px-8"
            >
                Sales
            </motion.h1>

            {/* Payout Warning Banner */}
            {!hasPayoutMethod && (
                <motion.div variants={itemVariants} className="px-6 md:px-8 mb-8">
                    <div className="w-full bg-[#fff4e5] border border-[#ffcc80] rounded-[4px] p-4 flex flex-col md:flex-row items-center justify-between shadow-sm">
                        <div className="flex items-center mb-4 md:mb-0">
                            <AlertCircle size={24} className="text-[#f57c00] mr-3 shrink-0" />
                            <p className="text-[14px] font-bold text-[#1a1a1a]">Action required: Add payout method</p>
                        </div>
                        <button 
                            onClick={() => navigate('/profile/settings')}
                            className="w-full md:w-auto px-5 py-2.5 bg-white border border-[#1a1a1a] rounded-[4px] text-[14px] font-bold text-[#1a1a1a] hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
                        >
                            Add Payout Method
                        </button>
                    </div>
                </motion.div>
            )}

            {/* FEATURE 10: Financial Analytics Dashboard */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 px-6 md:px-8">
                <div className="bg-white p-5 rounded-[4px] border border-[#e2e2e2] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Sales Volume</p>
                    <p className="text-[24px] font-black text-[#1a1a1a]">₹{metrics.totalRevenue.toLocaleString()}</p>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-blue-500"><TrendingUp size={48}/></div>
                </div>
                <div className="bg-white p-5 rounded-[4px] border border-[#e2e2e2] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Funds in Escrow</p>
                    <p className="text-[24px] font-black text-[#1a1a1a]">₹{metrics.pendingEscrow.toLocaleString()}</p>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-orange-500"><Clock size={48}/></div>
                </div>
                <div className="bg-white p-5 rounded-[4px] border border-[#e2e2e2] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#427A1A]"></div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Completed Payouts</p>
                    <p className="text-[24px] font-black text-[#1a1a1a]">₹{metrics.completedPayouts.toLocaleString()}</p>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-[#427A1A]"><Landmark size={48}/></div>
                </div>
            </motion.div>

            {/* Interactive Sub-Tabs Navigation */}
            <motion.div variants={itemVariants} className="flex border-b border-[#e2e2e2] mb-8 px-6 md:px-8 overflow-x-auto no-scrollbar">
                {['All sales', 'Open', 'Closed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-1 mr-8 text-[15px] font-bold transition-all border-b-2 whitespace-nowrap ${
                            activeTab === tab 
                            ? 'border-[#458731] text-[#458731]' 
                            : 'border-transparent text-[#54626c] hover:text-[#1a1a1a]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </motion.div>

            {/* Filter & Search Engine */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 mb-10 px-6 md:px-8">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by event or order ID"
                        className="w-full pl-10 pr-4 py-2.5 border border-[#cccccc] rounded-[4px] text-[15px] outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-all bg-white shadow-sm"
                    />
                </div>
                
                <div className="flex items-center w-full md:w-auto gap-3">
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 border border-[#cccccc] rounded-[4px] flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-[14px] font-medium text-[#1a1a1a] outline-none focus:border-[#458731] cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Amount</option>
                    </select>
                </div>
            </motion.div>

            {/* Dynamic Empty State vs List Logic */}
            <div className="px-6 md:px-8">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24"
                        >
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#427A1A] rounded-full animate-spin mb-4"></div>
                            <p className="text-[#54626c] font-medium text-[15px]">Syncing secure financial ledger...</p>
                        </motion.div>
                    ) : processedSales.length > 0 ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <AnimatePresence>
                                {processedSales.map((sale) => {
                                    const isPaidOut = sale.status === 'completed' || sale.payoutStatus === 'paid' || sale.status === 'Paid';
                                    const amount = Number(sale.totalAmount || sale.price * sale.quantity || 0);

                                    return (
                                        <motion.div 
                                            key={sale.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                            className="bg-white border border-[#e2e2e2] rounded-[4px] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-stretch"
                                        >
                                            <div className={`hidden md:block w-[4px] shrink-0 ${isPaidOut ? 'bg-[#427A1A]' : 'bg-[#f57c00]'}`}></div>
                                            
                                            <div className="flex-1 p-5 flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                                Order #{generateShortHash(sale.paymentId || sale.id)}
                                                            </span>
                                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                                                <Calendar size={12} className="mr-1" /> {formatDate(sale.createdAt || sale.eventTimestamp)}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-[16px] font-black text-[#1a1a1a] leading-tight mb-1 truncate">
                                                            {sale.eventName || sale.title || 'Parbet Event Ticket'}
                                                        </h3>
                                                        <p className="text-[13px] text-[#54626c] font-medium">
                                                            Section: {sale.tierName || sale.tier || 'General'} • Qty: {sale.quantity}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                                                        {isPaidOut ? (
                                                            <span className="inline-flex items-center text-[12px] font-bold text-[#427A1A] bg-[#eaf4d9] px-2.5 py-1 rounded border border-[#d4edda]">
                                                                <CheckCircle2 size={14} className="mr-1.5" /> Payout Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[12px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
                                                                <Clock size={14} className="mr-1.5" /> Funds in Escrow
                                                            </span>
                                                        )}
                                                        <span className="text-[12px] text-[#0064d2] font-bold flex items-center cursor-pointer hover:underline transition-colors">
                                                            <FileText size={14} className="mr-1.5" /> View Receipt
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-[220px] shrink-0 bg-[#f8f9fa] rounded border border-[#e2e2e2] p-4 flex flex-col justify-center text-right">
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Gross Sale</p>
                                                    <p className="text-[20px] font-black text-[#1a1a1a] mb-1">₹{amount.toLocaleString()}</p>
                                                    
                                                    <div className="w-full border-t border-gray-200 my-2"></div>
                                                    
                                                    <div className="flex flex-col items-end gap-1 text-[12px]">
                                                        {isPaidOut ? (
                                                            <>
                                                                <span className="text-gray-500 font-medium">Transferred to</span>
                                                                <span className="text-[#1a1a1a] font-bold flex items-center"><Landmark size={12} className="mr-1"/> Bank Account</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-gray-500 font-medium">Expected Payout</span>
                                                                <span className="text-[#1a1a1a] font-bold">Post-Event Verification</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 flex flex-col items-center bg-white border border-dashed border-[#cccccc] rounded-[8px]"
                        >
                            <div className="bg-[#f8f9fa] p-5 rounded-full mb-6 border border-[#e2e2e2]">
                                <DollarSign size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">You don't have any {activeTab !== 'All sales' ? activeTab.toLowerCase() : ''} sales</h3>
                            <p className="text-[15px] text-[#54626c] mb-8 max-w-sm leading-relaxed">
                                {searchQuery 
                                    ? "We couldn't find any sales matching your search criteria."
                                    : "Completed sales and payout history will appear here once you've fulfilled a buyer's order."}
                            </p>
                            {!searchQuery && (
                                <button 
                                    onClick={() => navigate('/profile/listings')}
                                    className="text-[#0064d2] font-bold text-[15px] hover:underline flex items-center"
                                >
                                    View my active listings <ArrowUpRight size={16} className="ml-1" />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}