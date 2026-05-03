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
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 7 Profile Sales)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Illustrative Ambient Backgrounds
 * FEATURE 2: Real-Time Firestore Sales Ledger Sync
 * FEATURE 3: Dynamic Escrow & Payout Auto-Calculator
 * FEATURE 4: Missing Bank Details Warning Banner (Hooked to Real Store)
 * FEATURE 5: 1:1 Booknshow Enterprise Empty State & Typography
 * FEATURE 6: Advanced Search Indexing (Event Name & Order ID)
 * FEATURE 7: Multi-Dimensional Sort Engine
 * FEATURE 8: Status Badging (Pending Escrow vs Paid Out)
 * FEATURE 9: Cryptographic Order ID Truncation
 * FEATURE 10: Hardware-Accelerated Layout Transitions
 * FEATURE 11: Financial Analytics Sub-Grid
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

// SECTION 1: Ambient Illustrative Background
const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#FAD8DC] opacity-20 blur-[80px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#EB5B6E] opacity-10 blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
);

export default function Sales() {
    const navigate = useNavigate();
    const { user, wallet, bankDetails } = useMainStore();
    
    // Core States
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All sales');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // FEATURE 4: Payout Validation Logic (Hooked to Real Bank Details State)
    const hasPayoutMethod = !!bankDetails;

    // FEATURE 2: Real-Time Live Sales Query
    useEffect(() => {
        if (!user || !user.uid) {
            setIsLoading(false);
            return;
        }

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
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

    // FEATURE 3, 6, 7: Analytics, Searching, and Filtering Engine
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
                (sale.eventName || sale.title || '').toLowerCase().includes(term) ||
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
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full font-sans pb-20 pt-4 relative min-h-screen bg-transparent">
            <AmbientBackground />

            <motion.div 
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="relative z-10 w-full"
            >
                {/* Header */}
                <motion.h1 
                    variants={itemVariants}
                    className="text-[32px] font-black text-[#333333] mb-6 tracking-tight leading-tight px-6 md:px-8"
                >
                    Sales Ledger
                </motion.h1>

                {/* FEATURE 4: Payout Warning Banner */}
                {!hasPayoutMethod && (
                    <motion.div variants={itemVariants} className="px-6 md:px-8 mb-8">
                        <div className="w-full bg-[#FAD8DC]/30 border border-[#E7364D]/30 rounded-[8px] p-5 flex flex-col md:flex-row items-center justify-between shadow-sm">
                            <div className="flex items-center mb-4 md:mb-0">
                                <AlertCircle size={24} className="text-[#E7364D] mr-3 shrink-0" />
                                <div>
                                    <p className="text-[14px] font-black text-[#333333] tracking-wide">Action required: Add Bank Details</p>
                                    <p className="text-[13px] text-[#626262] font-medium mt-0.5">We cannot process your withdrawals until a valid payout method is linked.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/profile/settings')}
                                className="w-full md:w-auto px-6 py-2.5 bg-[#333333] border border-[#333333] rounded-[8px] text-[14px] font-bold text-[#FFFFFF] hover:bg-[#E7364D] hover:border-[#E7364D] transition-colors shadow-sm"
                            >
                                Add Bank Details
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* FEATURE 11: Financial Analytics Dashboard */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 px-6 md:px-8">
                    <div className="bg-[#FFFFFF] p-6 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#333333]"></div>
                        <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1 ml-2">Gross Sales Volume</p>
                        <p className="text-[28px] font-black text-[#333333] ml-2">₹{metrics.totalRevenue.toLocaleString()}</p>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity text-[#333333]"><TrendingUp size={64}/></div>
                    </div>
                    <div className="bg-[#FFFFFF] p-6 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EB5B6E]"></div>
                        <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1 ml-2">Funds in Escrow</p>
                        <p className="text-[28px] font-black text-[#333333] ml-2">₹{metrics.pendingEscrow.toLocaleString()}</p>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity text-[#EB5B6E]"><Clock size={64}/></div>
                    </div>
                    <div className="bg-[#FFFFFF] p-6 rounded-[12px] border border-[#A3A3A3]/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#E7364D]"></div>
                        <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1 ml-2">Completed Payouts</p>
                        <p className="text-[28px] font-black text-[#333333] ml-2">₹{metrics.completedPayouts.toLocaleString()}</p>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity text-[#E7364D]"><Landmark size={64}/></div>
                    </div>
                </motion.div>

                {/* Interactive Sub-Tabs Navigation */}
                <motion.div variants={itemVariants} className="flex border-b border-[#A3A3A3]/20 mb-8 px-6 md:px-8 overflow-x-auto no-scrollbar">
                    {['All sales', 'Open', 'Closed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-2 mr-8 text-[15px] font-black transition-all relative whitespace-nowrap ${
                                activeTab === tab 
                                ? 'text-[#E7364D]' 
                                : 'text-[#626262] hover:text-[#333333]'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="salesTab" className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#E7364D] rounded-t-full"></motion.div>
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Filter & Search Engine */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 mb-10 px-6 md:px-8">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by event or order ID"
                            className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px] text-[14px] text-[#333333] font-medium outline-none focus:bg-[#FFFFFF] focus:border-[#E7364D]/50 transition-colors shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center w-full md:w-auto gap-3">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-auto px-4 py-3 bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[8px] text-[14px] font-bold text-[#333333] outline-none focus:border-[#E7364D]/50 cursor-pointer shadow-sm"
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
                                <div className="w-10 h-10 border-4 border-[#FAD8DC] border-t-[#E7364D] rounded-full animate-spin mb-4"></div>
                                <p className="text-[#626262] font-bold text-[14px] uppercase tracking-widest">Syncing secure ledger...</p>
                            </motion.div>
                        ) : processedSales.length > 0 ? (
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-5"
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
                                                className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] overflow-hidden shadow-[0_4px_20px_rgba(51,51,51,0.03)] hover:shadow-[0_8px_30px_rgba(231,54,77,0.08)] hover:border-[#E7364D]/30 transition-all flex flex-col md:flex-row items-stretch group"
                                            >
                                                <div className={`hidden md:block w-[6px] shrink-0 ${isPaidOut ? 'bg-[#E7364D]' : 'bg-[#EB5B6E]'}`}></div>
                                                
                                                <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="text-[11px] font-mono font-bold text-[#626262] bg-[#F5F5F5] px-2.5 py-1 rounded-[4px] border border-[#A3A3A3]/20">
                                                                    ID: {generateShortHash(sale.paymentId || sale.id)}
                                                                </span>
                                                                <span className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest flex items-center">
                                                                    <Calendar size={14} className="mr-1.5" /> {formatDate(sale.createdAt || sale.eventTimestamp)}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-[20px] font-black text-[#333333] leading-tight mb-2 truncate group-hover:text-[#E7364D] transition-colors">
                                                                {sale.eventName || sale.title || 'Booknshow Event Ticket'}
                                                            </h3>
                                                            <p className="text-[14px] text-[#626262] font-medium">
                                                                Section: <span className="font-bold text-[#333333]">{sale.tierName || sale.tier || 'General'}</span> <span className="mx-2 text-[#A3A3A3]">•</span> Quantity: <span className="font-bold text-[#333333]">{sale.quantity}</span>
                                                            </p>
                                                        </div>

                                                        <div className="mt-5 pt-5 border-t border-[#A3A3A3]/10 flex flex-wrap items-center gap-4">
                                                            {isPaidOut ? (
                                                                <span className="inline-flex items-center text-[12px] font-black uppercase tracking-widest text-[#E7364D] bg-[#FAD8DC]/30 px-3 py-1.5 rounded-[6px] border border-[#E7364D]/20">
                                                                    <CheckCircle2 size={16} className="mr-2" /> Payout Completed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-[12px] font-black uppercase tracking-widest text-[#EB5B6E] bg-[#FAD8DC]/10 px-3 py-1.5 rounded-[6px] border border-[#EB5B6E]/20">
                                                                    <Clock size={16} className="mr-2" /> Funds in Escrow
                                                                </span>
                                                            )}
                                                            <span className="text-[13px] text-[#A3A3A3] hover:text-[#E7364D] font-bold flex items-center cursor-pointer transition-colors ml-auto md:ml-0">
                                                                <FileText size={16} className="mr-1.5" /> View Receipt
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full md:w-[240px] shrink-0 bg-[#F5F5F5] rounded-[8px] border border-[#A3A3A3]/20 p-5 flex flex-col justify-center text-right">
                                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Gross Sale</p>
                                                        <p className="text-[24px] font-black text-[#333333] mb-2">₹{amount.toLocaleString()}</p>
                                                        
                                                        <div className="w-full border-t border-[#A3A3A3]/20 my-3"></div>
                                                        
                                                        <div className="flex flex-col items-end gap-1 text-[13px]">
                                                            {isPaidOut ? (
                                                                <>
                                                                    <span className="text-[#626262] font-medium">Transferred to</span>
                                                                    <span className="text-[#333333] font-bold flex items-center"><Landmark size={14} className="mr-1.5 text-[#E7364D]"/> Bank Account</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-[#626262] font-medium">Expected Payout</span>
                                                                    <span className="text-[#333333] font-bold">Post-Event Verification</span>
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
                                className="text-center py-20 flex flex-col items-center bg-[#FFFFFF] border border-dashed border-[#A3A3A3]/30 rounded-[12px] shadow-sm"
                            >
                                <div className="bg-[#FAD8DC]/30 p-5 rounded-full mb-6 border border-[#E7364D]/20">
                                    <DollarSign size={32} className="text-[#E7364D]" />
                                </div>
                                <h3 className="text-[20px] font-black text-[#333333] mb-3">You don't have any {activeTab !== 'All sales' ? activeTab.toLowerCase() : ''} sales</h3>
                                <p className="text-[14px] text-[#626262] font-medium mb-8 max-w-sm leading-relaxed">
                                    {searchQuery 
                                        ? "We couldn't find any sales matching your search criteria."
                                        : "Completed sales and payout history will appear here once you've fulfilled a buyer's order."}
                                </p>
                                {!searchQuery && (
                                    <button 
                                        onClick={() => navigate('/profile/listings')}
                                        className="text-[#E7364D] font-bold text-[15px] hover:text-[#EB5B6E] flex items-center transition-colors bg-[#FAD8DC]/20 px-6 py-3 rounded-[8px]"
                                    >
                                        View my active listings <ArrowUpRight size={18} className="ml-1.5" />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}