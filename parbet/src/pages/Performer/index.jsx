import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, MapPin, Calendar, ChevronDown, 
    Download, QrCode, ShieldCheck, Flame, Users,
    Clock, ChevronLeft, ChevronRight, Navigation, Loader2,
    Pencil, ShieldAlert, PlusCircle, Info
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

// Global Stores & Firebase
import { useAppStore } from '../../store/useStore';
import { useMarketStore } from '../../store/useMarketStore';
import { auth } from '../../lib/firebase';

// UI Components
import LocationDropdown from '../../components/LocationDropdown';
import AdminEditEventModal from '../../components/AdminEditEventModal';

/**
 * FEATURE 1: Real-Time Shared Database Integration (Linked to useMarketStore)
 * FEATURE 2: Strict IPL/Category Aggregation Engine
 * FEATURE 3: PocketBase Image Failsafe Scrubber (Fixes Cloudinary 404s)
 * FEATURE 4: Admin God-Mode Injector (Direct feed mutation & creation)
 * FEATURE 5: Dynamic Performer/Team Filtering Engine
 * FEATURE 6: Strict ISO Timestamp Parsing
 * FEATURE 7: Algorithmic "Trending" & "Fans Also Love" Derivation
 * FEATURE 8: Hardware-Accelerated Viagogo-Style Layout
 * FEATURE 9: Live Inventory Validation (See Tickets vs Sold Out)
 * FEATURE 10: Automatic State Hydration Failsafes
 */

// Strict Date Formatters mimicking the enterprise UI
const getMonthStr = (d) => {
    const date = new Date(d);
    return isNaN(date) ? 'TBA' : date.toLocaleDateString('en-US', { month: 'short' });
};
const getDayNum = (d) => {
    const date = new Date(d);
    return isNaN(date) ? '-' : date.getDate();
};
const getDowStr = (d) => {
    const date = new Date(d);
    return isNaN(date) ? 'TBA' : date.toLocaleDateString('en-US', { weekday: 'short' });
};
const getTimeStr = (d) => {
    const date = new Date(d);
    return isNaN(date) ? 'TBA' : date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) return 'This week';
    if (diffDays > 7 && diffDays <= 14) return 'Next week';
    return '';
};

// FEATURE 3: Cloudinary Legacy Scrubber for Fans Also Love images
const getSafeImage = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400';
    if (url.includes('res.cloudinary.com/dtz0urit6')) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400';
    return url;
};

