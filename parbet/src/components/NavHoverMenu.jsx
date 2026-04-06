import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useStore';
import { 
    Calendar, MapPin, Flame, ArrowRight, 
    Building2, Ticket, Music, Trophy, Star
} from 'lucide-react';

export default function NavHoverMenu({ isOpen, category, onMouseEnter, onMouseLeave }) {
    const navigate = useNavigate();
    const { liveMatches, setSearchQuery, setExploreCategory, userCity } = useAppStore();

    // --- RIGOROUS REAL-TIME MEGA-MENU DATA EXTRACTION ---
    const { performers, upcoming, venues } = useMemo(() => {
        if (!liveMatches || liveMatches.length === 0 || !category) {
            return { performers: [], upcoming: [], venues: [] };
        }
        
        let locationFiltered = liveMatches;
        const isValidCity = userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location';
        
        // FEATURE 1: Strict Geo-Filtering
        if (category !== 'Top Cities' && isValidCity) {
            locationFiltered = liveMatches.filter(m => m.loc?.toLowerCase().includes(userCity.toLowerCase()));
        }

        let catFiltered = [];
        if (category === 'Sports') {
            catFiltered = locationFiltered.filter(m => !m.league?.toLowerCase().includes('music') && !m.league?.toLowerCase().includes('politics'));
        } else if (category === 'Concerts') {
            catFiltered = locationFiltered.filter(m => m.league?.toLowerCase().includes('music') || m.league?.toLowerCase().includes('concert'));
        } else if (category === 'Theatre' || category === 'Theater') {
            catFiltered = locationFiltered.filter(m => m.league?.toLowerCase().includes('theatre') || m.league?.toLowerCase().includes('theater') || m.league?.toLowerCase().includes('broadway'));
        } else if (category === 'Top Cities') {
            catFiltered = liveMatches; 
        }

        // FEATURE 2: Live Event Counting & Aggregation
        const performerCounts = {};
        const venuesSet = new Set();
        
        if (category === 'Top Cities') {
            catFiltered.forEach(m => {
                if (m.loc) {
                    const city = m.loc.split(/,|•/)[0].trim();
                    if (city && city !== 'Global' && city !== 'Current Location') {
                        performerCounts[city] = (performerCounts[city] || 0) + 1;
                    }
                }
            });
        } else {
            catFiltered.forEach(m => {
                if (m.t1) performerCounts[m.t1] = (performerCounts[m.t1] || 0) + 1;
                if (m.t2) performerCounts[m.t2] = (performerCounts[m.t2] || 0) + 1;
                if (m.loc) {
                    const stadium = m.loc.split(/,|•/).pop().trim();
                    if (stadium && stadium !== 'Verified Venue') venuesSet.add(stadium);
                }
            });
        }

        // Sort by sheer volume of events
        const sortedPerformers = Object.entries(performerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count]) => ({ name, count }));

        // Sort upcoming chronologically
        const sortedUpcoming = [...catFiltered]
            .sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time))
            .slice(0, 3);

        return {
            performers: sortedPerformers,
            upcoming: sortedUpcoming,
            venues: Array.from(venuesSet).slice(0, 4)
        };
    }, [liveMatches, category, userCity]);

    const handleSearchRoute = (queryStr) => {
        setSearchQuery(queryStr);
        setExploreCategory('All Events');
        onMouseLeave();
        navigate('/explore');
    };

    const handleCategoryRoute = () => {
        setSearchQuery('');
        setExploreCategory(category === 'Top Cities' ? 'All Events' : category);
        onMouseLeave();
        navigate('/explore');
    };

    const handleEventRoute = (id) => {
        onMouseLeave();
        navigate(`/event?id=${id}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-[700px] bg-white rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-gray-200 z-[200] overflow-hidden cursor-default flex flex-col"
                >
                    {/* Invisible bridge to prevent mouse leave gap drops */}
                    <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                    
                    <div className="flex bg-white">
                        {/* SECTION 1: Top Performers/Cities Grid */}
                        <div className="w-[60%] p-6 border-r border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-widest flex items-center">
                                    {category === 'Sports' ? <Trophy size={16} className="mr-2 text-[#458731]" /> : null}
                                    {category === 'Concerts' ? <Music size={16} className="mr-2 text-[#458731]" /> : null}
                                    {category === 'Theatre' ? <Star size={16} className="mr-2 text-[#458731]" /> : null}
                                    {category === 'Top Cities' ? <MapPin size={16} className="mr-2 text-[#458731]" /> : null}
                                    Trending {category === 'Top Cities' ? 'Destinations' : 'Performers'}
                                </h3>
                            </div>

                            {performers.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {performers.map((item, idx) => {
                                        // FEATURE 3: Trending Highlight Logic (Top result gets a fire icon)
                                        const isTrending = idx === 0;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSearchRoute(item.name)}
                                                className="flex items-center p-2 rounded-xl hover:bg-[#F4F6F8] transition-colors group text-left border border-transparent hover:border-gray-200"
                                            >
                                                {/* FEATURE 4: Dynamic Image Resolution */}
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-3 flex-shrink-0 relative border border-gray-200 shadow-sm">
                                                    <img 
                                                        src={`https://loremflickr.com/100/100/${encodeURIComponent(item.name.split(' ')[0])},${category === 'Sports' ? 'sports' : 'music'}/all`} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#114C2A] transition-colors truncate flex items-center">
                                                        {item.name}
                                                        {isTrending && <Flame size={12} className="text-[#E91E63] ml-1.5 flex-shrink-0" />}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-gray-500">
                                                        {item.count} Event{item.count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* SECTION 4: Empty State Fallback */
                                <div className="py-12 text-center flex flex-col items-center">
                                    <Ticket size={32} className="text-gray-200 mb-3" />
                                    <p className="text-[14px] font-bold text-gray-800">No local {category.toLowerCase()} found.</p>
                                    <p className="text-[12px] text-gray-500 mt-1">Try expanding your location settings.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Split into Upcoming & Venues */}
                        <div className="w-[40%] bg-gray-50/50 p-6 flex flex-col">
                            
                            {/* SECTION 2: Live Upcoming Events */}
                            <div className="mb-6 flex-1">
                                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Upcoming {category}</h3>
                                {upcoming.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcoming.map((ev, idx) => (
                                            <button 
                                                key={`up-${idx}`} 
                                                onClick={() => handleEventRoute(ev.id)}
                                                className="w-full flex items-start text-left group"
                                            >
                                                <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center w-10 h-10 shrink-0 mr-3 shadow-sm group-hover:border-[#114C2A]">
                                                    <span className="text-[8px] font-black text-[#114C2A] uppercase">{ev.month}</span>
                                                    <span className="text-[14px] font-black text-gray-900 leading-none">{ev.day}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-[#114C2A] transition-colors">
                                                        {ev.t1} {ev.t2 ? `vs ${ev.t2}` : ''}
                                                    </h5>
                                                    <p className="text-[11px] text-gray-500 truncate flex items-center mt-0.5">
                                                        <MapPin size={10} className="mr-1 opacity-70"/> {ev.loc}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-gray-400 font-medium">Check back soon for new events.</p>
                                )}
                            </div>

                            {/* SECTION 3: Regional Venues */}
                            {venues.length > 0 && category !== 'Top Cities' && (
                                <div className="mt-auto">
                                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">Popular Venues</h3>
                                    <div className="flex flex-col space-y-2">
                                        {venues.map((v, idx) => (
                                            <button 
                                                key={`v-${idx}`}
                                                onClick={() => handleSearchRoute(v)}
                                                className="flex items-center text-[12px] font-bold text-gray-700 hover:text-[#114C2A] group"
                                            >
                                                <Building2 size={12} className="mr-2 text-gray-400 group-hover:text-[#114C2A]" />
                                                <span className="truncate">{v}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 5: Interactive Footer (Global Category Router) */}
                    <div className="bg-[#114C2A] p-3 flex justify-center border-t border-[#0c361d]">
                        <button 
                            onClick={handleCategoryRoute}
                            className="flex items-center text-[13px] font-bold text-white hover:text-green-200 transition-colors group"
                        >
                            View all {category} {category === 'Top Cities' ? 'events' : ''} in {userCity !== 'Loading...' ? userCity : 'your area'}
                            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}