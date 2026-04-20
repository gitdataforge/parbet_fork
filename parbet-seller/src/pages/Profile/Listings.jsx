import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Plus, 
    Ticket, 
    Calendar, 
    MapPin, 
    Trash2, 
    Edit3, 
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Pause,
    Play,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useSellerStore } from '../../store/useSellerStore';

export default function Listings() {
    const navigate = useNavigate();
    
    // FEATURE 1: Secure Data Injection & Multi-Currency State
    const { listings = [], isLoading, deleteListing, currency } = useSellerStore();

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

    // FEATURE 2: Complex Inventory State Machine
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Active');
    const [isMutating, setIsMutating] = useState(null);

    // FEATURE 3: Real-Time Multi-Tab Filtering Logic
    const filteredListings = useMemo(() => {
        return listings.filter(item => {
            const name = item.eventName || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Map statuses to tabs
            if (activeTab === 'All') return matchesSearch;
            if (activeTab === 'Active') return matchesSearch && item.status === 'active';
            if (activeTab === 'Paused') return matchesSearch && item.status === 'paused';
            if (activeTab === 'Sold') return matchesSearch && item.status === 'sold';
            if (activeTab === 'Expired') return matchesSearch && item.status === 'expired';
            return matchesSearch;
        });
    }, [listings, searchTerm, activeTab]);

    // FEATURE 4: Status Badge Logic Engine
    const renderStatus = (status) => {
        const styles = {
            active: 'bg-[#eaf4d9] text-[#458731]',
            paused: 'bg-orange-50 text-orange-600 border border-orange-200',
            sold: 'bg-[#ebf3fb] text-[#0064d2]',
            expired: 'bg-gray-100 text-gray-500 border border-gray-200'
        };
        const label = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active';
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || styles.active}`}>
                {label}
            </span>
        );
    };

    // FEATURE 5: Real-Time Database Mutator (Pause/Activate)
    const toggleListingStatus = async (item) => {
        if (isMutating) return;
        setIsMutating(item.id);
        const newStatus = item.status === 'active' ? 'paused' : 'active';
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
            const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', item.id);
            await updateDoc(ticketRef, { status: newStatus });
        } catch (err) {
            console.error("[Parbet Ledger] Failed to toggle listing status:", err);
        } finally {
            setIsMutating(null);
        }
    };

    // Framer Motion Animation Physics
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemAnimation = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#1a1a1a] mb-4" size={32} />
                <p className="text-[13px] font-bold text-[#54626c] tracking-widest uppercase">Syncing Inventory...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={container}
            className="w-full font-sans max-w-[1100px] pb-20"
        >
            {/* Header with Quick-Action Injection */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-[32px] font-black text-[#1a1a1a] tracking-tight leading-none mb-2">My Listings</h1>
                    <p className="text-[#54626c] text-[15px] font-medium">Manage your active tickets and track your sales history.</p>
                </div>
                <button 
                    onClick={() => navigate('/sell')}
                    className="flex items-center justify-center gap-2 bg-[#458731] hover:bg-[#3a7229] text-white px-6 py-3.5 rounded-[8px] font-bold text-[14px] transition-all shadow-md active:scale-95 shrink-0"
                >
                    <Plus size={18} /> Create New Listing
                </button>
            </div>

            {/* Inventory Analytics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Active', value: listings.filter(l => l.status === 'active').length, icon: <TrendingUp size={14}/>, color: 'text-[#458731]' },
                    { label: 'Paused', value: listings.filter(l => l.status === 'paused').length, icon: <Pause size={14}/>, color: 'text-orange-500' },
                    { label: 'Sold', value: listings.filter(l => l.status === 'sold').length, icon: <CheckCircle2 size={14}/>, color: 'text-[#0064d2]' },
                    { label: 'Total Volume', value: listings.length, icon: <Ticket size={14}/>, color: 'text-[#1a1a1a]' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-[#e2e2e2] p-4 rounded-[12px] shadow-sm">
                        <div className="flex items-center gap-2 text-[#54626c] text-[11px] font-bold uppercase tracking-widest mb-1">
                            <span className={stat.color}>{stat.icon}</span> {stat.label}
                        </div>
                        <div className="text-[22px] font-black text-[#1a1a1a]">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Interactive Toolbelt (Search & Tabs) */}
            <div className="bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm mb-6 overflow-hidden">
                <div className="flex flex-col md:flex-row border-b border-[#e2e2e2]">
                    <div className="flex-1 flex overflow-x-auto no-scrollbar">
                        {['Active', 'Paused', 'Sold', 'Expired', 'All'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-[14px] font-black transition-all whitespace-nowrap border-b-2 ${
                                    activeTab === tab 
                                    ? 'border-[#458731] text-[#458731] bg-[#f9fdf7]' 
                                    : 'border-transparent text-[#54626c] hover:text-[#1a1a1a] hover:bg-gray-50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 md:w-80 border-t md:border-t-0 md:border-l border-[#e2e2e2] bg-[#fcfcfc]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by match or venue..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#cccccc] rounded-[8px] text-[14px] outline-none focus:border-[#458731] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Dynamic Listing Ledger */}
                <div className="p-0">
                    <AnimatePresence mode="popLayout">
                        {filteredListings.length > 0 ? (
                            <div className="divide-y divide-[#e2e2e2]">
                                {filteredListings.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        variants={itemAnimation}
                                        layout
                                        exit={{ opacity: 0, x: -20 }}
                                        className={`p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors group ${item.status === 'paused' ? 'bg-gray-50 opacity-80' : 'bg-white hover:bg-[#fcfcfc]'}`}
                                    >
                                        <div className="flex items-start gap-5 flex-1 min-w-0">
                                            <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center border border-gray-200 shrink-0 transition-colors ${item.status === 'paused' ? 'bg-gray-100' : 'bg-[#f8f9fa] group-hover:bg-[#eaf4d9]'}`}>
                                                <Ticket size={24} className={`transition-colors ${item.status === 'paused' ? 'text-gray-400' : 'text-[#1a1a1a] group-hover:text-[#458731]'}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                    <h3 className="text-[17px] font-black text-[#1a1a1a] truncate leading-none">{item.eventName || 'Cricket Event'}</h3>
                                                    {renderStatus(item.status)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[13px] text-[#54626c] font-medium">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {new Date(item.commence_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {item.loc || 'Stadium TBA'}</span>
                                                    <span className="text-[#1a1a1a] font-bold">Sec {item.section || 'GA'} · Row {item.row || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto border-t border-gray-100 md:border-0 pt-4 md:pt-0">
                                            <div className="text-right">
                                                <div className="text-[11px] font-bold text-[#54626c] uppercase tracking-widest mb-0.5">Price</div>
                                                <div className="text-[20px] font-black text-[#1a1a1a]">{currencySymbol}{item.price?.toLocaleString()}</div>
                                            </div>
                                            
                                            {/* Explicit Data Controls */}
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => window.open(`https://parbet-44902.web.app/event?id=${item.eventId}`, '_blank')}
                                                    className="p-2.5 text-gray-400 hover:text-[#0064d2] hover:bg-[#ebf3fb] rounded-[8px] transition-all"
                                                    title="View on Marketplace"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => toggleListingStatus(item)}
                                                    disabled={isMutating === item.id || item.status === 'sold' || item.status === 'expired'}
                                                    className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-[8px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={item.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
                                                >
                                                    {isMutating === item.id ? <Loader2 size={18} className="animate-spin" /> : item.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/edit-listing/${item.id}`)}
                                                    className="p-2.5 text-gray-400 hover:text-[#458731] hover:bg-[#eaf4d9] rounded-[8px] transition-all"
                                                    title="Edit Listing"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteListing(item.id)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-all"
                                                    title="Delete Listing Permanently"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-24 px-6 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6 border border-dashed border-gray-300">
                                    <Ticket size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-[18px] font-black text-[#1a1a1a] mb-2">No listings found in this category</h3>
                                <p className="text-[15px] text-[#54626c] max-w-sm mb-8 font-medium leading-relaxed">
                                    {searchTerm 
                                        ? "We couldn't find any matches for your current search term. Try checking your spelling or filters." 
                                        : "You don't have any tickets listed here yet. Start selling to see your inventory grow."}
                                </p>
                                <button 
                                    onClick={() => activeTab !== 'Active' ? setActiveTab('Active') : navigate('/sell')}
                                    className="bg-[#1a1a1a] hover:bg-black text-white px-8 py-3.5 rounded-[8px] font-black text-[14px] transition-all active:scale-95 shadow-lg"
                                >
                                    {activeTab !== 'Active' ? 'Show Active Listings' : 'List My Tickets'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-[#f0f9ff] border border-[#0064d2]/10 rounded-[12px] p-5 flex items-start gap-4">
                <AlertCircle className="text-[#0064d2] shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="text-[14px] text-[#0064d2] font-black mb-1">Inventory Information</p>
                    <p className="text-[13px] text-[#0064d2]/80 leading-relaxed font-medium">
                        Active listings are visible to millions of fans on the Parbet buyer platform instantly. You can adjust your pricing or remove your listing at any time until it is purchased. Once a sale occurs, it will automatically move to the "Sold" tab.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}