export default function Performer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const performerName = decodeURIComponent(id || 'Indian Premier League');

    const { userCity, isLocationDropdownOpen, setLocationDropdownOpen, isAuthenticated } = useAppStore();
    
    // Shared Market State
    const { activeListings, isLoading, initMarketListener } = useMarketStore();

    // Local UI States
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Admin States
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [selectedAdminEvent, setSelectedAdminEvent] = useState(null);
    const [showLoader, setShowLoader] = useState(true);

    // Verify Admin Identity
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && user.email) {
                const validAdmins = ['testcodecfg@gmail.com', 'krishnamehta.gm@gmail.com', 'jatinseth.op@gmail.com'];
                setIsAdmin(validAdmins.includes(user.email.toLowerCase()));
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Initialize Real-Time Singleton Listener
    useEffect(() => {
        const unsubscribe = initMarketListener();
        window.scrollTo(0, 0);
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
        };
    }, [initMarketListener]);

    // Failsafe Loading Resolver
    useEffect(() => {
        if (activeListings && activeListings.length > 0) {
            setShowLoader(false);
        }
        const failsafe = setTimeout(() => setShowLoader(false), 4000);
        return () => clearTimeout(failsafe);
    }, [activeListings]);

    // FEATURE 2 & 5: Strict Real-Time API Filtering & Context Aggregation
    const { filteredEvents, fansAlsoLove } = useMemo(() => {
        
        // 1. Filter globally by performer/category strict overrides
        const base = activeListings.filter(m => {
            const searchString = `${m.title} ${m.eventName} ${m.team1} ${m.team2} ${m.league} ${m.sportCategory}`.toLowerCase();
            const query = performerName.toLowerCase();
            
            // Strict Aggregation Hooks
            if (query === 'ipl') return searchString.includes('ipl') || searchString.includes('premier league') || searchString.includes('cricket');
            if (query === 'cricket') return searchString.includes('cricket') || searchString.includes('t20') || searchString.includes('test');
            if (query === 'kabaddi') return searchString.includes('kabaddi') || searchString.includes('pkl');
            if (query === 'world cup') return searchString.includes('world cup') || searchString.includes('icc');
            
            return searchString.includes(query);
        });

        // 2. Filter locally by user's city drop-down
        const filtered = base.filter(m => {
            if (userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location' && userCity !== 'Detecting...') {
                const locStr = `${m.loc} ${m.city} ${m.location} ${m.stadium}`.toLowerCase();
                if (!locStr.includes(userCity.toLowerCase())) return false;
            }
            return true;
        });

        // 3. Derive "Fans Also Love" dynamically
        const tGroups = {};
        activeListings.forEach(e => {
            const key = e.sportCategory || e.team1 || e.title;
            if (!key) return;
            if (!tGroups[key]) tGroups[key] = { id: e.id, name: key, imageId: e.imageUrl || e.image || e.thumb, events: [] };
            tGroups[key].events.push(e);
        });

        const fansArr = Object.values(tGroups)
            .filter(g => !g.name.toLowerCase().includes(performerName.toLowerCase()))
            .slice(0, 4);

        return { 
            filteredEvents: filtered, 
            fansAlsoLove: fansArr 
        };
    }, [activeListings, performerName, userCity]);

    const viewerCount = useMemo(() => Math.floor((filteredEvents.length * 451.08) || 5413), [filteredEvents.length]);
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getDisplayName = () => {
        if (performerName.toUpperCase() === 'IPL') return 'Indian Premier League';
        if (performerName.toUpperCase() === 'ICC') return 'ICC World Cup';
        return performerName;
    };

    const handleCreateNew = () => {
        setSelectedAdminEvent({
            t1: performerName,
            t2: 'Opponent Team',
            league: performerName.toLowerCase().includes('ipl') ? 'Indian Premier League' : 'Tournament',
            sportCategory: performerName.toLowerCase().includes('ipl') || performerName.toLowerCase().includes('cricket') ? 'Cricket' : 'Sports'
        });
        setAdminModalOpen(true);
    };

    // CRITICAL BUGFIX: The button click was not utilizing the routing fixes established in Event/index.jsx
    const handleEventClick = (e, mId) => {
        e.stopPropagation();
        // Since Performer is an aggregate page, we send them to the specific Event Page
        // We do not need to verify auth here, as they are not booking yet. They just want to see the stadium map.
        navigate(`/event?id=${mId}`);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="w-full pb-20 bg-white font-sans text-[#1a1a1a]">
            
            <AdminEditEventModal 
                isOpen={adminModalOpen} 
                onClose={() => { setAdminModalOpen(false); setSelectedAdminEvent(null); }} 
                eventData={selectedAdminEvent} 
            />
            
            {/* EXACT VIAGOGO DARK GREEN HERO BANNER */}
            <div className="w-full bg-[#112d1e] h-[240px] md:h-[280px] relative overflow-hidden flex items-center">
                <div className="absolute inset-0 z-0 flex justify-end">
                    <div className="w-full md:w-[60%] h-full relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#112d1e] via-[#112d1e]/80 to-transparent z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1500&auto=format&fit=crop" 
                            alt="Stadium Cover" 
                            className="w-full h-full object-cover object-right"
                        />
                    </div>
                </div>
                
                <div className="relative z-20 max-w-[1200px] mx-auto px-4 md:px-8 w-full flex justify-between items-end md:items-center">
                    <h1 className="text-[36px] md:text-[56px] font-black text-white leading-[1.05] tracking-tight max-w-[600px] capitalize">
                        {getDisplayName()} <br className="hidden md:block" /> Tickets
                    </h1>
                    <div className="flex flex-col items-end gap-3">
                        <div className="hidden md:flex items-center gap-2 border border-white/40 rounded-full px-4 py-2 text-white bg-black/20 backdrop-blur-sm cursor-pointer hover:bg-black/40 transition-colors">
                            <span className="text-[14px] font-bold">10.8K</span>
                            <Heart size={16} />
                        </div>
                        {isAdmin && (
                            <button onClick={handleCreateNew} className="bg-[#8cc63f] text-[#1a1a1a] px-5 py-2.5 rounded-full font-black flex items-center gap-2 hover:bg-white transition-colors shadow-lg shadow-[#8cc63f]/20 shrink-0 text-[14px]">
                                <PlusCircle size={18} /> Add Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6">
                
                {/* VIEWER BANNER */}
                <div className="w-full bg-[#eaf4fd] text-[#0064d2] rounded-[8px] p-4 flex items-center mb-6 shadow-sm border border-[#d2e8fa]">
                    <Users size={20} className="mr-3 shrink-0" strokeWidth={2.5}/>
                    <span className="text-[14px] md:text-[15px] font-medium tracking-tight">
                        {viewerCount.toLocaleString()} people viewed {getDisplayName()} events in the past hour
                    </span>
                </div>

                {/* FILTER ROW */}
                <div className="flex flex-wrap items-center gap-3 overflow-visible pb-6 border-b border-[#e2e2e2] mb-6">
                    <div className="relative">
                        <button 
                            onClick={() => { setLocationDropdownOpen(!isLocationDropdownOpen); setActiveDropdown(null); }}
                            className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-black transition-colors"
                        >
                            <Navigation size={14} className="mr-2 fill-white -rotate-45"/> 
                            {userCity === 'Loading...' || userCity === 'Detecting...' ? 'Detecting...' : (userCity === 'All Cities' ? 'Global' : userCity)} 
                            <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        {isLocationDropdownOpen && <div className="absolute left-0 mt-2 z-50"><LocationDropdown /></div>}
                    </div>

                    <button className="bg-white border border-[#e2e2e2] text-[#1a1a1a] px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-[#f8f9fa] transition-colors">
                        All dates <ChevronDown size={16} className="ml-2 text-[#9ca3af]"/>
                    </button>

                    <button className="bg-white border border-[#e2e2e2] text-[#1a1a1a] px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-[#f8f9fa] transition-colors">
                        Hide sold out
                    </button>
                </div>

                {/* EVENT LIST HEADER */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] md:text-[20px] font-black text-[#1a1a1a] tracking-tight flex items-center gap-3">
                        {filteredEvents.length} events in {userCity && !['Loading...', 'Detecting...', 'All Cities', 'Global'].includes(userCity) ? userCity : 'all locations'}
                        {isAdmin && (
                            <span className="hidden md:inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest">
                                <ShieldAlert size={12} /> Admin
                            </span>
                        )}
                    </h2>
                </div>

                {/* MAIN EVENT LEDGER */}
                <div className="flex flex-col gap-3 mb-12">
                    {showLoader ? (
                        <div className="w-full py-20 flex flex-col items-center justify-center border border-[#e2e2e2] rounded-[12px] bg-[#f8f9fa]">
                            <Loader2 size={32} className="text-[#8cc63f] animate-spin mb-4" />
                            <p className="text-[14px] font-bold text-[#1a1a1a]">Syncing live secure inventory...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="w-full py-16 flex flex-col items-center justify-center bg-white border border-[#e2e2e2] rounded-[12px] shadow-sm">
                            <ShieldCheck size={48} className="text-[#9ca3af] mb-4" />
                            <h3 className="text-[18px] font-black text-[#1a1a1a]">No Active Events Found</h3>
                            <p className="text-[14px] text-[#54626c] mt-2">Sellers are currently updating inventory for {getDisplayName()}.</p>
                        </div>
                    ) : (
                        paginatedEvents.map((m, index) => {
                            const displayPrice = m.startingPrice !== null && m.startingPrice !== undefined ? m.startingPrice : m.price || m.minPrice;
                            const hasTickets = displayPrice !== null && displayPrice !== undefined;
                            const formattedPrice = hasTickets ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayPrice) : null;
                            const relativeLabel = getRelativeDateLabel(m.commence_time || m.eventTimestamp);
                            
                            const isHottest = index === 0;
                            const isSellingOut = index === 1 || index === 2;
                            
                            const dObj = new Date(m.commence_time || m.eventTimestamp);
                            const isWeekend = !isNaN(dObj) && (dObj.getDay() === 0 || dObj.getDay() === 6);

                            return (
                                <div 
                                    key={m.id} 
                                    onClick={(e) => handleEventClick(e, m.id)}
                                    className="relative bg-white border border-[#e2e2e2] rounded-[12px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-md hover:border-[#8cc63f] transition-all cursor-pointer group/item"
                                >
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAdminEvent(m);
                                                setAdminModalOpen(true);
                                            }}
                                            className="absolute -top-3 -right-3 md:top-1/2 md:-translate-y-1/2 md:right-4 z-[60] bg-red-600 text-white p-2.5 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.4)] opacity-100 md:opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 hover:bg-red-700"
                                            title="God Mode: Edit Event"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}

                                    {/* Exact Viagogo Date Tear-off */}
                                    <div className="flex items-center flex-1">
                                        <div className="flex flex-col items-center justify-center pr-5 md:pr-6 border-r border-[#e2e2e2] min-w-[70px]">
                                            <span className="text-[13px] font-bold text-[#1a1a1a] uppercase">{getMonthStr(m.commence_time || m.eventTimestamp)}</span>
                                            <span className="text-[28px] font-black text-[#1a1a1a] leading-none my-0.5">{getDayNum(m.commence_time || m.eventTimestamp)}</span>
                                            <span className="text-[12px] text-[#54626c] font-medium uppercase">{getDowStr(m.commence_time || m.eventTimestamp)}</span>
                                        </div>
                                        
                                        {/* Event Details */}
                                        <div className="pl-5 md:pl-6 flex-1 min-w-0">
                                            <h3 className="text-[16px] md:text-[18px] font-bold text-[#1a1a1a] leading-tight mb-1 truncate group-hover/item:text-[#458731] transition-colors pr-8">
                                                {m.title || m.eventName || `${m.t1} vs ${m.t2}`}
                                            </h3>
                                            <p className="text-[13px] text-[#54626c] flex items-center mb-2 truncate font-bold">
                                                {getTimeStr(m.commence_time || m.eventTimestamp)} • <MapPin size={12} className="mx-1.5 shrink-0 text-[#9ca3af]" /> <span className="truncate">{m.stadium || m.loc}, {m.location?.split(',')[0] || m.city}</span>
                                            </p>
                                            
                                            {/* Dynamic Tags */}
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {relativeLabel && (
                                                    <div className="flex items-center bg-[#f8f9fa] border border-[#e2e2e2] text-[#1a1a1a] px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <Calendar size={12} className="mr-1.5 text-[#9ca3af]"/> {relativeLabel}
                                                    </div>
                                                )}
                                                {isHottest && (
                                                    <div className="flex items-center bg-[#eaf4d9] text-[#458731] px-2 py-0.5 rounded-[4px] text-[11px] font-bold border border-[#d2e8b0]">
                                                        <Flame size={12} className="mr-1.5"/> Hottest event
                                                    </div>
                                                )}
                                                {isSellingOut && hasTickets && (
                                                    <div className="flex items-center bg-[#fdf2f2] text-[#c21c3a] px-2 py-0.5 rounded-[4px] text-[11px] font-bold border border-[#fecaca]">
                                                        <Clock size={12} className="mr-1.5"/> Few tickets left
                                                    </div>
                                                )}
                                                {isWeekend && !isSellingOut && !isHottest && (
                                                    <div className="flex items-center bg-[#f8f9fa] border border-[#e2e2e2] text-[#1a1a1a] px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <Calendar size={12} className="mr-1.5 text-[#9ca3af]"/> This weekend
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* See Tickets Button mapped to Live Inventory */}
                                    <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-[#e2e2e2] md:border-t-0 flex justify-end shrink-0 md:pl-4 md:pr-12">
                                        {hasTickets ? (
                                            <div className="flex items-center md:flex-col gap-4 md:gap-0 w-full md:w-auto">
                                                <div className="flex flex-col items-start md:items-end flex-1 md:flex-none md:mb-1">
                                                    <span className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">Starting from</span>
                                                    <span className="text-[20px] font-black text-[#1a1a1a]">{formattedPrice}</span>
                                                </div>
                                                <button className="w-auto px-6 py-2.5 rounded-[8px] font-bold text-[14px] bg-[#8cc63f] text-[#1a1a1a] hover:bg-[#7ab332] transition-colors shadow-sm shrink-0 whitespace-nowrap">
                                                    See tickets
                                                </button>
                                            </div>
                                        ) : (
                                            <button disabled className="w-full md:w-auto px-6 py-2.5 rounded-[8px] font-bold text-[14px] border border-[#e2e2e2] text-[#c21c3a] bg-[#fdf2f2] cursor-not-allowed">
                                                Sold out
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mb-16">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center text-[#9ca3af] hover:text-[#1a1a1a] disabled:opacity-30">
                            <ChevronLeft size={20} />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 flex items-center justify-center rounded-full text-[14px] font-bold transition-colors ${page === currentPage ? 'bg-[#1a1a1a] text-white' : 'bg-transparent text-[#1a1a1a] hover:bg-[#f8f9fa]'}`}>
                                    {page}
                                </button>
                            );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center text-[#9ca3af] hover:text-[#1a1a1a] disabled:opacity-30">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* DYNAMIC FANS ALSO LOVE CAROUSEL */}
                {fansAlsoLove.length > 0 && (
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[20px] md:text-[24px] font-black text-[#1a1a1a] tracking-tight">
                                {getDisplayName()} fans also love
                            </h2>
                        </div>
                        
                        <div className="flex overflow-x-auto custom-scrollbar space-x-4 pb-4 snap-x">
                            {fansAlsoLove.map((item, idx) => (
                                <div key={idx} className="min-w-[240px] max-w-[240px] cursor-pointer group snap-start" onClick={() => navigate(`/performer/${encodeURIComponent(item.name)}`)}>
                                    <div className="w-full h-[150px] relative rounded-[16px] overflow-hidden mb-3 border border-[#e2e2e2] shadow-sm group-hover:shadow-md transition-shadow bg-[#1a1a1a]">
                                        <img src={getSafeImage(item.imageId)} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h3 className="font-black text-[#1a1a1a] text-[16px] leading-tight truncate group-hover:text-[#458731] transition-colors">{item.name}</h3>
                                    <p className="text-[13px] text-[#54626c] font-medium mt-1">{item.events.length} upcoming events</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* APP DOWNLOAD BANNER */}
                <div className="w-full bg-[#f8f9fa] rounded-[24px] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden mb-12 shadow-sm border border-[#e2e2e2]">
                    <div className="md:w-1/2 z-10 text-center md:text-left mb-6 md:mb-0">
                        <h2 className="text-[26px] md:text-[32px] font-black text-[#1a1a1a] mb-1 leading-tight tracking-tight">Download the parbet app</h2>
                        <p className="text-[15px] text-[#54626c] font-medium mb-6 max-w-sm mx-auto md:mx-0">Discover your favourite events with ease and secure tickets instantly.</p>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 justify-center md:justify-start">
                            <button className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-[12px] flex items-center hover:bg-black transition-colors w-full sm:w-auto justify-center shadow-md">
                                <Download size={20} className="mr-3" />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] block opacity-80 uppercase tracking-widest font-bold mb-0.5">Download on the</span>
                                    <span className="text-[14px] font-black tracking-tight">App Store</span>
                                </div>
                            </button>
                            <button className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-[12px] flex items-center hover:bg-black transition-colors w-full sm:w-auto justify-center shadow-md">
                                <Download size={20} className="mr-3" />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] block opacity-80 uppercase tracking-widest font-bold mb-0.5">GET IT ON</span>
                                    <span className="text-[14px] font-black tracking-tight">Google Play</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center md:justify-end z-10 pr-4">
                        <div className="bg-white p-4 rounded-[16px] shadow-xl border border-[#e2e2e2] flex flex-col items-center">
                            <QrCode size={100} className="text-[#1a1a1a]"/>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}