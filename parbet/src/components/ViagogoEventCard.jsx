import React from 'react';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import { useAppStore } from '../store/useStore';

/**
 * FEATURE 1: Real-Time Payload Mapping (Seller to Buyer UI)
 * FEATURE 2: Dynamic Starting Price Engine (Calculated lowest tier)
 * FEATURE 3: Secure Interaction Guard (Heart / Favorites)
 * FEATURE 4: ISO Timestamp Parsing Engine
 * FEATURE 5: Real-time Fallback Image Handler
 * FEATURE 6: Hardware-Accelerated Hover Image Scale
 * FEATURE 7: Glassmorphism Action Elements
 * FEATURE 8: Conditional "Sold Out" Status State
 * FEATURE 9: Spatial Typography Truncation (Prevents layout breakage)
 * FEATURE 10: Dynamic "Viewing Now" Tag Engine
 */

export default function ViagogoEventCard({ event, onClick }) {
    const { isAuthenticated, openAuthModal, toggleFavorite } = useAppStore();

    if (!event) return null;

    // FEATURE 3: Secure Interaction Guard
    const handleRestrictedAction = (e, obj) => {
        e.stopPropagation(); // Prevents the card's outer onClick from firing
        if (!isAuthenticated) {
            openAuthModal();
        } else {
            toggleFavorite(obj);
        }
    };

    // FEATURE 4: ISO Timestamp Parsing Engine
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

    // FEATURE 5: Fallback Image Handler
    // If the seller didn't provide a cover image, load a dynamic, high-quality stadium shot
    const displayImage = event.imageUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop';

    // FEATURE 2: Dynamic Starting Price Engine
    const formattedPrice = event.startingPrice 
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.startingPrice)
        : null;

    return (
        <div 
            onClick={onClick} 
            className="min-w-[280px] max-w-[280px] flex-shrink-0 cursor-pointer snap-start group relative flex flex-col"
        >
            {/* IMAGE WRAPPER */}
            <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden mb-4 bg-[#f8f9fa] border border-[#e2e2e2]">
                
                {/* FEATURE 6: Hardware-Accelerated Hover Scale */}
                <img 
                    src={displayImage} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    onError={(e) => { 
                        // Ultimate failsafe for broken seller URLs
                        e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop'; 
                    }}
                />
                
                {/* FEATURE 7: Glassmorphism Action Elements */}
                <button 
                    onClick={(e) => handleRestrictedAction(e, event)} 
                    className="absolute top-3 right-3 w-[32px] h-[32px] rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black transition-colors shadow-md z-10"
                >
                    <Heart size={16} className="text-white" strokeWidth={2}/>
                </button>

                {/* FEATURE 10: Dynamic "Viewing Now" Tag Engine */}
                {event.views > 50 && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-[6px] flex items-center gap-1.5 shadow-sm">
                        <Eye size={12} className="text-[#c21c3a]" strokeWidth={2.5} />
                        <span className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-wider">{event.views} viewing</span>
                    </div>
                )}
            </div>
            
            {/* META INFORMATION */}
            {/* FEATURE 9: Spatial Typography Truncation */}
            <h3 className="font-bold text-[#1a1a1a] text-[16px] leading-snug mb-1.5 truncate pr-2">
                {event.title}
            </h3>
            
            <p className="text-[13px] text-[#54626c] mb-1 font-medium truncate flex items-center gap-1.5">
                <Calendar size={14} className="text-[#9ca3af] shrink-0" />
                {parseEventDate(event.eventTimestamp)}
            </p>

            <p className="text-[13px] text-[#54626c] mb-3 font-medium truncate flex items-center gap-1.5">
                <MapPin size={14} className="text-[#9ca3af] shrink-0" />
                {event.stadium}, {event.location?.split(',')[0]}
            </p>

            {/* PRICING ENGINE */}
            <div className="mt-auto pt-2">
                {formattedPrice ? (
                    <p className="text-[14px] text-[#1a1a1a] font-medium">
                        From <span className="font-black text-[16px] text-[#458731]">{formattedPrice}</span>
                    </p>
                ) : (
                    // FEATURE 8: Conditional "Sold Out" Status State
                    <div className="inline-flex items-center gap-1.5 bg-[#fdf2f2] text-[#c21c3a] px-2.5 py-1 rounded-[4px]">
                        <span className="text-[11px] font-black uppercase tracking-widest">Sold Out</span>
                    </div>
                )}
            </div>
        </div>
    );
}