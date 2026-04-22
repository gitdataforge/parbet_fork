import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Package, 
    Search, 
    ChevronDown, 
    ChevronUp, 
    Calendar, 
    Receipt, 
    ArrowRight,
    ShoppingBag,
    CheckCircle2,
    Clock,
    Download
} from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
import { exportOrdersToExcel } from '../../utils/excelExporter';

export default function Orders() {
    const navigate = useNavigate();
    
    // FEATURE 1: Secure Data Extraction
    // Pulls real-time order history strictly from the global store
    const { orders = [], isLoading } = useSellerStore();

    // FEATURE 2: Complex UI State Machine
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // FEATURE 3: Multi-Conditional Real-Time Search & Filter Engine
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = 
                (order.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'All' ? true : 
                statusFilter === 'Completed' ? order.status === 'completed' || order.status === 'delivered' :
                statusFilter === 'Pending' ? order.status === 'pending' || order.status === 'processing' :
                statusFilter === 'Cancelled' ? order.status === 'cancelled' : true;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // FEATURE 4: Chronological Sorting
    }, [orders, searchTerm, statusFilter]);

    // FEATURE 5: Currency & Date Formatting Utilities
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // FEATURE 6: Dynamic Status Badge Renderer
    const renderStatusBadge = (status) => {
        const normalized = (status || 'pending').toLowerCase();
        if (normalized === 'completed' || normalized === 'delivered') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#eaf4d9] text-[#458731] text-[12px] font-bold rounded-full uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Completed
                </span>
            );
        }
        if (normalized === 'cancelled') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[12px] font-bold rounded-full uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Cancelled
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-[12px] font-bold rounded-full uppercase tracking-wider">
                <Clock size={14} /> Processing
            </span>
        );
    };

    // FEATURE 7: Framer Motion Staggered Physics
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
    };

    // FEATURE 8: Excel Export Handler
    const handleExport = () => {
        if (filteredOrders.length > 0) {
            exportOrdersToExcel(filteredOrders, 'Parbet_Purchase_History');
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Fetching Order History...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="w-full font-sans max-w-[1000px] pb-20"
        >
            {/* FEATURE 9: Typography & Headers with Export Action */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-2">
                        My Orders
                    </h1>
                    <p className="text-[#54626c] text-[15px]">
                        Track and manage tickets you've purchased on the marketplace.
                    </p>
                </div>
                {filteredOrders.length > 0 && (
                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f8f9fa] border border-[#cccccc] hover:border-[#1a1a1a] text-[#1a1a1a] rounded-[4px] font-bold text-[14px] transition-colors shrink-0"
                    >
                        <Download size={18} /> Export Excel
                    </button>
                )}
            </motion.div>

            {/* FEATURE 10: Interactive Control Panel (Search & Filter) */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#54626c]" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by event name or Order ID..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#cccccc] rounded-[4px] text-[15px] outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-all font-medium shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {['All', 'Pending', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-3 rounded-[4px] text-[14px] font-bold transition-all whitespace-nowrap border ${
                                statusFilter === status 
                                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' 
                                : 'bg-white text-[#54626c] border-[#cccccc] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* FEATURE 11: Dynamic Order List with Accordion Expansion */}
            <div className="w-full space-y-4">
                <AnimatePresence mode="wait">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <motion.div 
                                key={order.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-[#e2e2e2] rounded-[4px] shadow-sm overflow-hidden"
                            >
                                {/* Order Header (Clickable) */}
                                <div 
                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[#f8f9fa] border border-[#e2e2e2] rounded-full flex items-center justify-center shrink-0">
                                            <Package size={20} className="text-[#1a1a1a]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-[16px] font-bold text-[#1a1a1a]">{order.eventName || 'Event Tickets'}</h3>
                                                {renderStatusBadge(order.status)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[13px] text-[#54626c]">
                                                <span className="flex items-center"><Receipt size={14} className="mr-1.5" /> #{order.id.substring(0, 8).toUpperCase()}</span>
                                                <span className="hidden md:block w-1 h-1 rounded-full bg-[#cccccc]"></span>
                                                <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-gray-100 md:border-0 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <p className="text-[12px] font-bold text-[#54626c] uppercase tracking-wider mb-0.5">Order Total</p>
                                            <p className="text-[18px] font-black text-[#1a1a1a]">{formatCurrency(order.amount)}</p>
                                        </div>
                                        <button className="text-gray-400 hover:text-[#1a1a1a] transition-colors p-2">
                                            {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* FEATURE 12: Expandable Order Details Panel */}
                                <AnimatePresence>
                                    {expandedOrderId === order.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden bg-[#f8f9fa] border-t border-[#e2e2e2]"
                                        >
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-4 border-b border-[#e2e2e2] pb-2">Ticket Information</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-[14px]">
                                                            <span className="text-[#54626c]">Event</span>
                                                            <span className="font-bold text-[#1a1a1a] text-right">{order.eventName || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[14px]">
                                                            <span className="text-[#54626c]">Quantity</span>
                                                            <span className="font-bold text-[#1a1a1a]">{order.quantity || 1} Ticket(s)</span>
                                                        </div>
                                                        <div className="flex justify-between text-[14px]">
                                                            <span className="text-[#54626c]">Section / Row</span>
                                                            <span className="font-bold text-[#1a1a1a]">{order.section || 'General'} / {order.row || '-'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[14px]">
                                                            <span className="text-[#54626c]">Delivery Method</span>
                                                            <span className="font-bold text-[#1a1a1a]">Mobile Transfer</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-4 border-b border-[#e2e2e2] pb-2">Payment Summary</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-[14px]">
                                                            <span className="text-[#54626c]">Subtotal</span>
                                                            <span className="font-bold text-[#1a1a1a]">{formatCurrency((order.amount || 0) * 0.85)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[14px]">
                                                            <span className="text-[#54626c]">Fees & Taxes</span>
                                                            <span className="font-bold text-[#1a1a1a]">{formatCurrency((order.amount || 0) * 0.15)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[15px] pt-2 border-t border-[#cccccc]">
                                                            <span className="font-black text-[#1a1a1a]">Total Paid</span>
                                                            <span className="font-black text-[#458731]">{formatCurrency(order.amount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="px-6 py-4 bg-white border-t border-[#e2e2e2] flex justify-end">
                                                <button 
                                                    onClick={() => navigate('/profile/support')}
                                                    className="text-[13px] font-bold text-[#0064d2] hover:underline"
                                                >
                                                    Report an issue with this order
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        /* FEATURE 13: Production-Grade Empty State */
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full bg-white border border-[#e2e2e2] rounded-[4px] p-12 flex flex-col items-center justify-center text-center shadow-sm"
                        >
                            <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag size={32} className="text-[#cccccc]" />
                            </div>
                            <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">No orders found</h3>
                            <p className="text-[15px] text-[#54626c] max-w-md mb-8">
                                {searchTerm || statusFilter !== 'All' 
                                    ? `We couldn't find any orders matching your current filters. Try adjusting your search criteria.`
                                    : `You haven't purchased any tickets yet. When you buy tickets on the marketplace, they will securely appear here.`}
                            </p>
                            
                            {(searchTerm || statusFilter !== 'All') ? (
                                <button 
                                    onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                                    className="bg-white border border-[#cccccc] hover:border-[#1a1a1a] text-[#1a1a1a] px-6 py-3 rounded-[4px] font-bold text-[14px] transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="bg-[#1a1a1a] hover:bg-[#333333] text-white px-8 py-3 rounded-[4px] font-bold text-[14px] transition-colors flex items-center gap-2"
                                >
                                    Explore Marketplace <ArrowRight size={16} />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}