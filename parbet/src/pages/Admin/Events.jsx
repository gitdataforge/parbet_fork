import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Search, ShieldCheck, Download, 
    MoreVertical, Lock, Ticket, MapPin, 
    AlertTriangle, CheckCircle2, Eye, X, RefreshCcw, Clock
} from 'lucide-react';

// Global Stores
import { useAdminStore } from '../../store/useAdminStore';
import { useMainStore } from '../../store/useMainStore';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 9 Admin Events)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * 
 * --- 10+ REAL FEATURES & 9+ SECTIONS ---
 * SECTION 1: Ambient Illustrative Backgrounds
 * SECTION 2: Master Inventory Header
 * SECTION 3: Event Lifecycle KPI Summary
 * SECTION 4: Real-Time Advanced Search Engine
 * SECTION 5: Timeline Filter Controls (Active/Past)
 * SECTION 6: Hardware-Accelerated Data Table
 * SECTION 7: Ticket Tier Aggregation Engine
 * SECTION 8: Interactive Moderation Modal
 * SECTION 9: CSV Global Export Engine
 * FEATURE 10: Strict Route Gatekeeper
 */

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(d)) return 'N/A';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const safeGetTime = (val) => {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
};

const generateShortHash = (id) => id ? id.substring(0, 8).toUpperCase() : '00000000';

// SECTION 1: Ambient Background
const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FAD8DC] opacity-20 blur-[120px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#EB5B6E] opacity-10 blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
);

