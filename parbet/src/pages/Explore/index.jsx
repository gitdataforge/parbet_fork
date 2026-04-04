import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MapPin, 
    Calendar, 
    Heart,
    Info
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';

export default function Explore() {
    const navigate = useNavigate();
    const { 
        liveMatches, 
        userCity, 
        searchQuery,
        exploreCategory,
        isLoadingMatches,
        fetchLocationAndMatches,
        isAuthenticated,
        openAuthModal
    } = useAppStore();

    useEffect(() => {
        if (liveMatches.length === 0 && !isLoadingMatches) {
            fetchLocationAndMatches();
        }
    }, [liveMatches.length, isLoadingMatches, fetchLocationAndMatches]);

    const handleRestrictedAction = (actionName) => {
        if (!isAuthenticated) openAuthModal();
        else console.log(`Executing secure real-time action: ${actionName}`);
    };

    // --- RIGOROUS REAL-TIME FILTERING LOGIC ---
    const filteredEvents = liveMatches.filter(m => {
        // 1. Global Search Query Filter
        if (searchQuery && !m.t1.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !m.t2.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !m.league.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // 2. Strict Location Filter (If not "All Cities", it must match)
        if (userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location') {
            // In a real app, Odds API returns country/region. We strictly enforce city matching here.
            // If the API 'loc' doesn't contain the exact 'userCity', it gets filtered out, triggering the empty state.
            if (!m.loc.toLowerCase().includes(userCity.toLowerCase())) {
                return false;
            }
        }

        // 3. Global Category Filter
        if (exploreCategory !== 'All Events') {
            if (exploreCategory === 'Sports' && !m.league.toLowerCase().includes('league') && !m.league.toLowerCase().includes('cup')) return false;
            if (exploreCategory === 'Concerts' && !m.league.toLowerCase().includes('concert')) return false;
            if (exploreCategory === 'Theater' && !m.league.toLowerCase().includes('theater')) return false;
            if (exploreCategory === 'Festivals' && !m.league.toLowerCase().includes('festival')) return false;
        }

        return true;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full pb-20 pt-4"
        >
            {/* Dynamic Heading */}
            <h2 className="text-[22px] font-bold text-brand-text mb-6">
                Explore events near {userCity}
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
                    className="mt-2 flex flex-col items-start"
                >
                    <h3 className="text-[16px] font-bold text-brand-text mb-1">
                        Oh no! No results.
                    </h3>
                    <p className="text-[14px] text-[#6A7074] font-medium">
                        Try changing your location above to explore events
                    </p>
                </motion.div>
            ) : (
                /* POPULATED STATE WITH REAL ODDS API DATA */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map((m) => (
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
                                    onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite ${m.t1}`); }}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 backdrop-blur-sm z-10 transition-colors"
                                >
                                    <Heart size={14} className="text-white"/>
                                </button>
                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md flex flex-col items-center shadow-sm">
                                    <span className="text-[10px] font-bold text-[#114C2A] uppercase leading-none">{m.month}</span>
                                    <span className="text-lg font-black text-[#114C2A] leading-none mt-0.5">{m.day}</span>
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-[16px] text-brand-text leading-tight mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {m.t1} vs {m.t2}
                                </h3>
                                <p className="text-[13px] text-brand-muted flex items-center mb-1">
                                    <MapPin size={14} className="mr-1.5 flex-shrink-0"/> <span className="truncate">{m.loc}</span>
                                </p>
                                <p className="text-[13px] text-brand-muted flex items-center mb-4">
                                    <Calendar size={14} className="mr-1.5 flex-shrink-0"/> {m.dow} • {m.time}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Starting from</span>
                                        <span className="text-[15px] font-black text-brand-text">₹{Math.floor(parseFloat(m.odds) * 1200).toLocaleString()}</span>
                                    </div>
                                    <div className={`flex items-center px-2 py-1 rounded text-xs font-bold border border-transparent ${m.tagColor || 'bg-gray-100 text-gray-600'}`}>
                                        <Info size={12} className="mr-1.5"/> {m.tag || 'Available'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}