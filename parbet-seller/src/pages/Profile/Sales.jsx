import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DollarSign, 
    Search, 
    Calendar, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    FileDown, 
    ChevronDown, 
    Filter,
    ShoppingBag,
    Receipt,
    ExternalLink,
    HelpCircle,
    ShieldAlert,
    Loader2 
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useSellerStore } from '../../store/useSellerStore';
import { exportSalesToExcel } from '../../utils/excelExporter';

// Retrieve global environment variables securely
const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

export default function Sales() {
    // FEATURE 1: Secure Identity & Role Verification
    const { user, sales: storeSales, isLoading: storeIsLoading, currency } = useSellerStore();
    const isAdmin = user?.email === 'testcodecfg@gmail.com';

    // FEATURE 2: Admin God-Mode Real-Time Sync & Graceful Error Handling
    const [adminSales, setAdminSales] = useState([]);
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [syncError, setSyncError] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            setIsAdminLoading(true);
            setSyncError(null);
            
            // CRITICAL FIX: Migrated query to secured Canvas Artifacts Path
            const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
            
            const unsub = onSnapshot(q, (snap) => {
                const allOrders = snap.docs.map(d => ({
                    id: d.id,
                    type: 'sale',
                    ...d.data()
                }));
                setAdminSales(allOrders);
                setIsAdminLoading(false);
            }, (error) => {
                // Graceful UI Error Handling
                console.error("Admin God-Mode Sync Error:", error);
                setSyncError(error.message || 'Missing or insufficient permissions.');
                setIsAdminLoading(false);
            });
            return () => unsub();
        }
    }, [isAdmin]);

    // Data Pipeline Routing
    const activeSales = isAdmin ? adminSales : storeSales;
    const isLoading = isAdmin ? isAdminLoading : storeIsLoading;

    // Dynamic Currency Symbol Resolver
    const getCurrencySymbol = (code) => {
        switch(code) {
            case 'USD': return '$';
            case 'GBP': return '£';
            case 'EUR': return '€';
            case 'AUD': return 'A$';
            case 'INR': 
            default: return '₹';
        }
    };
    const currencySymbol = getCurrencySymbol(currency || 'INR');

    // FEATURE 3: Complex State Management for Financial Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('All time');
    const [expandedSaleId, setExpandedSaleId] = useState(null);

    // FEATURE 4: Multi-Conditional Sales Filter & Search Engine
    const filteredSales = useMemo(() => {
        return activeSales.filter(sale => {
            const searchTarget = `${sale.eventName || ''} ${sale.id || ''} ${sale.sellerEmail || ''}`;
            const matchesSearch = searchTarget.toLowerCase().includes(searchTerm.toLowerCase());
            
            const saleDate = new Date(sale.createdAt || Date.now());
            const now = new Date();
            let matchesTime = true;

            if (timeFilter === 'Last 30 days') {
                const thirtyDaysAgo = new Date().setDate(now.getDate() - 30);
                matchesTime = saleDate >= thirtyDaysAgo;
            } else if (timeFilter === 'This year') {
                matchesTime = saleDate.getFullYear() === now.getFullYear();
            }

            return matchesSearch && matchesTime;
        }).sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
    }, [activeSales, searchTerm, timeFilter]);

    // FEATURE 5: Real-Time Financial Aggregators (Strict Math)
    const grossVolume = useMemo(() => {
        return filteredSales.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    }, [filteredSales]);

    const totalPlatformFees = useMemo(() => {
        return filteredSales.reduce((acc, curr) => acc + (Number(curr.platformFee) || (Number(curr.amount) * 0.15) || 0), 0);
    }, [filteredSales]);

    const sellerNetRevenue = useMemo(() => {
        return grossVolume * 0.85; // Strict 85% Seller Payout
    }, [grossVolume]);

    const pendingSellerPayouts = useMemo(() => {
        return filteredSales
            .filter(s => s.payoutStatus !== 'paid')
            .reduce((acc, curr) => acc + ((Number(curr.amount) || 0) * 0.85), 0);
    }, [filteredSales]);

    // FEATURE 6: Global Currency Formatter
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // FEATURE 7: Staggered Framer Motion Entrances
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
    };

    // FEATURE 8: Excel Export Execution
    const handleExport = () => {
        if (filteredSales.length > 0) {
            const fileName = isAdmin ? 'Parbet_Global_Sales_Report' : 'Parbet_My_Sales_Report';
            exportSalesToExcel(filteredSales, fileName);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#1a1a1a] mb-4" size={32} />
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Syncing Secure Ledger...</p>
            </div>
        );
    }

    // Graceful Error Boundary Rendering
    if (syncError) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <ShieldAlert className="text-[#c21c3a] mb-4" size={48} />
                <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">Database Access Denied</h3>
                <p className="text-[15px] text-[#54626c] max-w-md bg-white border border-[#e2e2e2] p-4 rounded-[4px] mt-2 shadow-sm">
                    <span className="font-bold text-[#1a1a1a]">Error:</span> {syncError}
                </p>
                <p className="text-[13px] text-[#54626c] mt-6 max-w-md">
                    Please ensure your Firestore security rules grant read access to the global artifacts collection for your admin account.
                </p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1100px] pb-20"
        >
            {/* FEATURE 9: Dynamic Header based on Role */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tighter leading-tight">
                            {isAdmin ? 'Platform Operations' : 'My Sales'}
                        </h1>
                        {isAdmin && (
                            <span className="bg-[#c21c3a] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                                <ShieldAlert size={12} /> God-Mode
                            </span>
                        )}
                    </div>
                    <p className="text-[#54626c] text-[15px]">
                        {isAdmin ? 'Global 15% commission ledger and marketplace oversight.' : 'View your transaction history and track pending 85% net payouts.'}
                    </p>
                </div>
                <button 
                    onClick={handleExport}
                    disabled={filteredSales.length === 0}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-[4px] font-bold text-[14px] transition-all shadow-sm ${
                        filteredSales.length > 0 
                        ? 'bg-white border border-[#cccccc] hover:border-[#1a1a1a] text-[#1a1a1a]' 
                        : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <FileDown size={18} /> Export Excel
                </button>
            </div>

            {/* FEATURE 10: Role-Based Financial Metric Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div variants={itemVariants} className="bg-[#1a1a1a] p-6 rounded-[4px] text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                            {isAdmin ? 'Total Platform Fees (15%)' : 'Net Revenue (85%)'}
                        </span>
                        <DollarSign size={18} className={isAdmin ? "text-[#0064d2]" : "text-[#8cc63f]"} />
                    </div>
                    <div className="text-[28px] font-black">{formatCurrency(isAdmin ? totalPlatformFees : sellerNetRevenue)}</div>
                    <div className="text-[12px] text-gray-400 mt-1 flex items-center gap-1">
                        <ArrowUpRight size={12} className={isAdmin ? "text-[#0064d2]" : "text-[#8cc63f]"} /> From {filteredSales.length} {isAdmin ? 'global ' : ''}sales
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] p-6 rounded-[4px] shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold uppercase tracking-widest text-[#54626c]">
                            {isAdmin ? 'Gross Market Volume' : 'Projected Payouts'}
                        </span>
                        <Clock size={18} className={isAdmin ? "text-[#458731]" : "text-orange-500"} />
                    </div>
                    <div className="text-[28px] font-black text-[#1a1a1a]">{formatCurrency(isAdmin ? grossVolume : pendingSellerPayouts)}</div>
                    <p className="text-[12px] text-[#54626c] mt-1 italic">{isAdmin ? 'Total value traded' : 'Pending event completion'}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white border border-[#e2e2e2] p-6 rounded-[4px] shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold uppercase tracking-widest text-[#54626c]">
                            {isAdmin ? 'Active Sellers' : 'Seller Rating'}
                        </span>
                        <CheckCircle2 size={18} className="text-[#458731]" />
                    </div>
                    <div className="text-[28px] font-black text-[#1a1a1a]">
                        {isAdmin ? [...new Set(activeSales.map(s => s.sellerId))].length : '98.2%'}
                    </div>
                    <p className="text-[12px] text-[#54626c] mt-1 font-medium">
                        {isAdmin ? 'Generating revenue' : 'Top Tier Performance'}
                    </p>
                </motion.div>
            </div>

            {/* FEATURE 11: Interactive Table Tools */}
            <div className="bg-white border border-[#e2e2e2] rounded-[4px] shadow-sm mb-6 overflow-hidden">
                <div className="p-4 border-b border-[#e2e2e2] flex flex-col md:flex-row gap-4 bg-[#f8f9fa]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={isAdmin ? "Search by Event, Order ID, or Seller Email..." : "Search by Order ID or Event..."}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#cccccc] rounded-[4px] text-[14px] outline-none focus:border-[#1a1a1a] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter size={16} className="text-[#54626c]" />
                        <select 
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="bg-white border border-[#cccccc] rounded-[4px] px-4 py-2 text-[14px] font-bold text-[#1a1a1a] outline-none cursor-pointer"
                        >
                            <option>All time</option>
                            <option>Last 30 days</option>
                            <option>This year</option>
                        </select>
                    </div>
                </div>

                {/* FEATURE 12: Real-Time Chronological Table with Expandable Nodes */}
                <div className="overflow-x-auto">
                    {filteredSales.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 text-[12px] font-bold uppercase tracking-wider text-[#54626c]">
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Order & Date</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">{isAdmin ? 'Event & Seller' : 'Event Detail'}</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">{isAdmin ? 'Platform Fee (15%)' : 'Net Payout (85%)'}</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2]">Status</th>
                                    <th className="px-6 py-4 border-b border-[#e2e2e2] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e2e2]">
                                {filteredSales.map((sale) => (
                                    <React.Fragment key={sale.id}>
                                        <tr className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedSaleId === sale.id ? 'bg-gray-50/50' : ''}`} onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}>
                                            <td className="px-6 py-5">
                                                <div className="text-[14px] font-bold text-[#1a1a1a]">#{sale.id.substring(0, 8).toUpperCase()}</div>
                                                <div className="text-[12px] text-[#54626c] mt-0.5 flex items-center gap-1.5">
                                                    <Calendar size={12} /> {new Date(sale.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[14px] font-bold text-[#1a1a1a] truncate max-w-[200px]">{sale.eventName || 'Event Ticket'}</div>
                                                {isAdmin ? (
                                                    <div className="text-[12px] text-[#0064d2] font-medium mt-0.5 truncate max-w-[200px]">{sale.sellerEmail || 'Unknown Seller'}</div>
                                                ) : (
                                                    <div className="text-[12px] text-[#54626c] mt-0.5">Section {sale.section || 'Gen'} • {sale.quantity || 1} Ticket(s)</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-[16px] font-black text-[#1a1a1a]">
                                                    {isAdmin 
                                                        ? formatCurrency(Number(sale.platformFee) || (Number(sale.amount) * 0.15)) 
                                                        : formatCurrency(Number(sale.amount) * 0.85)}
                                                </div>
                                                {isAdmin && <div className="text-[11px] text-gray-400 mt-0.5">Gross: {formatCurrency(sale.amount)}</div>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${sale.payoutStatus === 'paid' ? 'bg-[#eaf4d9] text-[#458731]' : 'bg-orange-50 text-orange-600'}`}>
                                                    {sale.payoutStatus === 'paid' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                                    {sale.payoutStatus === 'paid' ? 'Paid' : 'Processing'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="text-gray-400 hover:text-[#1a1a1a] transition-all">
                                                    <ChevronDown size={20} className={`transition-transform ${expandedSaleId === sale.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedSaleId === sale.id && (
                                                <tr>
                                                    <td colSpan="5" className="px-0 py-0">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-[#f8f9fa] border-b border-[#e2e2e2]"
                                                        >
                                                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Transaction Details</h4>
                                                                    <div className="space-y-2 text-[13px]">
                                                                        <div className="flex justify-between"><span className="text-gray-400">Buyer ID:</span> <span className="font-bold text-[#1a1a1a] truncate max-w-[120px]">{sale.buyerId || 'Anonymous'}</span></div>
                                                                        {isAdmin && <div className="flex justify-between"><span className="text-gray-400">Seller ID:</span> <span className="font-bold text-[#1a1a1a] truncate max-w-[120px]">{sale.sellerId || 'Unknown'}</span></div>}
                                                                        <div className="flex justify-between"><span className="text-gray-400">Platform Fee:</span> <span className="font-bold text-[#1a1a1a]">15% ({isAdmin ? 'Collected' : 'Deducted'})</span></div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-3">Fulfillment Status</h4>
                                                                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#458731]">
                                                                        <CheckCircle2 size={14} /> Tickets Delivered to Buyer
                                                                    </div>
                                                                    <div className="text-[12px] text-[#54626c] mt-2">
                                                                        {isAdmin ? 'Awaiting administrative payout release.' : 'Payout will be released 5-8 days post event.'}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-end">
                                                                    <button className="flex items-center gap-2 text-[13px] font-bold text-[#0064d2] hover:underline">
                                                                        <Receipt size={16} /> {isAdmin ? 'View Global Receipt' : 'View Full Receipt'} <ExternalLink size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag size={32} className="text-[#cccccc]" />
                            </div>
                            <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">{isAdmin ? 'No platform activity found' : 'No sales activity found'}</h3>
                            <p className="text-[15px] text-[#54626c] max-w-sm mb-8">
                                {searchTerm ? "We couldn't find any sales matching your search query." : isAdmin ? "Platform order stream is currently empty." : "Your ticket sales will appear here in real-time once a buyer completes a purchase."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Support Escalation Footer */}
            <div className="bg-[#ebf3fb] border border-[#0064d2]/20 rounded-[4px] p-4 flex items-start gap-3">
                <HelpCircle className="text-[#0064d2] shrink-0 mt-0.5" size={18} />
                <p className="text-[13px] text-[#0064d2] font-medium">
                    <strong>Payout Schedule:</strong> Seller payments are initiated 5-8 business days after the event has taken place. This ensures buyer protection and secondary market integrity.
                </p>
            </div>
        </motion.div>
    );
}