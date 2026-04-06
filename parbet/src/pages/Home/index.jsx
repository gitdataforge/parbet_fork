import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Heart, RefreshCw, AlertCircle, ChevronDown, Navigation as NavigationIcon, Clock, CheckCircle, Flame, Star, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

// Components
import LocationDropdown from '../../components/LocationDropdown';
import DealCard from '../../components/DealCard';
import CityHubCard from '../../components/CityHubCard';
import TrustSection from '../../components/TrustSection';
import RegionalMap from '../../components/RegionalMap';
import LeaguePortal from '../../components/LeaguePortal';
import VenueCard from '../../components/VenueCard';

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

    return (
        <div className="animate-fade-in w-full pb-20 overflow-x-hidden pt-2">
            
            {/* 1. TOP FILTERS (Repositioned ABOVE) */}
            <div className="flex items-center space-x-2 md:space-x-3 mb-6 px-4">
                <div className="w-10 h-10 rounded-[10px] bg-[#4a7228] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm">
                    <NavigationIcon size={18} className="text-white fill-white -rotate-45" />
                </div>
                <div className="relative">
                    <button onClick={() => setLocationDropdownOpen(!isLocationDropdownOpen)} className="bg-white border border-gray-200 text-brand-text px-4 py-2 h-10 rounded-[10px] text-sm font-bold flex items-center whitespace-nowrap shadow-sm">
                        <MapPin size={16} className="mr-2 text-gray-400"/> {userCity} <ChevronDown size={16} className={`ml-2 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    <LocationDropdown />
                </div>
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 h-10 rounded-[10px] text-sm font-medium flex items-center whitespace-nowrap shadow-sm">
                    <Calendar size={16} className="mr-2 opacity-40"/> All dates <ChevronDown size={16} className="ml-2 opacity-40"/>
                </button>
            </div>

            {/* 2. ENLARGED HERO CAROUSEL */}
            <div className="relative w-full h-[240px] md:h-[400px] rounded-[24px] overflow-hidden mb-6 group bg-gray-100 shadow-xl border border-gray-200">
                <AnimatePresence mode="wait">
                    <motion.div key={currentHeroIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 flex">
                        <div className="relative w-[60%] md:w-[45%] h-full z-20 flex flex-col justify-end pb-12 px-6 md:px-16" style={{ backgroundColor: heroSlides[currentHeroIndex].bgLeft, clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-none tracking-tight">{heroSlides[currentHeroIndex].title}</h2>
                            <button onClick={() => navigate(`/explore?q=${heroSlides[currentHeroIndex].query}`)} className="border border-white/40 text-white hover:bg-white/10 w-max px-8 py-3 rounded-[12px] text-sm font-bold transition-all">See Tickets</button>
                        </div>
                        <div className="absolute top-0 bottom-0 right-0 w-[60%] md:w-[70%] z-10" style={{ backgroundColor: heroSlides[currentHeroIndex].bgRight }}>
                            {heroSlides[currentHeroIndex].content}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3. PAGINATION DOTS */}
            <div className="flex justify-center items-center space-x-3 mb-10">
                {heroSlides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentHeroIndex(idx)} className={`transition-all duration-300 rounded-full ${idx === currentHeroIndex ? 'bg-[#1a1a1a] w-4 h-1' : 'bg-gray-300 w-2 h-2'}`} />
                ))}
            </div>

            {/* 4. CATEGORY FILTERS (Scrollable BELOW Carousel) */}
            <div className="flex items-center space-x-2.5 mb-14 overflow-x-auto hide-scrollbar whitespace-nowrap pb-4 px-4">
                {['All types', 'Sports', 'Concerts', 'Theatre & Comedy', 'Festivals', 'Family'].map(cat => (
                    <button key={cat} onClick={() => setSearchQuery(cat === 'All types' ? '' : cat)} className={`px-6 py-2.5 h-11 rounded-[12px] text-sm font-bold shadow-sm transition-all border ${(!searchQuery && cat === 'All types') || searchQuery === cat ? 'bg-[#E6F2D9] border-[#C5E1A5] text-[#114C2A]' : 'bg-white border-gray-200 text-gray-700'}`}>{cat}</button>
                ))}
            </div>

            {/* 5. LAST MINUTE DEALS RAIL */}
            {lastMinuteDeals.length > 0 && (
                <div className="mb-16 px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-[#1a1a1a] flex items-center">
                            <Flame size={24} className="text-orange-500 mr-2" /> Last-Minute Deals
                        </h2>
                    </div>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-5 pb-4">
                        {lastMinuteDeals.map(event => <DealCard key={event.id} event={event} />)}
                    </div>
                </div>
            )}

            {/* 6. REGIONAL INTERACTIVE MAP */}
            <div className="px-4">
                <RegionalMap />
            </div>

            {/* 7. TRENDING PERFORMERS (Circular Avatars) */}
            <div className="mb-16 px-4">
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-8">Trending Performers</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                    {trending.map((name, i) => (
                        <div key={i} onClick={() => navigate(`/performer/${encodeURIComponent(name)}`)} className="flex flex-col items-center cursor-pointer group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-gray-100 group-hover:border-[#458731] transition-all p-1">
                                <img src={`https://loremflickr.com/200/200/${encodeURIComponent(name.split(' ')[0])},person/all?lock=${i}`} className="w-full h-full object-cover rounded-full" alt={name}/>
                            </div>
                            <span className="text-xs font-bold text-center group-hover:text-[#458731] line-clamp-1">{name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 8. LEAGUE SPOTLIGHT GRID */}
            <div className="mb-16 px-4">
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-8">Major Leagues</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {leagues.map((l, i) => (
                        <LeaguePortal key={i} name={l} color={['#044d22', '#1a1a1a', '#004c99', '#990000'][i % 4]} query={l} icon={Trophy} />
                    ))}
                </div>
            </div>

            {/* 9. NEARBY THIS WEEKEND */}
            {weekendEvents.length > 0 && (
                <div className="mb-16 px-4 bg-[#EAF4D9] -mx-4 py-12">
                    <div className="max-w-[1400px] mx-auto">
                        <h2 className="text-2xl font-black text-[#114C2A] mb-8 px-4 flex items-center">
                            <Star size={24} className="mr-2 fill-current" /> Nearby this Weekend
                        </h2>
                        <div className="flex overflow-x-auto hide-scrollbar space-x-5 px-4 pb-4">
                            {weekendEvents.map(m => (
                                <div key={m.id} onClick={() => navigate(`/event?id=${m.id}`)} className="min-w-[280px] bg-white rounded-3xl p-4 shadow-sm border border-[#C5E1A5]">
                                    <div className="aspect-video rounded-2xl overflow-hidden mb-4"><img src={`https://loremflickr.com/400/300/${encodeURIComponent(m.league.split(' ')[0])}?lock=${m.id}`} className="w-full h-full object-cover" alt=""/></div>
                                    <h3 className="font-bold text-[#114C2A] mb-1 line-clamp-1">{m.t1} vs {m.t2}</h3>
                                    <p className="text-xs font-medium text-gray-500">{m.dow}, {m.day} {m.month} • {m.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 10. VENUE SPOTLIGHT */}
            <div className="mb-16 px-4">
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-8">Top Venues in {userCity}</h2>
                <div className="space-y-4">
                    {venues.map((v, i) => <VenueCard key={i} venue={v} />)}
                </div>
            </div>

            {/* 11. CITY HUB PORTALS */}
            <div className="mb-16 px-4">
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-8">Explore Global Hubs</h2>
                <div className="flex overflow-x-auto hide-scrollbar space-x-5 pb-4">
                    <CityHubCard name="London" img="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600" country="United Kingdom" />
                    <CityHubCard name="New York" img="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600" country="USA" />
                    <CityHubCard name="Dubai" img="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600" country="UAE" />
                    <CityHubCard name="Tokyo" img="https://images.unsplash.com/photo-1540959733332-e94e1bf32f38?w=600" country="Japan" />
                </div>
            </div>

            {/* 12. TRUST SECTION */}
            <div className="px-4 mb-20">
                <TrustSection />
            </div>

            {/* NEWSLETTER */}
            <div className="w-full mt-24 mb-16 flex flex-col items-center text-center px-4">
                <h2 className="text-[22px] md:text-[24px] font-bold text-[#1a1a1a] mb-10 tracking-tight">Get hot events and deals delivered straight to your inbox</h2>
                <div className="flex flex-col sm:flex-row items-end justify-center w-full max-w-[550px] mx-auto mb-8 space-y-6 sm:space-y-0 sm:space-x-6">
                    <div className="w-full sm:w-[350px] relative">
                        <input type="email" placeholder="Email address" className="w-full border-b border-gray-300 pb-3 px-1 focus:outline-none focus:border-[#4a7228] text-[#1a1a1a] placeholder-gray-500 text-[16px] transition-colors bg-transparent rounded-none" />
                    </div>
                    <button className="border border-[#4a7228] text-[#4a7228] px-6 py-3 rounded-[8px] font-bold hover:bg-[#F2F8ED] transition-colors whitespace-nowrap w-full sm:w-auto text-[15px]">Join the List</button>
                </div>
                <p className="text-[14px] text-gray-500 max-w-[800px] leading-relaxed">By signing in or creating an account, you agree to our <a href="#" className="text-[#0066cc] hover:underline">user agreement</a> and acknowledge our <a href="#" className="text-[#0066cc] hover:underline">privacy policy</a>.</p>
            </div>

        </div>
    );
}