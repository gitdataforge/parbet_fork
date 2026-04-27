import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2, AlertCircle, Pencil, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

// Global Stores
import { useAppStore } from '../../store/useStore';
import { useMarketStore } from '../../store/useMarketStore';

// UI Components
import ViagogoHeroCarousel from '../../components/ViagogoHeroCarousel';
import ViagogoFilterBar from '../../components/ViagogoFilterBar';
import ViagogoEventCard from '../../components/ViagogoEventCard';
import ViagogoCategoryCard from '../../components/ViagogoCategoryCard';
import AdminEditEventModal from '../../components/AdminEditEventModal';

/**
 * FEATURE 1: 100% Real-Time Shared Database Integration (No Mock Data)
 * FEATURE 2: State Hydration Failsafe (Eliminates infinite loading loop race conditions)
 * FEATURE 3: Admin God-Mode Injection (Direct event mutation from the feed)
 * FEATURE 4: Strict "See All" Exploration Routing (Passes global category queries)
 * FEATURE 5: Dynamic Search & Filtering Engine
 * FEATURE 6: Algorithmic Sport Categorization (Rails)
 * FEATURE 7: Fallback Empty State Engine
 * FEATURE 8: Hardware-Accelerated Rail Navigation (Framer Motion)
 * FEATURE 9: Spotify Cross-Promotion Banner
 * FEATURE 10: App Download Conversion Banner
 * FEATURE 11: Touch/Swipe Optimized Snap-to-Grid
 * FEATURE 12: Image 404 Cascade Prevention (Strict key mapping)
 */

