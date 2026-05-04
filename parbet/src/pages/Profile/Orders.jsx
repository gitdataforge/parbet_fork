import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// CRITICAL FIX: Restored ALL missing lucide-react icons required by the component to prevent ReferenceError crashes
import { 
    Ticket, Search, Filter, Calendar, MapPin, 
    Download, ShieldCheck, Tag, Loader2, ArrowRight, 
    X, AlertCircle, CheckCircle2, ExternalLink, HelpCircle,
    BarChart3, Repeat, Eye, Zap, ChevronRight
} from 'lucide-react';
import { useMainStore } from '../../store/useMainStore';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 7 Profile Orders)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Illustrative Ambient Backgrounds
 * FEATURE 2: Real-Time Order Hydration from Global Store
 * FEATURE 3: Analytics Dashboard (Total Spent, Active Tickets)
 * FEATURE 4: Hardware-Accelerated Tab Switching (Upcoming vs Past)
 * FEATURE 5: Real-time Local Search Engine
 * FEATURE 6: Dynamic E-Ticket Action Cards
 * FEATURE 7: Transaction Status Trackers (Pending vs Confirmed)
 * FEATURE 8: 1:1 Rebranded Troubleshooting Empty State
 * FEATURE 9: Resale Portal Triggers
 * FEATURE 10: Support & Help Quick Actions
 */

