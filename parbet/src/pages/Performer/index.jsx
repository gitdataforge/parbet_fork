import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Heart, Share, MapPin, Calendar, Tag, ChevronDown, 
    Info, Download, QrCode, ShieldCheck, Flame, Users,
    Search, Check, Clock, ChevronLeft, ChevronRight, Bookmark, Navigation
} from 'lucide-react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useAppStore } from '../../store/useStore';
import LocationDropdown from '../../components/LocationDropdown';
import FilterDropdown from '../../components/FilterDropdown';

// Strict Date Formatters mimicking the screenshots
const getMonthStr = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short' });
const getDayNum = (d) => new Date(d).getDate();
const getDowStr = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
const getTimeStr = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const eventDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) return 'This week';
    if (diffDays > 7 && diffDays <= 14) return 'Next week';
    return '';
};

export default function Performer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const performerName = decodeURIComponent(id || 'Indian Premier League');

    const { 
        liveMatches, userCity, isLoadingMatches, fetchLocationAndMatches,
        isAuthenticated, isLocationDropdownOpen, setLocationDropdownOpen,
        performerFilters, setPerformerFilter, toggleFavorite
    } = useAppStore();

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [emailInput, setEmailInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // ==========================================
    // CRITICAL FIX: REAL-TIME FIREBASE SYNC (STRICT PATHS)
    // ==========================================
    const [realTimeListings, setRealTimeListings] = useState([]);

    useEffect(() => {
        const db = getFirestore();
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
        
        // Listen instantly to the global tickets database using the mandatory 6-segment path
        const ticketsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
        
        const unsubscribe = onSnapshot(ticketsRef, (snapshot) => {
            const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRealTimeListings(listings);
        }, (error) => {
            console.error("Buyer Site Listener Permission Error:", error);
        });

        if (liveMatches.length === 0 && !isLoadingMatches) {
            fetchLocationAndMatches();
        }
        window.scrollTo(0, 0);

        return () => unsubscribe();
    }, [liveMatches.length, isLoadingMatches, fetchLocationAndMatches]);

    // --- RIGOROUS REAL-TIME API FILTERING ---
    const { baseEvents, filteredEvents, trendingGroups } = useMemo(() => {
        const base = liveMatches.filter(m => 
            m.t1?.toLowerCase().includes(performerName.toLowerCase()) || 
            m.t2?.toLowerCase().includes(performerName.toLowerCase()) ||
            m.league?.toLowerCase().includes(performerName.toLowerCase()) ||
            performerName.toLowerCase().includes('ipl')
        );

        const filtered = base.filter(m => {
            if (userCity && userCity !== 'All Cities' && userCity !== 'Global' && userCity !== 'Current Location') {
                if (m.loc && !m.loc.toLowerCase().includes(userCity.toLowerCase())) return false;
            }
            return true;
        });

        // Derive Trending Groups for the bottom rail based on local city volume
        const trendingRaw = liveMatches.filter(m => userCity !== 'All Cities' && m.loc && m.loc.toLowerCase().includes(userCity.toLowerCase()));
        const tGroups = {};
        trendingRaw.forEach(e => {
            const key = e.t1;
            if (!tGroups[key]) tGroups[key] = { id: e.id, name: key, imageId: e.t1, events: [] };
            tGroups[key].events.push(e);
        });
        const trendingArr = Object.values(tGroups).sort((a, b) => b.events.length - a.events.length).slice(0, 4);

        return { baseEvents: base, filteredEvents: filtered.length > 0 ? filtered : base, trendingGroups: trendingArr };
    }, [liveMatches, performerName, userCity]);

    // Derived State for Analytics & Pagination
    const viewerCount = useMemo(() => Math.floor(filteredEvents.length * 451.08) || 5413, [filteredEvents.length]);
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleDropdown = (dropdownName) => {
        if (activeDropdown === dropdownName) setActiveDropdown(null);
        else { setActiveDropdown(dropdownName); setLocationDropdownOpen(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="w-full pb-20 bg-white font-sans text-[#1a1a1a]">
            
            {/* 1. EXACT VIAGOGO DARK GREEN HERO BANNER */}
            <div className="w-full bg-[#112d1e] h-[240px] md:h-[280px] relative overflow-hidden flex items-center">
                {/* Fade to transparent for stadium image overlay */}
                <div className="absolute inset-0 z-0 flex justify-end">
                    <div className="w-full md:w-[60%] h-full relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#112d1e] via-[#112d1e]/80 to-transparent z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1500&auto=format&fit=crop" 
                            alt="Cricket Stadium" 
                            className="w-full h-full object-cover object-right"
                        />
                    </div>
                </div>
                
                <div className="relative z-20 max-w-[1200px] mx-auto px-4 md:px-8 w-full flex justify-between items-center">
                    <h1 className="text-[36px] md:text-[56px] font-black text-white leading-[1.05] tracking-tight max-w-[600px]">
                        {performerName === 'IPL' ? 'Indian Premier League' : performerName} <br /> Tickets
                    </h1>
                    <div className="hidden md:flex items-center gap-2 border border-white/40 rounded-full px-4 py-2 text-white bg-black/20 backdrop-blur-sm cursor-pointer hover:bg-black/40 transition-colors">
                        <span className="text-[14px] font-bold">10.8K</span>
                        <Heart size={16} />
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6">
                
                {/* 2. VIEWER BANNER */}
                <div className="w-full bg-[#eaf4fd] text-[#0064d2] rounded-[8px] p-4 flex items-center mb-6 shadow-sm border border-[#d2e8fa]">
                    <Users size={20} className="mr-3 shrink-0" strokeWidth={2.5}/>
                    <span className="text-[14px] md:text-[15px] font-medium tracking-tight">
                        {viewerCount.toLocaleString()} people viewed {performerName === 'IPL' ? 'Indian Premier League' : performerName} events in the past hour
                    </span>
                </div>

                {/* 3. FILTER ROW */}
                <div className="flex flex-wrap items-center gap-3 overflow-visible pb-6 border-b border-[#e2e2e2] mb-6">
                    <div className="relative">
                        <button 
                            onClick={() => { setLocationDropdownOpen(!isLocationDropdownOpen); setActiveDropdown(null); }}
                            className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center whitespace-nowrap shadow-sm hover:bg-black transition-colors"
                        >
                            <Navigation size={14} className="mr-2 fill-white -rotate-45"/> 
                            {userCity === 'Loading...' ? 'Detecting...' : (userCity === 'All Cities' ? 'Global' : userCity)} 
                            <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        {isLocationDropdownOpen && <div className="absolute left-0 mt-2 z-50"><LocationDropdown /></div>}
                    </div>

                    <div className="relative">
                        <button onClick={() => toggleDropdown('date')} className="bg-white border border-[#cccccc] text-[#1a1a1a] px-5 py-2.5 rounded-full text-[14px] font-medium flex items-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
                            All dates <ChevronDown size={16} className="ml-2 text-gray-500"/>
                        </button>
                        {activeDropdown === 'date' && <FilterDropdown type="date" isOpen={true} onClose={() => setActiveDropdown(null)} />}
                    </div>

                    <button className="bg-white border border-[#cccccc] text-[#1a1a1a] px-5 py-2.5 rounded-full text-[14px] font-medium flex items-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
                        Hide sold out
                    </button>
                </div>

                {/* 4. EVENT LIST HEADER */}
                <h2 className="text-[18px] md:text-[20px] font-black text-[#1a1a1a] mb-5 tracking-tight">
                    {filteredEvents.length} events in {userCity !== 'All Cities' ? userCity : 'all locations'}
                </h2>

                {/* 5. MAIN EVENT LEDGER */}
                <div className="flex flex-col gap-3 mb-12">
                    {isLoadingMatches ? (
                        <div className="w-full py-20 flex flex-col items-center justify-center border border-gray-200 rounded-[12px]">
                            <div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-gray-500">Syncing live sports network...</p>
                        </div>
                    ) : (
                        paginatedEvents.map((m, index) => {
                            // Map real-time Firebase tickets to this specific match
                            const eventListings = realTimeListings.filter(listing => listing.eventId === m.id || listing.t1 === m.t1);
                            const hasTickets = eventListings.length > 0;
                            const relativeLabel = getRelativeDateLabel(m.commence_time);
                            
                            // Pseudo-randomize tags to precisely match the Viagogo UI screenshots
                            const isHottest = index === 0;
                            const isSellingOut = index === 1 || index === 2;
                            const isWeekend = new Date(m.commence_time).getDay() === 0 || new Date(m.commence_time).getDay() === 6;

                            return (
                                <div 
                                    key={m.id} 
                                    onClick={() => navigate(`/event?id=${m.id}`)}
                                    className="bg-white border border-[#cccccc] rounded-[12px] p-4 flex flex-col md:flex-row md:items-center hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                                >
                                    {/* Exact Viagogo Date Tear-off */}
                                    <div className="flex items-center flex-1">
                                        <div className="flex flex-col items-center justify-center pr-5 md:pr-6 border-r border-[#e2e2e2] min-w-[70px]">
                                            <span className="text-[13px] font-bold text-[#1a1a1a] uppercase">{getMonthStr(m.commence_time)}</span>
                                            <span className="text-[28px] font-black text-[#1a1a1a] leading-none my-0.5">{getDayNum(m.commence_time)}</span>
                                            <span className="text-[12px] text-[#54626c] font-medium uppercase">{getDowStr(m.commence_time)}</span>
                                        </div>
                                        
                                        {/* Event Details */}
                                        <div className="pl-5 md:pl-6 flex-1 min-w-0">
                                            <h3 className="text-[16px] md:text-[18px] font-bold text-[#1a1a1a] leading-tight mb-1 truncate group-hover:text-[#0064d2] transition-colors">
                                                {m.t1} {m.t2 ? `vs ${m.t2}` : ''}
                                            </h3>
                                            <p className="text-[13px] text-[#54626c] flex items-center mb-2 truncate">
                                                {getTimeStr(m.commence_time)} • 🇮🇳 {m.loc}
                                            </p>
                                            
                                            {/* Dynamic Viagogo Tags (Hottest, Selling Out, Today) */}
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {relativeLabel && (
                                                    <div className="flex items-center bg-[#f8f9fa] border border-[#e2e2e2] text-[#1a1a1a] px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <Calendar size={12} className="mr-1.5 opacity-70"/> {relativeLabel}
                                                    </div>
                                                )}
                                                {isHottest && (
                                                    <div className="flex items-center bg-[#eaf4d9] text-[#458731] px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <Flame size={12} className="mr-1.5"/> Hottest event
                                                    </div>
                                                )}
                                                {isSellingOut && (
                                                    <div className="flex items-center bg-[#fce8eb] text-[#c21c3a] px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <Clock size={12} className="mr-1.5"/> Only {Math.floor(Math.random() * 4) + 1}% of tickets left
                                                    </div>
                                                )}
                                                {isWeekend && !isSellingOut && !isHottest && (
                                                    <div className="flex items-center bg-[#f8f9fa] border border-[#e2e2e2] text-[#1a1a1a] px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <Calendar size={12} className="mr-1.5 opacity-70"/> This weekend
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* See Tickets Button mapped to Real-Time DB */}
                                    <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-[#e2e2e2] md:border-t-0 flex justify-end shrink-0 md:pl-4">
                                        <button className={`w-full md:w-auto px-6 py-2.5 rounded-[8px] font-bold text-[14px] transition-colors shadow-sm ${
                                            hasTickets ? 'bg-[#458731] text-white hover:bg-[#3a7229]' : 'border border-[#cccccc] text-[#1a1a1a] bg-white hover:bg-gray-50'
                                        }`}>
                                            See tickets
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* 6. PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mb-16">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1a1a1a] disabled:opacity-30">
                            <ChevronLeft size={20} />
                        </button>
                        {[...Array(Math.min(3, totalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 flex items-center justify-center rounded-full text-[14px] font-bold transition-colors ${page === currentPage ? 'bg-[#458731] text-white' : 'bg-transparent text-[#1a1a1a] hover:bg-gray-100'}`}>
                                    {page}
                                </button>
                            );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1a1a1a] disabled:opacity-30">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* 7. "FANS ALSO LOVE" CAROUSEL */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] tracking-tight">
                            {performerName === 'IPL' ? 'Indian Premier League' : performerName} fans also love
                        </h2>
                        <div className="flex space-x-2">
                            <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"><ChevronLeft size={16}/></button>
                            <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center shadow-sm hover:bg-gray-50"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                    
                    <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                        {[
                            { name: 'Gujarat Titans', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400', hearts: '2.7K' },
                            { name: 'Kolkata Knight Riders', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400', hearts: '6.1K' },
                            { name: 'Travis Scott', img: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f921?q=80&w=400', hearts: '13.3K' },
                            { name: "ICC Women's Cricket World Cup", img: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=400', hearts: '949' }
                        ].map((item, idx) => (
                            <div key={idx} className="min-w-[240px] max-w-[240px] cursor-pointer group">
                                <div className="w-full h-[150px] relative rounded-[12px] overflow-hidden mb-3">
                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[12px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5">
                                        {item.hearts} <Heart size={12} className="opacity-80"/>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[#1a1a1a] text-[15px] leading-tight truncate">{item.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. TRENDING EVENTS NEAR LOCATION */}
                {trendingGroups.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] mb-6 tracking-tight">Trending events near <span className="text-[#458731]">{userCity}</span></h2>
                        <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                            {trendingGroups.map((g, idx) => (
                                <div key={idx} className="min-w-[260px] max-w-[260px] cursor-pointer group" onClick={() => navigate(`/event?id=${g.firstEventId}`)}>
                                    <div className="w-full h-[160px] relative rounded-[12px] overflow-hidden mb-3">
                                        <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400&auto=format&fit=crop" alt={g.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 left-3 bg-[#458731] text-white text-[12px] font-bold px-2 py-0.5 rounded-[4px] shadow-sm">#{idx + 1}</div>
                                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                                            <Heart size={16} />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-[#1a1a1a] text-[15px] leading-tight mb-1 truncate">{g.name}</h3>
                                    <p className="text-[13px] text-[#54626c] truncate mb-0.5">{getDowStr(new Date())}, {getDayNum(new Date())} {getMonthStr(new Date())} • 19:30</p>
                                    <p className="text-[13px] text-[#54626c] truncate">Wankhede Stadium</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 9. APP DOWNLOAD BANNER */}
                <div className="w-full bg-[#f2f7f4] rounded-[16px] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden mb-12 shadow-sm border border-[#e8f0e4]">
                    <div className="md:w-1/2 z-10 text-center md:text-left mb-6 md:mb-0">
                        <h2 className="text-[26px] md:text-[32px] font-black text-[#1a1a1a] mb-1 leading-tight tracking-tight">Download the parbet app</h2>
                        <p className="text-[15px] text-[#54626c] font-medium mb-6">Discover your favourite events with ease</p>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            <button className="bg-black text-white px-5 py-2.5 rounded-[8px] flex items-center hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center shadow-md">
                                <Download size={20} className="mr-3" />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] block opacity-80">Download on the</span>
                                    <span className="text-[14px] font-bold">App Store</span>
                                </div>
                            </button>
                            <button className="bg-black text-white px-5 py-2.5 rounded-[8px] flex items-center hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center shadow-md">
                                <Download size={20} className="mr-3" />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] block opacity-80">GET IT ON</span>
                                    <span className="text-[14px] font-bold">Google Play</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center md:justify-end z-10 pr-4">
                        <div className="bg-white p-3 rounded-[12px] shadow-lg border border-gray-100 flex flex-col items-center">
                            <QrCode size={80} className="text-[#1a1a1a] mb-1"/>
                        </div>
                    </div>
                </div>

                {/* 10. EMAIL SUBSCRIPTION BANNER */}
                <div className="w-full flex flex-col items-center text-center px-4 mb-8 py-8 border-t border-[#e2e2e2]">
                    <h3 className="text-[16px] md:text-[18px] font-bold text-[#1a1a1a] mb-6">Get hot events and deals delivered straight to your inbox</h3>
                    <div className="flex flex-col sm:flex-row items-center w-full max-w-md space-y-3 sm:space-y-0 sm:space-x-3">
                        <input 
                            type="email" placeholder="Email address" 
                            value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full bg-white border border-[#cccccc] py-3 px-4 rounded-[8px] outline-none focus:border-[#458731] transition-colors text-[15px] text-[#1a1a1a] placeholder-[#54626c] shadow-sm"
                        />
                        <button className="w-full sm:w-auto border border-[#458731] text-[#458731] font-bold px-6 py-3 rounded-[8px] hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm bg-white">
                            Join the List
                        </button>
                    </div>
                    <p className="text-[12px] text-[#54626c] mt-4 max-w-[800px] mx-auto leading-relaxed">
                        By signing in or creating an account, you agree to our <span className="text-[#0064d2] hover:underline cursor-pointer">user agreement</span> and acknowledge our <span className="text-[#0064d2] hover:underline cursor-pointer">privacy policy</span>. You may receive SMS notifications from us and can opt out at any time.
                    </p>
                </div>

            </div>
        </motion.div>
    );
}