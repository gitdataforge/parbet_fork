import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Calendar, ShieldCheck, Ticket, SlidersHorizontal, 
    ChevronDown, Zap, Eye, X, AlertCircle, Flame, Heart, Upload, Loader2, Tag, Pencil 
} from 'lucide-react';

// PRODUCTION IMPORTS
import { useAppStore } from '../../store/useStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';

// MODULAR COMPONENTS
import InteractiveStadiumMap from '../../components/InteractiveStadiumMap';
import TicketQuantityModal from '../../components/TicketQuantityModal';
import EventFilters from '../../components/EventFilters';
import LanguageCurrencyModal from '../../components/LanguageCurrencyModal';
import ShareEventModal from '../../components/ShareEventModal';
import AdminEditEventModal from '../../components/AdminEditEventModal';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 6 Event Detail)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: React Router Native Payload Engine (Bypasses Zustand store crash)
 * FEATURE 2: Seamless Return-To-Checkout Routing (Passes payload to login page)
 * FEATURE 3: Explicit Button Event Binding (Fixes broken checkout redirection)
 * FEATURE 4: PocketBase Image URL Scrubber (Fixes Cloudinary 404 banner crash)
 * FEATURE 5: Interactive Map Filtering Engine
 * FEATURE 6: Dynamic Nested Payload Mapping (Ticket Tiers)
 * FEATURE 7: Advanced ISO Timestamp Parser
 * FEATURE 8: Live Inventory Quantity Gate
 * FEATURE 9: Price-Value Algorithmic Sorting
 * FEATURE 10: Localized Schema Normalization Adapter
 * FEATURE 11: Real-Time Admin Identity Verification
 * FEATURE 12: Native Auth Redirection (Fixes phantom openAuthModal dead clicks)
 * FEATURE 13: Failsafe Window Redirect Fallback (Forces checkout if navigate() is swallowed)
 */

// Utility to strictly label dates based on the real-time API
const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) return 'This Week';
    return 'Upcoming';
};