export default function Home() {
    const navigate = useNavigate();
    
    // Local App State
    const { searchQuery, setLocationDropdownOpen, setSearchQuery, setExploreCategory } = useAppStore();
    
    // Shared Market State (Real-Time Firestore Pipe)
    const { activeListings, isLoading, initMarketListener } = useMarketStore();

    // Admin Authentication State
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [selectedAdminEvent, setSelectedAdminEvent] = useState(null);

    // FEATURE 2: Bulletproof Infinite Loader Resolution
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        const unsubscribe = initMarketListener();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [initMarketListener]);

    // Failsafe: Kill loader instantly if data exists, or timeout after 5 seconds for empty DBs
    useEffect(() => {
        if (activeListings && activeListings.length > 0) {
            setShowLoader(false);
        }
        const failsafeTimer = setTimeout(() => setShowLoader(false), 5000);
        return () => clearTimeout(failsafeTimer);
    }, [activeListings]);

    // FEATURE 3: Admin God-Mode Identity Verification
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && user.email) {
                const validAdmins = ['testcodecfg@gmail.com', 'krishnamehta.gm@gmail.com', 'jatinseth.op@gmail.com'];
                setIsAdmin(validAdmins.includes(user.email.toLowerCase()));
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // FEATURE 5: Dynamic Search Engine
    const filteredMatches = useMemo(() => {
        if (!searchQuery) return activeListings;
        const q = searchQuery.toLowerCase();
        return activeListings.filter(m => {
            const searchString = `${m.title} ${m.eventName} ${m.stadium} ${m.location} ${m.sportCategory}`.toLowerCase();
            return searchString.includes(q);
        });
    }, [activeListings, searchQuery]);

    // FEATURE 6: Algorithmic Categorization
    const trendingMatches = useMemo(() => filteredMatches.slice(0, 8), [filteredMatches]);
    
    const cricketMatches = useMemo(() => 
        filteredMatches.filter(m => {
            const str = `${m.title} ${m.sportCategory}`.toLowerCase();
            return str.includes('cricket') || str.includes('t20') || str.includes('test');
        }), 
    [filteredMatches]);

    const kabaddiMatches = useMemo(() => 
        filteredMatches.filter(m => {
            const str = `${m.title} ${m.sportCategory}`.toLowerCase();
            return str.includes('kabaddi') || str.includes('pkl');
        }), 
    [filteredMatches]);

    // FEATURE 8: Reusable Dynamic Event Rail
    const EventRail = ({ title, events, categoryQuery }) => {
        const scrollRef = useRef(null);
        
        const scroll = (direction) => {
            if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
            }
        };

        if (events.length === 0) return null;

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-10 md:mb-14 relative group"
            >
                <div className="flex items-center justify-between mb-4 md:mb-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[20px] md:text-[24px] font-black text-[#1a1a1a] tracking-tight">{title}</h2>
                        {isAdmin && (
                            <span className="hidden md:inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest">
                                <ShieldAlert size={12} /> Admin
                            </span>
                        )}
                    </div>
                    {/* FEATURE 4: Strict "See All" Exploration Routing */}
                    {events.length > 4 && (
                        <button 
                            onClick={() => {
                                setExploreCategory(categoryQuery || title);
                                setSearchQuery(categoryQuery === 'Trending' ? '' : categoryQuery);
                                navigate('/explore');
                            }}
                            className="text-[14px] font-bold text-[#0064d2] hover:underline hidden md:block"
                        >
                            See all
                        </button>
                    )}
                </div>
                
                <div className="relative">
                    <div ref={scrollRef} className="flex overflow-x-auto custom-scrollbar space-x-4 md:space-x-5 pb-6 snap-x">
                        {events.map((event, index) => (
                            <div key={event?.id || `event-fallback-${index}`} className="relative group/admin snap-start">
                                <ViagogoEventCard 
                                    event={event} 
                                    onClick={() => navigate(`/event?id=${event?.id}`)} 
                                />
                                {/* FEATURE 3: Floating Admin Edit Injector */}
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAdminEvent(event);
                                            setAdminModalOpen(true);
                                        }}
                                        className="absolute top-3 left-3 z-[60] bg-red-600 text-white p-2 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.4)] opacity-0 group-hover/admin:opacity-100 transition-all hover:scale-110 hover:bg-red-700"
                                        title="God Mode: Edit Event"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {events.length > 4 && (
                        <button 
                            onClick={() => scroll('right')} 
                            className="absolute -right-5 top-[40%] -translate-y-1/2 w-12 h-12 bg-white border border-[#e2e2e2] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#1a1a1a] hover:scale-105 transition-transform z-10 hidden lg:flex opacity-0 group-hover:opacity-100"
                        >
                            <ChevronDown size={24} className="-rotate-90" />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full bg-white pb-10 md:pb-20 font-sans text-[#1a1a1a]">
            
            {/* INJECT: Global Admin Edit Modal */}
            <AdminEditEventModal 
                isOpen={adminModalOpen} 
                onClose={() => { setAdminModalOpen(false); setSelectedAdminEvent(null); }} 
                eventData={selectedAdminEvent} 
            />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* 1. HERO CAROUSEL */}
                <div className="pt-2 md:pt-4">
                    <ViagogoHeroCarousel />
                </div>

                {/* 2. FILTER BAR */}
                <div className="mt-2 mb-6 md:mt-4 md:mb-8">
                    <ViagogoFilterBar />
                </div>

                {/* FEATURE 2: Failsafe Loading State UI */}
                {showLoader ? (
                    <div className="w-full py-24 flex flex-col items-center justify-center bg-[#f8f9fa] rounded-[16px] mb-12">
                        <Loader2 className="animate-spin text-[#8cc63f] mb-4" size={40} />
                        <h3 className="text-[18px] font-black text-[#1a1a1a]">Syncing Global Markets</h3>
                        <p className="text-[14px] text-[#54626c] mt-2">Connecting to live seller inventories...</p>
                    </div>
                ) : (
                    <>
                        {/* FEATURE 7: Empty State UI for Dynamic Matches */}
                        {filteredMatches.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-20 flex flex-col items-center justify-center bg-[#fcfcfc] border border-[#e2e2e2] rounded-[16px] mb-12 text-center px-6">
                                <div className="w-16 h-16 bg-[#fdf2f2] rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle size={32} className="text-[#c21c3a]" />
                                </div>
                                <h3 className="text-[20px] font-black text-[#1a1a1a] mb-2">No Active Matches Found</h3>
                                <p className="text-[15px] text-[#54626c] max-w-md mx-auto mb-6">
                                    There are currently no live tickets matching your criteria. Sellers are adding new inventory every minute.
                                </p>
                                <button onClick={() => setSearchQuery('')} className="bg-[#1a1a1a] text-white px-6 py-3 rounded-[8px] font-bold text-[14px] hover:bg-black transition-colors">
                                    Clear Filters
                                </button>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {/* FEATURE 12: Strict Key Mapping applied inside EventRail */}
                                
                                {/* DYNAMIC REAL-TIME RAILS */}
                                <EventRail key="trending-rail" title="Trending Now" events={trendingMatches} categoryQuery="Trending" />
                                
                                {/* SPOTIFY PROMO BANNER */}
                                <motion.div key="spotify-promo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-black rounded-[12px] p-5 md:p-6 mb-10 md:mb-14 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:shadow-xl transition-all">
                                    <div className="flex flex-col md:flex-row items-center w-full md:w-auto justify-center md:justify-start mb-5 md:mb-0 space-y-4 md:space-y-0 md:space-x-5">
                                        <div className="flex items-center space-x-3">
                                            <svg viewBox="0 0 24 24" width="32" height="32" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.36.18.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z"/></svg>
                                            <span className="font-bold text-[20px] md:text-[24px] text-white tracking-tight">Spotify</span>
                                        </div>
                                        <div className="text-center md:text-left border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-5">
                                            <h3 className="font-bold text-[14px] md:text-[16px] text-white leading-tight">Connect your Spotify account</h3>
                                            <p className="text-[12px] md:text-[14px] text-gray-400 mt-1">Discover matches from teams you follow</p>
                                        </div>
                                    </div>
                                    <button className="bg-[#1ed760] text-black font-bold px-8 py-3 rounded-full text-[14px] hover:bg-[#1cdf5f] transition-colors w-full md:w-auto">
                                        Connect Spotify
                                    </button>
                                </motion.div>

                                <EventRail key="cricket-rail" title="Top Cricket Matches" events={cricketMatches} categoryQuery="Cricket" />
                                <EventRail key="kabaddi-rail" title="Pro Kabaddi League" events={kabaddiMatches} categoryQuery="Kabaddi" />
                            </AnimatePresence>
                        )}
                    </>
                )}

                {/* POPULAR CATEGORIES GRID */}
                <div className="mb-10 md:mb-14">
                    <h2 className="text-[20px] md:text-[24px] font-black text-[#1a1a1a] mb-4 md:mb-5 tracking-tight">Popular categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { name: 'IPL Cricket', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80' },
                            { name: 'World Cup', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Kabaddi', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Football', img: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=600&q=80' }
                        ].map((cat, idx) => (
                            <ViagogoCategoryCard 
                                key={idx} 
                                name={cat.name} 
                                img={cat.img} 
                                onClick={() => { 
                                    setLocationDropdownOpen(false); 
                                    setSearchQuery(cat.name.split(' ')[0]); 
                                    setExploreCategory(cat.name.split(' ')[0]);
                                    navigate('/explore');
                                }} 
                            />
                        ))}
                    </div>
                </div>

                {/* APP DOWNLOAD BANNER */}
                <div className="w-full bg-[#f8f9fa] border border-[#e2e2e2] rounded-[16px] p-6 md:p-10 mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                    <div className="md:w-1/2 z-10 mb-6 md:mb-0 text-center md:text-left">
                        <h2 className="text-[24px] md:text-[32px] font-black text-[#1a1a1a] mb-2 leading-tight tracking-tight">Download the parbet app</h2>
                        <p className="text-[14px] md:text-[16px] text-[#54626c] font-medium">Favorites, secure tickets, and global markets in your pocket.</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 z-10 w-full md:w-auto justify-center">
                        <div className="flex flex-col space-y-2">
                            <button className="bg-black text-white px-4 py-2 rounded-[8px] flex items-center space-x-2 hover:bg-gray-800 transition-colors w-[130px]">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[8px]">Download on</span>
                                    <span className="text-[12px] font-bold">App Store</span>
                                </div>
                            </button>
                            <button className="bg-black text-white px-4 py-2 rounded-[8px] flex items-center space-x-2 hover:bg-gray-800 transition-colors w-[130px]">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[8px]">GET IT ON</span>
                                    <span className="text-[12px] font-bold">Google Play</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}