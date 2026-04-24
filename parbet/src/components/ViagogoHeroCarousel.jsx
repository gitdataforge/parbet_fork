import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppStore } from '../store/useStore';

// Real-time Native Auto-Optimization Utility
// CRITICAL FIX: Stripped Cloudinary wrapper to prevent 401 Unauthorized fetching crashes.
// Unsplash natively handles ?auto=format&fit=crop optimizations via direct URL parameters.
const optimizeImage = (url, width = 1200) => {
    if (!url) return '';
    // Direct passthrough to prevent Cloudinary 401 proxy blocks
    return url;
};

export default function ViagogoHeroCarousel() {
    const navigate = useNavigate();
    const { isAuthenticated, toggleFavorite } = useAppStore();
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // STRICT CRICKET & KABADDI CONTENT REPLICATION
    const heroSlides = [
        {
            id: "ipl-banner",
            title: "TATA IPL 2026",
            query: "IPL",
            image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"
        },
        {
            id: "icc-banner",
            title: "ICC T20 World Cup",
            query: "ICC",
            image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80"
        },
        {
            id: "pkl-banner",
            title: "Pro Kabaddi League",
            query: "Kabaddi",
            image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80"
        }
    ];

    // Real-time Auto-Advancing Logic
    useEffect(() => {
        const timer = setInterval(() => setCurrentHeroIndex((p) => (p + 1) % heroSlides.length), 6000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Secure Interaction Guard (Strictly routes to standalone /login)
    const handleRestrictedAction = (e, obj) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            toggleFavorite(obj);
        }
    };

    return (
        <div className="relative w-full mb-6 mt-0 md:mt-4 font-sans">
            
            {/* COHESIVE GEOMETRY CONTAINER:
              On mobile, fixed height + flex-col + overflow-hidden clamps the image to the top corners
              and the dark green block to the bottom corners perfectly. 
            */}
            <div className="relative w-full h-[260px] sm:h-[300px] md:h-[340px] lg:h-[400px] rounded-[16px] md:rounded-2xl overflow-hidden bg-[#114C2A] shadow-sm md:shadow-md group">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentHeroIndex} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.5 }} 
                        className="absolute inset-0 flex flex-col md:flex-row cursor-pointer"
                        onClick={() => navigate(`/performer/${encodeURIComponent(heroSlides[currentHeroIndex].query)}`)}
                    >
                        {/* Top/Right Image Section */}
                        <div className="relative w-full h-[70%] sm:h-[75%] md:h-full md:absolute md:right-0 md:w-[70%] z-10">
                            <img 
                                src={optimizeImage(heroSlides[currentHeroIndex].image, 1200)} 
                                className="w-full h-full object-cover md:mix-blend-overlay md:opacity-90" 
                                alt={heroSlides[currentHeroIndex].title} 
                                style={{
                                    maskImage: window.innerWidth >= 768 ? 'linear-gradient(to right, transparent, black 30%)' : 'none',
                                    WebkitMaskImage: window.innerWidth >= 768 ? 'linear-gradient(to right, transparent, black 30%)' : 'none'
                                }}
                            />
                            {/* Top-Right Black Heart Button */}
                            <button 
                                onClick={(e) => handleRestrictedAction(e, heroSlides[currentHeroIndex])} 
                                className="absolute top-3 right-3 md:top-4 md:right-4 w-[32px] h-[32px] md:w-[36px] md:h-[36px] bg-black/80 rounded-full flex items-center justify-center hover:scale-105 transition-transform z-30 shadow-md"
                            >
                                <Heart size={14} className="text-white" strokeWidth={2.5}/>
                            </button>
                        </div>

                        {/* Bottom/Left Dark Green Text Block */}
                        <div className="relative flex-1 w-full md:w-[50%] h-full z-20 flex flex-col justify-center px-4 md:px-14 lg:px-16 bg-[#114C2A] md:bg-transparent">
                            <h2 className="text-[20px] sm:text-[24px] md:text-[56px] lg:text-[64px] font-bold md:font-black text-white leading-tight tracking-tight truncate md:whitespace-normal">
                                {heroSlides[currentHeroIndex].title}
                            </h2>
                            
                            {/* Hidden on Mobile as per image_db9a7e.png */}
                            <div className="hidden md:block mt-6">
                                <button className="border border-[#1f7f45] bg-transparent text-white hover:bg-[#1f7f45] px-6 py-2.5 rounded-[8px] text-[14px] font-bold transition-all">
                                    See Tickets
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Exact Pagination Dots: Centered Charcoal/Gray on mobile, Left White on desktop */}
            <div className="flex justify-center md:justify-start md:absolute md:bottom-6 md:left-14 lg:left-16 space-x-2 mt-4 md:mt-0 z-30">
                {heroSlides.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentHeroIndex(idx)} 
                        className={`rounded-full transition-all duration-300 w-2 h-2 md:w-2.5 md:h-2.5 ${idx === currentHeroIndex ? 'bg-[#1a1a1a] md:bg-white' : 'bg-[#cccccc] md:bg-white/40 md:hover:bg-white/60'}`} 
                    />
                ))}
            </div>
        </div>
    );
}