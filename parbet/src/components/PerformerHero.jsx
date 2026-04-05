import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function PerformerHero({ performerName, eventCount, userCity, children }) {
    const { favorites, toggleFavorite, isAuthenticated, openAuthModal } = useAppStore();
    
    // Generate a stable, unique ID for the performer to securely save in the global favorites array
    const performerId = `perf_${encodeURIComponent(performerName)}`;
    const isFav = favorites?.some(f => f.id === performerId);

    const handleFavorite = () => {
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }
        
        // Push a standardized performer object to the global tracking state
        toggleFavorite({ 
            id: performerId, 
            t1: performerName, 
            type: 'performer',
            league: 'Performer Tour/League'
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col-reverse lg:flex-row justify-between items-start gap-8 mb-8"
        >
            {/* Left Column: Title, Interactive Tabs, and Counter */}
            <div className="flex-1 w-full max-w-3xl">
                
                {/* Title & Favorite Action */}
                <div className="flex items-center justify-between md:justify-start gap-6 mb-8">
                    <h1 className="text-[40px] md:text-[56px] font-black text-[#1D2B36] leading-[1.1] tracking-tight">
                        {performerName} Tickets
                    </h1>
                    <button 
                        onClick={handleFavorite} 
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shrink-0 shadow-sm ${
                            isFav 
                                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                        aria-label="Toggle Favorite"
                    >
                        <Heart size={22} className={isFav ? "fill-[#E91E63] text-[#E91E63]" : "text-gray-500"}/>
                    </button>
                </div>

                {/* Injection Slot for FilterDropdown Tabs (Location, Dates, Opponents, etc.) */}
                <div className="mb-8 relative z-50">
                    {children}
                </div>

                {/* Dynamic Event Counter */}
                <div className="mt-8 mb-2">
                    <h3 className="text-[17px] font-bold text-brand-text tracking-tight">
                        {eventCount} {eventCount === 1 ? 'event' : 'events'} {userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location' ? `near ${userCity}` : 'in all locations'}
                    </h3>
                </div>
            </div>

            {/* Right Column: Dynamic Cover Image */}
            <div className="w-full lg:w-[400px] shrink-0">
                <div className="w-full h-[220px] md:h-[260px] rounded-[16px] overflow-hidden shadow-md border border-gray-200 bg-gray-100 relative group">
                    <img 
                        src={`https://loremflickr.com/800/500/${encodeURIComponent(performerName.split(' ')[0])},sports/all`} 
                        alt={`${performerName} Live`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Subtle inner shadow for premium depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none rounded-[16px]"></div>
                </div>
            </div>
        </motion.div>
    );
}