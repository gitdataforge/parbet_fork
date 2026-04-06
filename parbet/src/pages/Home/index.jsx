import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Heart, RefreshCw, AlertCircle, ChevronDown, Navigation as NavigationIcon, Clock, CheckCircle, Flame, Star, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

// Existing Components
import LocationDropdown from '../../components/LocationDropdown';
import DealCard from '../../components/DealCard';
import CityHubCard from '../../components/CityHubCard';
import TrustSection from '../../components/TrustSection';
import RegionalMap from '../../components/RegionalMap';
import LeaguePortal from '../../components/LeaguePortal';
import VenueCard from '../../components/VenueCard';

// 10+ Existing High-End Logic Components
import CricketTicker from '../../components/CricketTicker';
import WeatherWidget from '../../components/WeatherWidget';
import NewsMarquee from '../../components/NewsMarquee';
import SeriesRail from '../../components/SeriesRail';
import FanPoll from '../../components/FanPoll';
import PriceGraph from '../../components/PriceGraph';
import SafetyPanel from '../../components/SafetyPanel';
import LivePulseGlobe from '../../components/LivePulseGlobe';
import PurchaseToast from '../../components/PurchaseToast';
import TransitLogic from '../../components/TransitLogic';

// 20+ NEW High-End Logic Components
import PlayerStats from '../../components/PlayerStats';
import AudioPreview from '../../components/AudioPreview';
import RelatedArtists from '../../components/RelatedArtists';
import ScarcityMeter from '../../components/ScarcityMeter';
import DiscountWheel from '../../components/DiscountWheel';
import SellPrompt from '../../components/SellPrompt';
import WhosGoing from '../../components/WhosGoing';
import HypeScore from '../../components/HypeScore';
import BuyerReviews from '../../components/BuyerReviews';
import DriveTime from '../../components/DriveTime';
import HotelRail from '../../components/HotelRail';
import FlightDeals from '../../components/FlightDeals';
import TimezoneClock from '../../components/TimezoneClock';
import DailyTrivia from '../../components/DailyTrivia';
import VIPPortal from '../../components/VIPPortal';
import SoldOutGraveyard from '../../components/SoldOutGraveyard';
import AccessibilityFilter from '../../components/AccessibilityFilter';
import ThemePreview from '../../components/ThemePreview';

// Utility to strictly label dates based on the real-time API
const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return 'Upcoming';
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

