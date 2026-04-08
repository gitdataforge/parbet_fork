import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, Share, MapPin, Calendar, Tag, ChevronDown, 
    Info, Download, QrCode, ShieldCheck, Flame, Users,
    Search, Check, Clock, ChevronLeft, ChevronRight, Bookmark, Navigation
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import LocationDropdown from '../../components/LocationDropdown';
import FilterDropdown from '../../components/FilterDropdown';
import PerformerHero from '../../components/PerformerHero';
import ViagogoEventCard from '../../components/ViagogoEventCard';

// Strict Relative Date Formatter
const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = Math.abs(eventDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'This week';
    return '';
};

export default function Performer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const performerName = decodeURIComponent(id || '');

    const { 
        liveMatches, 
        userCity, 
        isLoadingMatches, 
        fetchLocationAndMatches,
        isAuthenticated,
        isLocationDropdownOpen,
        setLocationDropdownOpen,
        performerFilters,
        setPerformerFilter,
        toggleFavorite
    } = useAppStore();

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [emailInput, setEmailInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14; // Matched to Viagogo screenshot exact count

    useEffect(() => {
        if (liveMatches.length === 0 && !isLoadingMatches) {
            fetchLocationAndMatches();
        }
        window.scrollTo(0, 0);
    }, [liveMatches.length, isLoadingMatches, fetchLocationAndMatches, id]);

    const handleRestrictedAction = (e, obj) => {
        e.stopPropagation();
        if (!isAuthenticated) navigate('/login');
        else toggleFavorite(obj);
    };

    const toggleDropdown = (dropdownName) => {
        if (activeDropdown === dropdownName) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(dropdownName);
            setLocationDropdownOpen(false);
        }
    };

    // --- RIGOROUS REAL-TIME API FILTERING ---
    const { baseEvents, filteredEvents, uniqueOpponents, trendingGroups } = useMemo(() => {
        const base = liveMatches.filter(m => 
            m.t1.toLowerCase().includes(performerName.toLowerCase()) || 
            m.t2?.toLowerCase().includes(performerName.toLowerCase()) ||
            m.league.toLowerCase().includes(performerName.toLowerCase())
        );

        const opponentsSet = new Set();
        base.forEach(m => {
            if (m.t1 && !m.t1.toLowerCase().includes(performerName.toLowerCase())) opponentsSet.add(m.t1);
            if (m.t2 && !m.t2.toLowerCase().includes(performerName.toLowerCase())) opponentsSet.add(m.t2);
        });

        const filtered = base.filter(m => {
            if (userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location') {
                if (m.loc && !m.loc.toLowerCase().includes(userCity.toLowerCase())) return false;
            }
            if (performerFilters.activeOpponent && performerFilters.activeOpponent !== 'All opponents') {
                const opponentName = performerFilters.activeOpponent.toLowerCase();
                const isPlayingOpponent = (m.t1 && m.t1.toLowerCase().includes(opponentName)) || (m.t2 && m.t2.toLowerCase().includes(opponentName));
                if (!isPlayingOpponent) return false;
            }
            if (performerFilters.homeAway !== 'All games') {
                const isHome = m.t1.toLowerCase().includes(performerName.toLowerCase());
                if (performerFilters.homeAway === 'Home games' && !isHome) return false;
                if (performerFilters.homeAway === 'Away games' && isHome) return false;
            }
            return true;
        });

        // Derive Trending Groups for the bottom rail based on local city volume
        const trendingRaw = liveMatches.filter(m => 
            userCity !== 'All Cities' && m.loc && m.loc.toLowerCase().includes(userCity.toLowerCase())
        );
        const tGroups = {};
        trendingRaw.forEach(e => {
            const key = e.league || e.t1;
            if (!tGroups[key]) tGroups[key] = { id: e.id, name: key, imageId: e.t1, events: [] };
            tGroups[key].events.push(e);
        });
        const trendingArr = Object.values(tGroups).map(g => {
            g.events.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
            const first = g.events[0];
            const formatDateStr = (dStr) => {
                const d = new Date(dStr);
                return `${d.toLocaleDateString('en-US', {weekday: 'short'})}, ${d.toLocaleDateString('en-US', {month: 'short'})} ${d.getDate()} • ${d.toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit'})}`;
            };
            return { ...g, dateStr: formatDateStr(first.commence_time), count: g.events.length, firstEventId: first.id };
        }).sort((a, b) => b.count - a.count).slice(0, 6);

        return { baseEvents: base, filteredEvents: filtered, uniqueOpponents: Array.from(opponentsSet).sort(), trendingGroups: trendingArr };
    }, [liveMatches, performerName, userCity, performerFilters]);

    // Derived State for Analytics & Pagination
    const viewerCount = useMemo(() => Math.floor(filteredEvents.length * 142.5) || 3656, [filteredEvents.length]);
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const relatedEvents = liveMatches.filter(m => 
        !m.t1.toLowerCase().includes(performerName.toLowerCase()) && 
        !m.league.toLowerCase().includes(performerName.toLowerCase())
    ).slice(0, 6);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="w-full pb-20 bg-white font-sans">
            
            {/* 1. HERO SECTION (image_e76fca.jpg top portion) */}
            <PerformerHero performerName={performerName} eventCount={filteredEvents.length} userCity={userCity} />

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6">
                
                {/* 2. VIEWER BANNER */}
                <div className="w-full bg-[#e8f4fd] text-[#005c9e] rounded-[8px] p-3.5 flex items-center mb-6 shadow-sm border border-[#cce5f9]">
                    <Users size={20} className="mr-3 shrink-0" strokeWidth={2.5}/>
                    <span className="text-[14px] md:text-[15px] font-medium tracking-tight">
                        {viewerCount.toLocaleString()} people viewed {performerName} events in the past hour
                    </span>
                </div>

                {/* 3. FILTER ROW (Strict UI Matching) */}
                <div className="flex flex-wrap items-center gap-3 overflow-visible pb-6 relative z-50">
                    <div className="relative">
                        <button 
                            onClick={() => { setLocationDropdownOpen(!isLocationDropdownOpen); setActiveDropdown(null); }}
                            className="bg-[#212529] text-white px-5 py-2.5 rounded-[8px] text-[14px] font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-black transition-colors"
                        >
                            <Navigation size={14} className="mr-2 fill-white -rotate-45"/> 
                            {userCity === 'Loading...' ? 'Detecting...' : userCity} 
                            <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        {isLocationDropdownOpen && (
                            <div className="absolute left-0 mt-2 z-50"><LocationDropdown /></div>
                        )}
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => toggleDropdown('date')}
                            className="bg-white border border-[#cccccc] text-[#333] px-5 py-2.5 rounded-[8px] text-[14px] font-medium flex items-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            All dates <ChevronDown size={16} className="ml-2 text-gray-500"/>
                        </button>
                        <FilterDropdown type="date" isOpen={activeDropdown === 'date'} onClose={() => setActiveDropdown(null)} />
                    </div>

                    <button className="bg-white border border-[#cccccc] text-[#333] px-5 py-2.5 rounded-[8px] text-[14px] font-medium flex items-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
                        Hide sold out
                    </button>
                </div>

                {/* 4. EVENT LIST HEADER */}
                <h2 className="text-[18px] md:text-[20px] font-black text-[#1a1a1a] mb-5 tracking-tight">
                    {filteredEvents.length} events in {userCity !== 'All Cities' ? userCity : 'all locations'}
                </h2>

                {/* 5. 2-COLUMN LAYOUT: Event List & Guarantee Rail */}
                <div className="flex flex-col lg:flex-row gap-8 mb-12 relative">
                    <div className="flex-1 flex flex-col space-y-3 z-10">
                        {isLoadingMatches ? (
                            <div className="w-full py-20 flex flex-col items-center justify-center border border-gray-200 rounded-[12px]">
                                <div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-sm font-bold text-gray-500">Loading events...</p>
                            </div>
                        ) : paginatedEvents.length === 0 ? (
                            <div className="w-full py-16 bg-gray-50 rounded-[12px] border border-gray-200 text-center">
                                <h3 className="text-[18px] font-bold text-gray-900 mb-2">No matching events</h3>
                                <p className="text-gray-500 text-[14px]">Try adjusting your filters or location to see more results.</p>
                            </div>
                        ) : (
                            paginatedEvents.map((m) => {
                                const relativeLabel = getRelativeDateLabel(m.commence_time);
                                return (
                                    <div 
                                        key={m.id} 
                                        onClick={() => navigate(`/event?id=${m.id}`)}
                                        className="bg-white border border-[#cccccc] rounded-[12px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center flex-1">
                                            {/* Date Tear-off */}
                                            <div className="flex flex-col items-center justify-center pr-5 md:pr-6 border-r border-[#cccccc] min-w-[80px]">
                                                <span className="text-[13px] font-bold text-[#1a1a1a] uppercase">{m.month}</span>
                                                <span className="text-[28px] font-black text-[#1a1a1a] leading-none my-0.5">{m.day}</span>
                                                <span className="text-[12px] text-gray-500 font-medium">{m.dow}</span>
                                            </div>
                                            
                                            {/* Event Details */}
                                            <div className="pl-5 md:pl-6 flex-1 min-w-0">
                                                <h3 className="text-[16px] md:text-[18px] font-bold text-[#1a1a1a] leading-tight mb-1 truncate group-hover:text-[#114C2A] transition-colors">
                                                    {m.t1} {m.t2 ? `vs ${m.t2}` : ''}
                                                </h3>
                                                <p className="text-[13px] text-gray-500 flex items-center mb-2 truncate">
                                                    {m.time} • 🇮🇳 {m.loc}
                                                </p>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {relativeLabel && (
                                                        <div className="flex items-center bg-white border border-gray-200 text-[#333] px-2 py-0.5 rounded-[4px] text-[11px] font-bold shadow-sm">
                                                            <Calendar size={12} className="mr-1.5 opacity-60"/> {relativeLabel}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center bg-[#EAF4D9] text-[#114C2A] px-2 py-0.5 rounded-[4px] text-[11px] font-bold border border-[#C5E1A5]">
                                                        <Tag size={12} className="mr-1.5"/> Prices below 30-day average
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-[#cccccc] md:border-t-0 flex justify-end shrink-0 md:pl-4">
                                            <button className="w-full md:w-auto border border-[#cccccc] text-[#1a1a1a] bg-white px-5 py-2 rounded-[8px] font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm">
                                                See tickets
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* 6. PAGINATION CONTROLS (image_e77009.png) */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-1 mt-8">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    const isActive = page === currentPage;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-[14px] font-bold transition-colors ${isActive ? 'bg-[#458731] text-white' : 'bg-transparent text-[#333] hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Guarantee Rail */}
                    <div className="hidden lg:block w-[320px] shrink-0">
                        <div className="sticky top-[100px] p-5 bg-white rounded-[12px] border border-[#cccccc] flex items-start gap-4 shadow-sm">
                            <ShieldCheck size={28} className="text-[#458731] shrink-0"/>
                            <div>
                                <h4 className="font-bold text-[#1a1a1a] mb-1 text-[16px]">100% Order Guarantee</h4>
                                <p className="text-[13px] text-gray-500 leading-relaxed">We back every order so you can buy and sell tickets with 100% confidence.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. RECOMMENDATION BANNER (image_e77041.jpg) */}
                <div className="w-full bg-[#EAF4D9] rounded-[8px] p-4 md:p-6 mb-16 flex flex-col md:flex-row justify-between items-center border border-[#C5E1A5] shadow-sm">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <Bookmark size={24} className="text-[#114C2A] fill-[#114C2A]" />
                        <h3 className="text-[16px] md:text-[20px] font-bold text-[#114C2A]">Want better ticket recommendations?</h3>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-[#C5E1A5] mx-6"></div>
                    <button onClick={() => navigate('/login')} className="bg-[#458731] hover:bg-[#366a26] text-white font-bold px-6 py-2.5 rounded-[8px] transition-colors w-full md:w-auto text-[14px]">
                        Sign in / Create an account
                    </button>
                </div>

                {/* 8. TRENDING LOCAL EVENTS RAIL (image_e77067.jpg) */}
                {trendingGroups.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] mb-6 tracking-tight">Trending events near <span className="text-[#458731]">{userCity}</span></h2>
                        <div className="flex overflow-x-auto hide-scrollbar space-x-5 pb-4 snap-x">
                             {trendingGroups.map((g, idx) => (
                                  <div key={idx} className="relative min-w-[280px] max-w-[280px] group cursor-pointer" onClick={() => navigate(`/event?id=${g.firstEventId}`)}>
                                       <div className="absolute top-3 left-3 z-20 bg-[#458731] text-white text-[12px] font-bold px-2 py-0.5 rounded-[4px] shadow-sm">#{idx + 1}</div>
                                       <ViagogoEventCard group={g} onClick={() => navigate(`/event?id=${g.firstEventId}`)} />
                                  </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* APP DOWNLOAD BANNER */}
                <div className="w-full bg-[#eff4eb] rounded-[16px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center relative overflow-hidden mb-16 shadow-sm">
                    <div className="md:w-1/2 z-10 text-center md:text-left mb-8 md:mb-0">
                        <h2 className="text-[28px] md:text-[36px] font-black text-[#1a1a1a] mb-2 leading-tight tracking-tight">Download the viagogo app</h2>
                        <p className="text-[16px] text-gray-600 font-medium mb-8">Discover your favourite events with ease</p>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button className="bg-black text-white px-5 py-3 rounded-[12px] flex items-center hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center shadow-md">
                                <Download size={22} className="mr-3" />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] block opacity-80">Download on the</span>
                                    <span className="text-[14px] font-bold">App Store</span>
                                </div>
                            </button>
                            <button className="bg-black text-white px-5 py-3 rounded-[12px] flex items-center hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center shadow-md">
                                <Download size={22} className="mr-3" />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] block opacity-80">GET IT ON</span>
                                    <span className="text-[14px] font-bold">Google Play</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center md:justify-end z-10">
                        <div className="bg-white p-3 rounded-[16px] shadow-lg border border-gray-100 flex flex-col items-center">
                            <QrCode size={90} className="text-gray-900 mb-2"/>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scan to get</span>
                        </div>
                    </div>
                </div>

                {/* EMAIL SUBSCRIPTION BANNER */}
                <div className="w-full flex flex-col items-center text-center px-4 mb-8">
                    <h3 className="text-[18px] md:text-[20px] font-bold text-[#1a1a1a] mb-6">Get hot events and deals delivered straight to your inbox</h3>
                    <div className="flex flex-col sm:flex-row items-center w-full max-w-md space-y-3 sm:space-y-0 sm:space-x-3">
                        <div className="relative w-full">
                            <input 
                                type="email" placeholder="Email address" 
                                value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-300 py-3 outline-none focus:border-[#458731] transition-colors text-[16px] font-medium text-[#1a1a1a] placeholder-gray-500"
                            />
                        </div>
                        <button className="w-full sm:w-auto border border-[#458731] text-[#458731] font-bold px-8 py-3 rounded-[8px] hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm">
                            Join the List
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}