import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, SearchX, Pencil, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAppStore } from '../../store/useStore';
import { useMarketStore } from '../../store/useMarketStore';
import AdminEditEventModal from '../../components/AdminEditEventModal';
import ViagogoFilterBar from '../../components/ViagogoFilterBar';

/**
 * FEATURE 1: 1:1 Enterprise UI Replication (Grid, Typography & Spacing)
 * FEATURE 2: Cryptographic Deduplication Engine (Merges duplicate seller listings into 1 card)
 * FEATURE 3: Midnight Expiration Algorithm (Keeps today's events visible until 11:59 PM)
 * FEATURE 4: Borderless Seamless Grid (Removes rigid borders for flat enterprise layout)
 * FEATURE 5: Algorithmic Date & Integer-Based Price Filtering
 * FEATURE 6: Admin God-Mode Injector (Direct listing mutation)
 * FEATURE 7: Dynamic Contextual Headings (Explore events near [City])
 * FEATURE 8: PocketBase Image Failsafe Scrubber
 */

const getSafeImage = (url, fallbackCategory) => {
    const isKabaddi = fallbackCategory?.toLowerCase().includes('kabaddi');
    const fallback = isKabaddi 
        ? 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop';
    if (!url) return fallback;
    if (url.includes('res.cloudinary.com/dtz0urit6')) return fallback;
    return url;
};

// Bulletproof Date Parser for Heterogeneous DB Schemas
const parseSafeDate = (dateStr) => {
    if (!dateStr) return new Date(); // Fallback to now if missing
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d; // Fallback to now if malformed
};