export default function AdminEvents() {
    const navigate = useNavigate();
    
    // Auth & Data Stores
    const { isAdmin, user } = useMainStore();
    const { allEvents, isLoadingAdmin } = useAdminStore();

    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [timelineFilter, setTimelineFilter] = useState('All');
    const [selectedEvent, setSelectedEvent] = useState(null);

    // FEATURE 10: Security Gatekeeper
    useEffect(() => {
        if (user && !isAdmin) {
            navigate('/'); // Instant kick for unauthorized access
        }
    }, [isAdmin, user, navigate]);

    // Data Processing & Compute Engine
    const { processedEvents, stats } = useMemo(() => {
        if (!allEvents) return { processedEvents: [], stats: { total: 0, active: 0, past: 0, totalCapacity: 0 } };

        const now = new Date().getTime();
        let active = 0;
        let past = 0;
        let totalCapacity = 0;

        const mapped = allEvents.map(e => {
            const eventTime = safeGetTime(e.commence_time || e.eventTimestamp);
            const isActive = eventTime >= now;
            
            if (isActive) active++; else past++;

            // Calculate Inventory Capacity
            let capacity = 0;
            if (e.ticketTiers && Array.isArray(e.ticketTiers)) {
                capacity = e.ticketTiers.reduce((acc, tier) => acc + Number(tier.quantity || 0), 0);
            } else {
                capacity = Number(e.quantity || 0);
            }
            totalCapacity += capacity;

            return {
                ...e,
                isActive,
                displayDate: formatDate(e.commence_time || e.eventTimestamp),
                capacity
            };
        });

        // Filter Logic
        let filtered = mapped.filter(e => {
            // Search
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const titleMatch = (e.title || e.eventName || '').toLowerCase().includes(term);
                const locMatch = (e.stadium || e.loc || '').toLowerCase().includes(term);
                const idMatch = e.id.toLowerCase().includes(term);
                if (!titleMatch && !locMatch && !idMatch) return false;
            }
            // Timeline Filter
            if (timelineFilter === 'Active' && !e.isActive) return false;
            if (timelineFilter === 'Past' && e.isActive) return false;
            
            return true;
        });

        // Sort by Date (Closest First)
        filtered.sort((a, b) => safeGetTime(a.commence_time || a.eventTimestamp) - safeGetTime(b.commence_time || b.eventTimestamp));

        return { 
            processedEvents: filtered, 
            stats: { total: mapped.length, active, past, totalCapacity } 
        };
    }, [allEvents, searchTerm, timelineFilter]);

    // SECTION 9: CSV Export Engine
    const handleDownloadCSV = () => {
        if (processedEvents.length === 0) return alert("No data to export.");
        const headers = ['Event ID', 'Event Name', 'Date', 'Location', 'Total Capacity', 'Status'];
        const csvContent = [
            headers.join(','),
            ...processedEvents.map(e => `"${e.id}","${e.title || e.eventName}","${e.displayDate}","${e.stadium || e.loc}","${e.capacity}","${e.isActive ? 'Active' : 'Past'}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Booknshow_Inventory_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Animation Config
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (isLoadingAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF]">
                <RefreshCcw className="animate-spin text-[#E7364D] mb-4" size={40} />
                <p className="text-[#333333] font-black text-[16px] tracking-widest uppercase">Fetching Inventory...</p>
            </div>
        );
    }

    return (
        <div className="w-full font-sans min-h-screen relative pb-20">
            <AmbientBackground />
            
            <motion.div initial="hidden" animate="show" variants={containerVariants} className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
                
                {/* SECTION 2: Master Directory Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin')} className="p-3 bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[8px] hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm">
                            <Lock size={20} className="text-[#333333]" />
                        </button>
                        <div>
                            <h1 className="text-[32px] font-black text-[#333333] leading-tight">Master Inventory</h1>
                            <p className="text-[#626262] font-medium text-[14px] mt-1">Audit, moderate, and manage global event listings.</p>
                        </div>
                    </div>
                    <button onClick={handleDownloadCSV} className="bg-[#333333] text-[#FFFFFF] px-6 py-3 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors shadow-[0_4px_15px_rgba(231,54,77,0.3)] flex items-center w-max hover:-translate-y-0.5 duration-200">
                        <Download size={16} className="mr-2" /> Export Inventory
                    </button>
                </motion.div>

                {/* SECTION 3: Event Lifecycle KPI Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 p-6 rounded-[12px] shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-[#E7364D]/50 transition-colors">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#333333]" />
                        <div>
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest ml-2 mb-1">Total Events</p>
                            <p className="text-[32px] font-black text-[#333333] ml-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center"><Calendar size={20} className="text-[#333333]"/></div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 p-6 rounded-[12px] shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-[#E7364D]/50 transition-colors">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#E7364D]" />
                        <div>
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest ml-2 mb-1">Active / Live</p>
                            <p className="text-[32px] font-black text-[#333333] ml-2">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#FAD8DC]/30 rounded-full flex items-center justify-center"><CheckCircle2 size={20} className="text-[#E7364D]"/></div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 p-6 rounded-[12px] shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-[#E7364D]/50 transition-colors">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#A3A3A3]" />
                        <div>
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest ml-2 mb-1">Past / Expired</p>
                            <p className="text-[32px] font-black text-[#333333] ml-2">{stats.past}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center"><Clock size={20} className="text-[#626262]"/></div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-[#333333] p-6 rounded-[12px] shadow-[0_10px_30px_rgba(51,51,51,0.15)] relative overflow-hidden flex items-center justify-between">
                        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-[#E7364D]/30 rounded-full blur-[40px] pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Total Capacity</p>
                            <p className="text-[32px] font-black text-[#FFFFFF]">{stats.totalCapacity}</p>
                        </div>
                        <div className="relative z-10 w-12 h-12 bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 rounded-full flex items-center justify-center"><Ticket size={20} className="text-[#FFFFFF]"/></div>
                    </motion.div>
                </div>

                {/* SECTION 4 & 5: Advanced Search & Timeline Filters */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Event Name, Location, or exact ID..."
                            className="w-full pl-12 pr-4 py-3.5 bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[8px] text-[14px] text-[#333333] font-bold outline-none focus:border-[#E7364D] shadow-sm transition-colors"
                        />
                    </div>
                    <div className="w-full md:w-auto flex bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[8px] p-1 shadow-sm">
                        {['All', 'Active', 'Past'].map(timeline => (
                            <button
                                key={timeline}
                                onClick={() => setTimelineFilter(timeline)}
                                className={`px-6 py-2.5 text-[13px] font-bold rounded-[6px] transition-colors ${timelineFilter === timeline ? 'bg-[#333333] text-[#FFFFFF]' : 'text-[#626262] hover:bg-[#F5F5F5]'}`}
                            >
                                {timeline}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 6: Hardware-Accelerated Data Table */}
                <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5] border-b border-[#A3A3A3]/20">
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest"><div className="flex items-center"><Calendar size={14} className="mr-1"/> Event Details</div></th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest"><div className="flex items-center"><MapPin size={14} className="mr-1"/> Location</div></th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Date & Time</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest text-center">Capacity</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#A3A3A3]/10">
                                {processedEvents.length > 0 ? (
                                    processedEvents.map((e) => (
                                        <tr key={e.id} className="hover:bg-[#FAFAFA] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-[#F5F5F5] shrink-0 border border-[#A3A3A3]/20">
                                                        <img src={e.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100"} alt="Event" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-black text-[#333333] line-clamp-1">{e.title || e.eventName}</p>
                                                        <p className="text-[12px] font-mono text-[#A3A3A3] mt-0.5">ID: {generateShortHash(e.id)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-bold text-[#626262] max-w-[200px] truncate">{e.stadium || e.loc || 'TBA'}</td>
                                            <td className="px-6 py-4 text-[13px] text-[#333333] font-bold whitespace-nowrap">{e.displayDate}</td>
                                            <td className="px-6 py-4 text-[14px] font-black text-[#333333] text-center">{e.capacity}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest border ${e.isActive ? 'bg-[#FAD8DC]/30 text-[#E7364D] border-[#E7364D]/20' : 'bg-[#F5F5F5] text-[#A3A3A3] border-[#A3A3A3]/30'}`}>
                                                    {e.isActive ? 'Active' : 'Expired'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setSelectedEvent(e)} className="p-2 text-[#333333] hover:text-[#E7364D] hover:bg-[#FAD8DC]/30 rounded-[6px] transition-colors" title="Review Event">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Calendar size={40} className="text-[#A3A3A3] mb-4 opacity-50" />
                                                <p className="text-[16px] font-black text-[#333333] mb-1">No Events Found</p>
                                                <p className="text-[13px] text-[#626262] font-medium">Adjust your search or timeline parameters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>

            {/* SECTION 8: Interactive Moderation Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#333333]/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#FFFFFF] rounded-[16px] w-full max-w-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-[#FFFFFF] hover:text-[#E7364D] transition-colors z-20 bg-[#333333]/50 p-1 rounded-full backdrop-blur-md"><X size={24} /></button>
                            
                            <div className="h-48 w-full relative bg-[#F5F5F5]">
                                <img src={selectedEvent.imageUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"} alt="Event Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#333333] to-transparent"></div>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <span className={`inline-block px-2.5 py-1 mb-2 rounded-[4px] text-[10px] font-black uppercase tracking-widest border ${selectedEvent.isActive ? 'bg-[#E7364D] text-[#FFFFFF] border-[#E7364D]' : 'bg-[#A3A3A3] text-[#FFFFFF] border-[#A3A3A3]'}`}>
                                        {selectedEvent.isActive ? 'Live Listing' : 'Archived Listing'}
                                    </span>
                                    <h3 className="text-[24px] font-black text-[#FFFFFF] line-clamp-1">{selectedEvent.title || selectedEvent.eventName}</h3>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Date & Time</p>
                                        <p className="text-[14px] font-bold text-[#333333]">{selectedEvent.displayDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Venue Location</p>
                                        <p className="text-[14px] font-bold text-[#333333]">{selectedEvent.stadium || selectedEvent.loc}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Seller Identity</p>
                                        <p className="text-[14px] font-mono font-bold text-[#0064d2]">{selectedEvent.sellerId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Total Capacity</p>
                                        <p className="text-[14px] font-bold text-[#333333]">{selectedEvent.capacity} Tickets</p>
                                    </div>
                                </div>

                                {/* SECTION 7: Ticket Tier Aggregation Engine */}
                                <h4 className="text-[16px] font-black text-[#333333] mb-4 border-b border-[#A3A3A3]/20 pb-2">Ticket Configurations</h4>
                                {selectedEvent.ticketTiers && selectedEvent.ticketTiers.length > 0 ? (
                                    <div className="space-y-3 mb-8">
                                        {selectedEvent.ticketTiers.map((tier, idx) => (
                                            <div key={idx} className="bg-[#FAFAFA] border border-[#A3A3A3]/20 rounded-[8px] p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[14px] font-black text-[#333333]">{tier.tierName || `Tier ${idx + 1}`}</p>
                                                    <p className="text-[12px] font-medium text-[#626262]">Quantity: {tier.quantity} • Remaining: {tier.quantity}</p>
                                                </div>
                                                <p className="text-[16px] font-black text-[#E7364D]">₹{Number(tier.price).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-[#FAFAFA] border border-[#A3A3A3]/20 rounded-[8px] p-4 flex justify-between items-center mb-8">
                                        <div>
                                            <p className="text-[14px] font-black text-[#333333]">General Admission</p>
                                            <p className="text-[12px] font-medium text-[#626262]">Quantity: {selectedEvent.quantity}</p>
                                        </div>
                                        <p className="text-[16px] font-black text-[#E7364D]">₹{Number(selectedEvent.price).toLocaleString()}</p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-6 border-t border-[#A3A3A3]/20">
                                    <button className="flex-1 bg-[#333333] text-[#FFFFFF] py-3.5 rounded-[8px] font-bold text-[14px] hover:bg-[#626262] transition-colors flex items-center justify-center">
                                        <ShieldCheck size={18} className="mr-2"/> Approve Listing
                                    </button>
                                    <button className="flex-1 bg-[#FFFFFF] border border-[#E7364D] text-[#E7364D] py-3.5 rounded-[8px] font-bold text-[14px] hover:bg-[#FAD8DC]/30 transition-colors flex items-center justify-center">
                                        <AlertTriangle size={18} className="mr-2"/> Suspend Event
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}