// Safe Date Formatter
const formatDate = (isoString) => {
    if (!isoString) return 'Date TBA';
    const d = new Date(isoString);
    if (isNaN(d)) return 'Date TBA';
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
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

// High-Fidelity Inline SVG Replica of Official Booknshow Logo
const BooknshowLogo = ({ className = "", textColor = "text-[#333333]" }) => (
    <div className={`flex items-center justify-center select-none relative z-10 ${className}`}>
        <span className={`text-[36px] font-black tracking-tighter lowercase leading-none ${textColor}`}>book</span>
        <svg width="34" height="40" viewBox="0 0 100 120" className="mx-1 transform -translate-y-1 hover:rotate-[-5deg] transition-transform duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Asymmetric Ticket Base */}
            <path d="M5,25 L25,5 L50,25 L75,5 L95,25 L90,115 L75,100 L50,115 L25,100 L5,115 Z" fill="#E7364D" />
            {/* White lowercase 'n' cutout */}
            <path d="M35,85 L35,55 C35,35 65,35 65,55 L65,85" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={`text-[36px] font-black tracking-tighter lowercase leading-none ${textColor}`}>show</span>
    </div>
);

export default function Orders() {
    const navigate = useNavigate();
    const { user, orders, isLoadingOrders } = useMainStore();
    
    // SECTION 2: State Management
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const ticketRef = useRef(null);

    // SECTION 4: Analytics Calculation Logic
    const analytics = useMemo(() => {
        let active = 0;
        let totalSpent = 0;
        const now = new Date().getTime();
        
        (orders || []).forEach(order => {
            totalSpent += Number(order.amountPaid || order.totalAmount || 0);
            const eventTime = new Date(order.commence_time?.seconds ? order.commence_time.seconds * 1000 : order.commence_time || order.eventTimestamp || order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).getTime();
            if (!isNaN(eventTime) && eventTime >= now) {
                active += Number(order.quantity || 1);
            }
        });
        
        return { active, totalSpent };
    }, [orders]);

    // SECTION 5: Logical Data Filtering & Deduplication
    const uniqueOrders = useMemo(() => {
        const seen = new Set();
        return (orders || []).filter(order => {
            const isDuplicate = seen.has(order.id);
            seen.add(order.id);
            return !isDuplicate;
        });
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const now = new Date().getTime();
        return uniqueOrders.filter(order => {
            const eventTime = new Date(order.commence_time?.seconds ? order.commence_time.seconds * 1000 : order.commence_time || order.eventTimestamp || order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).getTime();
            const isPast = !isNaN(eventTime) && eventTime < now;
            
            // Tab Filter
            if (activeTab === 'Upcoming' && isPast) return false;
            if (activeTab === 'Past' && !isPast) return false;
            
            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const eventName = (order.eventName || '').toLowerCase();
                const orderId = (order.paymentId || order.id || '').toLowerCase();
                if (!eventName.includes(query) && !orderId.includes(query)) return false;
            }
            
            return true;
        }).sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });
    }, [uniqueOrders, activeTab, searchQuery]);

    const handleDownloadTicket = async () => {
        if (!ticketRef.current || isDownloading) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Booknshow_Ticket_${selectedTicket.id.substring(0,8)}.pdf`);
        } catch (err) {
            console.error("PDF Generation failed:", err);
            alert("Failed to generate PDF. Please try taking a screenshot.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Animation Variants
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

    return (
        <div className="w-full font-sans pb-20 pt-4 relative min-h-screen bg-transparent">
            <AmbientBackground />
            
            <motion.div initial="hidden" animate="show" variants={containerVariants} className="relative z-10 w-full">
                
                {/* SECTION 6: Header & Analytics Dashboard */}
                <div className="px-6 md:px-8 mb-8">
                    <motion.h1 variants={itemVariants} className="text-[32px] font-black text-[#333333] mb-6 tracking-tight leading-tight">
                        My Orders
                    </motion.h1>
                    
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-5 shadow-sm">
                            <div className="flex items-center text-[#626262] mb-2">
                                <Ticket size={16} className="mr-2 text-[#E7364D]" />
                                <span className="text-[13px] font-bold uppercase tracking-wider">Active Tickets</span>
                            </div>
                            <span className="text-[28px] font-black text-[#333333]">{analytics.active}</span>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-5 shadow-sm">
                            <div className="flex items-center text-[#626262] mb-2">
                                <BarChart3 size={16} className="mr-2 text-[#E7364D]" />
                                <span className="text-[13px] font-bold uppercase tracking-wider">Total Orders</span>
                            </div>
                            <span className="text-[28px] font-black text-[#333333]">{uniqueOrders.length}</span>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] p-5 shadow-sm hidden md:block">
                            <div className="flex items-center text-[#626262] mb-2">
                                <CheckCircle2 size={16} className="mr-2 text-[#E7364D]" />
                                <span className="text-[13px] font-bold uppercase tracking-wider">Total Spent</span>
                            </div>
                            <span className="text-[28px] font-black text-[#333333]">₹{analytics.totalSpent.toLocaleString()}</span>
                        </div>
                    </motion.div>
                </div>
                
                {/* SECTION 7: Interactive Tab Navigation & Search */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#A3A3A3]/20 mb-8 px-6 md:px-8 gap-4">
                    <div className="flex">
                        {['Upcoming', 'Past'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 mr-8 text-[15px] font-black transition-all relative ${
                                    activeTab === tab 
                                    ? 'text-[#E7364D]' 
                                    : 'text-[#626262] hover:text-[#333333]'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="orderTab" className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#E7364D] rounded-t-full"></motion.div>
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {uniqueOrders.length > 0 && (
                        <div className="relative w-full md:w-[280px] mb-4 md:mb-0">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
                            <input 
                                type="text"
                                placeholder="Search event or Order ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F5F5F5] border border-[#A3A3A3]/20 text-[#333333] text-[14px] font-medium rounded-[8px] py-2.5 pl-9 pr-4 focus:outline-none focus:border-[#E7364D]/50 focus:bg-[#FFFFFF] transition-all"
                            />
                        </div>
                    )}
                </motion.div>

                <div className="px-6 md:px-8">
                    {/* SECTION 8: Real-Time Loading State Logic */}
                    {isLoadingOrders ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#E7364D] mb-4" size={32} />
                            <p className="text-[#626262] font-bold text-[14px] uppercase tracking-widest">Decrypting Ledger...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        
                        /* SECTION 9: Populated Orders List */
                        <div className="space-y-6">
                            <AnimatePresence>
                                {filteredOrders.map((order) => {
                                    const isPending = order.status === 'pending_approval' || order.paymentMethod === 'bank_transfer' || order.status === 'Pending';
                                    const eventDate = order.commence_time?.seconds ? order.commence_time.seconds * 1000 : order.commence_time || order.eventTimestamp || order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt;
                                    
                                    return (
                                        <motion.div 
                                            key={order.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] overflow-hidden shadow-[0_4px_20px_rgba(51,51,51,0.03)] hover:shadow-[0_8px_30px_rgba(231,54,77,0.08)] hover:border-[#E7364D]/30 transition-all group"
                                        >
                                            {/* Status Header */}
                                            <div className={`px-5 py-3 flex items-center justify-between border-b border-[#A3A3A3]/10 ${isPending ? 'bg-[#FAD8DC]/20' : 'bg-[#F5F5F5]'}`}>
                                                <div className="flex items-center gap-2.5">
                                                    {isPending ? <AlertCircle size={16} className="text-[#EB5B6E]" /> : <CheckCircle2 size={16} className="text-[#E7364D]" />}
                                                    <span className={`text-[12px] font-black uppercase tracking-widest ${isPending ? 'text-[#EB5B6E]' : 'text-[#E7364D]'}`}>
                                                        {isPending ? 'Reviewing Payment Proof' : 'Order Confirmed'}
                                                    </span>
                                                </div>
                                                <span className="text-[13px] font-bold text-[#A3A3A3] tracking-wide">
                                                    ID: {order.paymentId ? order.paymentId.substring(0,8).toUpperCase() : order.id.substring(0,8).toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            {/* Body */}
                                            <div className="p-6 flex flex-col md:flex-row gap-8">
                                                <div className="flex-1 flex flex-col justify-between space-y-5">
                                                    <div>
                                                        <h3 className="text-[20px] font-black text-[#333333] leading-tight mb-3 group-hover:text-[#E7364D] transition-colors">{order.eventName || 'Booknshow Event'}</h3>
                                                        <div className="flex items-center text-[14px] text-[#626262] font-medium mb-2">
                                                            <Calendar size={16} className="mr-3 text-[#A3A3A3]" /> {formatDate(eventDate)}
                                                        </div>
                                                        <div className="flex items-center text-[14px] text-[#626262] font-medium">
                                                            <MapPin size={16} className="mr-3 text-[#A3A3A3]" /> {order.eventLoc || 'Venue TBA'}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Bar */}
                                                    <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-[#A3A3A3]/10">
                                                        <button 
                                                            disabled={isPending} 
                                                            onClick={() => setSelectedTicket(order)}
                                                            className={`px-6 py-2.5 rounded-[8px] text-[14px] font-bold transition-all shadow-sm flex items-center ${isPending ? 'bg-[#F5F5F5] text-[#A3A3A3] cursor-not-allowed' : 'bg-[#E7364D] text-[#FFFFFF] hover:bg-[#EB5B6E] hover:shadow-[0_4px_15px_rgba(231,54,77,0.3)] hover:-translate-y-0.5'}`}
                                                        >
                                                            <Eye size={16} className="mr-2" /> View & Download E-Ticket
                                                        </button>
                                                        <button onClick={() => navigate('/seller/create')} className="px-6 py-2.5 bg-[#FFFFFF] border border-[#A3A3A3]/30 text-[#333333] text-[14px] font-bold rounded-[8px] hover:bg-[#FAD8DC]/10 hover:border-[#E7364D] hover:text-[#E7364D] flex items-center transition-all">
                                                            <Repeat size={16} className="mr-2" /> Sell on Marketplace
                                                        </button>
                                                        <button onClick={() => window.open('mailto:support@booknshow.com', '_blank')} className="p-2.5 bg-[#FFFFFF] border border-[#A3A3A3]/30 text-[#626262] rounded-[8px] hover:bg-[#F5F5F5] hover:text-[#333333] transition-all ml-auto md:ml-0" title="Get Support">
                                                            <HelpCircle size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Ticket Summary Side-Panel */}
                                                <div className="w-full md:w-[240px] bg-[#F5F5F5] rounded-[8px] border border-[#A3A3A3]/20 p-5 flex flex-col justify-center">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Section / Tier</p>
                                                            <p className="text-[15px] font-black text-[#333333]">{order.tierName || 'General Admission'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Quantity</p>
                                                            <p className="text-[15px] font-black text-[#333333]">{order.quantity} Tickets</p>
                                                        </div>
                                                        <div className="pt-3 border-t border-[#A3A3A3]/20">
                                                            <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Total Paid</p>
                                                            <p className="text-[18px] font-black text-[#E7364D]">₹{(Number(order.totalAmount || order.amountPaid) || 0).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* SECTION 10: 1:1 Rebranded Troubleshooting Empty State */
                        <motion.div variants={itemVariants} className="w-full flex flex-col items-center md:items-start mt-4">
                            <div className="w-full max-w-[800px] border border-[#A3A3A3]/20 rounded-[12px] p-8 md:p-10 mb-10 bg-[#FFFFFF] shadow-[0_10px_40px_rgba(51,51,51,0.05)] relative overflow-hidden">
                                
                                {/* Empty State Decorator */}
                                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FAD8DC]/30 rounded-bl-full -z-0"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-[#FAD8DC]/50 rounded-full flex items-center justify-center mb-6">
                                        <Search size={24} className="text-[#E7364D]" />
                                    </div>
                                    <h3 className="text-[20px] font-black text-[#333333] mb-8 leading-tight">
                                        Don't see your orders? <br className="md:hidden"/>Here's what you can do:
                                    </h3>
                                    
                                    <div className="space-y-8">
                                        <section>
                                            <p className="text-[15px] font-bold text-[#333333] mb-4">1. Check your email address</p>
                                            <ul className="space-y-3">
                                                <li className="flex items-start text-[14px] text-[#626262] font-medium leading-relaxed">
                                                    <ChevronRight size={18} className="text-[#E7364D] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                                    Ensure the email used for purchase exactly matches the email on this account.
                                                </li>
                                                <li className="flex items-start text-[14px] text-[#626262] font-medium leading-relaxed">
                                                    <ChevronRight size={18} className="text-[#E7364D] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                                    If different, sign out and sign back in with the correct email via Google Auth.
                                                </li>
                                            </ul>
                                        </section>

                                        <section>
                                            <p className="text-[15px] font-bold text-[#333333] mb-4">2. Did you check out as a guest?</p>
                                            <ul className="space-y-3">
                                                <li className="flex items-start text-[14px] text-[#626262] font-medium leading-relaxed">
                                                    <ChevronRight size={18} className="text-[#E7364D] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                                    Find your secure Guest Access Code in the order confirmation email.
                                                </li>
                                                <li className="flex items-start text-[14px] text-[#626262] font-medium leading-relaxed">
                                                    <ChevronRight size={18} className="text-[#E7364D] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                                    Sign out, click 'Sign In', and select 'Guest Purchase? Find your order'.
                                                </li>
                                                <li className="flex items-start text-[14px] text-[#626262] font-medium leading-relaxed">
                                                    <ChevronRight size={18} className="text-[#E7364D] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                                    Enter your email and access code to decrypt and view your order.
                                                </li>
                                            </ul>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Ticket Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#333333]/80 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="bg-transparent w-full max-w-md relative my-auto"
                        >
                            {/* Close Button Outside Ticket to not be captured in PDF */}
                            <button onClick={() => setSelectedTicket(null)} className="absolute -top-12 right-0 text-[#FFFFFF] hover:text-[#E7364D] transition-colors bg-[#333333] p-2 rounded-full z-50 shadow-xl">
                                <X size={24} />
                            </button>

                            {/* The Digital Ticket Container (Captured by html2canvas) */}
                            <div ref={ticketRef} className="bg-[#FFFFFF] rounded-[16px] overflow-hidden shadow-2xl relative">
                                
                                {/* Dark Theme Ticket Header with Inverted Logo */}
                                <div className="bg-[#333333] w-full pt-6 pb-5 flex flex-col justify-center items-center border-b-4 border-[#E7364D] relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                    <BooknshowLogo textColor="text-[#FFFFFF]" className="scale-75 origin-center -mb-2" />
                                    <p className="text-[10px] text-[#A3A3A3] uppercase tracking-[0.2em] relative z-10 font-bold">Official Access Pass</p>
                                </div>

                                {/* Event Info */}
                                <div className="p-6 md:p-8 bg-[#FFFFFF] relative">
                                    <div className="mb-6 pb-6 border-b border-dashed border-[#A3A3A3]/40">
                                        <h2 className="text-[22px] font-black text-[#333333] leading-tight mb-4">{selectedTicket.eventName}</h2>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Calendar size={16} className="text-[#A3A3A3] mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Date & Time</p>
                                                    <p className="text-[14px] font-black text-[#333333]">
                                                        {selectedTicket.commence_time?.seconds ? new Date(selectedTicket.commence_time.seconds * 1000).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 
                                                         selectedTicket.createdAt?.seconds ? new Date(selectedTicket.createdAt.seconds * 1000).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date TBA'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-[#A3A3A3] mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Venue</p>
                                                    <p className="text-[14px] font-black text-[#333333]">{selectedTicket.eventLoc || 'Venue TBA'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seat/Tier Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-[#FAFAFA] p-3 rounded-[8px] border border-[#A3A3A3]/20">
                                            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Tier / Section</p>
                                            <p className="text-[15px] font-black text-[#E7364D] truncate">{selectedTicket.tierName || 'General Admission'}</p>
                                        </div>
                                        <div className="bg-[#FAFAFA] p-3 rounded-[8px] border border-[#A3A3A3]/20">
                                            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Admit</p>
                                            <p className="text-[15px] font-black text-[#333333]">{selectedTicket.quantity} Person(s)</p>
                                        </div>
                                        <div className="bg-[#FAFAFA] p-3 rounded-[8px] border border-[#A3A3A3]/20 col-span-2">
                                            <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Buyer Details</p>
                                            <p className="text-[14px] font-black text-[#333333] truncate">{selectedTicket.buyerName || selectedTicket.buyerEmail || user?.email}</p>
                                        </div>
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="flex flex-col items-center justify-center p-4 bg-[#F5F5F5] rounded-[12px] border border-[#A3A3A3]/20">
                                        <div className="bg-[#FFFFFF] p-2 rounded-[8px] shadow-sm mb-3">
                                            <QRCodeSVG value={`BOOKNSHOW_SECURE_${selectedTicket.id}`} size={140} fgColor="#333333" level="H" />
                                        </div>
                                        <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-0.5">Ticket ID</p>
                                        <p className="text-[14px] font-mono font-black text-[#333333] tracking-widest">{selectedTicket.id.substring(0, 12).toUpperCase()}</p>
                                    </div>
                                </div>
                                
                                {/* Bottom Perforation Visual */}
                                <div className="h-4 w-full bg-[radial-gradient(circle,transparent_4px,#FFFFFF_4px)] bg-[length:16px_16px] -mt-2"></div>
                            </div>

                            {/* Download Button (Outside the PDF capture area) */}
                            <div className="mt-6">
                                <button 
                                    onClick={handleDownloadTicket} 
                                    disabled={isDownloading}
                                    className="w-full bg-[#E7364D] text-[#FFFFFF] font-black py-4 rounded-[8px] hover:bg-[#333333] transition-colors shadow-[0_4px_15px_rgba(231,54,77,0.4)] flex items-center justify-center disabled:opacity-50"
                                >
                                    {isDownloading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Download size={20} className="mr-2" />}
                                    {isDownloading ? 'Generating PDF...' : 'Download E-Ticket'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}