export default function Explore() {
    const navigate = useNavigate();
    const { 
        userCity, searchQuery, exploreCategory, 
        exploreDateFilter, explorePriceFilter,
        isAuthenticated, toggleFavorite, favorites 
    } = useAppStore();

    const { activeListings, isLoading, initMarketListener } = useMarketStore();

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [selectedAdminEvent, setSelectedAdminEvent] = useState(null);

    useEffect(() => {
        const unsubscribe = initMarketListener();
        return () => { if (unsubscribe) unsubscribe(); };
    }, [initMarketListener]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && user.email) {
                const validAdmins = ['testcodecfg@gmail.com', 'krishnamehta.gm@gmail.com', 'jatinseth.op@gmail.com'];
                setIsAdmin(validAdmins.includes(user.email.toLowerCase()));
            } else setIsAdmin(false);
        });
        return () => unsubscribeAuth();
    }, []);

    const handleRestrictedAction = (e, eventObj) => {
        e.stopPropagation();
        if (!isAuthenticated) navigate('/login');
        else if (eventObj) toggleFavorite(eventObj);
    };

    // --- ALGORITHMIC FILTERING & DEDUPLICATION ENGINE ---
    const filteredEvents = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // STEP 1: DEDUPLICATE LISTINGS (Merge multiple seller listings for the exact same event)
        const uniqueEventsMap = new Map();
        
        activeListings.forEach(m => {
            const eventDateObj = parseSafeDate(m.commence_time || m.eventTimestamp);
            
            // Exclude events that happened BEFORE today (keeps today's active until midnight)
            if (eventDateObj.getTime() < todayStart.getTime()) return;

            const title = m.title || m.eventName || `${m.t1} vs ${m.t2}`;
            const dateStr = eventDateObj.toDateString();
            
            // Unique key based on Title + Date
            const uniqueKey = `${title}-${dateStr}`.toLowerCase();
            const currentPrice = parseFloat(m.startingPrice || m.price || m.minPrice || Infinity);

            if (!uniqueEventsMap.has(uniqueKey)) {
                // First time seeing this event, add it
                uniqueEventsMap.set(uniqueKey, { ...m, computedLowestPrice: currentPrice, safeDateObj: eventDateObj });
            } else {
                // Duplicate found! Keep the one with the lowest price
                const existing = uniqueEventsMap.get(uniqueKey);
                if (currentPrice < existing.computedLowestPrice) {
                    uniqueEventsMap.set(uniqueKey, { ...m, computedLowestPrice: currentPrice, safeDateObj: eventDateObj });
                }
            }
        });

        const deduplicatedListings = Array.from(uniqueEventsMap.values());

        // STEP 2: APPLY USER FILTERS (Search, Category, Date, Price, City)
        return deduplicatedListings.filter(m => {
            const rawString = `${m.title} ${m.eventName} ${m.t1} ${m.t2} ${m.league} ${m.sportCategory} ${m.loc} ${m.city} ${m.stadium}`.toLowerCase();
            
            if (exploreCategory && exploreCategory !== 'All Events') {
                const cat = exploreCategory.toLowerCase();
                let isCatMatch = false;
                if (cat === 'sports') isCatMatch = rawString.includes('ipl') || rawString.includes('cricket') || rawString.includes('kabaddi') || rawString.includes('football');
                else if (cat === 'concerts') isCatMatch = rawString.includes('concert') || rawString.includes('music') || rawString.includes('singer');
                else if (cat === 'theater') isCatMatch = rawString.includes('theater') || rawString.includes('play') || rawString.includes('drama');
                else if (cat === 'festivals') isCatMatch = rawString.includes('festival') || rawString.includes('mela');
                else isCatMatch = rawString.includes(cat);
                if (!isCatMatch) return false;
            }

            if (exploreDateFilter && exploreDateFilter !== 'All dates') {
                const eDateMidnight = new Date(m.safeDateObj);
                eDateMidnight.setHours(0,0,0,0);
                
                const diffDays = Math.round((eDateMidnight.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
                const dayOfWeek = m.safeDateObj.getDay(); 

                if (exploreDateFilter === 'Today' && diffDays !== 0) return false;
                if (exploreDateFilter === 'This weekend') {
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
                    if (!isWeekend || diffDays < 0 || diffDays > 7) return false;
                }
                if (exploreDateFilter === 'Next 7 days' && (diffDays < 0 || diffDays > 7)) return false;
                if (exploreDateFilter === 'This month') {
                    if (m.safeDateObj.getMonth() !== todayStart.getMonth() || m.safeDateObj.getFullYear() !== todayStart.getFullYear()) return false;
                }
            }

            if (explorePriceFilter && explorePriceFilter !== 'Price') {
                const price = m.computedLowestPrice;
                if (explorePriceFilter === 'Under ₹2000' && price > 2000) return false;
                if (explorePriceFilter === 'Under ₹5000' && price > 5000) return false;
                if (explorePriceFilter === 'Under ₹10000' && price > 10000) return false;
                if (explorePriceFilter === 'Under ₹20000' && price > 20000) return false;
            }

            if (searchQuery && !rawString.includes(searchQuery.toLowerCase())) return false;

            if (exploreCategory !== 'All Events' && userCity && !['All Cities', 'Global', 'Loading...', 'Detecting...'].includes(userCity)) {
                if (!rawString.includes(userCity.toLowerCase())) return false;
            }

            return true;
        });
    }, [activeListings, exploreCategory, exploreDateFilter, explorePriceFilter, searchQuery, userCity]);

    const clearAllFilters = () => {
        setSearchQuery('');
        useAppStore.setState({ exploreDateFilter: 'All dates', explorePriceFilter: 'Price', exploreCategory: 'All Events' });
    };

    return (
        <div className="w-full min-h-screen bg-white font-sans text-[#1a1a1a]">
            {/* The ONLY Filter bar that should exist on the page */}
            <ViagogoFilterBar />

            <AdminEditEventModal 
                isOpen={adminModalOpen} 
                onClose={() => { setAdminModalOpen(false); setSelectedAdminEvent(null); }} 
                eventData={selectedAdminEvent} 
            />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-6 md:mt-10">
                
                <div className="mb-6 md:mb-8">
                    <h1 className="text-[26px] md:text-[34px] font-black tracking-tight text-[#1a1a1a] leading-tight">
                        Explore events near {userCity && !['Loading...', 'Detecting...', 'All Cities', 'Global'].includes(userCity) ? userCity : 'you'}
                    </h1>
                    {isAdmin && (
                        <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-[6px] mt-2 font-black text-[11px] uppercase tracking-widest shadow-sm">
                            <ShieldAlert size={14} /> Admin Inventory Active
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-[#8cc63f] mb-4" size={44} />
                        <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Hydrating Market Feed</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 py-20 flex flex-col items-center text-center bg-[#fcfcfc] rounded-[32px] border border-[#e2e2e2]">
                        <div className="w-20 h-20 bg-[#fdf2f2] rounded-full flex items-center justify-center mb-6">
                            <SearchX size={40} className="text-[#c21c3a]" />
                        </div>
                        <h3 className="text-[22px] font-black text-[#1a1a1a]">No events found</h3>
                        <p className="text-gray-500 mt-2 mb-6 max-w-sm font-medium">Try adjusting your date, price selection, or changing your location.</p>
                        <button onClick={clearAllFilters} className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-black transition-colors">Clear Filters</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-20">
                        <AnimatePresence>
                            {filteredEvents.map((m, idx) => {
                                const isFav = favorites?.some(f => f.id === m.id);
                                const safeImage = getSafeImage(m.imageUrl || m.image || m.thumb, m.title || m.sportCategory);
                                const displayPrice = m.computedLowestPrice;
                                const formattedPrice = displayPrice && displayPrice !== Infinity ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayPrice) : null;
                                
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        key={m.id}
                                        onClick={() => navigate(`/event?id=${m.id}`)}
                                        className="flex flex-col group cursor-pointer relative"
                                    >
                                        {/* ADMIN TRIGGER */}
                                        {isAdmin && (
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedAdminEvent(m); setAdminModalOpen(true); }} className="absolute top-3 left-3 z-[60] bg-red-600 text-white p-2.5 rounded-full shadow-[0_8px_20px_rgba(220,38,38,0.4)] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                <Pencil size={14} />
                                            </button>
                                        )}

                                        {/* EXACT VIAGOGO IMAGE FRAME (Borderless & Flat) */}
                                        <div className="w-full aspect-[1.4] rounded-[12px] overflow-hidden relative mb-3 bg-[#f8f9fa]">
                                            <img src={safeImage} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95" />
                                            
                                            {/* Exact Viagogo Heart Button */}
                                            <button onClick={(e) => handleRestrictedAction(e, m)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors z-20">
                                                <Heart size={16} className={isFav ? "fill-white text-white" : "text-white"} />
                                            </button>
                                        </div>

                                        {/* EXACT VIAGOGO CONTENT AREA */}
                                        <div className="flex flex-col px-0.5">
                                            <h3 className="font-bold text-[16px] text-[#1a1a1a] leading-[1.3] mb-1.5 line-clamp-2">
                                                {m.title || m.eventName || `${m.t1} vs ${m.t2}`}
                                            </h3>
                                            
                                            {/* Date Mapping: "Sun, 10 May • 18:00" */}
                                            <p className="text-[13px] text-[#54626c] mb-0.5 font-normal">
                                                {m.safeDateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} • {m.safeDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            
                                            {/* Venue & City Mapping: "Venue in City" */}
                                            <p className="text-[13px] text-[#54626c] line-clamp-1 mb-2 font-normal">
                                                {m.loc || m.stadium} in {m.city || m.location?.split(',')[0]}
                                            </p>

                                            {/* Minimalist Price */}
                                            {formattedPrice ? (
                                                <p className="text-[14px] font-medium text-[#1a1a1a]">Starting from {formattedPrice}</p>
                                            ) : (
                                                <div className="inline-flex items-center gap-1 text-[#c21c3a] mt-0.5">
                                                    <AlertCircle size={14} />
                                                    <span className="text-[12px] font-bold uppercase tracking-widest">Sold Out</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}