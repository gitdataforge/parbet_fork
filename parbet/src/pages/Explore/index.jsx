import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MapPin, 
    Calendar, 
    Heart,
    Info,
    Clock,
    Flame
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';

// Strict Relative Date Formatter
const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return 'Upcoming';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) return 'This Week';
    return 'Upcoming';
};

export default function Explore() {
    const navigate = useNavigate();
    const { 
        liveMatches, 
        userCity, 
        userCountry,
        strictLocation,
        searchQuery,
        exploreCategory,
        isLoadingMatches,
        fetchLocationAndMatches,
        isAuthenticated,
        openAuthModal,
        toggleFavorite
    } = useAppStore();

    useEffect(() => {
        if (liveMatches.length === 0 && !isLoadingMatches) {
            fetchLocationAndMatches();
        }
    }, [liveMatches.length, isLoadingMatches, fetchLocationAndMatches]);

    const handleRestrictedAction = (actionName, eventObj = null) => {
        if (!isAuthenticated) {
            openAuthModal();
        } else if (eventObj && actionName.includes('Favourite')) {
            toggleFavorite(eventObj);
        }
    };

    // --- RIGOROUS REAL-TIME FILTERING LOGIC ---
    const filteredEvents = useMemo(() => {
        return liveMatches.filter(m => {
            // 1. Global Search Query Filter
            if (searchQuery && !m.t1.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !m.t2?.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !m.league.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // 2. Strict Location Filter (If not "All Cities", it must match)
            if (userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location') {
                // If the API 'loc' doesn't contain the exact 'userCity', it gets filtered out, triggering the empty state.
                if (m.loc && !m.loc.toLowerCase().includes(userCity.toLowerCase())) {
                    return false;
                }
            }

            // 3. Global Category Filter
            if (exploreCategory !== 'All Events') {
                const cat = exploreCategory.toLowerCase();
                const leag = (m.league || '').toLowerCase();
                
                if (cat === 'sports' && !leag.includes('league') && !leag.includes('cup') && !leag.includes('cricket') && !leag.includes('soccer')) return false;
                if (cat === 'concerts' && !leag.includes('concert') && !leag.includes('music')) return false;
                if (cat === 'theater' && !leag.includes('theater') && !leag.includes('theatre') && !leag.includes('broadway')) return false;
                if (cat === 'festivals' && !leag.includes('festival')) return false;
            }

            return true;
        });
    }, [liveMatches, searchQuery, userCity, exploreCategory]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full pb-20 pt-4"
        >
            {/* Dynamic Heading */}
            <h2 className="text-[22px] font-bold text-brand-text mb-6 tracking-tight">
                Explore events near {userCity !== 'Loading...' ? userCity : 'you'}
            </h2>

            {/* CONTENT AREA: Empty State OR Real Data Map */}
            {isLoadingMatches ? (
                <div className="w-full py-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold text-brand-text">Scanning regional marketplaces...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                /* EXACT EMPTY STATE UI AS REQUESTED */
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex flex-col items-start bg-gray-50 border border-gray-200 rounded-[16px] p-10"
                >
                    <h3 className="text-[20px] font-bold text-brand-text mb-2">
                        Oh no! No results.
                    </h3>
                    <p className="text-[15px] text-[#6A7074] font-medium">
                        Try changing your location above or adjusting your search filters to explore events.
                    </p>
                </motion.div>
            ) : (
                /* POPULATED STATE WITH REAL API DATA */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map((m, idx) => {
                        const relativeLabel = getRelativeDateLabel(m.commence_time);
                        const isHottest = idx === 0 && !searchQuery;
                        
                        return (
                            <motion.div 
                                whileHover={{ y: -4, shadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                                key={`explore-${m.id}`}
                                onClick={() => navigate(`/event?id=${m.id}`)}
                                className="bg-white border border-gray-200 rounded-[16px] overflow-hidden cursor-pointer group flex flex-col shadow-sm transition-all"
                            >
                                <div className="relative w-full h-[180px] bg-gray-100 overflow-hidden">
                                    <img 
                                        src={`https://loremflickr.com/600/400/${encodeURIComponent(m.league.split(' ')[0])},sports/all`} 
                                        alt={m.t1} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite`, m); }}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 backdrop-blur-sm z-10 transition-colors shadow-sm"
                                    >
                                        <Heart size={14} className="text-white"/>
                                    </button>
                                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex flex-col items-center shadow-sm">
                                        <span className="text-[10px] font-bold text-[#114C2A] uppercase leading-none tracking-wide mb-0.5">{m.month}</span>
                                        <span className="text-[20px] font-black text-[#114C2A] leading-none">{m.day}</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-[16px] text-[#1D2B36] leading-tight mb-2 group-hover:text-[#458731] transition-colors line-clamp-2">
                                        {m.t1} {m.t2 ? `vs ${m.t2}` : ''}
                                    </h3>
                                    <p className="text-[13px] text-gray-500 font-medium flex items-center mb-1">
                                        <MapPin size={14} className="mr-1.5 flex-shrink-0 opacity-70"/> <span className="truncate">{m.loc}</span>
                                    </p>
                                    <p className="text-[13px] text-gray-500 font-medium flex items-center mb-4">
                                        <Calendar size={14} className="mr-1.5 flex-shrink-0 opacity-70"/> {m.dow} • {m.time}
                                    </p>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Starting from</span>
                                            <span className="text-[16px] font-black text-[#1D2B36]">₹{Math.floor(parseFloat(m.odds || 1.5) * 1200).toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-1">
                                            {relativeLabel && (
                                                <div className="flex items-center bg-[#EAF4D9] text-[#114C2A] border border-[#C5E1A5] px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                                                    <Clock size={10} className="mr-1 opacity-80"/> {relativeLabel}
                                                </div>
                                            )}
                                            {isHottest && (
                                                <div className="flex items-center bg-[#FFF1F2] text-[#E91E63] px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                                                    <Flame size={10} className="mr-1"/> Hottest
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}