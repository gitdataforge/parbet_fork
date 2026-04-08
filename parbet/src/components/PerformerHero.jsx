import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function PerformerHero({ performerName }) {
    const navigate = useNavigate();
    const { favorites, toggleFavorite, isAuthenticated } = useAppStore();
    
    // Generate a stable, unique ID for the performer to securely save in the global favorites array
    const performerId = `perf_${encodeURIComponent(performerName)}`;
    const isFav = favorites?.some(f => f.id === performerId);

    const handleFavorite = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full mb-6 md:mb-20 font-sans"
        >
            {/* Full-width dark green gradient background matching image_e76fca.jpg */}
            <div className="absolute top-0 left-0 right-0 h-[260px] md:h-[320px] bg-gradient-to-r from-[#1b3422] via-[#1c3822] to-[#0c1f12] z-0"></div>
            
            <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 pt-10 md:pt-16 flex flex-col md:flex-row justify-between items-start">
                
                {/* Left Column: Oversized Typography & Heart Action */}
                <div className="flex-1 w-full flex items-start justify-between md:justify-start gap-4 md:gap-16 pb-8 md:pb-0">
                    <h1 className="text-[32px] md:text-[52px] lg:text-[60px] font-bold text-white leading-[1.05] tracking-tight max-w-[600px] drop-shadow-sm">
                        {performerName} Tickets
                    </h1>
                    
                    <button 
                        onClick={handleFavorite} 
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-all shrink-0 mt-1 md:mt-4 shadow-sm ${
                            isFav 
                                ? 'bg-black/40 border-[#E91E63] hover:bg-black/60' 
                                : 'bg-transparent border-white/30 hover:border-white/80 hover:bg-white/10'
                        }`}
                        aria-label="Toggle Favorite"
                    >
                        <Heart size={18} className={isFav ? "fill-[#E91E63] text-[#E91E63]" : "text-white"} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Right Column: Overlapping Dynamic Cover Image */}
                <div className="w-full md:w-[380px] lg:w-[460px] h-[200px] md:h-[280px] rounded-[16px] overflow-hidden shadow-2xl bg-gray-100 relative shrink-0 md:transform md:translate-y-12 z-20">
                    <img 
                        src={`https://loremflickr.com/800/500/${encodeURIComponent(performerName.split(' ')[0])},sports/all`} 
                        alt={`${performerName} Live`} 
                        className="w-full h-full object-cover"
                    />
                    {/* Subtle inner shadow for premium depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none rounded-[16px]"></div>
                </div>
            </div>
        </motion.div>
    );
}