// Advanced ISO Timestamp Parser
const parseEventTimestamp = (isoString) => {
    if (!isoString) return { date: 'Date TBA', time: '' };
    const d = new Date(isoString);
    if (isNaN(d)) return { date: 'Date TBA', time: '' };
    return {
        date: `${d.toLocaleDateString('en-US', { weekday: 'short' })}, ${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
};

export default function Event() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('id');
    const navigate = useNavigate();
    const location = useLocation();
    
    const { 
        isAuthenticated,
        isTicketQuantityModalOpen,
        setTicketQuantityModalOpen,
        selectedTicketQuantity,
        userCurrency,
        userLanguage,
        favorites,
        toggleFavorite
    } = useAppStore();

    // Real-Time Document State
    const [eventData, setEventData] = useState(null);
    const [ticketTiers, setTicketTiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Feature UI States
    const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLangCurrModalOpen, setIsLangCurrModalOpen] = useState(false);
    
    // ADMIN GOD-MODE STATES
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    // MAP FILTER STATE
    const [activeSection, setActiveSection] = useState(null);
    const [sitTogether, setSitTogether] = useState(true);
    const [instantDownloadOnly, setInstantDownloadOnly] = useState(false);
    const [clearViewOnly, setClearViewOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');
    
    const hasOpenedModal = useRef(false);
    const feedScrollRef = useRef(null);

    // FEATURE 10: Strict Admin Auth Verification
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

    // Dynamic Document Listener & Schema Normalizer
    useEffect(() => {
        if (!eventId) return;

        setIsLoading(true);
        const docRef = doc(db, 'events', eventId);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const rawData = docSnap.data();

                // FEATURE 9: Local Data Normalization Adapter
                const normalizedTitle = rawData.title || rawData.eventName || 'Upcoming Event';
                const normalizedTimestamp = rawData.commence_time || rawData.eventTimestamp || rawData.date || new Date().toISOString();
                const normalizedStadium = rawData.venue?.name || rawData.loc || 'TBA Venue';
                const normalizedLocation = rawData.venue?.city || rawData.city || 'TBA City';
                
                let synthesizedTiers = rawData.ticketTiers || [];
                if (!rawData.ticketTiers && rawData.price) {
                    synthesizedTiers = [{
                        id: `tier-${docSnap.id}`,
                        name: rawData.section ? `${rawData.section}` : 'General Admission',
                        price: rawData.price,
                        quantity: rawData.quantity || 1,
                        seats: rawData.row ? `Row ${rawData.row}` : 'Any',
                        disclosures: ['Instant Download', 'Mobile Ticket']
                    }];
                }

                const mappedData = { 
                    id: docSnap.id, 
                    ...rawData,
                    title: normalizedTitle,
                    eventTimestamp: normalizedTimestamp,
                    stadium: normalizedStadium,
                    location: normalizedLocation,
                    ticketTiers: synthesizedTiers
                };

                setEventData(mappedData);
                setTicketTiers(synthesizedTiers);
                
                if (!hasOpenedModal.current && !isTicketQuantityModalOpen) {
                    setTicketQuantityModalOpen(true);
                    hasOpenedModal.current = true;
                }
            } else {
                setEventData(null);
                setTicketTiers([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("[Database] Failed to fetch event document:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [eventId, setTicketQuantityModalOpen, isTicketQuantityModalOpen]);

    // Smart Auto-scroll
    useEffect(() => {
        if (feedScrollRef.current) {
            feedScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeSection, sortOrder, instantDownloadOnly, clearViewOnly]);

    // FEATURE 1, 2, 11 & 13: Secure "Book" Action with Native Login Redirect & Failsafe Fallback
    const handlePurchaseInitiation = (tier) => {
        // CAPTURE: Strict metadata bundle
        const captureData = {
            eventId: eventId,
            tierId: tier.id,
            eventName: eventData.title,
            eventLoc: `${eventData.stadium}, ${eventData.location?.split(',')[0]}`,
            price: Number(tier.price),
            quantity: selectedTicketQuantity,
            tierName: tier.name,
            sellerId: eventData.sellerId || 'system',
            imageUrl: eventData.imageUrl
        };

        if (!isAuthenticated) {
            // FEATURE 2: Pass the return URL and the captured payload to the Login screen
            navigate('/login', { 
                state: { 
                    returnTo: `/checkout?eventId=${eventId}&tierId=${tier.id}&qty=${selectedTicketQuantity}`,
                    reservedListing: captureData
                } 
            });
            return;
        }

        // CRITICAL BUGFIX: If user IS authenticated, proceed directly to checkout.
        // FEATURE 13: Store fallback payload in session storage in case state is lost during a hard redirect
        sessionStorage.setItem('parbet_checkout_fallback', JSON.stringify(captureData));

        // SECURE TRANSITION: Inject payload directly into the Router state to guarantee delivery
        navigate(
            `/checkout?eventId=${eventId}&tierId=${tier.id}&qty=${selectedTicketQuantity}`, 
            { state: { reservedListing: captureData } }
        );

        // FEATURE 13: Failsafe window redirect fallback if navigate() is swallowed by DOM context
        setTimeout(() => {
            if (!window.location.pathname.includes('/checkout')) {
                window.location.href = `/checkout?eventId=${eventId}&tierId=${tier.id}&qty=${selectedTicketQuantity}`;
            }
        }, 300);
    };

    if (!eventId) return <div className="min-h-screen p-10 font-bold text-center text-[#333333]">Invalid Event ID.</div>;
    
    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
            <Loader2 className="animate-spin text-[#E7364D] mb-4" size={40} />
            <h3 className="text-[16px] font-black text-[#333333] tracking-widest uppercase">Fetching Secure Inventory</h3>
        </div>
    );

    if (!eventData && !isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
            <ShieldCheck size={48} className="text-[#A3A3A3] mb-4" />
            <h3 className="text-[20px] font-black text-[#333333]">Event Offline</h3>
            <p className="text-[#626262] mt-2">This event has been removed or securely archived by the seller.</p>
            <button onClick={() => navigate('/explore')} className="mt-6 bg-[#333333] hover:bg-[#E7364D] transition-colors text-[#FFFFFF] px-6 py-3 rounded-[8px] font-bold shadow-md">Explore Events</button>
        </div>
    );

    const filteredTiers = ticketTiers.filter(tier => {
        if (Number(tier.quantity) < selectedTicketQuantity) return false;
        if (activeSection && !tier.name.toUpperCase().includes(activeSection.toUpperCase())) return false;
        const disclosuresStr = (tier.disclosures || []).join(' ').toLowerCase();
        if (instantDownloadOnly && !disclosuresStr.includes('paperless') && !disclosuresStr.includes('instant download')) return false;
        if (clearViewOnly && disclosuresStr.includes('obstructed')) return false;
        return true;
    }).sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

    const clearAllFilters = () => {
        setActiveSection(null);
        setInstantDownloadOnly(false);
        setClearViewOnly(false);
    };

    const bestValuePrice = filteredTiers.length > 0 ? Math.min(...filteredTiers.map(t => Number(t.price))) : null;
    const isFavorite = favorites?.some(f => f.id === eventData?.id);
    
    const handleRestrictedAction = (e, actionFn) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login', { state: { returnTo: location.pathname + location.search } });
        } else {
            actionFn();
        }
    };

    // FEATURE 4: Advanced Image Resolution with Failsafe Scrubber
    const fallbackImage = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop';
    
    const getSafeImage = (url) => {
        if (!url) return fallbackImage;
        if (url.includes('res.cloudinary.com/dtz0urit6')) return fallbackImage;
        return url;
    };
    
    const displayImage = getSafeImage(eventData.imageUrl || eventData.image);
    const parsedTime = parseEventTimestamp(eventData.eventTimestamp);

    return (
        <div className="w-full animate-fade-in pb-10 bg-[#FFFFFF] min-h-screen text-[#333333] font-sans">
            
            {/* Modular Overlays */}
            <TicketQuantityModal sitTogether={sitTogether} setSitTogether={setSitTogether} />
            <EventFilters 
                isOpen={isFilterSidebarOpen} 
                onClose={() => setIsFilterSidebarOpen(false)} 
                instantDownloadOnly={instantDownloadOnly} setInstantDownloadOnly={setInstantDownloadOnly}
                clearViewOnly={clearViewOnly} setClearViewOnly={setClearViewOnly}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                filteredCount={filteredTiers.length}
            />
            <LanguageCurrencyModal isOpen={isLangCurrModalOpen} onClose={() => setIsLangCurrModalOpen(false)} />
            <ShareEventModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} eventData={eventData} />
            
            {/* Admin God-Mode Editor Modal */}
            <AdminEditEventModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} eventData={eventData} />

            {/* TOP INTERACTION HEADER */}
            <div className="w-full bg-[#FFFFFF] border-b border-[#A3A3A3]/20 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <img 
                        src={displayImage} 
                        alt="Event Thumbnail" 
                        className="w-[60px] h-[60px] rounded-lg object-cover shadow-sm border border-[#A3A3A3]/30"
                        onError={(e) => { e.target.src = fallbackImage; }}
                    />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[18px] md:text-[20px] font-black text-[#333333] leading-tight mb-1 cursor-pointer hover:text-[#E7364D] hover:underline transition-colors">
                                {eventData?.title}
                            </h1>
                            {/* Strictly Rendered Admin Trigger */}
                            {isAdmin && (
                                <button 
                                    onClick={() => setIsAdminModalOpen(true)}
                                    className="flex items-center gap-1.5 bg-[#FAD8DC]/30 text-[#E7364D] border border-[#E7364D]/50 px-2 py-0.5 rounded-[6px] font-bold text-[11px] uppercase tracking-wider hover:bg-[#FAD8DC]/50 transition-colors shadow-sm mb-1"
                                >
                                    <Pencil size={12} /> Edit
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="bg-[#FAD8DC]/40 text-[#E7364D] border border-[#E7364D]/20 text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px] shadow-sm">
                                {getRelativeDateLabel(eventData?.eventTimestamp)}
                            </span>
                            <span className="text-[13px] text-[#626262] font-bold">
                                {parsedTime.date} <span className="text-[#A3A3A3]">•</span> {parsedTime.time}
                            </span>
                        </div>
                        <p className="text-[13px] text-[#626262] font-bold flex items-center gap-1">
                            <MapPin size={12} className="text-[#A3A3A3]" /> {eventData?.stadium}, {eventData?.location?.split(',')[0]}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => handleRestrictedAction(e, () => toggleFavorite(eventData))} 
                            className="w-10 h-10 rounded-full border border-[#A3A3A3]/50 bg-[#FFFFFF] flex items-center justify-center hover:bg-[#FAD8DC]/20 hover:border-[#E7364D] transition-colors shadow-sm"
                        >
                            <Heart size={18} className={isFavorite ? "fill-[#E7364D] text-[#E7364D]" : "text-[#626262]"} />
                        </button>
                        <button 
                            onClick={() => setIsShareModalOpen(true)} 
                            className="w-10 h-10 rounded-full border border-[#A3A3A3]/50 bg-[#FFFFFF] flex items-center justify-center hover:bg-[#FAD8DC]/20 hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm text-[#626262]"
                        >
                            <Upload size={18} />
                        </button>
                    </div>
                    
                    <div className="h-8 w-px bg-[#A3A3A3]/30 mx-1 hidden md:block"></div>
                    
                    <button 
                        onClick={() => setIsLangCurrModalOpen(true)} 
                        className="flex items-center gap-1.5 hover:bg-[#F5F5F5] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#A3A3A3]/30"
                    >
                        <span className="text-[14px] font-bold text-[#333333]">{userCurrency}</span>
                        <span className="text-[14px] font-bold text-[#333333]">{userLanguage}</span>
                        <ChevronDown size={14} className="text-[#A3A3A3]"/>
                    </button>
                </div>
            </div>

            {/* MAIN SPLIT-SCREEN LAYOUT */}
            <div className="w-full h-[85vh] min-h-[700px] flex flex-col lg:flex-row bg-[#FFFFFF] rounded-none lg:rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(51,51,51,0.08)] border-0 lg:border border-[#A3A3A3]/20 mt-0 lg:mt-4 lg:mx-4 xl:mx-auto max-w-[1500px]">
                
                {/* Left Side: Interactive Stadium Map */}
                <div className="hidden lg:flex flex-1 relative flex-col bg-[#F5F5F5] border-r border-[#A3A3A3]/20">
                    <InteractiveStadiumMap 
                        activeSection={activeSection} 
                        onSectionSelect={setActiveSection} 
                        category={eventData?.sportCategory} 
                    />
                </div>

                {/* Right Side: Ticket Listings Panel */}
                <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col bg-[#FFFFFF] h-full z-20 shadow-[-15px_0_40px_rgba(51,51,51,0.05)]">
                    
                    {/* Top Controls Bar */}
                    <div className="p-5 border-b border-[#A3A3A3]/20 flex flex-col bg-[#FFFFFF] shadow-sm z-30">
                        <div className="flex items-center justify-between mb-3">
                            <button 
                                onClick={() => setTicketQuantityModalOpen(true)} 
                                className="flex items-center space-x-2 bg-[#FFFFFF] border border-[#A3A3A3]/50 text-[#333333] px-5 py-2.5 rounded-full font-bold text-[14px] hover:border-[#E7364D] hover:bg-[#FAD8DC]/20 transition-all shadow-sm"
                            >
                                <span>{selectedTicketQuantity} Tickets</span>
                                <ChevronDown size={14} className="opacity-60" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setActiveSection(null)} className="flex items-center space-x-2 bg-[#FFFFFF] border border-transparent text-[#333333] px-3 py-2.5 rounded-full font-bold text-[14px] hover:bg-[#F5F5F5] transition-colors">
                                    <span>{activeSection || 'Any section'}</span>
                                    <ChevronDown size={14} className="opacity-60" />
                                </button>
                                <button 
                                    onClick={() => setIsFilterSidebarOpen(true)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#A3A3A3]/50 hover:bg-[#FAD8DC]/20 hover:border-[#E7364D] transition-all text-[#333333] hover:text-[#E7364D] shadow-sm relative"
                                >
                                    <SlidersHorizontal size={16} />
                                    {(instantDownloadOnly || clearViewOnly || sortOrder === 'desc') && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E7364D] rounded-full border-2 border-[#FFFFFF]"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        <AnimatePresence>
                            {(activeSection || instantDownloadOnly || clearViewOnly) && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-wrap gap-2 pt-2"
                                >
                                    {activeSection && (
                                        <div className="flex items-center bg-[#333333] text-[#FFFFFF] px-3 py-1.5 rounded-full text-[12px] font-bold shadow-sm">
                                            {activeSection}
                                            <button onClick={() => setActiveSection(null)} className="ml-2 hover:text-[#E7364D]"><X size={12} /></button>
                                        </div>
                                    )}
                                    {instantDownloadOnly && (
                                        <div className="flex items-center bg-[#F5F5F5] border border-[#A3A3A3]/30 text-[#626262] px-3 py-1.5 rounded-full text-[12px] font-bold shadow-sm">
                                            Instant Download
                                            <button onClick={() => setInstantDownloadOnly(false)} className="ml-2 hover:text-[#333333]"><X size={12} /></button>
                                        </div>
                                    )}
                                    {clearViewOnly && (
                                        <div className="flex items-center bg-[#F5F5F5] border border-[#A3A3A3]/30 text-[#626262] px-3 py-1.5 rounded-full text-[12px] font-bold shadow-sm">
                                            Clear View
                                            <button onClick={() => setClearViewOnly(false)} className="ml-2 hover:text-[#333333]"><X size={12} /></button>
                                        </div>
                                    )}
                                    <button onClick={clearAllFilters} className="text-[12px] font-bold text-[#A3A3A3] hover:text-[#E7364D] transition-colors px-2 py-1.5">
                                        Clear all
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Scrollable Listings Feed */}
                    <div ref={feedScrollRef} className="flex-1 overflow-y-auto bg-[#F8F9FA] p-4 md:p-5 relative scroll-smooth custom-scrollbar">
                        {filteredTiers.length === 0 ? (
                            <div className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[16px] p-10 text-center mt-4 shadow-sm">
                                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#A3A3A3]/20">
                                    <Ticket size={28} className="text-[#A3A3A3]" />
                                </div>
                                <h3 className="text-[18px] font-black text-[#333333] mb-2 leading-tight">No matching tickets</h3>
                                <p className="text-[14px] text-[#626262] mb-6 font-medium">Try reducing the ticket quantity or clearing your section filter to see more results.</p>
                                <button 
                                    onClick={clearAllFilters} 
                                    className="bg-[#FFFFFF] border border-[#A3A3A3]/50 px-6 py-3 rounded-full font-bold text-[14px] hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm text-[#333333]"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-6 space-y-3">
                                <h4 className="text-[12px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1 px-1">
                                    {filteredTiers.length} results sorted by {sortOrder === 'asc' ? 'lowest price' : 'highest price'}
                                </h4>
                                
                                <AnimatePresence mode="popLayout">
                                    {filteredTiers.map((tier) => {
                                        const isBestValue = Number(tier.price) === bestValuePrice && sortOrder === 'asc';
                                        
                                        return (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                                whileHover={{ y: -2 }}
                                                key={tier.id} 
                                                onClick={() => handlePurchaseInitiation(tier)}
                                                className={`bg-[#FFFFFF] rounded-[12px] p-5 cursor-pointer border hover:border-[#E7364D] hover:shadow-[0_4px_15px_rgba(231,54,77,0.1)] transition-all group relative overflow-hidden flex flex-col ${isBestValue ? 'border-[#E7364D] shadow-sm' : 'border-[#A3A3A3]/30'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${isBestValue ? 'bg-[#E7364D]' : 'bg-[#E7364D] opacity-0 group-hover:opacity-100'}`}></div>
                                                
                                                <div className="flex justify-between items-start mb-4 pl-2">
                                                    <div className="flex-1 pr-4">
                                                        <div className="flex flex-col space-y-1 mb-2">
                                                            <h3 className="font-black text-[#333333] text-[18px] leading-tight group-hover:text-[#E7364D] transition-colors">
                                                                {tier.name}
                                                            </h3>
                                                            {isBestValue && (
                                                                <span className="flex items-center w-max bg-[#FAD8DC]/50 text-[#E7364D] border border-[#E7364D]/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[4px]">
                                                                    <Flame size={12} className="mr-1"/> Best Value
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[13px] text-[#626262] font-bold flex flex-wrap items-center gap-2 mt-1.5">
                                                            <span>Seats: {tier.seats}</span>
                                                            <span className="text-[#A3A3A3]">•</span>
                                                            <span className="text-[#333333]">{tier.quantity} Remaining</span>
                                                            
                                                            {Number(tier.quantity) <= 2 && (
                                                                <span className="flex items-center text-[#E7364D] font-bold text-[11px] bg-[#FAD8DC]/30 px-1.5 py-0.5 rounded-[4px] ml-1 border border-[#E7364D]/20">
                                                                    <AlertCircle size={12} className="mr-1"/> Only {tier.quantity} left
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 flex flex-col items-end">
                                                        <span className="block text-[24px] font-black text-[#333333] leading-none mb-1">
                                                            {userCurrency === 'USD' ? '$' : userCurrency === 'GBP' ? '£' : userCurrency === 'EUR' ? '€' : userCurrency === 'AUD' ? 'A$' : '₹'}{Number(tier.price).toLocaleString()}
                                                        </span>
                                                        <span className="text-[11px] font-black text-[#A3A3A3] uppercase tracking-widest mb-3">
                                                            / ticket
                                                        </span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePurchaseInitiation(tier);
                                                            }}
                                                            className="w-full md:w-auto px-6 py-2.5 rounded-[8px] font-black text-[14px] bg-[#E7364D] text-[#FFFFFF] hover:bg-[#EB5B6E] hover:shadow-md transition-all whitespace-nowrap"
                                                        >
                                                            Book tickets
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {(tier.disclosures && tier.disclosures.length > 0) && (
                                                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[#A3A3A3]/20 pl-2">
                                                        {tier.disclosures.map(d => (
                                                            <span key={d} className="flex items-center text-[11px] font-bold text-[#626262] bg-[#F5F5F5] border border-[#A3A3A3]/30 px-2 py-1 rounded-[4px]">
                                                                <Tag size={12} className="mr-1 text-[#A3A3A3]"/> {d}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}