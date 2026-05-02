import React from 'react';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import { useAppStore } from '../store/useStore';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 4 Event Card)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: PocketBase / Cloudinary Scrubber (Fixes 404 console errors from legacy DB seeds)
 * FEATURE 2: Real-Time Universal Payload Mapping (Handles both old and new seeded schemas)
 * FEATURE 3: Dynamic Starting Price Engine (Calculated lowest tier or direct root price)
 * FEATURE 4: Secure Interaction Guard (Heart / Favorites)
 * FEATURE 5: ISO Timestamp Parsing Engine
 * FEATURE 6: Strict Image Interceptor (Forces Kabaddi imagery)
 * FEATURE 7: Hardware-Accelerated Hover Image Scale
 * FEATURE 8: Glassmorphism Action Elements
 * FEATURE 9: Conditional "Sold Out" Status State
 * FEATURE 10: Spatial Typography Truncation
 */

export default function ViagogoEventCard({ event, onClick }) {
    const { isAuthenticated, openAuthModal, toggleFavorite } = useAppStore();

    if (!event) return null;

    // Secure Interaction Guard
    const handleRestrictedAction = (e, obj) => {
        e.stopPropagation(); 
        if (!isAuthenticated) {
            openAuthModal();
        } else {
            toggleFavorite(obj);
        }
    };

    // FEATURE 2: Universal Payload Mapping
    // Intelligently maps either the old nested schema or the new flat IPL seeded schema
    const displayTitle = event.title || event.eventName || 'Upcoming Event';
    const displayTimestamp = event.displayDate || event.eventTimestamp || event.commence_time || event.date;
    const displayStadium = event.venue?.name || event.stadium || event.loc || 'TBA Venue';
    const displayCity = event.venue?.city || event.location || event.city || 'TBA City';
    const displayPrice = event.startingPrice !== null && event.startingPrice !== undefined ? event.startingPrice : event.price;

    // ISO Timestamp Parsing Engine
    const parseEventDate = (isoString) => {
        if (!isoString) return 'Date TBA';
        const d = new Date(isoString);
        if (isNaN(d)) return 'Date TBA';
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = d.getDate();
        const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${dayStr}, ${monthStr} ${dayNum} • ${timeStr}`;
    };

    // FEATURE 1 & 6: PocketBase Resolution & Cloudinary Scrubber
    const determineDisplayImage = () => {
        const isKabaddi = (event.sportCategory?.toLowerCase().includes('kabaddi')) || 
                          (displayTitle.toLowerCase().includes('kabaddi')) ||
                          (displayTitle.toLowerCase().includes('pkl'));
                          
        if (isKabaddi) {
            return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop';
        }
        
        let rawUrl = event.imageUrl || event.image || event.thumb;

        // CRITICAL FIX: Scrub broken legacy Cloudinary links from the old database schema
        if (rawUrl && rawUrl.includes('res.cloudinary.com/dtz0urit6')) {
            rawUrl = null; // Force standard fallback
        }
        
        return rawUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop';
    };

    const displayImage = determineDisplayImage();

    // Dynamic Starting Price Engine
    const formattedPrice = displayPrice 
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayPrice)
        : null;

    return (
        <div 
            onClick={onClick} 
            className="min-w-[280px] max-w-[280px] flex-shrink-0 cursor-pointer snap-start group relative flex flex-col"
        >
            {/* IMAGE WRAPPER */}
            <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden mb-4 bg-[#F5F5F5] border border-[#A3A3A3]/20 shadow-sm group-hover:shadow-md transition-shadow">
                
                <img 
                    src={displayImage} 
                    alt={displayTitle} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    onError={(e) => { 
                        e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop'; 
                    }}
                />
                
                <button 
                    onClick={(e) => handleRestrictedAction(e, event)} 
                    className="absolute top-3 right-3 w-[32px] h-[32px] rounded-full bg-[#FFFFFF]/90 backdrop-blur-md flex items-center justify-center hover:bg-[#FAD8DC] transition-colors shadow-[0_2px_10px_rgba(51,51,51,0.1)] z-10"
                >
                    <Heart size={16} className="text-[#E7364D]" strokeWidth={2}/>
                </button>

                {event.views > 50 && (
                    <div className="absolute bottom-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md px-2.5 py-1.5 rounded-[6px] flex items-center gap-1.5 shadow-sm border border-[#FAD8DC]/50">
                        <Eye size={12} className="text-[#E7364D]" strokeWidth={2.5} />
                        <span className="text-[10px] font-black text-[#333333] uppercase tracking-wider">{event.views} viewing</span>
                    </div>
                )}
            </div>
            
            {/* META INFORMATION */}
            <h3 className="font-bold text-[#333333] text-[16px] leading-snug mb-1.5 truncate pr-2 group-hover:text-[#E7364D] transition-colors">
                {displayTitle}
            </h3>
            
            <p className="text-[13px] text-[#626262] mb-1 font-medium truncate flex items-center gap-1.5">
                <Calendar size={14} className="text-[#A3A3A3] shrink-0" />
                {parseEventDate(displayTimestamp)}
            </p>

            <p className="text-[13px] text-[#626262] mb-3 font-medium truncate flex items-center gap-1.5">
                <MapPin size={14} className="text-[#A3A3A3] shrink-0" />
                {displayStadium}, {displayCity?.split(',')[0]}
            </p>

            {/* PRICING ENGINE */}
            <div className="mt-auto pt-2">
                {formattedPrice ? (
                    <p className="text-[14px] text-[#626262] font-medium">
                        From <span className="font-black text-[16px] text-[#E7364D]">{formattedPrice}</span>
                    </p>
                ) : (
                    <div className="inline-flex items-center gap-1.5 bg-[#FAD8DC]/30 border border-[#E7364D]/20 text-[#E7364D] px-2.5 py-1 rounded-[4px]">
                        <span className="text-[11px] font-black uppercase tracking-widest">Sold Out</span>
                    </div>
                )}
            </div>
        </div>
    );
}