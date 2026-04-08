import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { useSellerStore } from '../store/useSellerStore';

export default function SearchDropdown() {
    const navigate = useNavigate();
    const { searchQuery, liveMatches, isLoadingEvents, setSearchQuery } = useSellerStore();

    // Real-time filtering against the 100% real ESPN data pipeline
    const filteredEvents = useMemo(() => {
        if (!searchQuery || searchQuery.trim().length === 0) return [];
        
        const query = searchQuery.toLowerCase();
        return liveMatches.filter(m => {
            const matchStr = `${m.t1} ${m.t2} ${m.league} ${m.loc}`.toLowerCase();
            return matchStr.includes(query);
        }).slice(0, 8); // Display top 8 most relevant real-world matches
    }, [searchQuery, liveMatches]);

    const handleSelectEvent = (event) => {
        setSearchQuery(''); // Close dropdown
        // Route to creation flow, passing the real API team name to auto-fill the form
        navigate(`/create-listing?q=${encodeURIComponent(event.t1)}`);
    };

    // Do not render the dropdown shell if there is no user input
    if (!searchQuery || searchQuery.trim().length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 z-[100] max-h-[400px] overflow-y-auto hide-scrollbar font-sans"
            >
                {isLoadingEvents ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="animate-spin text-[#458731] mb-3" size={28} />
                        <span className="text-[14px] text-[#54626c] font-medium tracking-wide">Syncing live sports network...</span>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <ul className="flex flex-col py-2">
                        {filteredEvents.map((event) => (
                            <li 
                                key={event.id}
                                onClick={() => handleSelectEvent(event)}
                                className="px-5 py-3.5 hover:bg-gray-50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors group"
                            >
                                <div className="flex flex-col mb-2 md:mb-0">
                                    <h4 className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors leading-tight">
                                        {event.t1} {event.t2 ? `vs ${event.t2}` : ''}
                                    </h4>
                                    <div className="flex items-center text-[12px] text-gray-500 mt-1.5 space-x-4">
                                        <span className="flex items-center"><Calendar size={12} className="mr-1.5 opacity-70" /> {event.dow}, {event.month} {event.day} • {event.time}</span>
                                        <span className="flex items-center"><MapPin size={12} className="mr-1.5 opacity-70" /> {event.loc}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 md:ml-4">
                                    <span className="bg-gray-100 text-[#54626c] text-[11px] font-bold px-3 py-1.5 rounded-[4px] uppercase tracking-wider group-hover:bg-[#EAF4D9] group-hover:text-[#114C2A] transition-colors">
                                        Sell Tickets
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <p className="text-[16px] font-bold text-[#1a1a1a] mb-1.5">No scheduled events found</p>
                        <p className="text-[14px] text-[#54626c]">We couldn't find a live match for "{searchQuery}".</p>
                        <button 
                            onClick={() => {
                                const q = searchQuery;
                                setSearchQuery('');
                                navigate(`/create-listing?q=${encodeURIComponent(q)}`);
                            }}
                            className="mt-5 text-[#458731] text-[14px] font-bold hover:underline"
                        >
                            Continue with custom listing &rarr;
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}