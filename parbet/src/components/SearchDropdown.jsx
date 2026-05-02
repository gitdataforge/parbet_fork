import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, MapPin, Calendar, X, Search, 
    TrendingUp, Music, Trophy, ArrowRight, Flame 
} from 'lucide-react';
import { useAppStore } from '../store/useStore';

/**
 * GLOBAL REBRAND: Booknshow Search Dropdown
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 */

// FEATURE 1: Real-Time Text Highlighting Logic (Rebranded to #E7364D)
const HighlightText = ({ text, query }) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <strong key={i} className="text-[#E7364D] font-black">{part}</strong>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default function SearchDropdown() {
    const navigate = useNavigate();
    const { 
        isSearchExpanded, 
        setSearchExpanded, 
        trendingPerformers, 
        searchQuery,
        setSearchQuery,
        liveMatches,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        userCity
    } = useAppStore();

    // Handle clicking a generic search string or category
    const handleGenericSearch = (searchString) => {
        setSearchQuery(searchString);
        addRecentSearch(searchString);
        setSearchExpanded(false);
        navigate('/explore');
    };

    // Handle clicking a specific event
    const handleEventClick = (event) => {
        addRecentSearch(`${event.t1} vs ${event.t2}`);
        setSearchExpanded(false);
        navigate(`/event?id=${event.id}`);
    };

    const query = searchQuery.trim().toLowerCase();

    // ------------------------------------------------------------------
    // API DATA RESOLUTION
    // ------------------------------------------------------------------

    // SECTION 1: Smart Date Context - Happening Today
    const todayEvents = useMemo(() => {
        const today = new Date().toDateString();
        return liveMatches
            .filter(m => new Date(m.commence_time).toDateString() === today)
            .slice(0, 2);
    }, [liveMatches]);

    // SECTION 2: Regional Popular Venues
    const popularVenues = useMemo(() => {
        const venues = new Set();
        liveMatches.forEach(m => { if(m.loc) venues.add(m.loc) });
        return Array.from(venues).slice(0, 4);
    }, [liveMatches]);

    // SECTION 3: Dynamic Array Grouping (Events vs Venues)
    const { eventMatches, venueMatches } = useMemo(() => {
        if (!query) return { eventMatches: [], venueMatches: [] };
        
        const events = [];
        const venuesSet = new Set();
        const venues = [];

        liveMatches.forEach(m => {
            const matchesEvent = m.t1.toLowerCase().includes(query) || m.t2?.toLowerCase().includes(query) || m.league.toLowerCase().includes(query);
            const matchesVenue = m.loc?.toLowerCase().includes(query);

            if (matchesEvent && events.length < 5) events.push(m);
            if (matchesVenue && !venuesSet.has(m.loc) && venues.length < 3) {
                venuesSet.add(m.loc);
                venues.push(m);
            }
        });

        return { eventMatches: events, venueMatches: venues };
    }, [liveMatches, query]);

    return (
        <AnimatePresence>
            {isSearchExpanded && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-[110%] left-0 right-0 bg-[#FFFFFF] rounded-[16px] shadow-[0_20px_50px_rgba(51,51,51,0.2)] border border-[#A3A3A3]/20 z-[100] overflow-hidden flex flex-col"
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing before click registers
                >
                    <div className="px-3 md:px-5 pt-5 pb-3 max-h-[60vh] overflow-y-auto hide-scrollbar flex-1">
                        
                        {/* -------------------------------------------------------- */}
                        {/* IDLE STATE: EXPLORATION (No active query)                */}
                        {/* -------------------------------------------------------- */}
                        {!query ? (
                            <div className="space-y-6">
                                
                                {/* SECTION 4: Top Categories (Quick Links) */}
                                <div>
                                    <h4 className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest px-2 mb-3">Browse by Category</h4>
                                    <div className="flex flex-wrap gap-2 px-2">
                                        <button onClick={() => handleGenericSearch('Sports')} className="flex items-center bg-[#FFFFFF] border border-[#A3A3A3]/30 text-[#626262] px-3 py-1.5 rounded-full text-[13px] font-bold hover:bg-[#FAD8DC]/30 hover:text-[#E7364D] hover:border-[#E7364D]/50 transition-colors">
                                            <Trophy size={14} className="mr-1.5" /> Sports
                                        </button>
                                        <button onClick={() => handleGenericSearch('Concerts')} className="flex items-center bg-[#FFFFFF] border border-[#A3A3A3]/30 text-[#626262] px-3 py-1.5 rounded-full text-[13px] font-bold hover:bg-[#FAD8DC]/30 hover:text-[#E7364D] hover:border-[#E7364D]/50 transition-colors">
                                            <Music size={14} className="mr-1.5" /> Concerts
                                        </button>
                                        <button onClick={() => handleGenericSearch('Festival')} className="flex items-center bg-[#FFFFFF] border border-[#A3A3A3]/30 text-[#626262] px-3 py-1.5 rounded-full text-[13px] font-bold hover:bg-[#FAD8DC]/30 hover:text-[#E7364D] hover:border-[#E7364D]/50 transition-colors">
                                            <Flame size={14} className="mr-1.5" /> Festivals
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION 5: Recent Searches */}
                                {recentSearches && recentSearches.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest px-2">Recent Searches</h4>
                                            <button onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }} className="text-[11px] font-bold text-[#A3A3A3] hover:text-[#E7364D] transition-colors px-2">Clear</button>
                                        </div>
                                        <div className="flex flex-col">
                                            {recentSearches.map((item, idx) => (
                                                <button
                                                    key={`recent-${idx}`}
                                                    onClick={() => handleGenericSearch(item)}
                                                    className="flex items-center px-3 py-2.5 rounded-xl hover:bg-[#FAD8DC]/20 transition-colors group w-full text-left"
                                                >
                                                    <Clock size={16} className="text-[#A3A3A3] mr-3 group-hover:text-[#E7364D] transition-colors shrink-0" />
                                                    <span className="text-[14px] font-medium text-[#333333] group-hover:text-[#E7364D] truncate">{item}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 6: Happening Today (Smart Context) */}
                                {todayEvents.length > 0 && (
                                    <div>
                                        <h4 className="text-[12px] font-bold text-[#E7364D] uppercase tracking-widest px-2 mb-3 flex items-center">
                                            <Flame size={14} className="mr-1" /> Happening Today
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {todayEvents.map((event, idx) => (
                                                <button
                                                    key={`today-${idx}`}
                                                    onClick={() => handleEventClick(event)}
                                                    className="flex items-center p-3 border border-[#A3A3A3]/20 rounded-xl hover:border-[#E7364D] hover:bg-[#FAD8DC]/10 transition-all text-left group"
                                                >
                                                    <div className="bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-lg flex flex-col items-center justify-center w-12 h-12 shrink-0 mr-3 shadow-sm group-hover:border-[#E7364D]">
                                                        <span className="text-[9px] font-black text-[#E7364D] uppercase">{event.month}</span>
                                                        <span className="text-[16px] font-black text-[#333333] leading-none">{event.day}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-bold text-[14px] text-[#333333] truncate group-hover:text-[#E7364D]">{event.t1} {event.t2 ? `vs ${event.t2}` : ''}</h5>
                                                        <p className="text-[12px] text-[#626262] truncate flex items-center mt-0.5">
                                                            <MapPin size={10} className="mr-1 opacity-70"/> {event.loc}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 7: Popular Venues */}
                                {popularVenues.length > 0 && (
                                    <div>
                                        <h4 className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest px-2 mb-2">Venues near {userCity !== 'Loading...' ? userCity : 'you'}</h4>
                                        <div className="flex flex-col">
                                            {popularVenues.map((venue, idx) => (
                                                <button
                                                    key={`venue-${idx}`}
                                                    onClick={() => handleGenericSearch(venue)}
                                                    className="flex items-center px-3 py-2.5 rounded-xl hover:bg-[#FAD8DC]/20 transition-colors group w-full text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#A3A3A3]/20 flex items-center justify-center mr-3 group-hover:bg-[#E7364D] group-hover:border-[#E7364D] transition-colors shrink-0">
                                                        <MapPin size={14} className="text-[#A3A3A3] group-hover:text-[#FFFFFF]" />
                                                    </div>
                                                    <span className="text-[14px] font-bold text-[#626262] group-hover:text-[#E7364D] truncate">{venue}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            /* -------------------------------------------------------- */
                            /* ACTIVE STATE: LIVE API SUGGESTIONS (With Highlighting)   */
                            /* -------------------------------------------------------- */
                            <div className="space-y-6">
                                
                                {/* SECTION 8: Direct Event Matches */}
                                {eventMatches.length > 0 && (
                                    <div>
                                        <h4 className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest px-2 mb-2">Events</h4>
                                        <div className="flex flex-col">
                                            {eventMatches.map((event, idx) => (
                                                <button
                                                    key={`event-match-${idx}`}
                                                    onClick={() => handleEventClick(event)}
                                                    className="flex items-start px-3 py-3 rounded-xl hover:bg-[#FAD8DC]/20 transition-colors group w-full text-left border border-transparent hover:border-[#FAD8DC]"
                                                >
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FFFFFF] mr-3 shrink-0 border border-[#A3A3A3]/20">
                                                        <img src={`https://loremflickr.com/100/100/${encodeURIComponent(event.league.split(' ')[0])},sports/all`} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[15px] font-medium text-[#333333] truncate leading-tight mb-1 group-hover:text-[#E7364D]">
                                                            <HighlightText text={`${event.t1} ${event.t2 ? `vs ${event.t2}` : ''}`} query={query} />
                                                        </span>
                                                        <div className="flex items-center text-[12px] text-[#A3A3A3] font-medium">
                                                            <Calendar size={12} className="mr-1 shrink-0" />
                                                            <span className="mr-3 whitespace-nowrap">{event.dow}, {event.day} {event.month}</span>
                                                            <MapPin size={12} className="mr-1 shrink-0" />
                                                            <span className="truncate">{event.loc}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 9: Direct Venue Matches */}
                                {venueMatches.length > 0 && (
                                    <div>
                                        <h4 className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest px-2 mb-2">Venues</h4>
                                        <div className="flex flex-col">
                                            {venueMatches.map((venue, idx) => (
                                                <button
                                                    key={`venue-match-${idx}`}
                                                    onClick={() => handleGenericSearch(venue.loc)}
                                                    className="flex items-center px-3 py-2.5 rounded-xl hover:bg-[#FAD8DC]/20 transition-colors group w-full text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#A3A3A3]/20 flex items-center justify-center mr-3 shrink-0 group-hover:bg-[#E7364D] group-hover:border-[#E7364D]">
                                                        <MapPin size={14} className="text-[#A3A3A3] group-hover:text-[#FFFFFF]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-[#626262] truncate group-hover:text-[#E7364D]">
                                                            <HighlightText text={venue.loc} query={query} />
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State for Active Query */}
                                {eventMatches.length === 0 && venueMatches.length === 0 && (
                                    <div className="p-8 text-center">
                                        <Search size={32} className="mx-auto text-[#A3A3A3] mb-3" />
                                        <p className="text-[15px] text-[#333333] font-bold mb-1">No exact matches for "{searchQuery}"</p>
                                        <p className="text-[13px] text-[#626262] font-medium">Try checking for typos or searching a broader term.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FEATURE 4: Global Routing Footer */}
                    {query && (
                        <div className="border-t border-[#A3A3A3]/20 p-2 bg-[#FFFFFF] mt-auto">
                            <button 
                                onClick={() => handleGenericSearch(searchQuery)}
                                className="w-full flex items-center justify-center p-3 rounded-[8px] hover:bg-[#E7364D] hover:text-[#FFFFFF] transition-colors text-[#E7364D] font-bold text-[14px] group shadow-sm bg-[#FFFFFF] border border-[#E7364D]/50"
                            >
                                <Search size={16} className="mr-2 opacity-70 group-hover:opacity-100" />
                                See all results for "{searchQuery}"
                                <ArrowRight size={16} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}