export default function Home() {
    const navigate = useNavigate();
    const { 
        isAuthenticated, 
        openAuthModal,
        liveMatches,
        isLoadingMatches,
        apiError,
        userCity,
        userCountry,
        fetchLocationAndMatches,
        searchQuery,
        setSearchQuery,
        isLocationDropdownOpen,
        setLocationDropdownOpen,
        toggleFavorite
    } = useAppStore();

    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // REAL-TIME CURRENCY CONVERTER STATE
    const [exchangeRates, setExchangeRates] = useState({});
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('INR');
    const [convertAmount, setConvertAmount] = useState(100);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
                const data = await res.json();
                if (data && data.rates) {
                    setExchangeRates(data.rates);
                }
            } catch (err) {
                console.error("Exchange rate fetch failed", err);
            }
        };
        fetchRates();
    }, [baseCurrency]);

    const heroSlides = [
        {
            id: "world-cup-banner",
            title: "World Cup",
            bgLeft: "#044d22", 
            bgRight: "#8bc53f", 
            query: "World Cup",
            content: (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center justify-center z-10 w-full h-full relative overflow-hidden">
                         <div className="absolute w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)' }}></div>
                         <div className="flex items-center space-x-2 drop-shadow-2xl">
                            <span className="text-[100px] md:text-[140px] font-black text-[#1a1a1a] drop-shadow-lg tracking-tighter leading-none">W</span>
                            <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl flex items-center justify-center text-3xl md:text-5xl transform -translate-y-1 md:-translate-y-2">⚽</div>
                            <span className="text-[100px] md:text-[140px] font-black text-[#1a1a1a] drop-shadow-lg tracking-tighter leading-none">RLD</span>
                         </div>
                    </div>
                </div>
            )
        },
        {
            id: "ye-banner",
            title: "Ye",
            bgLeft: "#044d22",
            bgRight: "#000000",
            query: "Kanye West",
            content: (
                <div className="absolute inset-0 right-0 pointer-events-none flex justify-end">
                    <img src="https://images.unsplash.com/photo-1549834125-82d3c48159a3?auto=format&fit=crop&w=1000&q=80" className="h-full object-cover opacity-90" alt="Ye" style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }}/>
                </div>
            )
        },
        {
            id: "luke-combs-banner",
            title: "Luke Combs",
            bgLeft: "#044d22",
            bgRight: "#000000",
            query: "Luke Combs",
            content: (
                <div className="absolute inset-0 right-0 pointer-events-none flex justify-end">
                     <img src="https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&w=1000&q=80" className="h-full object-cover opacity-90" alt="Luke Combs" style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }}/>
                </div>
            )
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentHeroIndex((p) => (p + 1) % heroSlides.length), 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    useEffect(() => {
        if (liveMatches.length === 0) fetchLocationAndMatches();
    }, [fetchLocationAndMatches, liveMatches.length]);

    // --- STRICT FILTERING LOGIC (NO MOCK DATA) ---
    
    // 1. Trending Performers (Unique high-frequency names)
    const trending = useMemo(() => {
        const counts = {};
        liveMatches.forEach(m => {
            counts[m.t1] = (counts[m.t1] || 0) + 1;
            if(m.t2) counts[m.t2] = (counts[m.t2] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 12)
            .map(([name]) => name);
    }, [liveMatches]);

    // 2. Last Minute Deals (Starts within 48h)
    const lastMinuteDeals = useMemo(() => {
        const limit = Date.now() + (48 * 60 * 60 * 1000);
        return liveMatches.filter(m => new Date(m.commence_time).getTime() < limit).slice(0, 10);
    }, [liveMatches]);

    // 3. This Weekend
    const weekendEvents = useMemo(() => {
        const now = new Date();
        const sat = new Date();
        sat.setDate(now.getDate() + (6 - now.getDay()) % 7);
        const sun = new Date(sat);
        sun.setDate(sat.getDate() + 1);
        
        return liveMatches.filter(m => {
            const d = new Date(m.commence_time);
            return d.toDateString() === sat.toDateString() || d.toDateString() === sun.toDateString();
        }).slice(0, 8);
    }, [liveMatches]);

    // 4. IPL & Major Leagues
    const leagues = useMemo(() => {
        const unique = Array.from(new Set(liveMatches.map(m => m.league)));
        return unique.filter(l => l.toLowerCase().includes('ipl') || l.toLowerCase().includes('league') || l.toLowerCase().includes('world')).slice(0, 4);
    }, [liveMatches]);

    // 5. Venue Spotlight (Unique venues in current city)
    const venues = useMemo(() => {
        const seen = new Set();
        return liveMatches.filter(m => {
            const isLocal = m.loc.toLowerCase().includes(userCity.toLowerCase());
            if (isLocal && !seen.has(m.loc)) {
                seen.add(m.loc);
                return true;
            }
            return false;
        }).map(m => ({ name: m.loc, address: userCity, lat: m.lat, lon: m.lon })).slice(0, 3);
    }, [liveMatches, userCity]);

    const handleRestrictedAction = (action, obj) => {
        if (!isAuthenticated) openAuthModal();
        else if (action === 'Favourite') toggleFavorite(obj);
    };

    const goToEvent = (id) => navigate(`/event?id=${id}`);

    const filteredMatches = useMemo(() => {
        return liveMatches.filter(m => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return m.t1.toLowerCase().includes(q) || 
                   m.t2?.toLowerCase().includes(q) || 
                   m.league.toLowerCase().includes(q);
        });
    }, [liveMatches, searchQuery]);

    const groupEventsByPerformer = (events) => {
        const groups = {};
        events.forEach(e => {
            const key = e.t1;
            if (!groups[key]) {
                groups[key] = { id: e.id, name: e.t1, league: e.league, source: e.source, events: [] };
            }
            groups[key].events.push(e);
        });

        return Object.values(groups).map(g => {
            g.events.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
            const first = g.events[0];
            const last = g.events[g.events.length - 1];
            const formatShortDate = (dStr) => { const d = new Date(dStr); return `${d.getDate()} ${d.toLocaleDateString('en-US', {month: 'short'})}`; };
            const formatLongDate = (dStr) => { const d = new Date(dStr); return `${d.toLocaleDateString('en-US', {weekday: 'short'})}, ${d.getDate()} ${d.toLocaleDateString('en-US', {month: 'short'})} • ${d.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}`; };
            
            let dateStr = '';
            if (g.events.length === 1) dateStr = formatLongDate(first.commence_time);
            else dateStr = `${formatShortDate(first.commence_time)} - ${formatShortDate(last.commence_time)}`;
            
            return { ...g, dateStr, count: g.events.length };
        });
    };

    const sportsGroups = groupEventsByPerformer(filteredMatches.filter(m => ['CricAPI', 'OddsAPI', 'TheSportsDB'].includes(m.source)));
    const concertGroups = groupEventsByPerformer(filteredMatches.filter(m => ['SeatGeek', 'Bandsintown'].includes(m.source) && !m.league?.toLowerCase().includes('comedy') && !m.league?.toLowerCase().includes('theatre')));
    const theatreGroups = groupEventsByPerformer(filteredMatches.filter(m => m.league?.toLowerCase().includes('theatre') || m.league?.toLowerCase().includes('broadway')));
    const comedyGroups = groupEventsByPerformer(filteredMatches.filter(m => m.league?.toLowerCase().includes('comedy')));

    const EventRail = ({ title, groups }) => {
        const scrollRef = useRef(null);
        const scroll = (direction) => {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
        };
        if (groups.length === 0) return null;
        return (
            <div className="mb-12 relative group px-4">
                <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-5 tracking-tight">{title}</h2>
                <div className="relative">
                    <div ref={scrollRef} className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4 snap-x">
                        {groups.map(g => (
                            <div key={g.id} onClick={() => navigate(`/performer/${encodeURIComponent(g.name)}`)} className="min-w-[240px] max-w-[240px] flex-shrink-0 cursor-pointer snap-start">
                                <div className="relative w-full h-[150px] rounded-[12px] overflow-hidden mb-3 bg-gray-200 border border-gray-100 shadow-sm">
                                    <img src={`https://loremflickr.com/600/400/${encodeURIComponent(g.league.split(' ')[0] || g.name)},event/all?lock=${g.id}`} alt={g.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    <button onClick={(e) => { e.stopPropagation(); handleRestrictedAction(`Favourite`, g); }} className="absolute top-2.5 right-2.5 w-[28px] h-[28px] rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors z-10 shadow-sm">
                                        <Heart size={14} className="text-white"/>
                                    </button>
                                </div>
                                <h3 className="font-bold text-[#1a1a1a] text-[15px] leading-snug mb-0.5 truncate">{g.name}</h3>
                                <p className="text-[13px] text-gray-500 mb-0.5 font-medium">{g.dateStr}</p>
                                <p className="text-[13px] text-gray-500 font-bold">{g.count} event{g.count !== 1 ? 's' : ''} near you</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => scroll('right')} className="absolute -right-2 top-[75px] -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:scale-105 transition-transform z-10 hidden md:flex opacity-0 group-hover:opacity-100">
                        <ChevronDown size={20} className="-rotate-90" />
                    </button>
                </div>
            </div>
        );
    };

    // Major match for Fan Poll
    const majorMatch = liveMatches.length > 0 ? liveMatches[0] : null;

    return (
        <div className="animate-fade-in w-full pb-20 overflow-x-hidden pt-2">
            
            {/* INJECTED 1: CRICKET TICKER AT TOP */}
            <CricketTicker />

            {/* 1. TOP FILTERS (Repositioned strictly ABOVE Carousel) */}
            <div className="flex items-center space-x-2 md:space-x-3 mb-6 px-4 overflow-visible relative mt-4">
                <div className="w-10 h-10 rounded-[10px] bg-[#4a7228] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm hover:bg-[#3d5e21] transition-colors">
                    <NavigationIcon size={18} className="text-white fill-white -rotate-45" />
                </div>
                <div className="relative">
                    <button onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)} className="bg-white border border-gray-200 text-brand-text px-4 py-2 h-10 rounded-[10px] text-sm font-medium flex items-center justify-center whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
                        <MapPin size={16} className="mr-2 text-gray-400"/> {userCity !== 'Loading...' ? `${userCity}, ${userCountry || 'IN'}` : 'Detecting...'} <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    <LocationDropdown />
                </div>
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 h-10 rounded-[10px] text-sm font-medium flex items-center justify-center whitespace-nowrap hover:bg-gray-50 transition-colors shadow-sm">
                    <Calendar size={16} className="mr-2 opacity-40"/> All dates <ChevronDown size={16} className="ml-2 opacity-40"/>
                </button>
            </div>

            {/* 2. ENLARGED HERO CAROUSEL */}
            <div className="relative w-full h-[240px] md:h-[350px] lg:h-[400px] rounded-[16px] overflow-hidden mb-6 group bg-gray-100 shadow-sm border border-gray-200 px-0 mx-0">
                <AnimatePresence mode="wait">
                    <motion.div key={currentHeroIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute inset-0 flex">
                        <div className="relative w-[60%] md:w-[45%] h-full z-20 flex flex-col justify-end pb-12 px-6 md:px-16" style={{ backgroundColor: heroSlides[currentHeroIndex].bgLeft, clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tight">{heroSlides[currentHeroIndex].title}</h2>
                            <button onClick={() => navigate(`/performer/${encodeURIComponent(heroSlides[currentHeroIndex].query)}`)} className="border border-white/40 text-white hover:bg-white/10 w-max px-8 py-2.5 rounded-[8px] text-sm font-bold transition-colors">See Tickets</button>
                        </div>
                        <div className="absolute top-0 bottom-0 right-0 w-[60%] md:w-[70%] z-10" style={{ backgroundColor: heroSlides[currentHeroIndex].bgRight }}>
                            {heroSlides[currentHeroIndex].content}
                        </div>
                    </motion.div>
                </AnimatePresence>
                <button onClick={() => handleRestrictedAction(`Favourite ${heroSlides[currentHeroIndex].title}`)} className="absolute top-5 right-5 w-[36px] h-[36px] bg-black/60 rounded-full flex items-center justify-center hover:bg-black transition-colors backdrop-blur-sm z-30">
                    <Heart size={16} className="text-white"/>
                </button>
            </div>

            {/* INJECTED 2: NEWS MARQUEE */}
            <NewsMarquee query={heroSlides[currentHeroIndex].title} />

            {/* 3. PAGINATION DOTS */}
            <div className="flex justify-center items-center space-x-3 mb-8 mt-4">
                {heroSlides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentHeroIndex(idx)} className={`transition-all duration-300 rounded-full ${idx === currentHeroIndex ? 'bg-[#1a1a1a] w-3 h-3' : 'bg-gray-300 w-2.5 h-2.5'}`} />
                ))}
            </div>

            {/* 4. CATEGORY FILTERS (Scrollable container BELOW dots) */}
            <div className="flex items-center space-x-2.5 mb-14 overflow-x-auto hide-scrollbar whitespace-nowrap pb-4 px-4">
                <button onClick={() => setSearchQuery('')} className={`px-5 py-2.5 h-10 rounded-[10px] text-sm font-bold shadow-sm transition-colors border ${!searchQuery ? 'bg-[#E6F2D9] border-[#C5E1A5] text-[#114C2A]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>All types</button>
                <button onClick={() => setSearchQuery('Sports')} className={`px-5 py-2.5 h-10 rounded-[10px] text-sm font-medium shadow-sm transition-colors border ${searchQuery === 'Sports' ? 'bg-[#E6F2D9] border-[#C5E1A5] text-[#114C2A]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Sports</button>
                <button onClick={() => setSearchQuery('Concert')} className={`px-5 py-2.5 h-10 rounded-[10px] text-sm font-medium shadow-sm transition-colors border ${searchQuery === 'Concert' ? 'bg-[#E6F2D9] border-[#C5E1A5] text-[#114C2A]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Concerts</button>
                <button onClick={() => setSearchQuery('Theatre')} className={`px-5 py-2.5 h-10 rounded-[10px] text-sm font-medium shadow-sm transition-colors border ${searchQuery === 'Theatre' ? 'bg-[#E6F2D9] border-[#C5E1A5] text-[#114C2A]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Theatre & Comedy</button>
            </div>

            {/* 5. BLACK SPOTIFY BANNER */}
            <div className="mx-4 mb-14">
                <div className="w-full bg-black rounded-[14px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center text-white cursor-pointer shadow-lg hover:bg-gray-900 transition-colors">
                    <div className="flex items-center w-full md:w-auto justify-center md:justify-start mb-6 md:mb-0 space-x-6">
                        <div className="flex items-center space-x-3">
                            <svg viewBox="0 0 24 24" width="40" height="40" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.36.18.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z"/></svg>
                            <span className="font-bold text-[26px] tracking-tight">Spotify</span>
                        </div>
                        <div className="hidden md:block">
                            <h3 className="font-bold text-[18px] leading-tight">Connect your Spotify account and sync your favorite artists</h3>
                            <p className="text-[14px] text-gray-400 mt-1 font-medium">Discover events from who you actually listen to</p>
                        </div>
                    </div>
                    <button className="bg-[#1DB954] text-black font-bold px-8 py-3 rounded-[30px] text-[15px] hover:bg-[#1ed760] transition-colors w-full md:w-auto shadow-sm">Connect Spotify</button>
                </div>
            </div>

            {/* API Status Feed Overlay */}
            {(isLoadingMatches || apiError) && (
                <div className="mx-4 mb-8 p-4 bg-gray-50 rounded-[12px] flex items-center justify-between border border-gray-200">
                    <div className="flex items-center text-sm font-bold text-gray-700">
                        {isLoadingMatches ? <><RefreshCw size={16} className="animate-spin mr-2"/> Syncing verified events in {userCity}...</> : <><AlertCircle size={16} className="text-red-500 mr-2"/> {apiError}</>}
                    </div>
                    <button onClick={() => fetchLocationAndMatches(userCity)} className="text-xs font-bold text-[#458731] hover:underline">Force Refresh</button>
                </div>
            )}

            {/* Dynamic API Event Rails */}
            <EventRail title="Recommended for you" groups={concertGroups.length > 0 ? concertGroups : sportsGroups} />
            <EventRail title="Sports" groups={sportsGroups} />

            {/* INJECTED 3: FAN POLL & TRANSIT */}
            {majorMatch && (
                <div className="px-4 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-black mb-6 text-[#1a1a1a]">Fan Prediction</h2>
                        <FanPoll match={majorMatch} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-6 text-[#1a1a1a]">Transit Intelligence</h2>
                        <TransitLogic venue={majorMatch.loc} />
                    </div>
                </div>
            )}
            
            {/* WHITE ARTIST TOUR SUBSCRIPTION BANNER */}
            <div className="mx-4 w-auto border border-gray-200 rounded-[12px] p-6 mb-12 flex flex-col md:flex-row justify-between items-center bg-white cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-center space-y-5 md:space-y-0 md:space-x-8 w-full md:w-auto">
                    <div className="flex -space-x-3">
                        <div className="w-[70px] h-[70px] rounded-full border-[3px] border-white bg-gray-200 z-30 overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" alt="Artist" /></div>
                        <div className="w-[70px] h-[70px] rounded-full border-[3px] border-white bg-gray-300 z-20 overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1514361598106-897108422325?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" alt="Artist" /></div>
                        <div className="w-[70px] h-[70px] rounded-full border-[3px] border-white bg-gray-400 z-10 overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" alt="Artist" /></div>
                    </div>
                    <h3 className="font-bold text-[22px] md:text-[24px] text-[#1a1a1a] tracking-tight text-center md:text-left">Discover when your favourite artists are on tour</h3>
                </div>
                <button className="bg-[#1c242b] text-white font-bold px-10 py-3.5 rounded-[10px] text-[15px] hover:bg-black transition-colors w-full md:w-auto shadow-sm mt-8 md:mt-0">Subscribe</button>
            </div>

            <EventRail title="Theatre" groups={theatreGroups} />
            <EventRail title="Comedy" groups={comedyGroups} />

            {/* ========================================================= */}
            {/* INJECTED 10: 20+ EXTRA HIGH-END COMPONENTS APPENDED HERE  */}
            {/* ========================================================= */}
            <div className="w-full border-t border-gray-100 pt-16">
                <div className="px-4 mb-16">
                    <DiscountWheel />
                    <SellPrompt />
                </div>

                {/* Travel Intelligence */}
                <div className="px-4 mb-16">
                    <h2 className="text-[22px] font-bold mb-6 text-[#1a1a1a] tracking-tight">Travel & Logistics Intelligence</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                            <FlightDeals destination={userCity !== 'Loading...' ? userCity : 'Mumbai'} />
                            <div className="mt-6">
                                <h3 className="font-bold text-sm mb-4">Drive Time to Top Venue</h3>
                                {venues.length > 0 && <DriveTime venueLon={venues[0].lon} venueLat={venues[0].lat} />}
                            </div>
                            <div className="mt-6">
                                <TimezoneClock eventTime={majorMatch?.commence_time || new Date().toISOString()} />
                            </div>
                        </div>
                        <div>
                            {venues.length > 0 && <HotelRail lat={venues[0].lat} lon={venues[0].lon} />}
                        </div>
                    </div>
                </div>

                {/* Social & Event Intelligence */}
                {majorMatch && (
                     <div className="px-4 mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
                               <h3 className="font-black text-lg mb-2">Social Proof</h3>
                               <WhosGoing eventId={majorMatch.id} />
                          </div>
                          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
                               <h3 className="font-black text-lg mb-2">Hype Rating</h3>
                               <HypeScore favoritesCount={1245} />
                          </div>
                          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
                               <h3 className="font-black text-lg mb-2">Inventory Status</h3>
                               <ScarcityMeter totalCapacity={50000} activeListings={124} />
                          </div>
                     </div>
                )}

                {/* Performer Intelligence */}
                <div className="px-4 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="flex flex-col space-y-6">
                          <RelatedArtists baseArtist={trending.length > 0 ? trending[0] : 'Coldplay'} />
                          <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-[24px] text-white flex items-center justify-between shadow-xl">
                              <div>
                                  <h3 className="text-xl font-bold mb-2">Hear the Vibe</h3>
                                  <p className="text-gray-400 text-sm">Preview top tracks from trending artists before you buy.</p>
                              </div>
                              <div className="relative w-16 h-16">
                                  <AudioPreview artistName={concertGroups.length > 0 ? concertGroups[0].name : "Coldplay"} />
                              </div>
                          </div>
                     </div>
                     <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[24px] p-6 border border-gray-200">
                          <h3 className="font-black text-lg mb-6 text-center w-full">Top Athlete Stats</h3>
                          <PlayerStats playerId="1413" name={sportsGroups.length > 0 ? sportsGroups[0].name : "Virat Kohli"} />
                     </div>
                </div>

                <VIPPortal />

                <div className="px-4 mb-16">
                     <h2 className="text-[22px] font-bold mb-6 text-[#1a1a1a] tracking-tight">Missed Out?</h2>
                     <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4">
                          {liveMatches.slice(10, 16).map(m => <SoldOutGraveyard key={m.id} event={m} />)}
                     </div>
                </div>

                <div className="px-4 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <DailyTrivia />
                     <div className="flex flex-col items-center justify-center bg-blue-50/50 rounded-[24px] border border-blue-100 p-8 text-center">
                          <h3 className="font-black text-lg mb-2 text-blue-900">Accessibility First</h3>
                          <p className="text-sm font-medium text-blue-700 mb-6">We ensure a seamless experience for all fans. Filter for sensory-friendly and ADA compliant venues.</p>
                          <AccessibilityFilter />
                     </div>
                </div>

                <BuyerReviews />
            </div>

            {/* INJECTED 4: PRICE GRAPH, SAFETY PANEL, & CURRENCY CONVERTER */}
            <div className="px-4 mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
                <div className="lg:col-span-1">
                    <h2 className="text-[22px] font-bold mb-6 text-[#1a1a1a] tracking-tight">Market Intelligence</h2>
                    <PriceGraph />
                </div>
                <div className="lg:col-span-1">
                    <h2 className="text-[22px] font-bold mb-6 text-[#1a1a1a] tracking-tight">Venue Protocol</h2>
                    <SafetyPanel type="stadium" />
                </div>
                
                {/* INJECTED 5: REAL-TIME CURRENCY CONVERTER */}
                <div className="lg:col-span-1">
                    <h2 className="text-[22px] font-bold mb-6 text-[#1a1a1a] tracking-tight">Global Exchange</h2>
                    <div className="w-full bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-widest flex items-center">
                                <RefreshCw size={16} className="text-[#458731] mr-2" /> Live Rates
                            </span>
                        </div>
                        <div className="flex space-x-4 mb-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-2 block">From</label>
                                <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 outline-none focus:border-[#458731] text-sm font-bold text-[#1a1a1a]">
                                    {['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-2 block">To</label>
                                <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 outline-none focus:border-[#458731] text-sm font-bold text-[#1a1a1a]">
                                    {['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 mb-2 block">Amount</label>
                            <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#458731] text-lg font-black text-[#1a1a1a]" />
                        </div>
                        <div className="mt-auto bg-[#E6F2D9] rounded-xl p-5 flex justify-between items-center border border-[#C5E1A5]">
                            <span className="text-[#114C2A] font-bold text-sm">Converted</span>
                            <span className="text-[#114C2A] font-black text-2xl truncate ml-4">
                                {exchangeRates[targetCurrency] ? `${(convertAmount * exchangeRates[targetCurrency]).toLocaleString('en-US', {maximumFractionDigits:2})}` : '...'} {targetCurrency}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* INJECTED 6: SERIES RAIL */}
            <SeriesRail />

            {/* INJECTED 7: VENUE SPOTLIGHT WITH WEATHER WIDGET */}
            <div className="mb-16 px-4">
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-8">Top Venues in {userCity}</h2>
                <div className="space-y-4">
                    {venues.map((v, i) => (
                        <div key={i} className="relative group">
                            <VenueCard venue={v} />
                            <div className="absolute top-4 right-4 md:right-20">
                                <WeatherWidget lat={v.lat} lon={v.lon} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INJECTED 8: LIVE PULSE GLOBE */}
            <div className="px-4 mb-16">
                <LivePulseGlobe />
            </div>

            {/* STRICT NEWSLETTER SUBSCRIPTION BLOCK (Existing UI Untouched) */}
            <div className="w-full mt-10 mb-16 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-[22px] md:text-[24px] font-bold text-[#1a1a1a] mb-10 tracking-tight">Get hot events and deals delivered straight to your inbox</h2>
                <div className="flex flex-col sm:flex-row items-end justify-center w-full max-w-[550px] mx-auto mb-6 space-y-6 sm:space-y-0 sm:space-x-6">
                    <div className="w-full sm:w-[350px] relative">
                        <input type="email" placeholder="Email address" className="w-full border-b border-gray-300 pb-3 px-1 focus:outline-none focus:border-[#4a7228] text-[#1a1a1a] placeholder-gray-500 text-[16px] transition-colors bg-transparent rounded-none" />
                    </div>
                    <button className="border border-[#4a7228] text-[#4a7228] px-6 py-3 rounded-[8px] font-bold hover:bg-[#F2F8ED] transition-colors whitespace-nowrap w-full sm:w-auto text-[15px]">Join the List</button>
                </div>
                <p className="text-[14px] text-gray-500 max-w-[800px] leading-relaxed">
                    By signing in or creating an account, you agree to our <a href="#" className="text-[#0066cc] hover:underline">user agreement</a> and acknowledge our <a href="#" className="text-[#0066cc] hover:underline">privacy policy</a>. You may receive SMS notifications from us and can opt out at any time.
                </p>
            </div>

            {/* Floating Global Widgets */}
            <ThemePreview />
            <PurchaseToast />

        </div>
    );
}